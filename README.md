# Artifact

## 1. Team

**Name:** 1a  

**Team Members:**
- Xamir Ernesto Rojas Gamboa
- Juan Sebastian Medina Pinto
- Juan Manuel Pérez Ordoñez

## 2. Software System

**Name:** Tussi

**Logo:**

![Tussi Logo](logo.png)

## Description

**Tussi** is an ecommerce platform built upon a distributed, modern architecture, connecting buyers and sellers in a highly scalable, modular, and secure environment. It includes decoupled microservices for authentication, product catalog management, and shopping cart management, backed by PostgreSQL and MongoDB databases, with a frontend built using React and Tailwind CSS.

### Prototype Objective

The first deliverable demonstrates a functional vertical flow, covering:

- User registration and login (auth-service with FastAPI and JWT)
- Product catalog viewing (service with FastAPI and PostgreSQL)
- Adding products to cart and checkout (cart-service with Express and MongoDB)

Each service is developed, documented, and containerized with Docker, orchestrated by Docker Compose, adhering to maintainability, scalability, and portability.

### Justification for Tussi’s Name and Design

The name **Tussi** is intentionally provocative and disruptive—a metaphor to positively alter shopping experiences, creating emotional, sensory, and memorable interactions.

#### Aesthetic and Visual Symbolism

Intense pink color, animations, and "psychoactive" effects are deliberate emotional design choices, creating sensory engagement and visual differentiation.

#### Target Audience

**Tussi** targets young adults interested in:
- Unconventional wellness (CBD, legal nootropics, holistic products)
- Sustainable and disruptive fashion
- Digital art and sensory items

It appeals to conscious, curious, and creative consumers seeking authentic, unique experiences.

#### Value Proposition and Innovation

Tussi integrates:
- **Curated products** (sustainable, original, safe)
- **Radical transparency** (product origins, benefits, real effects)
- **Community elements** (experiential reviews, forums, direct feedback)

#### Strategic Benefits

The provocative name and design generate immediate impact and memorability, facilitating virality and differentiation, reducing market entry barriers, and establishing emotional connections from first contact.

## 3. Architectural Structures

### Component-and-Connector (C&C) Structure

#### C&C View
![Tussi Logo](diagram.png)

**Architectural Styles:**

1. **Microservices**  
   Independently deployable services like auth-service and products-api, each with isolated logic, databases, and Docker containers.  
   **Advantages:** Parallel teamwork, simplified maintenance, and horizontal scalability.

2. **Container-based Architecture**  
   All system components (services, databases) run in Docker containers orchestrated by Docker Compose.  
   **Advantages:** Consistent environments, simplified deployment, dependency isolation.

3. **Client-Server Architecture**  
   Frontend (Next.js with React-TS) acts as client, consuming backend microservices via HTTP.  
   **Advantages:** Clear separation of presentation and business logic, standard HTTP/REST interaction.

4. **Layered Architecture**  
   Each microservice internally structured into defined layers: Controllers (API), Services (business logic), Models/Schemas (data), Repository/DB (persistence).  
   **Advantages:** Easy unit testing, clear separation of concerns, improved maintainability.

### Architectural Elements and Relations

**Connectors and Protocols:**

- **REST-HTTP/JSON (TLS + JWT)**
  - Web Client → Auth Service (`POST /auth/register, POST /auth/login, GET /auth/me`)
  - Web Client → Products API (`GET /products, GET /products/{id}`)
  - Web Client → Cart Service (`GET /cart, POST /cart/add, POST /cart/checkout`)

- **SQL (TCP/5432)**
  - Auth Service → auth-db (PostgreSQL) for user operations
  - Products API → products-db (PostgreSQL) for product operations

- **MongoDB Driver (TCP/27017)**
  - Cart Service → MongoDB for cart data management

- **Internal REST (JSON + JWT)**
  - Cart Service → Auth Service to validate JWT tokens and authorize checkout
  - Cart Service → Products API to decrease stock after successful checkout

**Critical Flows:**

- **Authentication:** Client sends credentials to Auth Service, receives JWT, and includes it in `Authorization: Bearer <token>` headers.
- **Session Validation:** Client queries `/auth/me` endpoint with JWT for user profile and state.
- **Product Catalog:** Client requests product lists/details from Products API, which queries PostgreSQL.
- **Cart Management & Checkout:** Client manages cart via Cart Service (MongoDB). During checkout, Cart Service validates JWT via Auth Service, checks stock via Products API, simulates payment processing, updates MongoDB, and adjusts stock via Products API.

## 4. Prototype

### Instructions for Deploying the Software System Locally

**Run Command:**
```bash
docker compose up --build
```

**Accessing the Database:**
```bash
docker exec -it products-db psql -U user -d products
```

**Populating the Database:**
Copy and run queries from `products_dump.sql` to populate the database with sample products.

**Using the Application:**
Frontend accessible through your browser at:

```
http://localhost:3000/
```
