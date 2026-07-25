# CanonSync AI – Backend API Reference

The **CanonSync AI Backend** is a high-performance RESTful API designed to manage television show canon facts, script submissions, and continuity analysis reports. It is built with a strictly structured, layered Object-Oriented Programming (OOP) architecture using Node.js, Express.js, and PostgreSQL.

---

## 🏗️ Architecture & Design Principles

The backend utilizes a **layered OOP architecture** to decouple database operations, business logic, route definitions, and request/response coordination:

```
[ HTTP Requests ]
       │
       ▼
 ┌───────────┐
 │  Routes   │  ──► Map URL patterns & HTTP methods to Controller handlers
 └───────────┘
       │
       ▼
 ┌───────────┐
 │Controllers│  ──► Coordinate Express req/res, run basic validation, set status codes
 └───────────┘
       │
       ▼
 ┌───────────┐
 │ Services  │  ──► Contain business logic, validation rules, cross-module constraints
 └───────────┘
       │
       ▼
 ┌───────────┐
 │Repos/Model│  ──► Execute parameterized SQL queries; instantiate OOP model entities
 └───────────┘
       │
       ▼
[ PostgreSQL ]
```

### Core Layers:
1. **Routes (`/routes`)**: Maps Express requests directly to Controller methods.
2. **Controllers (`/controllers`)**: Manages the req/res lifecycle. Performs high-level input extraction and HTTP response status formatting.
3. **Services (`/services`)**: Contains strict business logic, parameter/relation verification, and domain rules.
4. **Repositories (`/repositories`)**: Encapsulates all raw, parameterized SQL queries using the `pg` driver (preventing SQL injection).
5. **Models (`/models`)**: Defines ES6 classes matching database table entities.

---

## 🛠️ Technology Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (v5+)
- **Database**: PostgreSQL (v14+)
- **Driver**: `pg` (Node-Postgres)
- **Module System**: ES Modules (`import`/`export`)
- **Configuration**: `dotenv`

---

## 📁 Directory Structure

```
backend/
├── config/            # Database pool setup and configurations
├── controllers/       # HTTP Request/Response controllers (OOP bound methods)
├── middleware/        # Express custom middleware (loggers, error handlers)
├── models/            # Entity models matching DB tables
├── repositories/      # Database access layer (RAW parameterized SQL queries)
├── routes/            # Express route routers
├── services/          # Pure business logic and domain verification
├── utils/             # Reusable helper utilities (e.g., UUID validators)
├── app.js             # App setup (middleware registration, routing mounting)
└── server.js          # Main entrypoint (database test and server listener start)
```

---

## 📡 API Endpoints

All endpoints require JSON request payloads and return JSON responses.

### Shows (`/api/v1/shows`)
| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/shows` | Register a new TV show | `201 Created` |
| **GET** | `/api/v1/shows` | Retrieve all registered shows | `200 OK` |
| **GET** | `/api/v1/shows/:id` | Fetch details of a show by ID | `200 OK` |
| **PATCH** | `/api/v1/shows/:id` | Update show attributes | `200 OK` |
| **DELETE** | `/api/v1/shows/:id` | Remove a show (cascades associated data) | `200 OK` |

### Canon Facts (`/api/v1/canon`)
| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/canon` | Create a new canon fact | `201 Created` |
| **GET** | `/api/v1/canon` | Fetch all facts (Filter via `?show_id=<UUID>`) | `200 OK` |
| **GET** | `/api/v1/canon/:id` | Fetch specific canon fact details | `200 OK` |
| **PATCH** | `/api/v1/canon/:id` | Modify canon fact parameters | `200 OK` |
| **DELETE** | `/api/v1/canon/:id` | Delete a canon fact | `200 OK` |

### Submissions (`/api/v1/submissions`)
| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/submissions` | Submit a script for a TV show | `201 Created` |
| **GET** | `/api/v1/submissions` | Retrieve submissions (Filter via `?show_id=<UUID>`) | `200 OK` |
| **GET** | `/api/v1/submissions/:id` | Fetch a single submission | `200 OK` |
| **PATCH** | `/api/v1/submissions/:id` | Edit submission content or state | `200 OK` |
| **DELETE** | `/api/v1/submissions/:id` | Remove a submission record | `200 OK` |

### Conflicts (`/api/v1/conflicts`)
| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/conflicts` | Log a detected canon conflict | `201 Created` |
| **GET** | `/api/v1/conflicts` | Retrieve conflicts (Filter via `?submission_id=<UUID>`) | `200 OK` |
| **GET** | `/api/v1/conflicts/:id` | Fetch detail of a single conflict report | `200 OK` |
| **PATCH** | `/api/v1/conflicts/:id` | Update conflict status or reasoning | `200 OK` |
| **DELETE** | `/api/v1/conflicts/:id` | Remove a conflict report | `200 OK` |

---

## ⚙️ Environment Variables

Create a `.env` file in the root of the `/backend` directory:

```env
PORT=3000

# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=canonsync
DB_USER=postgres
DB_PASSWORD=your_secure_password
```

---

## 🚀 Installation & Running

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Set Up Database Schema
Apply the schema structure directly on your PostgreSQL database:
```bash
psql -U postgres -d canonsync -f ../database/schema.sql
```

### 3. Run the Server

**Development Mode (Auto-reloads on file changes):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```