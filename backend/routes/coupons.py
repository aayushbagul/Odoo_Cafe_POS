from fastapi import APIRouter, HTTPException
from tortoise_models.coupon import Coupon
from schemas.coupon import CouponCreate, CouponResponse, CouponValidateRequest, CouponValidateResponse
from typing import List
from decimal import Decimal

router = APIRouter()

@router.get("", response_model=List[CouponResponse])
async def get_coupons():
    return await Coupon.all()

@router.post("", response_model=CouponResponse)
async def create_coupon(coupon: CouponCreate):
    # Ensure code is uppercase and unique
    exists = await Coupon.filter(code=coupon.code.upper()).exists()
    if exists:
        raise HTTPException(status_code=400, detail="Coupon code already exists")
    
    # Force uppercase before saving
    coupon_data = coupon.dict()
    coupon_data['code'] = coupon_data['code'].upper()
    
    new_coupon = await Coupon.create(**coupon_data)
    return new_coupon

@router.post("/validate", response_model=CouponValidateResponse)
async def validate_coupon(request: CouponValidateRequest):
    # Find active coupon matching the code (case-insensitive)
    coupon = await Coupon.get_or_none(code=request.code.upper(), is_active=True)
    
    if not coupon:
        return CouponValidateResponse(valid=False, message="❌ Invalid or expired coupon code!")
        
    if request.subtotal < coupon.min_order_amount:
        return CouponValidateResponse(
            valid=False, 
            message=f"❌ Minimum order amount of ₹{coupon.min_order_amount} required."
        )
        
    # Calculate discount
    if coupon.discount_type == 'percentage':
        discount_amount = request.subtotal * (coupon.discount_value / Decimal('100'))
    else: # fixed
        discount_amount = coupon.discount_value
        
    # Ensure discount doesn't exceed subtotal
    if discount_amount > request.subtotal:
        discount_amount = request.subtotal
        
    symbol = '%' if coupon.discount_type == 'percentage' else '₹'
    msg = f"✅ {coupon.discount_value}{symbol} Discount Applied!"
    
    return CouponValidateResponse(
        valid=True, 
        message=msg, 
        discount_amount=discount_amount
    )