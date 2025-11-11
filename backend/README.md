# E-commerce Backend API — Documentation

A concise reference for the E-commerce backend: endpoints, data models, authentication, example requests/responses, and quick-start instructions.

---

## Table of Contents

1. Introduction & Base URL
2. Authentication
3. Data Models (summary)
4. API Endpoints
   - Users & Authentication
   - Products
   - Cart
   - Orders
5. Errors & Status Codes
6. Quick Start

---

## 1. Introduction & Base URL

Base URL (local development):
http://localhost:3000/api

This document describes request/response formats and authorization requirements for the API.

---

## 2. Authentication

- Mechanism: JSON Web Tokens (JWT)
- Cookie: Server sets a secure, HttpOnly cookie on login/register.
- Header: For protected routes clients must send:
  Authorization: Bearer <JWT>

Authentication flow:

1. Register or login via `/users/register` or `/users/login`.
2. Server returns a JWT and sets a secure HttpOnly cookie.
3. Client includes the JWT in the Authorization header for protected endpoints.
4. `authUser.js` middleware validates the token and attaches `req.user`.

Roles: `user`, `admin`.

---

## 3. Data Models (summary)

- User: {\_id, username, email, fullname {firstname, lastname}, role}
- Fabric: {\_id, fabric_name, material, color, ...}
- Product: {\_id, product_name, price, stock_quantity, fabric_id}
- Cart: {\_id, user_id, items: [{product_id, quantity}]}
- Order: {\_id, user_id, orderItems: [{product_id, quantity, price_at_purchase}], total_amount, status, order_date}

---

## 4. API Endpoints

### 4.1 Users & Authentication

Register a New User

- Method: POST
- Endpoint: /users/register
- Auth: Public
- Body (example):
  {
  "fullname": { "firstname": "Aisha", "lastname": "Khan" },
  "username": "aisha_k",
  "email": "aisha.khan@example.com",
  "password": "PasswordAisha1"
  }
- Success: 201 Created — message and created user object
- Errors: 400 Bad Request (validation), 409 Conflict (duplicate)

Login a User

- Method: POST
- Endpoint: /users/login
- Auth: Public
- Body (example): { "email": "aisha.khan@example.com", "password": "PasswordAisha1" }
- Success: 200 OK — message, user, token
- Error: 401 Unauthorized

Logout a User

- Method: GET
- Endpoint: /users/logout
- Auth: User
- Success: 200 OK — { "message": "Logout Successfully" }
- Notes: Token blacklisting used to invalidate current token

---

### 4.2 Products

Get All Products

- Method: GET
- Endpoint: /products
- Auth: Public
- Success: 200 OK — list of products with populated fabric details
- Example product structure:
  {
  "\_id": "...",
  "product_name": "Classic White T-Shirt",
  "price": 29.99,
  "stock_quantity": 150,
  "fabric_id": { "\_id": "...", "fabric_name": "Premium Cotton", "material": "Cotton" }
  }

Note: Fabric CRUD is similar and typically admin-only.

---

### 4.3 Shopping Cart (Authenticated)

Get My Cart

- Method: GET
- Endpoint: /cart
- Auth: User
- Success: 200 OK — cart object with items

Add or Update Item

- Method: POST
- Endpoint: /cart/items
- Auth: User
- Body: { "product_id": "690afb8a1797d8667aa66cce", "quantity": 2 }
- Success: 200 OK — returns updated cart
- Errors: 400 Bad Request (missing fields or insufficient stock), 404 Not Found (product)

Remove Item

- Method: DELETE
- Endpoint: /cart/items/:productId
- Auth: User
- Success: 200 OK — returns updated cart
- Error: 404 Not Found if item not in cart

---

### 4.4 Orders

Create an Order (Checkout)

- Method: POST
- Endpoint: /orders
- Auth: User
- Behavior: converts cart into an order, saves price_at_purchase, decrements stock, clears cart
- Success: 201 Created — order object with total_amount and status
- Error: 400 Bad Request if cart empty or product out of stock

Get My Orders

- Method: GET
- Endpoint: /orders/my-orders
- Auth: User
- Success: 200 OK — array of past orders

Update Order Status (Admin)

- Method: PATCH
- Endpoint: /orders/:id/status
- Auth: Admin
- Body: { "status": "Shipped" }
- Success: 200 OK — updated order
- Errors: 403 Forbidden (not admin), 404 Not Found (order)

---

## 5. Errors & Status Codes (summary)

- 200 OK — successful retrieval or non-creation operations
- 201 Created — resource created
- 400 Bad Request — validation error, empty cart, insufficient stock
- 401 Unauthorized — invalid credentials / missing token
- 403 Forbidden — insufficient permissions
- 404 Not Found — resource missing
- 409 Conflict — duplicate resource (email/username)

---

## 6. Quick Start (local)

1. Ensure MongoDB is running.
2. Install dependencies:
   cd d:\VS_Code\RiloProject\backend
   npm install
3. Configure `.env` (PORT, MONGO_URI, JWT_SECRET, etc.)
4. Start server:
   npm run dev
5. API base: http://localhost:3000/api

---

Notes & Conventions:

- Timestamps: ISO 8601
- Prices: numeric (decimals) — validate on write
- Stock adjustments occur only on successful order creation

If you want, I can generate a Postman collection or example curl commands for these endpoints.
