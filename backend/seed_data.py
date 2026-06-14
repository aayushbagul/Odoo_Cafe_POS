import asyncio
from tortoise import Tortoise
from tortoise_models.config import DATABASE_URL
from tortoise_models.signup import User
from tortoise_models.table import Floor, Table
from tortoise_models.product import Category, Product
from tortoise_models.customer import Customer
from tortoise_models.coupon import Coupon
from tortoise_models.payment import PaymentMethod
from tortoise_models.reservation import Reservation
from tortoise_models.session import POSSession

async def seed_data():
    # 1. Initialize Tortoise ORM with ALL models
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
    
    # 2. Completely wipe the database
    conn = Tortoise.get_connection("default")
    await conn.execute_script("""
        DROP SCHEMA public CASCADE;
        CREATE SCHEMA public;
    """)
    print("✅ Database wiped successfully.")
    
    # 3. Recreate all tables
    await Tortoise.generate_schemas()
    print("✅ Tables recreated successfully.")

    # ==========================================
    # SEED DATA
    # ==========================================

    # 1. Users (Admin, Cashier, Kitchen Staff)
    admin = await User.create(name="Admin User", username="admin", email="admin@odoo.com", password="admin123", role="admin")
    cashier = await User.create(name="John Cashier", username="cashier", email="cashier@odoo.com", password="cashier123", role="cashier")
    kitchen = await User.create(name="Mike Chef", username="kitchen", email="kitchen@odoo.com", password="kitchen123", role="kitchen")
    print("✅ Users seeded.")

    # 2. Floors & Tables
    floor1 = await Floor.create(name="Main Hall", description="Indoor seating")
    floor2 = await Floor.create(name="Outdoor Patio", description="Garden area")

    for i in range(1, 17):
        await Table.create(
            table_number=str(i),
            floor_id=floor1.id if i <= 8 else floor2.id,
            seats=4 if i % 2 == 0 else 2,
            status="available"
        )
    print("✅ Floors and Tables seeded.")

    # 3. Categories (With Colors)
    cat_chaat = await Category.create(name="Chaat", description="Indian street food", color="#E74C3C")
    cat_desert = await Category.create(name="Desert", description="Sweets and desserts", color="#F1C40F")
    cat_meal = await Category.create(name="Meal", description="Main courses", color="#2ECC71")
    cat_bev = await Category.create(name="Beverages", description="Cold drinks and teas", color="#3498DB")
    print("✅ Categories seeded with colors.")

    # 4. Products (With Unit of Measure & Tax)
    products = [
        {"name": "Masala Tea", "price": 20, "category_id": cat_bev.id, "unit_of_measure": "cup", "tax_percent": 5},
        {"name": "Coffee", "price": 50, "category_id": cat_bev.id, "unit_of_measure": "cup", "tax_percent": 5},
        {"name": "Lassi", "price": 60, "category_id": cat_bev.id, "unit_of_measure": "glass", "tax_percent": 5},
        {"name": "Pani Puri", "price": 40, "category_id": cat_chaat.id, "unit_of_measure": "plate", "tax_percent": 12},
        {"name": "Bhel Puri", "price": 50, "category_id": cat_chaat.id, "unit_of_measure": "plate", "tax_percent": 12},
        {"name": "Ice Cream", "price": 80, "category_id": cat_desert.id, "unit_of_measure": "scoop", "tax_percent": 18},
        {"name": "Gulab Jamun", "price": 60, "category_id": cat_desert.id, "unit_of_measure": "piece", "tax_percent": 18},
        {"name": "Sandwich", "price": 100, "category_id": cat_meal.id, "unit_of_measure": "piece", "tax_percent": 5},
        {"name": "Burger", "price": 120, "category_id": cat_meal.id, "unit_of_measure": "piece", "tax_percent": 5},
    ]
    for p in products:
        await Product.create(**p)
    print("✅ Products seeded.")

    # 5. Customers
    await Customer.create(name="Rahul Sharma", email="rahul@example.com", phone="9876543210")
    await Customer.create(name="Priya Singh", email="priya@example.com", phone="9123456780")
    print("✅ Customers seeded.")

    # 6. Coupons
    await Coupon.create(code="SAVE10", discount_type="percentage", discount_value=10, min_order_amount=0)
    await Coupon.create(code="FLAT50", discount_type="fixed", discount_value=50, min_order_amount=200)
    print("✅ Coupons seeded.")

    # 7. Payment Methods (Crucial for POS)
    await PaymentMethod.create(name="Cash", type="cash", is_enabled=True)
    await PaymentMethod.create(name="Card / Digital", type="card", is_enabled=True)
    await PaymentMethod.create(name="UPI QR", type="upi", is_enabled=True, upi_id="odoo.cafe@ybl")
    print("✅ Payment Methods seeded.")

    # 8. Sample Reservations
    await Reservation.create(
        customer_name="Amit Patel", 
        phone="9988776655", 
        date="2023-11-20", 
        time="19:00:00", 
        party_size=4, 
        table_id=5, 
        status="confirmed", 
        notes="Anniversary dinner"
    )
    print("✅ Reservations seeded.")

    print("\n🎉 Database seeding completed successfully!")
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(seed_data())