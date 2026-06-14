from tortoise import models, fields
from tortoise.models import Model

class User(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255)
    username = fields.CharField(max_length=255, unique=True)
    email = fields.CharField(max_length=255, null=True)
    password = fields.CharField(max_length=255)
    role = fields.CharField(max_length=20, default="cashier") # admin, cashier, kitchen
    is_archived = fields.BooleanField(default=False)

    class Meta:
        db_table = "Users"



