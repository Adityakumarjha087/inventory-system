from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.customer import Customer
from app.models.order import Order
from app.schemas.customer import CustomerCreate


async def create_customer(session: AsyncSession, data: CustomerCreate) -> Customer:
    customer = Customer(**data.model_dump())
    session.add(customer)
    await session.commit()
    await session.refresh(customer)
    return customer


async def get_customers(
    session: AsyncSession, search: str | None = None
) -> list[Customer]:
    stmt = select(Customer).order_by(Customer.id)
    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(
            Customer.full_name.ilike(pattern) | Customer.email.ilike(pattern)
        )
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def get_customer_by_id(session: AsyncSession, customer_id: int) -> Customer | None:
    return await session.get(Customer, customer_id)


async def get_customer_by_email(session: AsyncSession, email: str) -> Customer | None:
    result = await session.execute(select(Customer).where(Customer.email == email))
    return result.scalar_one_or_none()


async def delete_customer(session: AsyncSession, customer: Customer) -> None:
    await session.delete(customer)
    await session.commit()


async def customer_has_orders(session: AsyncSession, customer_id: int) -> bool:
    result = await session.execute(
        select(Order.id).where(Order.customer_id == customer_id).limit(1)
    )
    return result.scalar_one_or_none() is not None
