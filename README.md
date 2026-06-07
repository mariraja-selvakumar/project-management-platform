# Project Management Platform

A production-ready SaaS Project Management Platform built with Node.js, Express, Knex, MySQL, and React, now fully containerized using Docker.

## Features

- **Authentication**: Secure JWT-based login/logout with refresh token rotation.
- **Dashboard**: Real-time KPIs, task distribution charts, and activity feed.
- **Project Management**: CRUD operations for projects with status tracking.
- **Task Management**: Granular task tracking within projects.
- **User Management**: RBAC (Role-Based Access Control) for Admins, Managers, Members, and Viewers.
- **Security**: Rate limiting, Helmet.js headers, input validation, and audit logging.

## Tech Stack

- **Backend**: Node.js, Express.js, Knex.js, MySQL
- **Frontend**: React 18, Vite, Zustand, React Query, Lucide Icons, Nginx
- **Infrastructure**: Docker, Docker Compose

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)

### Setup & Running

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/mariraja-selvakumar/project-management-platform.git
    cd project-management-platform
    ```

2.  **Environment Configuration**:
    Create or update your `.env` file in the project root by copying from the example:
    ```bash
    cp .env.example .env
    ```
    *Ensure `DATABASE_URL` is set to `mysql://root:Admin@2026@db:3306/project_management` to work correctly within Docker.*

3.  **Start the Application**:
    Simply run the following command to build the images and start all services (Database, Backend, Frontend):
    ```bash
    docker-compose up -d --build
    ```
    *Note: The backend service will automatically run database migrations and seeds upon startup.*

4.  **Access the Application**:
    - **Frontend**: Navigate to `http://localhost:5173` in your browser.
    - **Database**: Access your database on host port `3307` using user `root` and password `Admin@2026`.

### Manual Operations (if needed)

- **Running Migrations Manually**:
  If you need to apply new migrations to a running backend container:
  ```bash
  docker exec -it project-management-platform-backend-1 npx knex migrate:latest
  ```

- **Stopping the Application**:
  ```bash
  docker-compose down
  ```

## API Documentation

Postman collection and environment files are located in the `docs/` folder. Import them into Postman to explore the API.

## Testing

Backend unit tests can be run locally (ensure you have dependencies installed in `/backend`):

```bash
cd backend
npm install
npm run test
```
