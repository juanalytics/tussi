# Artifact

## 1. Team

**Name:** 1a  

**Team Members:**
- Xamir Ernesto Rojas Gamboa
- Juan Sebastian Medina Pinto
- Juan Manuel Pérez Ordoñez

## 2. Software System

### Name
Tussi

### Logo
![Tussi Logo](logo.png)

### Description
**Tussi** is a distributed e-commerce platform built with modern microservices architecture that provides user authentication, product catalog management, and shopping cart functionality. The system is designed to handle high traffic loads through distributed services and uses modern web technologies for optimal performance and scalability.

The platform connects buyers and sellers in a highly scalable, modular, and secure environment, featuring decoupled microservices backed by PostgreSQL and MongoDB databases, with a frontend built using Next.js, React, and Tailwind CSS.

#### Key Features of Second Prototype
- **API Gateway Integration**: Centralized entry point for all client requests
- **Enhanced Security**: JWT-based authentication with middleware validation
- **Service Orchestration**: Improved service-to-service communication
- **Load Balancing**: Request distribution across microservices
- **Monitoring**: Health checks and centralized logging

#### Justification for Tussi's Name and Design
The name **Tussi** is intentionally provocative and disruptive—a metaphor to positively alter shopping experiences, creating emotional, sensory, and memorable interactions.

**Aesthetic and Visual Symbolism:** Intense pink color, animations, and "psychoactive" effects are deliberate emotional design choices, creating sensory engagement and visual differentiation.

**Target Audience:** Young adults interested in unconventional wellness (CBD, legal nootropics, holistic products), sustainable and disruptive fashion, and digital art and sensory items.

## 3. Architectural Structures

### Component-and-Connector (C&C) Structure

#### C&C View
![Architecture Diagram](ArquitectureC&C.png)

#### Description of Architectural Styles and Patterns Used

**Architectural Styles:**
1. **Microservices Architecture**
   - Distributed system with independently deployable services
   - Each service has isolated logic, databases, and Docker containers
   - **Advantages:** Parallel development, simplified maintenance, horizontal scalability

2. **API Gateway Pattern**
   - Single entry point for all client requests
   - Centralized routing, authentication, and cross-cutting concerns
   - **NEW IN PROTOTYPE 2:** Enhanced service orchestration and load balancing

3. **Container-based Architecture**
   - All system components run in Docker containers orchestrated by Docker Compose
   - **Advantages:** Consistent environments, simplified deployment, dependency isolation

4. **Database per Service Pattern**
   - Each microservice has its own dedicated database
   - **Advantages:** Data isolation, technology diversity, independent scaling

**Patterns:**
- **Server-Side Rendering (SSR)**: Next.js frontend with SSR capabilities
- **Circuit Breaker**: Implemented in API Gateway for fault tolerance
- **Health Check Pattern**: All services expose health endpoints
- **JWT Authentication**: Secure token-based authentication across services

#### Description of Architectural Elements and Relations

**Components:**

**Presentation Layer:**
- **Frontend (Next.js)**
  - Type: Presentation
  - Technology: Next.js 14, React, TypeScript, Tailwind CSS
  - Responsibilities: Server-side rendering, user interface, client-side interactions
  - **NEW:** Enhanced integration with API Gateway

**Gateway Layer:**
- **API Gateway** ⭐ **NEW IN PROTOTYPE 2**
  - Type: Logic/Communication
  - Technology: Node.js, Express
  - Responsibilities: 
    - Request routing and load balancing
    - Authentication middleware and JWT validation
    - Rate limiting and CORS handling
    - Service discovery and health monitoring
    - Centralized logging and error handling

**Business Logic Layer:**
- **Auth Service**
  - Type: Logic
  - Technology: FastAPI (Python), Poetry for dependency management
  - Responsibilities: User authentication, JWT token management, user registration/login

- **Products API**
  - Type: Logic
  - Technology: FastAPI (Python), Poetry for dependency management
  - Responsibilities: Product catalog management, inventory tracking, product search

- **Cart API**
  - Type: Logic
  - Technology: Node.js, TypeScript, Express
  - Responsibilities: Shopping cart operations, cart persistence, cart session management

**Data Layer:**
- **Auth Database**
  - Type: Data
  - Technology: PostgreSQL 15
  - Responsibilities: User credentials, authentication data storage

- **Products Database**
  - Type: Data
  - Technology: PostgreSQL 15
  - Responsibilities: Product information, inventory data storage

- **Cart Database**
  - Type: Data
  - Technology: MongoDB
  - Responsibilities: Shopping cart data, session storage

**Connectors and Communication:**

**External Communications:**
- **HTTP REST API (TLS + JWT)**
  - **Frontend → API Gateway**: All client requests now go through the gateway
  - **API Gateway → Microservices**: Internal service communication via bridge network

**Internal Communications:**
- **API Gateway → Auth Service**: Authentication and authorization requests
- **API Gateway → Products API**: Product catalog operations
- **API Gateway → Cart API**: Shopping cart management
- **Cart API → Auth Service**: User validation via API Gateway
- **Cart API → Products API**: Stock validation via API Gateway

**Database Connections:**
- **SQL (TCP/5432)**: PostgreSQL drivers for auth/products services
- **MongoDB Driver (TCP/27017)**: MongoDB driver for cart service

**Critical Flows:**

1. **Authentication Flow (Enhanced)**
   - Client → API Gateway → Auth Service
   - API Gateway validates and caches JWT tokens
   - Enhanced security with rate limiting and request validation

2. **Product Catalog Flow**
   - Client → API Gateway → Products API
   - Gateway handles load balancing and caching

3. **Cart Management & Checkout Flow**
   - Client → API Gateway → Cart Service
   - Gateway orchestrates calls to Auth Service and Products API
   - Improved error handling and transaction management

### Layered Structure

#### Layered View
The system implements an N-Tier Layered Architecture with microservices distribution:

**Layers:**
1. **Presentation Layer**
   - Components: Next.js Frontend
   - Technologies: Next.js 14 (SSR), React, TypeScript, Tailwind CSS
   - Responsibilities: User interface rendering, client-side logic, SSR optimization

2. **API Gateway Layer** ⭐ **NEW**
   - Components: API Gateway Service
   - Technologies: Node.js, Express
   - Responsibilities: Request routing, authentication, rate limiting, service orchestration

3. **Business Logic Layer**
   - Components: Auth Service, Products API, Cart API
   - Technologies: FastAPI (Python), Node.js (TypeScript)
   - Responsibilities: Core business logic, validation, processing rules

4. **Data Access Layer**
   - Components: Database connectors within each service
   - Technologies: SQLAlchemy (Python), Mongoose (Node.js), PostgreSQL drivers
   - Responsibilities: Data persistence, query optimization, transaction management

5. **Data Layer**
   - Components: PostgreSQL databases, MongoDB database
   - Technologies: PostgreSQL 15, MongoDB
   - Responsibilities: Data storage, backup, indexing, data integrity

### Deployment Structure

#### Deployment View
Container Orchestration Pattern with Docker Compose for local development and testing.

**Deployment Units:**

- **Frontend Container:**
  - Image: Custom Next.js build
  - Ports: `3000:3000`
  - Dependencies: `api-gateway`
  - Environment: `NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:9000`

- **API Gateway Container:** ⭐ **NEW**
  - Image: Custom Node.js build
  - Ports: `9000:9000`
  - Dependencies: `auth-service`, `products-api`, `cart-api`
  - Environment: 
    - `NODE_ENV=production`
    - `PORT=9000`
    - `JWT_SECRET=your-secret-key`
    - `AUTH_SERVICE_URL=http://auth-service:8000`
    - `PRODUCTS_SERVICE_URL=http://products-api:8000`
    - `CART_SERVICE_URL=http://cart-api:8000`
  - Health Check: `curl -f http://localhost:9000/health`

- **Auth Service Container:**
  - Image: Custom FastAPI build
  - Ports: `8000:8000`
  - Dependencies: `auth-db`
  - Environment: `DATABASE_URL=postgresql://authuser:supersecret@auth-db:5432/auth`
  - Health Check: `curl -f http://localhost:8000/health`

- **Products API Container:**
  - Image: Custom FastAPI build
  - Ports: `8001:8000`
  - Dependencies: `products-db`
  - Environment: `DATABASE_URL=postgresql://user:password@products-db:5432/products`
  - Health Check: `curl -f http://localhost:8000/health`

- **Cart API Container:**
  - Image: Custom Node.js TypeScript build
  - Ports: `8002:8000`
  - Dependencies: `carts-db`, `auth-service`
  - Environment: `MONGO_URI=mongodb://root:rootpassword@carts-db:27017/cart-service?authSource=admin`
  - Health Check: `curl -f http://localhost:8000/health`

- **Database Containers:**
  - **Auth DB**: PostgreSQL 15 on port 5432
  - **Products DB**: PostgreSQL 15 on port 5433
  - **Cart DB**: MongoDB on port 27017

**Infrastructure:**
- **Network**: Custom bridge network (`microservices_network`) for internal communication
- **Storage**: Docker volumes for database persistence
- **Monitoring**: Health checks for all services
- **Load Balancing**: API Gateway handles service routing and load distribution

### Decomposition Structure

#### Decomposition View
```
Tussi E-Commerce Platform
├── Presentation Module
│   └── Frontend (Next.js SSR)
│       ├── React Components & Hooks
│       ├── API Service Integrations
│       ├── Tailwind CSS Styling
│       └── SSR Optimization
├── Gateway Module ⭐ NEW
│   └── API Gateway (Node.js)
│       ├── Request Routing Logic
│       ├── Authentication Middleware
│       ├── Service Discovery
│       └── Load Balancing
├── Business Services Module
│   ├── Auth Service (FastAPI + Poetry)
│   │   ├── JWT Token Management
│   │   ├── User Registration/Login
│   │   └── SQLAlchemy Models
│   ├── Products API (FastAPI + Poetry)
│   │   ├── Catalog Management
│   │   ├── Inventory Tracking
│   │   └── PostgreSQL Integration
│   └── Cart API (Node.js TypeScript)
│       ├── Shopping Cart Operations
│       ├── MongoDB Document Management
│       └── Checkout Processing
├── Data Module
│   ├── Auth Database (PostgreSQL 15)
│   │   └── User Credentials & Sessions
│   ├── Products Database (PostgreSQL 15)
│   │   └── Product Catalog & Inventory
│   └── Cart Database (MongoDB)
│       └── Cart Documents & Sessions
└── Infrastructure Module
    ├── Docker Compose Orchestration
    ├── Microservices Network Bridge
    ├── Persistent Volume Management
    └── Optional Nginx Load Balancer
```

**Module Descriptions:**

* **Presentation Module**: Next.js-based frontend with SSR capabilities, React components, custom hooks, and Tailwind CSS styling
* **Gateway Module**: ⭐ **NEW** - Centralized API Gateway providing request routing, authentication middleware, service discovery, and load balancing
* **Business Services Module**: Domain-specific microservices with FastAPI (Python) and Node.js (TypeScript) implementations
* **Data Module**: Polyglot persistence with PostgreSQL for relational data and MongoDB for flexible document storage
* **Infrastructure Module**: Complete Docker-based deployment with container orchestration, networking, and persistent storage

## 4. Technical Implementation Details

### Programming Languages Used
- **JavaScript/TypeScript**: Frontend (Next.js), API Gateway (Node.js), Cart API
- **Python**: Auth Service (FastAPI), Products API (FastAPI)
- **SQL**: Database queries and schema definitions
- **HTML/CSS**: Frontend templating and styling

### New Features in Prototype 2
- **API Gateway**: Centralized request handling and service orchestration
- **Enhanced Security**: JWT middleware validation at gateway level
- **Service Discovery**: Dynamic service routing and health monitoring
- **Rate Limiting**: Request throttling and abuse prevention
- **Centralized Logging**: Unified logging across all services

## 5. Prototype Deployment

### Prerequisites
- Docker and Docker Compose (version 3.8+)
- Node.js 18+ (for local development)
- Python 3.9+ (for local development)
- Poetry (for Python dependency management)

### Local Deployment Instructions

**1. Clone the Repository:**
```bash
git clone [repository-url]
cd TUSSI/
```

**2. Environment Setup:**
The docker-compose.yml file contains all necessary environment variables. For local development, you may need to create `.env` files for each service.

**3. Build and Deploy:**
```bash
# Build all containers
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

**4. Database Initialization:**
```bash
# Wait for databases to be ready
docker-compose ps

# Populate products database
docker exec -it products-db psql -U user -d products
# Then run queries from products_dump.sql
```

**5. Verify Deployment:**
```bash
# Check all containers
docker-compose ps

# Test health endpoints
curl http://localhost:9000/health    # API Gateway
curl http://localhost:8000/health    # Auth Service
curl http://localhost:8001/health    # Products API
curl http://localhost:8002/health    # Cart API
```

### Services Configuration

| Service         | External Port | Internal Port | Description |
|:----------------|:--------------|:--------------|:------------|
| **Frontend**    | 3000          | 3000          | Next.js SSR Web Application |
| **API Gateway** | **9000**      | **9000**      | **Main API Gateway** ⭐ **NEW** |
| Auth Service    | 8000          | 8000          | Authentication & Authorization |
| Products API    | 8001          | 8000          | Product Catalog Management |
| Cart API        | 8002          | 8000          | Shopping Cart Operations |
| Auth DB         | 5432          | 5432          | PostgreSQL Auth Database |
| Products DB     | 5433          | 5432          | PostgreSQL Products Database |
| Cart DB         | 27017         | 27017         | MongoDB Cart Database |

### Access Points

- **Web Application**: http://localhost:3000
- **API Gateway**: http://localhost:9000 ⭐ **NEW**
- **API Documentation**: 
  - Gateway: http://localhost:9000/docs
  - Auth Service: http://localhost:8000/docs
  - Products API: http://localhost:8001/docs
  - Cart API: http://localhost:8002/docs

## 6. Testing

### API Testing
All API endpoints are now accessible through the API Gateway:

**Authentication:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

**Products:**
- `GET /api/products`
- `GET /api/products/{id}`

**Cart:**
- `GET /api/cart`
- `POST /api/cart/add`
- `POST /api/cart/checkout`

### Health Monitoring
- **System Health**: `GET /health` (API Gateway)
- **Service Status**: `GET /api/status` (Overall system status)

## 7. Monitoring and Troubleshooting

### Application Logs
```bash
# View logs for specific service
docker-compose logs -f api-gateway
docker-compose logs -f auth-service
docker-compose logs -f products-api
docker-compose logs -f cart-api

# View all logs
docker-compose logs -f
```

### Common Issues

**API Gateway Connection Issues:**
```bash
# Ensure all backend services are healthy
docker-compose exec api-gateway curl -f http://auth-service:8000/health
docker-compose exec api-gateway curl -f http://products-api:8000/health
docker-compose exec api-gateway curl -f http://cart-api:8000/health
```

**Database Connection Issues:**
```bash
# Check database health
docker-compose exec auth-db pg_isready -U authuser -d auth
docker-compose exec products-db pg_isready -U user -d products
docker-compose exec carts-db mongosh --eval "db.adminCommand('ping')"
```

## 8. Architecture Compliance Checklist

- [x] **Distributed architecture** - Microservices with API Gateway orchestration
- [x] **Two presentation components** - Next.js web frontend + Mobile app (planned)
- [x] **Four logic components** - API Gateway, Auth Service, Products API, Cart API
- [x] **Communication/orchestration component** - API Gateway handles service orchestration ⭐
- [x] **Four data components** - Auth DB, Products DB, Cart DB + planned mobile storage
- [x] **Asynchronous processing** - Background tasks in services
- [x] **HTTP-based connectors** - REST API calls, Database connectors
- [x] **Four programming languages** - JavaScript/TypeScript, Python, SQL, HTML/CSS
- [x] **Container-oriented deployment** - Full Docker Compose orchestration

## 9. Changes from Prototype 1 to Prototype 2

### Major Additions:
1. **API Gateway Implementation** - Centralized request handling
2. **Enhanced Security** - JWT middleware at gateway level
3. **Service Orchestration** - Improved inter-service communication
4. **Health Monitoring** - Comprehensive health checks
5. **Load Balancing** - Request distribution capabilities

### Architecture Improvements:
- **Centralized Routing**: All client requests go through API Gateway
- **Better Error Handling**: Standardized error responses
- **Enhanced Monitoring**: Centralized logging and health checks
- **Improved Security**: Authentication middleware at gateway level

## 10. Future Enhancements

- Mobile application implementation
- Message queue integration (Redis/RabbitMQ)
- Advanced monitoring (ELK Stack)
- Caching layer (Redis)
- CI/CD pipeline implementation
- Kubernetes deployment

## 11. Project Structure

```
TUSSI/
├── .gitignore
├── diagram.png                     # Architecture diagram
├── docker-compose.yml             # Container orchestration
├── logo.png                       # Tussi logo
├── products_dump.sql              # Sample products data
├── README.md                      # This documentation
├── api-gateway/                   # ⭐ NEW - API Gateway Service
│   ├── node_modules/
│   ├── Dockerfile
│   ├── package-lock.json
│   ├── package.json
│   └── server.js                  # Gateway routing logic
├── frontend/                      # Next.js Frontend Application
│   ├── app/
│   │   ├── components/           # React components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utility libraries
│   │   ├── public/              # Static assets
│   │   ├── services/            # API service calls
│   │   └── styles/              # CSS and styling
│   ├── components.json          # shadcn/ui configuration
│   ├── Dockerfile
│   ├── next-env.d.ts
│   ├── next.config.mjs
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── postcss.config.mjs
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── web-app-manifest-512x512.png
├── nginx/                        # Optional Load Balancer
│   └── nginx.conf               # Nginx configuration
├── services/                     # Microservices Directory
│   ├── auth-service/            # Authentication Microservice
│   │   ├── app/
│   │   │   ├── controllers/     # FastAPI route handlers
│   │   │   ├── models/          # SQLAlchemy models
│   │   │   └── services/        # Business logic
│   │   ├── database.py          # Database configuration
│   │   ├── deps.py              # Dependencies and middleware
│   │   ├── main.py              # FastAPI application entry
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── Dockerfile
│   │   ├── poetry.lock
│   │   ├── pyproject.toml       # Poetry configuration
│   │   └── requirements.txt     # Python dependencies
│   ├── cart-api/                # Cart Management Microservice
│   │   ├── node_modules/
│   │   ├── src/
│   │   │   ├── config/          # Database and app configuration
│   │   │   ├── controllers/     # Express route controllers
│   │   │   ├── middleware/      # Authentication middleware
│   │   │   ├── models/          # MongoDB models
│   │   │   ├── routes/          # API route definitions
│   │   │   ├── utils/           # Utility functions
│   │   │   └── index.js         # Application entry point
│   │   ├── .dockerignore
│   │   ├── .env                 # Environment variables
│   │   ├── .gitignore
│   │   ├── Dockerfile
│   │   ├── package-lock.json
│   │   └── package.json
│   └── products-api/            # Products Catalog Microservice
│       ├── app/
│       │   ├── db/              # Database utilities
│       │   ├── models/          # SQLAlchemy models
│       │   ├── routers/         # FastAPI routers
│       │   ├── schemas/         # Pydantic schemas
│       │   ├── services/        # Business logic services
│       │   └── __init__.py
│       ├── main.py              # FastAPI application entry
│       ├── tests/               # Unit tests
│       ├── Dockerfile
│       └── pyproject.toml       # Poetry configuration
```

### Architecture Insights from Project Structure

**Microservices Distribution:**
- Each service (`auth-service`, `products-api`, `cart-api`) is completely isolated with its own:
  - Dependencies (`pyproject.toml`, `package.json`)
  - Dockerfile for containerization
  - Internal folder structure following best practices
  - Database models and business logic

**Technology Stack Evidence:**
- **Python Services** (`auth-service`, `products-api`): Use Poetry for dependency management and FastAPI framework
- **Node.js Services** (`cart-api`, `api-gateway`): Use npm/yarn with TypeScript support
- **Frontend**: Next.js with modern tooling (Tailwind, TypeScript, pnpm)

**Container Architecture:**
- Each component has its own `Dockerfile`
- `docker-compose.yml` orchestrates all services
- Clear separation between development and production configurations

**API Gateway Integration:**
- Dedicated `api-gateway/` directory shows the centralized routing approach
- `server.js` contains the main gateway logic for request handling and service orchestration

**Database Strategy:**
- `products_dump.sql` indicates PostgreSQL usage for products
- MongoDB integration evident in `cart-api` structure
- Database per service pattern clearly implemented

## 12. References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [API Gateway Pattern](https://microservices.io/patterns/apigateway.html)
- [Microservices Patterns](https://microservices.io/patterns/index.html)