# Project Management Platform

## About This Project
A production-ready SaaS Project Management Platform designed to streamline team collaboration, project tracking, and task management. It features robust role-based access control, secure authentication, and real-time dashboard analytics.

## Specifications
- **Backend**: Node.js, Express.js, Knex.js, MySQL
- **Frontend**: React 18, Vite, Zustand, React Query, Lucide Icons, Nginx
- **Security**: JWT Authentication, RBAC, Rate Limiting, Helmet.js, Zod Validation
- **Infrastructure**: Docker & Docker Compose

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/mariraja-selvakumar/project-management-platform.git
cd project-management-platform
```

---

### Option A: Running with Docker (Recommended)

**Prerequisites**: [Docker Desktop](https://www.docker.com/products/docker-desktop/)

1.  **Configure**:
    ```bash
    cp .env.example .env
    ```
    Ensure `DATABASE_URL` is set to `mysql://root:Admin@2026@db:3306/project_management`.
2.  **Build & Run**:
    ```bash
    docker-compose up -d --build
    ```
    *Database migrations and seeding run automatically.*
3.  **Access**:
    - Frontend: `http://localhost:5173`
    - DB: `127.0.0.1:3307`

---

### Option B: Running Locally (Development)

**Prerequisites**: Node.js (v18+), MySQL (v8.0+)

1.  **Environment Setup**:
    Configure your `.env` file with your local MySQL credentials.
2.  **Build & Setup**:
    ```bash
    # Backend
    cd backend && npm install
    npx knex migrate:latest
    npx knex seed:run
    
    # Frontend
    cd ../frontend && npm install
    ```
3.  **Run**:
    - Backend: `npm start` (from `/backend`)
    - Frontend: `npm run dev` (from `/frontend`)

---

## Testing
```bash
cd backend
npm test
```

## Features & Documentation
- **API Documentation**: Located in `docs/` folder (Postman).
- **Security**: Includes Audit Logs, RBAC, Input Validation, and Rate Limiting.
