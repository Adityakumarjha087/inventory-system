from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


async def create_product(session: AsyncSession, data: ProductCreate) -> Product:
    product = Product(**data.model_dump())
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return product


async def get_products(session: AsyncSession, search: str | None = None) -> list[Product]:
    stmt = select(Product).order_by(Product.id)
    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(Product.name.ilike(pattern) | Product.sku.ilike(pattern))
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def get_product_by_id(session: AsyncSession, product_id: int) -> Product | None:
    return await session.get(Product, product_id)


async def get_product_by_sku(session: AsyncSession, sku: str) -> Product | None:
    result = await session.execute(select(Product).where(Product.sku == sku))
    return result.scalar_one_or_none()


async def update_product(
    session: AsyncSession, product: Product, data: ProductUpdate
) -> Product:
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    await session.commit()
    await session.refresh(product)
    return product


async def delete_product(session: AsyncSession, product: Product) -> None:
    await session.delete(product)
    await session.commit()


async def product_has_order_items(session: AsyncSession, product_id: int) -> bool:
    from app.models.order import OrderItem

    result = await session.execute(
        select(OrderItem.id).where(OrderItem.product_id == product_id).limit(1)
    )
    return result.scalar_one_or_none() is not None
