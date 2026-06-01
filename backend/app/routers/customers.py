from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.schemas.customer import CustomerCreate, CustomerResponse
from app.services import customer_service

router = APIRouter(prefix="/api/customers", tags=["Customers"])


@router.post("", response_model=CustomerResponse, status_code=201)
async def create_customer(
    data: CustomerCreate, session: AsyncSession = Depends(get_session)
):
    existing = await customer_service.get_customer_by_email(session, data.email)
    if existing:
        raise HTTPException(
            status_code=409, detail=f"Email '{data.email}' is already registered"
        )

    try:
        customer = await customer_service.create_customer(session, data)
    except IntegrityError:
        raise HTTPException(
            status_code=409, detail=f"Email '{data.email}' is already registered"
        )
    return customer


@router.get("", response_model=list[CustomerResponse])
async def list_customers(
    search: str | None = Query(default=None),
    session: AsyncSession = Depends(get_session),
):
    return await customer_service.get_customers(session, search)


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(customer_id: int, session: AsyncSession = Depends(get_session)):
    customer = await customer_service.get_customer_by_id(session, customer_id)
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.delete("/{customer_id}", status_code=200)
async def delete_customer(
    customer_id: int, session: AsyncSession = Depends(get_session)
):
    customer = await customer_service.get_customer_by_id(session, customer_id)
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    if await customer_service.customer_has_orders(session, customer_id):
        raise HTTPException(
            status_code=400,
            detail="Cannot delete customer who has existing orders",
        )

    await customer_service.delete_customer(session, customer)
    return {"detail": "Customer deleted"}
