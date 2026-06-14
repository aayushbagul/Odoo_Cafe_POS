from tortoise import fields
from tortoise.models import Model

class Coupon(Model):
    id = fields.IntField(pk=True)
    code = fields.CharField(max_length=50, unique=True)
    discount_type = fields.CharField(max_length=20) # 'percentage' or 'fixed'
    discount_value = fields.DecimalField(max_digits=10, decimal_places=2)
    min_order_amount = fields.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = fields.BooleanField(default=True)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "coupons"