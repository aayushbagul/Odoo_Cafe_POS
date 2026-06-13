from tortoise import fields
from tortoise.models import Model

class Order(Model):
    id = fields.IntField(pk=True)
    order_number = fields.CharField(max_length=50, unique=True)
    table = fields.ForeignKeyField('models.Table', related_name='orders', null=True)
    customer = fields.ForeignKeyField('models.Customer', related_name='orders', null=True)
    employee = fields.ForeignKeyField('models.User', related_name='orders', null=True)
    status = fields.CharField(max_length=20, default='draft')  # draft, paid, cancelled
    subtotal = fields.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = fields.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = fields.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_method = fields.CharField(max_length=50, null=True)  # cash, card, upi
    notes = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "orders"

class OrderItem(Model):
    id = fields.IntField(pk=True)
    order = fields.ForeignKeyField('models.Order', related_name='items')
    product = fields.ForeignKeyField('models.Product', related_name='order_items')
    quantity = fields.IntField(default=1)
    unit_price = fields.DecimalField(max_digits=10, decimal_places=2)
    subtotal = fields.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        table = "order_items"