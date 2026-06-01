# Inventory & Order Management System

A full-stack application for managing products, customers, orders, and inventory tracking.

## Technology Stack

| Layer          | Technology                    |
|----------------|-------------------------------|
| Frontend       | React (Vite)                  |
| Backend        | Python (FastAPI)              |
| Database       | PostgreSQL                    |
| Containerization | Docker + Docker Compose     |

## Project Structure

```
├── backend/          # FastAPI backend API
│   ├── app/
│   │   ├── models/   # SQLAlchemy models
│   │   ├── schemas/  # Pydantic validation schemas
│   │   ├── routers/  # API route handlers
│   │   └── services/ # Business logic layer
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   └── services/    # API client
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- Git

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd "Order Management System"
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your configuration (default values work for local development).

4. Start all services:
   ```bash
   docker compose up --build
   ```

5. Access the application:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API Docs**: http://localhost:8000/docs

### Running Without Docker

#### Backend
```bash
cd backend
pip install -r requirements.txt
export DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/order_management"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Products
| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| POST   | /api/products       | Create a product     |
| GET    | /api/products       | List all products    |
| GET    | /api/products/{id}  | Get product by ID    |
| PUT    | /api/products/{id}  | Update a product     |
| DELETE | /api/products/{id}  | Delete a product     |

### Customers
| Method | Endpoint              | Description            |
|--------|-----------------------|------------------------|
| POST   | /api/customers        | Create a customer      |
| GET    | /api/customers        | List all customers     |
| GET    | /api/customers/{id}   | Get customer by ID     |
| DELETE | /api/customers/{id}   | Delete a customer      |

### Orders
| Method | Endpoint           | Description          |
|--------|--------------------|----------------------|
| POST   | /api/orders        | Create an order      |
| GET    | /api/orders        | List all orders      |
| GET    | /api/orders/{id}   | Get order details    |
| DELETE | /api/orders/{id}   | Cancel/delete order  |

### Dashboard
| Method | Endpoint        | Description              |
|--------|-----------------|--------------------------|
| GET    | /api/dashboard  | Get summary statistics   |

## Business Rules

- Product SKU must be unique
- Customer email must be unique
- Product quantity cannot be negative
- Orders cannot be placed if stock is insufficient
- Creating an order automatically reduces stock
- Deleting an order restores stock
- Total order amount is calculated by the backend

## Environment Variables

| Variable          | Default                  | Description                    |
|-------------------|--------------------------|--------------------------------|
| POSTGRES_USER     | postgres                 | PostgreSQL username            |
| POSTGRES_PASSWORD | postgres                 | PostgreSQL password            |
| POSTGRES_DB       | order_management         | PostgreSQL database name       |
| DATABASE_URL      | (constructed from above) | Full async database URL        |
| CORS_ORIGINS      | *                        | Allowed CORS origins           |
| BACKEND_PORT      | 8000                     | Backend host port              |
| FRONTEND_PORT     | 3000                     | Frontend host port             |
| VITE_API_URL      | http://localhost:8000/api| Backend API URL for frontend   |
