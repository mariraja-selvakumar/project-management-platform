# Project Management Platform

A production-ready SaaS Project Management Platform built with Node.js, Express, Knex, MySQL, and React.

## Features

- **Authentication**: Secure JWT-based login/logout with refresh token rotation.
- **Dashboard**: Real-time KPIs, task distribution charts, and activity feed.
- **Project Management**: CRUD operations for projects with status tracking.
- **Task Management**: Granular task tracking within projects.
- **User Management**: RBAC (Role-Based Access Control) for Admins, Managers, Members, and Viewers.
- **Security**: Rate limiting, Helmet.js headers, input validation, and audit logging.

## Tech Stack

- **Backend**: Node.js, Express.js, Knex.js, MySQL
- **Frontend**: React 18, Vite, Zustand, React Query, Lucide Icons
- **Documentation**: Postman (collection & environment in `/docs`)
- **Testing**: Jest, Supertest

## Getting Started

### Prerequisites

- Node.js (v18+)
- MySQL (v8.0+)
- Docker (optional)

### Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/mariraja-selvakumar/project-management-platform.git
    cd project-management-platform
    ```

2.  **Backend Configuration**:
    ```bash
    cd backend
    cp .env.example .env
    # Update .env with your database credentials and secrets
    npm install
    npx knex migrate:latest
    npx knex seed:run
    ```

3.  **Frontend Configuration**:
    ```bash
    cd ../frontend
    npm install
    ```

### Running the App

- **Backend**: `npm start` (from `/backend`)
- **Frontend**: `npm run dev` (from `/frontend`)

### Running Tests

```bash
cd backend
npm test
```

## API Documentation

Postman collection and environment files are located in the `docs/` folder. Import them into Postman to explore the API.

## Environment Variables (Backend)

| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL connection string |
| `JWT_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `PORT` | Server port (default 3000) |
| `CORS_ORIGIN` | Allowed frontend origin |

## Security Controls

- **RBAC**: Every endpoint is protected by permission-based middleware.
- **Audit Logs**: Every write operation is recorded in the `audit_logs` table.
- **Input Validation**: Joi/Zod schemas validate all request data.
- **Rate Limiting**: Protects against brute-force and DDoS attempts.
