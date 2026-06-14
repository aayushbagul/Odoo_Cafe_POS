from tortoise import fields
from tortoise.models import Model

class Category(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100)
    is_active = fields.BooleanField(default=True)
    color = fields.CharField(max_length=20, default="#714B67")

    class Meta:
        table = "categories"

class Product(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255)
    price = fields.DecimalField(max_digits=10, decimal_places=2)
    category = fields.ForeignKeyField('models.Category', related_name='products', null=True)
    image_url = fields.CharField(max_length=500, null=True)
    is_available = fields.BooleanField(default=True)
    show_on_kds = fields.BooleanField(default=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    unit_of_measure = fields.CharField(max_length=20, default="piece")
    tax_percent = fields.DecimalField(max_digits=5, decimal_places=2, default=0)

    class Meta:
        table = "products"