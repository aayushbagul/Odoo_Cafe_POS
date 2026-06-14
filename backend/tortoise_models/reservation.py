from tortoise import fields
from tortoise.models import Model

class Reservation(Model):
    id = fields.IntField(pk=True)
    customer_name = fields.CharField(max_length=255)
    phone = fields.CharField(max_length=20, null=True)
    date = fields.DateField()
    time = fields.TimeField()
    party_size = fields.IntField()
    table = fields.ForeignKeyField('models.Table', related_name='reservations', null=True)
    status = fields.CharField(max_length=20, default="pending") # pending, confirmed, cancelled, completed
    notes = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)