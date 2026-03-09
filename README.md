# BACKEND FULL COURSE - Node.JS Express.JS Prisma PostgreSQL & Docker

This guide provides an overview of the codebase, the functionality of the app, and detailed instructions on how to set up and run the app. Make sure to follow all steps carefully, especially regarding Node.js version requirements.

## Overview

This is an **Dockerized** and authentication-protected Todo App using **Node.js**, **Express.js**, **bcrypt**, **JWT authentication**, **Prisma**, and **PostgreSQL**. The app allows users to:
- **Register**: Create a new account.
- **Login**: Authenticate and receive a JWT token.
- **Manage Todos**: Perform auth protected CRUD operations on their own todo tasks after logging in.

## Project Structure

Here’s the complete project structure for the auth-protected Todo App:

```
backend-todo-app/
│
├── public/
│   └── index.html              # The frontend HTML file for authentication and todo management
│
├── prisma/
│   ├── schema.prisma           # Prisma database schema definition
│   └── migrations/             # Database migration history
│
├── src/
│   ├── middleware/
│   │   └── authMiddleware.js    # Middleware for verifying JWT and protecting routes
│   ├── routes/
│   │   ├── authRoutes.js        # Routes for user registration and login
│   │   └── todoRoutes.js        # Routes for authenticated CRUD operations on todos
│   ├── prisma.js                # Prisma client database setup and instantiation
│   └── server.js                # Main server entry point
│
├── Dockerfile                   # Docker container setup instructions
├── docker-compose.yaml          # Docker setup config for App & PostgreSQL
├── package.json                 # Project dependencies and scripts
├── package-lock.json            # Lockfile for exact dependency versions
└── todo-app.rest                # REST client file for emulating API requests
```

### Explanation of Key Directories and Files

- **`prisma/`**: Contains Prisma's schema (`schema.prisma`) and migration files. After each schema change, migration files/pushes are used to apply database changes.
- **`public/`**: Contains the frontend HTML file. This file interacts with the backend API for user registration, login, and todo management.
- **`src/`**: The core backend code, with routes, middleware, and database access logic.
- **`Dockerfile`**: The instructions for building the Node.js application in an Alpine containerized environment.
- **`docker-compose.yaml`**: Configuration for Docker Compose, which sets up the Node.js app and PostgreSQL connection in separate linked containers.
- **`todo-app.rest`**: Makes testing API endpoints quick and easy directly in VS Code.

---

## Getting Started

0. **Install Docker Desktop**: Ensure Docker Desktop is installed and running on your system.

1. **Clone the Repository**:
```bash
git clone https://github.com/your-username/backend-todo-app.git
cd backend-todo-app
```

2. **Build the Docker Images**:
This builds the Node.js application image.
```bash
docker compose build
```

3. **Boot up Docker Containers**:
Start the application and the PostgreSQL database in detached mode (background).
```bash
docker compose up -d
```
> *You can also use just `docker compose up` to see all logs directly in your terminal, but it will command your terminal session until you press `Ctrl+C`.*

4. **Initialize Your Database with Prisma**:
Push your Prisma schema to the running database to create the necessary tables. You execute this *inside* the running app container.
```bash
docker compose exec app npx prisma db push
```

*Alternative if using Migrations:*
```bash
docker compose exec app npx prisma migrate dev --name init
```

5. **Interact directly with the PostgreSQL Database**:
To login to the docker PostgreSQL database (from a new terminal instance while docker containers are running) where you can run SQL commands and manually query data:
```bash
docker exec -it postgres-db psql -U postgres -d todoapp
```
> *Useful PSQL Commands: Type `\dt` to list all tables, `SELECT * FROM "Todo";` to see all rows in the Todo table, and `\q` or `quit` to exit.*

6. **To Stop or Clean Up Docker Containers**:
Stop the running containers:
```bash
docker compose down
```
Stop and delete containers **AND** delete volumes (Warning: resets database data!):
```bash
docker compose down -v
```

8. **Access the App**:
Open `http://localhost:5003` in your browser to see the frontend. You can register, log in, and manage your todo list seamlessly.

---

## Emulating HTTP Requests (REST Client)

The **REST Client** file (`todo-app.rest`) is provided to help you test the API using HTTP requests directly. You can run these requests using the **REST Client** extension for VS Code or other compatible tools.

### `todo-app.rest`

The `todo-app.rest` file includes requests for:
- **Registering a user**: Sends a `POST` request to create a new user.
- **Logging in**: Sends a `POST` request to authenticate a user and retrieve a JWT token.
- **Fetching todos**: Sends a `GET` request to fetch the authenticated user's todos (JWT required).
- **Adding a todo**: Sends a `POST` request to create a new todo (JWT required).
- **Updating a todo**: Sends a `PUT` request to update an existing todo (JWT required).
- **Deleting a todo**: Sends a `DELETE` request to remove a todo (JWT required).

### How to Use the REST Client

1. Install the **REST Client** extension for VS Code.
2. Open `todo-app.rest`.
3. Run the requests by clicking on the "Send Request" link above each block of HTTP code.
4. **Important**: Make sure to copy the `token` from the login response and replace it in the `Authorization` header for protected routes.

## Conclusion

This guide covers the main Docker orchestration, backend components, and database workflows to get the project up and running locally. With minimal setup through Docker, you can dive straight into exploring full-stack authentication and CRUD API endpoints!
