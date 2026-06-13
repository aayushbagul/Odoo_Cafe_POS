import asyncio
from tortoise import Tortoise
from tortoise_models.config import DATABASE_URL
from tortoise_models.signup import User
from tortoise_models.table import Floor, Table
from tortoise_models.product import Category, Product
from tortoise_models.customer import Customer

async def seed_data():
    # 1. Initialize Tortoise ORM
    await Tortoise.init(
        db_url=DATABASE_URL,
        modules={"models": [
            "tortoise_models.signup",
            "tortoise_models.table",
            "tortoise_models.product",
            "tortoise_models.customer",
            "tortoise_models.order"
        ]}
    )
    
    # 2. Completely wipe the database (Drop and recreate the public schema)
    conn = Tortoise.get_connection("default")
    await conn.execute_script("""
        DROP SCHEMA public CASCADE;
        CREATE SCHEMA public;
    """)
    print("✅ Database wiped successfully.")
    
    # 3. Recreate all tables based on your updated models
    await Tortoise.generate_schemas()
    print("✅ Tables recreated successfully.")

    # 4. Seed Data
    
    # Create Floors
    floor1 = await Floor.create(name="Floor 1", description="Main dining area")
    floor2 = await Floor.create(name="Floor 2", description="Outdoor seating")

    # Create Tables (16 tables total)
    for i in range(1, 17):
        await Table.create(
            table_number=str(i),
            floor_id=floor1.id if i <= 8 else floor2.id,
            seats=4 if i % 2 == 0 else 2,
            status="available"
        )

    # Create Categories (Matching your frontend)
    chaat_cat = await Category.create(name="Chaat", description="Indian street food")
    desert_cat = await Category.create(name="Desert", description="Sweets and desserts")
    food_cat = await Category.create(name="Meal", description="Main courses and snacks")
    bev_cat = await Category.create(name="Beverages", description="Cold drinks and teas")

    # Create Products (Matching your frontend)
    products = [
        {"name": "Masala Tea", "price": 20, "category_id": bev_cat.id},
        {"name": "Coffee", "price": 50, "category_id": bev_cat.id},
        {"name": "Lassi", "price": 60, "category_id": bev_cat.id},
        {"name": "Pani Puri", "price": 40, "category_id": chaat_cat.id},
        {"name": "Bhel Puri", "price": 50, "category_id": chaat_cat.id},
        {"name": "Ice Cream", "price": 80, "category_id": desert_cat.id},
        {"name": "Gulab Jamun", "price": 60, "category_id": desert_cat.id},
        {"name": "Sandwich", "price": 100, "category_id": food_cat.id},
        {"name": "Burger", "price": 120, "category_id": food_cat.id},
    ]

    for product in products:
        await Product.create(**product)

    # Create Sample Customers
    await Customer.create(name="Rahul Sharma", email="rahul@example.com", phone="9876543210")
    await Customer.create(name="Priya Singh", email="priya@example.com", phone="9123456780")
    await Customer.create(name="Admin", email="admin@odoo.com", phone="9999999999")

    print("✅ Database seeded successfully!")
    
    # 5. Close connections
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(seed_data())