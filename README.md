# Todo App — Node.js + Express.js + SQLite

A full-stack Todo application built as part of a backend development course. This project covers core backend concepts including REST API design, JWT authentication, middleware, and in-memory SQLite database integration, with a served HTML/CSS/JS frontend.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (v22+) |
| Framework | Express.js v5 |
| Database | SQLite (Node.js built-in `node:sqlite`) |
| Auth | JSON Web Tokens (JWT) via `jsonwebtoken` |
| Password Hashing | `bcryptjs` |
| Frontend | Vanilla HTML, CSS, JavaScript |

---

## Features

- **User Registration & Login** — Passwords are hashed with bcrypt; JWT tokens are issued on auth
- **Protected Routes** — Auth middleware validates JWT on every `/todos` request
- **Full CRUD for Todos** — Create, read, update (mark complete), and delete todos
- **Persistent Login** — Token stored in `localStorage`; dashboard auto-loads on page refresh
- **In-memory SQLite DB** — No external DB setup needed; resets on server restart

---

## Project Structure

```
ch2/
├── public/
│   ├── index.html        # Frontend (auth + todo dashboard)
│   ├── styles.css
│   └── fanta.css
├── src/
│   ├── server.js         # Express app entry point
│   ├── db.js             # SQLite DB setup (users + todos tables)
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT verification middleware
│   └── routes/
│       ├── authRoutes.js       # POST /auth/register, POST /auth/login
│       └── todoRoutes.js       # GET/POST/PUT/DELETE /todos
├── .env                  # Environment variables (PORT, JWT_SECRET)
├── package.json
└── todo-app.rest         # REST Client test file
```

---

## Getting Started

### Prerequisites
- **Node.js v22+** (uses `--experimental-sqlite` and `--watch` flags)

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd ch2

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
PORT=5003
JWT_SECRET=your_secret_key_here
```

### Run the Dev Server

```bash
npm run dev
```

The server starts at **http://localhost:5003** with auto-restart on file changes (`--watch`).

---

## API Endpoints

### Auth (Public)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive a JWT token |

### Todos (Protected — requires `Authorization` header)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/todos` | Fetch all todos for logged-in user |
| POST | `/todos` | Create a new todo |
| PUT | `/todos/:id` | Mark a todo as complete |
| DELETE | `/todos/:id` | Delete a todo |

> **Auth header format:** `Authorization: <token>`

---

## Notes

- The SQLite database is **in-memory** — data resets every time the server restarts
- Tokens expire after **24 hours**
- This project is intentionally simple — built to learn backend fundamentals
