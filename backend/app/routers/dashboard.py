from decimal import Decimal

from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.customer import Customer
from app.models.order import Order
from app.models.product import Product

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

LOW_STOCK_THRESHOLD = 10


class LowStockProduct(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    sku: str
    quantity_in_stock: int


class DashboardResponse(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: list[LowStockProduct]


@router.get("", response_model=DashboardResponse)
async def get_dashboard(session: AsyncSession = Depends(get_session)):
    total_products = (
        await session.execute(select(func.count(Product.id)))
    ).scalar_one()

    total_customers = (
        await session.execute(select(func.count(Customer.id)))
    ).scalar_one()

    total_orders = (
        await session.execute(select(func.count(Order.id)))
    ).scalar_one()

    low_stock_result = await session.execute(
        select(Product)
        .where(Product.quantity_in_stock <= LOW_STOCK_THRESHOLD)
        .order_by(Product.quantity_in_stock)
    )
    low_stock_products = [
        LowStockProduct.model_validate(p) for p in low_stock_result.scalars().all()
    ]

    return DashboardResponse(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_products=low_stock_products,
    )
