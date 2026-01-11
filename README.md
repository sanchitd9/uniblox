# Shopping Cart API

## Features

- **Products**: Browse available products loaded from JSON
- **Shopping Cart**: Add items, view cart contents, track quantities
- **Discounts**: Every nth order is eligible for a 10% discount with auto-generated codes
- **Orders**: Checkout with optional discount code application
- **Admin**: Generate discount codes and view order statistics

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5
- **Testing**: Jest + Supertest

## Installation

```bash
make install
```

This installs dependencies for both the backend and frontend.

## Usage

### Start Both Servers

```bash
make start
```

This starts both the backend (port 3000) and frontend servers in the background.

### Stop Servers

```bash
make stop
```

### Run Tests

```bash
npm test
```

## API Endpoints

### Public Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/products` | Get all products |
| GET | `/api/cart` | View current cart |
| POST | `/api/cart/add` | Add item to cart |
| POST | `/api/checkout` | Create order |

### Admin Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/generateCode` | Generate discount code |
| GET | `/api/admin/stats` | Get order statistics |