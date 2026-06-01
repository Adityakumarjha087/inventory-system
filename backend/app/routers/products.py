from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.services import product_service

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.post("", response_model=ProductResponse, status_code=201)
async def create_product(
    data: ProductCreate, session: AsyncSession = Depends(get_session)
):
    # Check for duplicate SKU before insert for a clearer error message
    existing = await product_service.get_product_by_sku(session, data.sku)
    if existing:
        raise HTTPException(status_code=409, detail=f"SKU '{data.sku}' already exists")

    try:
        product = await product_service.create_product(session, data)
    except IntegrityError:
        raise HTTPException(status_code=409, detail=f"SKU '{data.sku}' already exists")
    return product


@router.get("", response_model=list[ProductResponse])
async def list_products(
    search: str | None = Query(default=None),
    session: AsyncSession = Depends(get_session),
):
    return await product_service.get_products(session, search)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, session: AsyncSession = Depends(get_session)):
    product = await product_service.get_product_by_id(session, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    data: ProductUpdate,
    session: AsyncSession = Depends(get_session),
):
    product = await product_service.get_product_by_id(session, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    # If SKU is being changed, check for conflicts
    if data.sku is not None and data.sku != product.sku:
        existing = await product_service.get_product_by_sku(session, data.sku)
        if existing:
            raise HTTPException(status_code=409, detail=f"SKU '{data.sku}' already exists")

    try:
        product = await product_service.update_product(session, product, data)
    except IntegrityError:
        raise HTTPException(status_code=409, detail=f"SKU '{data.sku}' already exists")
    return product


@router.delete("/{product_id}", status_code=200)
async def delete_product(product_id: int, session: AsyncSession = Depends(get_session)):
    product = await product_service.get_product_by_id(session, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    if await product_service.product_has_order_items(session, product_id):
        raise HTTPException(
            status_code=400,
            detail="Cannot delete product that is referenced in existing orders",
        )

    await product_service.delete_product(session, product)
    return {"detail": "Product deleted"}
