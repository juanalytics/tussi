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

The platform connects buyers and sellers in a highly scalable, modular, and secure environment, featuring decoupled microservices backed by PostgreSQL and MongoDB databases, with a frontend built using Next.js, React, and Tailwind CSS, plus a native mobile application for iOS and Android.

#### Key Features of Second Prototype
- **API Gateway Integration**: Centralized entry point for all client requests
- **Enhanced Security**: JWT-based authentication with middleware validation
- **Service Orchestration**: Improved service-to-service communication
- **Load Balancing**: Request distribution across microservices
- **Monitoring**: Health checks and centralized logging
- **Multi-Platform Support**: Web application and native mobile app for iOS/Android

#### Justification for Tussi's Name and Design
The name **Tussi** is intentionally provocative and disruptive—a metaphor to positively alter shopping experiences, creating emotional, sensory, and memorable interactions.

**Aesthetic and Visual Symbolism:** Intense pink color, animations, and "psychoactive" effects are deliberate emotional design choices, creating sensory engagement and visual differentiation.

**Target Audience:** Young adults interested in unconventional wellness (CBD, legal nootropics, holistic products), sustainable and disruptive fashion, and digital art and sensory items.

## 3. Architectural Structures

### Component-and-Connector (C&C) Structure

#### C&C View
```mermaid
graph TD
    subgraph "Presentation Layer"
        Frontend[/"Frontend"/]
        MobileApp[/"Mobile App"/]
    end

    subgraph "Gateway Layer"
        APIGateway["API Gateway"]
    end

    subgraph "Business Logic Layer"
        AuthService["Auth Service"]
        ProductsAPI["Products API"]
        CartAPI["Cart API"]
    end

    subgraph "Data Layer"
        AuthDB[(Auth Database<br>PostgreSQL)]
        ProductsDB[(Products Database<br>PostgreSQL)]
        CartDB[(Cart Database<br>MongoDB)]
        MobileLocalStorage[("Mobile Local<br>Storage")]
    end

    Frontend -- "HTTP REST API" --> APIGateway
    MobileApp -- "HTTP REST API" --> APIGateway

    APIGateway -- "Routes to" --> AuthService
    APIGateway -- "Routes to" --> ProductsAPI
    APIGateway -- "Routes to" --> CartAPI

    AuthService -- "Connects to" --> AuthDB
    ProductsAPI -- "Connects to" --> ProductsDB
    CartAPI -- "Connects to" --> CartDB
    MobileApp -- "Uses" --> MobileLocalStorage

    CartAPI -- "Validates User via" --> APIGateway
    CartAPI -- "Validates Stock via" --> APIGateway
```

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

5. **Multi-Platform Client Architecture**
   - Web and mobile clients consuming the same backend services
   - **Advantages:** Code reuse, consistent user experience, unified API

**Patterns:**
- **Server-Side Rendering (SSR)**: Next.js frontend with SSR capabilities
- **Circuit Breaker**: Implemented in API Gateway for fault tolerance
- **Health Check Pattern**: All services expose health endpoints
- **JWT Authentication**: Secure token-based authentication across services
- **Cross-Platform Data Synchronization**: Shared state management between web and mobile

#### Description of Architectural Elements and Relations

**Components:**

**Presentation Layer:**
- **Frontend (Next.js)**
  - Type: Presentation
  - Technology: Next.js 14, React, TypeScript, Tailwind CSS
  - Responsibilities: Server-side rendering, user interface, client-side interactions
  - **NEW:** Enhanced integration with API Gateway

- **Mobile App (React Native)** ⭐ **NEW IN PROTOTYPE 2**
  - Type: Presentation
  - Technology: React Native, TypeScript, Native Navigation
  - Responsibilities: Native mobile experience, offline capabilities, push notifications
  - Platform Support: iOS and Android

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
    - Cross-platform client support

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

- **Mobile Local Storage** ⭐ **NEW**
  - Type: Data
  - Technology: AsyncStorage (React Native)
  - Responsibilities: Offline data caching, user preferences, session persistence

**Connectors and Communication:**

**External Communications:**
- **HTTP REST API (TLS + JWT)**
  - **Web Frontend → API Gateway**: Browser-based client requests
  - **Mobile App → API Gateway**: Native mobile client requests
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
- **AsyncStorage**: Local mobile data persistence

**Critical Flows:**

1. **Authentication Flow (Enhanced)**
   - Web/Mobile Client → API Gateway → Auth Service
   - API Gateway validates and caches JWT tokens
   - Enhanced security with rate limiting and request validation
   - Cross-platform session synchronization

2. **Product Catalog Flow**
   - Web/Mobile Client → API Gateway → Products API
   - Gateway handles load balancing and caching
   - Mobile offline caching capabilities

3. **Cart Management & Checkout Flow**
   - Web/Mobile Client → API Gateway → Cart Service
   - Gateway orchestrates calls to Auth Service and Products API
   - Improved error handling and transaction management
   - Cross-platform cart synchronization

### Layered Structure

#### Layered View
The system implements an N-Tier Layered Architecture with microservices distribution:
```mermaid
graph TD
    subgraph "User Interface"
        A[Web Browser]
        B[Mobile Device]
    end

    subgraph "Presentation Layer"
        C["Frontend"]
        D["Mobile App"]
    end

    subgraph "API Gateway Layer"
        E["API Gateway"]
    end

    subgraph "Business Logic Layer"
        F["Auth Service"]
        G["Products API"]
        H["Cart API"]
    end

    subgraph "Data Access Layer"
        I["SQLAlchemy (Auth, Products)"]
        J["Mongoose (Cart)"]
        K["AsyncStorage (Mobile)"]
    end

    subgraph "Data Layer"
        L["Auth DB (PostgreSQL)"]
        M["Products DB (PostgreSQL)"]
        N["Cart DB (MongoDB)"]
        O["Mobile Local Storage"]
    end

    A --> C
    B --> D
    C --> E
    D --> E
    E --> F
    E --> G
    E --> H
    F --> I
    G --> I
    H --> J
    D --> K
    I --> L
    I --> M
    J --> N
    K --> O
```

**Layers:**
1. **Presentation Layer**
   - Components: Next.js Frontend, React Native Mobile App
   - Technologies: Next.js 14 (SSR), React, React Native, TypeScript, Tailwind CSS
   - Responsibilities: User interface rendering, client-side logic, SSR optimization, native mobile experience

2. **API Gateway Layer** ⭐ **NEW**
   - Components: API Gateway Service
   - Technologies: Node.js, Express
   - Responsibilities: Request routing, authentication, rate limiting, service orchestration, cross-platform support

3. **Business Logic Layer**
   - Components: Auth Service, Products API, Cart API
   - Technologies: FastAPI (Python), Node.js (TypeScript)
   - Responsibilities: Core business logic, validation, processing rules

4. **Data Access Layer**
   - Components: Database connectors within each service, Mobile local storage adapters
   - Technologies: SQLAlchemy (Python), Mongoose (Node.js), PostgreSQL drivers, AsyncStorage
   - Responsibilities: Data persistence, query optimization, transaction management, offline caching

5. **Data Layer**
   - Components: PostgreSQL databases, MongoDB database, Mobile local storage
   - Technologies: PostgreSQL 15, MongoDB, AsyncStorage (React Native)
   - Responsibilities: Data storage, backup, indexing, data integrity, offline data management

### Deployment Structure

#### Deployment View
Container Orchestration Pattern with Docker Compose for backend services and native mobile app distribution.
```mermaid
graph TD
    subgraph "Docker Host"
        subgraph "Docker Network (microservices_network)"
            FrontendContainer["Frontend Container<br>(Port 3000)"]
            APIGatewayContainer["API Gateway Container<br>(Port 9000)"]
            AuthServiceContainer["Auth Service Container<br>(Port 8000)"]
            ProductsAPIContainer["Products API Container<br>(Port 8001)"]
            CartAPIContainer["Cart API Container<br>(Port 8002)"]
            AuthDBContainer["Auth DB Container<br>(PostgreSQL, Port 5432)"]
            ProductsDBContainer["Products DB Container<br>(PostgreSQL, Port 5433)"]
            CartDBContainer["Cart DB Container<br>(MongoDB, Port 27017)"]
        end

        FrontendContainer -- "Depends on" --> APIGatewayContainer
        APIGatewayContainer -- "Depends on" --> AuthServiceContainer
        APIGatewayContainer -- "Depends on" --> ProductsAPIContainer
        APIGatewayContainer -- "Depends on" --> CartAPIContainer
        AuthServiceContainer -- "Depends on" --> AuthDBContainer
        ProductsAPIContainer -- "Depends on" --> ProductsDBContainer
        CartAPIContainer -- "Depends on" --> CartDBContainer
    end

    subgraph "Client Devices"
        UserDevice["User Device<br>(Browser)"]
        MobileDevice["Mobile Device<br>(iOS/Android)"]
    end

    UserDevice -- "HTTP/S" --> FrontendContainer
    UserDevice -- "HTTP/S" --> APIGatewayContainer
    MobileDevice -- "HTTP/S" --> APIGatewayContainer

    subgraph "App Stores"
        AppStore["App Store / Google Play"]
    end

    MobileDevice -- "Installs from" --> AppStore
```

**Deployment Units:**

- **Frontend Container:**
  - Image: Custom Next.js build
  - Ports: `3000:3000`
  - Dependencies: `api-gateway`
  - Environment: `NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:9000`

- **Mobile Application:** ⭐ **NEW**
  - Platform: iOS/Android Native
  - Distribution: App Store/Google Play Store
  - Dependencies: API Gateway (remote)
  - Environment: `API_GATEWAY_URL=https://api.tussi.com` (production)
  - Local Storage: AsyncStorage for offline capabilities

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
    - `MOBILE_CLIENT_SUPPORT=true`
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
- **Mobile Distribution**: Native app stores for iOS/Android deployment

### Decomposition Structure

#### Decomposition View
```mermaid
mindmap
  root("Tussi E-Commerce Platform")
    ("Presentation Module")
      ("Frontend (Next.js SSR)")
        ("React Components & Hooks")
        ("API Service Integrations")
        ("Tailwind CSS Styling")
        ("SSR Optimization")
      ("Mobile App (React Native) ⭐ NEW")
        ("Native Components & Navigation")
        ("API Service Integrations")
        ("Offline Data Management")
        ("Push Notifications")
        ("Platform-Specific Implementations")
    ("Gateway Module ⭐ NEW")
      ("API Gateway (Node.js)")
        ("Request Routing Logic")
        ("Authentication Middleware")
        ("Service Discovery")
        ("Load Balancing")
        ("Cross-Platform Support")
    ("Business Services Module")
      ("Auth Service (FastAPI + Poetry)")
        ("JWT Token Management")
        ("User Registration/Login")
        ("Cross-Platform Authentication")
        ("SQLAlchemy Models")
      ("Products API (FastAPI + Poetry)")
        ("Catalog Management")
        ("Inventory Tracking")
        ("Search & Filtering")
        ("PostgreSQL Integration")
      ("Cart API (Node.js TypeScript)")
        ("Shopping Cart Operations")
        ("Cross-Platform Cart Sync")
        ("MongoDB Document Management")
        ("Checkout Processing")
    ("Data Module")
      ("Auth Database (PostgreSQL 15)")
        ("User Credentials & Sessions")
      ("Products Database (PostgreSQL 15)")
        ("Product Catalog & Inventory")
      ("Cart Database (MongoDB)")
        ("Cart Documents & Sessions")
      ("Mobile Local Storage (AsyncStorage) ⭐ NEW")
        ("Offline Cache & User Preferences")
    ("Infrastructure Module")
      ("Docker Compose Orchestration")
      ("Microservices Network Bridge")
      ("Persistent Volume Management")
      ("Mobile App Store Distribution ⭐ NEW")
```

**Module Descriptions:**

* **Presentation Module**: Multi-platform presentation layer with Next.js-based web frontend and React Native mobile application
* **Gateway Module**: ⭐ **NEW** - Centralized API Gateway providing cross-platform request routing, authentication middleware, service discovery, and load balancing
* **Business Services Module**: Domain-specific microservices with FastAPI (Python) and Node.js (TypeScript) implementations, supporting both web and mobile clients
* **Data Module**: Polyglot persistence with PostgreSQL for relational data, MongoDB for flexible document storage, and mobile local storage for offline capabilities
* **Infrastructure Module**: Complete deployment solution with Docker-based backend services and native mobile app distribution

## 4. Technical Implementation Details

### Programming Languages Used
- **JavaScript/TypeScript**: Frontend (Next.js), Mobile App (React Native), API Gateway (Node.js), Cart API
- **Python**: Auth Service (FastAPI), Products API (FastAPI)
- **SQL**: Database queries and schema definitions
- **HTML/CSS**: Frontend templating and styling
- **Platform-Specific**: Native iOS (Swift/Objective-C) and Android (Java/Kotlin) for mobile integrations

### New Features in Prototype 2
- **API Gateway**: Centralized request handling and service orchestration
- **Enhanced Security**: JWT middleware validation at gateway level
- **Service Discovery**: Dynamic service routing and health monitoring
- **Rate Limiting**: Request throttling and abuse prevention
- **Centralized Logging**: Unified logging across all services
- **Mobile Application**: Native iOS and Android app with offline capabilities
- **Cross-Platform Synchronization**: Seamless data sync between web and mobile

## 5. Prototype Deployment

### Prerequisites
- Docker and Docker Compose (version 3.8+)
- Node.js 18+ (for local development)
- Python 3.9+ (for local development)
- Poetry (for Python dependency management)
- React Native CLI (for mobile development)
- Xcode (for iOS development)
- Android Studio (for Android development)

### Local Deployment Instructions

**1. Clone the Repository:**
```bash
git clone [repository-url]
cd TUSSI/
```

**2. Environment Setup:**
The docker-compose.yml file contains all necessary environment variables. For local development, you may need to create `.env` files for each service.

**3. Build and Deploy Backend Services:**
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

**5. Mobile App Setup:**
```bash
# Navigate to mobile app directory
cd mobile-app/

# Install dependencies
npm install

# iOS setup
cd ios && pod install && cd ..

# Run on iOS simulator
npx react-native run-ios

# Run on Android emulator
npx react-native run-android
```

**6. Verify Deployment:**
```bash
# Check all containers
docker-compose ps

# Test health endpoints
curl http://localhost:9000/health    # API Gateway
curl http://localhost:8000/health    # Auth Service
curl http://localhost:8001/health    # Products API
curl http://localhost:8002/health    # Cart API

# Test mobile app connectivity
# Open mobile app and verify API connectivity
```

### Services Configuration

| Service         | External Port | Internal Port | Description |
|:----------------|:--------------|:--------------|:------------|
| **Frontend**    | 3000          | 3000          | Next.js SSR Web Application |
| **Mobile App**  | N/A           | N/A           | **Native iOS/Android Application** ⭐ **NEW** |
| **API Gateway** | **9000**      | **9000**      | **Main API Gateway** ⭐ **NEW** |
| Auth Service    | 8000          | 8000          | Authentication & Authorization |
| Products API    | 8001          | 8000          | Product Catalog Management |
| Cart API        | 8002          | 8000          | Shopping Cart Operations |
| Auth DB         | 5432          | 5432          | PostgreSQL Auth Database |
| Products DB     | 5433          | 5432          | PostgreSQL Products Database |
| Cart DB         | 27017         | 27017         | MongoDB Cart Database |

### Access Points

- **Web Application**: http://localhost:3000
- **Mobile Application**: Available on iOS/Android devices ⭐ **NEW**
- **API Gateway**: http://localhost:9000 ⭐ **NEW**
- **API Documentation**: 
  - Gateway: http://localhost:9000/docs
  - Auth Service: http://localhost:8000/docs
  - Products API: http://localhost:8001/docs
  - Cart API: http://localhost:8002/docs

## 6. Testing

### API Testing
All API endpoints are now accessible through the API Gateway from both web and mobile clients:

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

### Mobile App Testing
- **Unit Tests**: React Native component testing with Jest
- **Integration Tests**: API connectivity and data synchronization
- **E2E Tests**: Full user flows on iOS and Android simulators
- **Device Testing**: Real device testing for iOS and Android

### Health Monitoring
- **System Health**: `GET /health` (API Gateway)
- **Service Status**: `GET /api/status` (Overall system status)
- **Mobile Connectivity**: Built-in health checks within mobile app

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

### Mobile App Debugging
```bash
# iOS debugging
npx react-native log-ios

# Android debugging
npx react-native log-android

# Metro bundler logs
npx react-native start
```

### Common Issues

**API Gateway Connection Issues:**
```bash
# Ensure all backend services are healthy
docker-compose exec api-gateway curl -f http://auth-service:8000/health
docker-compose exec api-gateway curl -f http://products-api:8000/health
docker-compose exec api-gateway curl -f http://cart-api:8000/health
```

**Mobile App Connection Issues:**
```bash
# Check API Gateway accessibility from mobile
curl http://[YOUR_LOCAL_IP]:9000/health

# Verify mobile app configuration
# Check API_GATEWAY_URL in mobile app configuration
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
- [x] **Two presentation components** - Next.js web frontend + React Native mobile app ⭐
- [x] **Four logic components** - API Gateway, Auth Service, Products API, Cart API
- [x] **Communication/orchestration component** - API Gateway handles service orchestration ⭐
- [x] **Four data components** - Auth DB, Products DB, Cart DB + Mobile AsyncStorage ⭐
- [x] **Asynchronous processing** - Background tasks in services + mobile offline sync
- [x] **HTTP-based connectors** - REST API calls, Database connectors
- [x] **Four programming languages** - JavaScript/TypeScript, Python, SQL, HTML/CSS
- [x] **Container-oriented deployment** - Full Docker Compose orchestration + mobile distribution

## 9. Changes from Prototype 1 to Prototype 2

### Major Additions:
1. **API Gateway Implementation** - Centralized request handling
2. **Enhanced Security** - JWT middleware at gateway level
3. **Service Orchestration** - Improved inter-service communication
4. **Health Monitoring** - Comprehensive health checks
5. **Load Balancing** - Request distribution capabilities
6. **Mobile Application** - Native iOS and Android app implementation ⭐
7. **Cross-Platform Support** - Unified API for web and mobile clients
8. **Offline Capabilities** - Mobile app offline data management

### Architecture Improvements:
- **Centralized Routing**: All client requests go through API Gateway
- **Better Error Handling**: Standardized error responses
- **Enhanced Monitoring**: Centralized logging and health checks
- **Improved Security**: Authentication middleware at gateway level
- **Multi-Platform Support**: Native mobile experience with data synchronization
- **Offline-First Design**: Mobile app works without internet connectivity

## 10. Future Enhancements

- Advanced push notifications for mobile app
- Message queue integration (Redis/RabbitMQ)
- Advanced monitoring (ELK Stack)
- Caching layer (Redis)
- CI/CD pipeline implementation
- Kubernetes deployment
- App Store optimization and analytics
- Mobile app performance monitoring

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
├── mobile-app/                   # ⭐ NEW - React Native Mobile Application
│   ├── android/                 # Android-specific files
│   │   ├── app/
│   │   ├── gradle/
│   │   └── build.gradle
│   ├── ios/                     # iOS-specific files
│   │   ├── TussiApp/
│   │   ├── TussiApp.xcodeproj/
│   │   └── Podfile
│   ├── src/                     # React Native source code
│   │   ├── components/          # Reusable components
│   │   ├── navigation/          # Navigation configuration
│   │   ├── screens/             # App screens
│   │   ├── services/            # API services
│   │   ├── store/               # State management
│   │   └── utils/               # Utility functions
│   ├── __tests__/               # Mobile app tests
│   ├── .eslintrc.js
│   ├── .prettierrc.js
│   ├── babel.config.js
│   ├── index.js                 # App entry point
│   ├── metro.config.js
│   ├── package.json
│   └── react-native.config.js
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

**Multi-Platform Presentation:**
- **Web Frontend** (`frontend/`): Next.js with React and TypeScript
- **Mobile Application** (`mobile-app/`): React Native with native iOS/Android support ⭐

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
- **Mobile**: React Native with platform-specific configurations for iOS and Android

**Container Architecture:**
- Each backend component has its own `Dockerfile`
- `docker-compose.yml` orchestrates all backend services
- Mobile app deployed through native app stores

**API Gateway Integration:**
- Dedicated `api-gateway/` directory shows the centralized routing approach
- `server.js` contains the main gateway logic for request handling and service orchestration
- Supports both web and mobile client requests

**Database Strategy:**
- `products_dump.sql` indicates PostgreSQL usage for products
- MongoDB integration evident in `cart-api` structure
- Database per service pattern clearly implemented
- Mobile local storage for offline capabilities

## 12. References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [API Gateway Pattern](https://microservices.io/patterns/apigateway.html)
- [Microservices Patterns](https://microservices.io/patterns/index.html)
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [Cross-Platform Development Best Practices](https://reactnative.dev/docs/platformspecific-code)