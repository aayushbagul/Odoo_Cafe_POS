from tortoise import fields
from tortoise.models import Model

class POSSession(Model):
    id = fields.IntField(pk=True)
    user = fields.ForeignKeyField('models.User', related_name='sessions')
    start_time = fields.DatetimeField(auto_now_add=True)
    end_time = fields.DatetimeField(null=True)
    opening_cash = fields.DecimalField(max_digits=10, decimal_places=2, default=0)
    closing_cash = fields.DecimalField(max_digits=10, decimal_places=2, null=True)
    total_sales = fields.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = fields.CharField(max_length=20, default="open") # open, closed