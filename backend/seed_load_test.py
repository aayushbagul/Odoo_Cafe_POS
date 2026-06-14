import asyncio
import random
import string
from datetime import datetime, timedelta, date, time
from tortoise import Tortoise
from tortoise_models.config import DATABASE_URL
from tortoise_models.signup import User
from tortoise_models.table import Floor, Table
from tortoise_models.product import Category, Product
from tortoise_models.customer import Customer
from tortoise_models.coupon import Coupon
from tortoise_models.reservation import Reservation
from tortoise_models.session import POSSession
from tortoise_models.order import Order, OrderItem

# ==========================================
# CONFIGURATION
# ==========================================
# Set to True if you want to WIPE the database and ONLY have load test data.
# Set to False if you want to APPEND this data to your existing seeded data.
WIPE_DB = False 

async def seed_load_test():
    await Tortoise.init(
        db_url=DATABASE_URL,
        modules={"models": [
            "tortoise_models.signup",
            "tortoise_models.table",
            "tortoise_models.product",
            "tortoise_models.customer",
            "tortoise_models.order",
            "tortoise_models.coupon",
            "tortoise_models.payment",
            "tortoise_models.reservation",
            "tortoise_models.session"
        ]}
    )
    
    if WIPE_DB:
        conn = Tortoise.get_connection("default")
        await conn.execute_script("""
            DROP SCHEMA public CASCADE;
            CREATE SCHEMA public;
        """)
        print("✅ Database wiped successfully.")
        await Tortoise.generate_schemas()
        print("✅ Tables recreated successfully.")
    else:
        print("🚀 Appending load test data to existing database...")

    # 1. Users (500)
    print("🔄 Generating 500 Users...")
    users = []
    for i in range(1, 501):
        u = await User.create(
            name=f"Load User {i}",
            username=f"loaduser_{i}",
            email=f"loaduser_{i}@test.com",
            password="password123",
            role=random.choice(["admin", "cashier", "kitchen"])
        )
        users.append(u)
        
    # 2. Floors (20)
    print("🔄 Generating 20 Floors...")
    floors = []
    for i in range(1, 21):
        f = await Floor.create(name=f"Load Floor {i}", description="For load testing")
        floors.append(f)
        
    # 3. Tables (500)
    print("🔄 Generating 500 Tables...")
    tables = []
    for i in range(1, 501):
        t = await Table.create(
            table_number=f"LT-{i:04d}", # Ensures unique table numbers like LT-0001
            floor_id=random.choice(floors).id,
            seats=random.randint(2, 8),
            status=random.choice(["available", "occupied"])
        )
        tables.append(t)
        
    # 4. Categories (50)
    print("🔄 Generating 50 Categories...")
    categories = []
    for i in range(1, 51):
        c = await Category.create(
            name=f"Load Cat {i}",
            description="Load test category",
            color=f"#{random.randint(0, 0xFFFFFF):06x}" # Random hex color
        )
        categories.append(c)
        
    # 5. Products (500)
    print("🔄 Generating 500 Products...")
    products = []
    for i in range(1, 501):
        p = await Product.create(
            name=f"Load Product {i}",
            price=round(random.uniform(10.0, 500.0), 2),
            category_id=random.choice(categories).id,
            unit_of_measure=random.choice(["piece", "kg", "litre", "cup"]),
            tax_percent=random.choice([5, 12, 18]),
            is_available=random.choice([True, True, True, False]), # 75% available
            show_on_kds=random.choice([True, True, False]) # 66% on KDS
        )
        products.append(p)
        
    # 6. Customers (500)
    print("🔄 Generating 500 Customers...")
    customers = []
    for i in range(1, 501):
        c = await Customer.create(
            name=f"Load Customer {i}",
            email=f"cust_{i}@loadtest.com",
            phone=f"9{random.randint(100000000, 999999999)}"
        )
        customers.append(c)
        
    # 7. Coupons (500)
    print("🔄 Generating 500 Coupons...")
    for i in range(1, 501):
        await Coupon.create(
            code=f"LOAD{i:04d}", # Ensures unique codes like LOAD0001
            discount_type=random.choice(["percentage", "fixed"]),
            discount_value=round(random.uniform(5.0, 50.0), 2),
            min_order_amount=round(random.uniform(0, 200.0), 2)
        )
        
    # 8. Reservations (500)
    print("🔄 Generating 500 Reservations...")
    for i in range(1, 501):
        await Reservation.create(
            customer_name=f"Res Customer {i}",
            phone=f"9{random.randint(100000000, 999999999)}",
            date=date.today() + timedelta(days=random.randint(0, 30)),
            time=time(hour=random.randint(10, 21), minute=random.choice([0, 15, 30, 45])),
            party_size=random.randint(1, 8),
            table_id=random.choice(tables).id,
            status=random.choice(["pending", "confirmed", "completed"]),
            notes="Load test reservation"
        )
        
    # 9. POS Sessions (500)
    print("🔄 Generating 500 POS Sessions...")
    sessions = []
    for i in range(1, 501):
        s = await POSSession.create(
            user_id=random.choice(users).id,
            opening_cash=round(random.uniform(1000, 5000), 2),
            closing_cash=round(random.uniform(1000, 10000), 2) if random.random() > 0.2 else None,
            total_sales=round(random.uniform(0, 5000), 2),
            status=random.choice(["open", "closed"])
        )
        # If closed, set a random end time in the past
        if s.status == "closed":
            s.end_time = datetime.now() - timedelta(days=random.randint(0, 29))
            await s.save()
        sessions.append(s)
        
    # 10. Orders (500) & OrderItems (~1500 total)
    print("🔄 Generating 500 Orders and ~1500 Order Items...")
    for i in range(1, 501):
        session = random.choice(sessions)
        table = random.choice(tables)
        customer = random.choice(customers)
        
        # Create the order with 0 totals first
        order = await Order.create(
            order_number=f"LT-ORD-{i:05d}",
            table_id=table.id,
            customer_id=customer.id,
            session_id=session.id,
            status=random.choice(["draft", "paid", "cancelled"]),
            kds_status=random.choice(["to_cook", "preparing", "completed"]),
            payment_method=random.choice(["cash", "card", "upi"]),
            subtotal=0, 
            tax=0,
            total=0
        )
        
        # Add 1 to 5 random items to the order
        num_items = random.randint(1, 5)
        chosen_products = random.sample(products, num_items)
        
        order_subtotal = 0
        for prod in chosen_products:
            qty = random.randint(1, 3)
            unit_price = float(prod.price)
            line_subtotal = unit_price * qty
            order_subtotal += line_subtotal
            
            await OrderItem.create(
                order_id=order.id,
                product_id=prod.id,
                quantity=qty,
                unit_price=unit_price,
                subtotal=line_subtotal,
                item_status=random.choice(["pending", "prepared"]),
                notes=None
            )
            
        # Calculate and update final order totals
        tax = order_subtotal * 0.18
        total = order_subtotal + tax
        
        order.subtotal = order_subtotal
        order.tax = tax
        order.total = total
        await order.save()
        
    print("\n🎉 Load test data generation completed successfully!")
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(seed_load_test())