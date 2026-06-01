from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.schemas.order import OrderCreate, OrderListItem, OrderResponse
from app.services import order_service

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=201)
async def create_order(
    data: OrderCreate, session: AsyncSession = Depends(get_session)
):
    try:
        order = await order_service.create_order(session, data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    # Re-fetch with full relationships for the response
    order = await order_service.get_order_by_id(session, order.id)
    return order


@router.get("", response_model=list[OrderListItem])
async def list_orders(session: AsyncSession = Depends(get_session)):
    orders = await order_service.get_orders(session)
    return [
        OrderListItem(
            id=o.id,
            customer_id=o.customer_id,
            total_amount=o.total_amount,
            status=o.status,
            created_at=o.created_at,
            customer_name=o.customer.full_name,
            item_count=len(o.items),
        )
        for o in orders
    ]


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, session: AsyncSession = Depends(get_session)):
    order = await order_service.get_order_by_id(session, order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.delete("/{order_id}", status_code=200)
async def delete_order(order_id: int, session: AsyncSession = Depends(get_session)):
    order = await order_service.get_order_by_id(session, order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    await order_service.delete_order(session, order)
    return {"detail": "Order deleted and stock restored"}
