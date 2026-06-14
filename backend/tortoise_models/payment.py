from tortoise import fields
from tortoise.models import Model

class PaymentMethod(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=50) # Cash, Card, UPI
    type = fields.CharField(max_length=20) # cash, card, upi
    is_enabled = fields.BooleanField(default=True)
    upi_id = fields.CharField(max_length=100, null=True) # Only for UPI