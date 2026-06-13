from tortoise import fields
from tortoise.models import Model

class Floor(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100)
    occupied = fields.BooleanField(default=True)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "floors"

class Table(Model):
    id = fields.IntField(pk=True)
    table_number = fields.CharField(max_length=50)
    floor = fields.ForeignKeyField('models.Floor', related_name='tables')
    seats = fields.IntField()
    status = fields.CharField(max_length=20, default='available')  # available, occupied, reserved
    occupied = fields.BooleanField(default=True)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "tables"