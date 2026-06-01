from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate


async def create_order(session: AsyncSession, data: OrderCreate) -> Order:
    """
    Create an order, validate stock, deduct inventory, and compute totals.

    Raises ValueError with a descriptive message on validation failure.
    """
    # Validate customer
    customer = await session.get(Customer, data.customer_id)
    if customer is None:
        raise ValueError(f"Customer with id {data.customer_id} not found")

    # Collect unique product ids and load them in one query
    product_ids = [item.product_id for item in data.items]
    result = await session.execute(select(Product).where(Product.id.in_(product_ids)))
    products_map: dict[int, Product] = {p.id: p for p in result.scalars().all()}

    # Validate all products exist and have sufficient stock
    order_items: list[OrderItem] = []
    total_amount = Decimal("0.00")

    for item in data.items:
        product = products_map.get(item.product_id)
        if product is None:
            raise ValueError(f"Product with id {item.product_id} not found")
        if product.quantity_in_stock < item.quantity:
            raise ValueError(
                f"Insufficient stock for product '{product.name}' "
                f"(available: {product.quantity_in_stock}, requested: {item.quantity})"
            )

        unit_price = product.price
        subtotal = unit_price * item.quantity

        order_items.append(
            OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                unit_price=unit_price,
                subtotal=subtotal,
            )
        )
        total_amount += subtotal

        # Deduct stock
        product.quantity_in_stock -= item.quantity

    order = Order(
        customer_id=data.customer_id,
        total_amount=total_amount,
        status="pending",
        items=order_items,
    )
    session.add(order)
    await session.commit()
    await session.refresh(order)
    return order


async def get_orders(session: AsyncSession) -> list[Order]:
    stmt = (
        select(Order)
        .options(selectinload(Order.customer), selectinload(Order.items))
        .order_by(Order.id)
    )
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def get_order_by_id(session: AsyncSession, order_id: int) -> Order | None:
    stmt = (
        select(Order)
        .options(
            selectinload(Order.customer),
            selectinload(Order.items).selectinload(OrderItem.product),
        )
        .where(Order.id == order_id)
    )
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def delete_order(session: AsyncSession, order: Order) -> None:
    """Cancel/delete an order and restore stock for each line item."""
    for item in order.items:
        product = await session.get(Product, item.product_id)
        if product is not None:
            product.quantity_in_stock += item.quantity

    await session.delete(order)
    await session.commit()
