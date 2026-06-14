from pydantic import BaseModel
from decimal import Decimal

class CouponBase(BaseModel):
    code: str
    discount_type: str
    discount_value: Decimal
    min_order_amount: Decimal = 0

class CouponCreate(CouponBase):
    pass

class CouponResponse(CouponBase):
    id: int
    is_active: bool
    class Config:
        from_attributes = True

# Schema for the validation endpoint
class CouponValidateRequest(BaseModel):
    code: str
    subtotal: Decimal

class CouponValidateResponse(BaseModel):
    valid: bool
    message: str
    discount_amount: Decimal = 0