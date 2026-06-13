# 🍕 Odoo Cafe POS System

A complete web-based restaurant POS with backend configuration, a responsive POS terminal for order taking, and a real-time Kitchen Display System.

## What We Built

### Three Main Components:
1. **Backend (API & Configuration)** - RESTful API managing products, employees, tables, payments, coupons, image uploads, and PDF receipt generation.
2. **POS Terminal** - Responsive cashier interface for table selection, order taking, cart management, multi-payment processing, and receipt generation.
3. **Kitchen Display (KDS)** - Real-time Kanban board for kitchen staff to track orders from "To Cook" to "Completed" with item-level prep tracking.

## Key Features

### Backend
- ✅ Product & Category Management (with image uploads & KDS visibility toggles)
- ✅ Payment Methods configuration (Cash, Card, UPI)
- ✅ Floor Plan & Table Management (visual status tracking)
- ✅ Dynamic Coupons & Automated Promotions (percentage & fixed discounts)
- ✅ Customer & Employee Management
- ✅ PDF Receipt Generation (thermal-printer ready via ReportLab)

### POS Terminal
- ✅ Responsive 3-column layout (Products, Cart, Payment)
- ✅ Visual Floor/Table selection (Available vs. Occupied)
- ✅ Cart with quantity adjustment & real-time tax calculation
- ✅ Discount/Coupon application with backend validation
- ✅ Multiple payment methods (Cash with change calculator, Card, UPI QR)
- ✅ PDF Receipt downloading & printing
- ✅ "Send to Kitchen" functionality (creates draft orders)

### Kitchen Display (KDS)
- ✅ Real-time order tickets with auto-refresh
- ✅ Three-stage workflow Kanban (To Cook → Preparing → Completed)
- ✅ Item-level & order-level completion tracking (strikethrough UI)
- ✅ Product & category filtering
- ✅ Search functionality & toast notifications

## Tech Stack

| Layer | Tech |
|-------|------|
| **Backend API** | FastAPI, SQLite (Dev) / PostgreSQL (Prod), Tortoise ORM, PyJWT, ReportLab |
| **Frontend** | React (Vite), Tailwind CSS, Tabler Icons, React Router |
| **Database** | PostgreSQL / AsyncPG |

## Team

- Aayush Bagul - Team Leader
- Abhishek Wadile - Team Member
- Mrunal Sakhare - Team Member
- Shaunak Hawaldar - Team Member

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+

### Run Locally

```bash
# 1. Backend
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate

pip install fastapi "uvicorn[standard]" "tortoise-orm[asyncpg,aiosqlite]" pydantic python-jose PyJWT python-multipart reportlab python-dotenv

# Seed the database (creates SQLite file and populates initial data)
python seed_data.py

# Start the server
uvicorn routes.main:app --reload --port 8000

# Backend at http://localhost:8000
# API Docs at http://localhost:8000/docs
```

```bash
# 2. Frontend (in a new terminal)
cd frontend
npm install
npm install @tabler/icons-react react-router-dom

# Start the dev server
npm run dev

# Frontend at http://localhost:5173
```

### Access Points
- **POS Terminal:** `http://localhost:5173/dashboard`
- **Kitchen Display:** `http://localhost:5173/kds` (Open on a separate screen/tab)
- **API Documentation:** `http://localhost:8000/docs`