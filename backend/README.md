# CanonSync AI – Backend API Reference

The **CanonSync AI Backend** is a RESTful API for managing television show canon facts, script submissions, and continuity conflict reports. Built with a layered OOP architecture using Node.js, Express.js, and PostgreSQL with pgvector.

---

## 🏗️ Architecture & Design Principles

```
[ HTTP Request ]
      │
      ▼
┌───────────┐
│  Routes   │  ──► Map URL patterns & HTTP methods to Controller handlers
└───────────┘
      │
      ▼
┌──────────────┐
│  Middleware  │  ──► Joi schema validation (body & query params)
└──────────────┘
      │
      ▼
┌───────────────┐
│  Controllers  │  ──► Extract req/res, delegate to service, set HTTP status
└───────────────┘
      │
      ▼
┌──────────┐
│ Services │  ──► Business logic, ENUM validation, FK existence checks
└──────────┘
      │
      ▼
┌─────────────┐
│ Repositories│  ──► Parameterized SQL queries via `pg` driver
└─────────────┘
      │
      ▼
 [ PostgreSQL + pgvector ]
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v18+ |
| Framework | Express.js v5+ |
| Database | PostgreSQL v14+ with `pgvector` |
| DB Driver | `pg` (node-postgres) |
| Validation | Joi |
| Modules | ES Modules (`import`/`export`) |
| Config | `dotenv` |

---

## 📁 Directory Structure

```
backend/
├── config/          # Database pool (pg Pool) setup
├── controllers/     # HTTP request/response handlers (OOP, bound methods)
├── database/
│   └── migrations/  # (empty — schema applied directly via schema.sql)
├── middleware/       # Joi validation middleware, logging, error handling
├── models/          # ES6 entity classes matching DB tables
├── repositories/    # Raw parameterized SQL query layer
├── routes/          # Express Router definitions
├── services/        # Business logic and domain rules
├── utils/           # UUID validator, Joi schemas
├── app.js           # Middleware registration & route mounting
└── server.js        # Entry point — DB ping & HTTP listen
```

---

## ⚙️ Environment Variables

Create a `.env` file inside `/backend`:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=canonsync
DB_USER=postgres
DB_PASSWORD=your_secure_password
```

---

## 🚀 Installation & Running

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Apply database schema (run once against your PostgreSQL instance)
psql -U postgres -d canonsync -f ../database/schema.sql

# 3. Start development server (auto-reload)
npm run dev

# 4. Start production server
npm start
```

---

## 📡 API Reference

**Base URL:** `http://localhost:3000/api/v1`

All requests and responses use `Content-Type: application/json`.

---

### Error Response Format

All error responses share a consistent shape:

```json
{
  "error": "Human-readable error message."
}
```

| HTTP Status | Meaning |
|---|---|
| `400 Bad Request` | Validation failed (missing field, wrong type, invalid ENUM) |
| `404 Not Found` | Requested resource does not exist |
| `500 Internal Server Error` | Unexpected server-side failure |

---

## 📺 Shows

> Manages registered TV shows. All canon facts and submissions belong to a show. Deleting a show **cascades** and removes all related canon facts, submissions, and conflicts.

### `POST /api/v1/shows`

Register a new TV show.

**Request Body**

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `title` | `string` | ✅ Yes | min: 1, max: 255 | Name of the show |
| `description` | `string` | ❌ No | max: 2000, nullable | Short description of the show |

```json
{
  "title": "Andor",
  "description": "A prequel series to Rogue One set in the Star Wars universe."
}
```

**Success Response `201 Created`**

```json
{
  "show_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Andor",
  "description": "A prequel series to Rogue One set in the Star Wars universe.",
  "created_at": "2026-07-28T08:00:00.000Z"
}
```

---

### `GET /api/v1/shows`

Retrieve all registered shows, ordered by creation date (newest first).

**Query Parameters**

| Param | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `page` | `integer` | ❌ No | min: 1, default: 1 | Page number |
| `limit` | `integer` | ❌ No | min: 1, max: 100, default: 20 | Results per page |

```
GET /api/v1/shows?page=2&limit=10
```

**Success Response `200 OK`**

```json
{
  "data": [
    {
      "show_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Andor",
      "description": "A prequel series to Rogue One.",
      "created_at": "2026-07-28T08:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 85,
    "totalPages": 9
  }
}
```

---

### `GET /api/v1/shows/:id`

Fetch a single show by its UUID.

**Path Parameter**

| Param | Type | Description |
|---|---|---|
| `id` | `UUID v4` | The `show_id` of the show |

**Success Response `200 OK`** — same shape as a single object from the list above.

**Error `404`** — if no show exists with that ID.

---

### `PATCH /api/v1/shows/:id`

Update one or more fields of an existing show. All fields are optional but **at least one must be provided**.

**Path Parameter:** `id` — `UUID v4`

**Request Body** *(at least one field required)*

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `title` | `string` | ❌ No | min: 1, max: 255 | New title |
| `description` | `string` | ❌ No | max: 2000, nullable | New description |

```json
{
  "description": "Updated description for Andor Season 2."
}
```

**Success Response `200 OK`** — updated show object.

**Error `404`** — show not found.

---

### `DELETE /api/v1/shows/:id`

Permanently delete a show. **Cascades** to all associated canon facts, submissions, and conflicts.

**Path Parameter:** `id` — `UUID v4`

**Success Response `200 OK`**

```json
{
  "show_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Andor",
  "description": "...",
  "created_at": "2026-07-28T08:00:00.000Z"
}
```

**Error `404`** — show not found.

---

## 📖 Canon Facts

> Stores verified canonical facts for a show. Supports vector embeddings for semantic similarity search and a `superseded_by` self-reference for fact versioning.

### `POST /api/v1/canon`

Create a new canon fact. The referenced `show_id` must exist.

**Request Body**

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `show_id` | `UUID v4` | ✅ Yes | must exist | Show this fact belongs to |
| `category` | `string` | ✅ Yes | one of enum below | Thematic category of the fact |
| `fact_text` | `string` | ✅ Yes | min: 1, max: 5000 | The canon statement |
| `source_episode` | `string` | ❌ No | max: 100, nullable | Episode reference (e.g. `"S01E03"`) |
| `embedding` | `number[]` | ❌ No | 1536 floats, nullable | pgvector embedding for semantic search |
| `superseded_by` | `UUID v4` | ❌ No | nullable | ID of the fact that replaces this one |
| `author_name` | `string` | ❌ No | max: 100, nullable | Who submitted this fact |

**Valid `category` values:** `character`, `lore`, `timeline`, `location`, `relationship`, `other`

```json
{
  "show_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "category": "lore",
  "fact_text": "Cassian Andor was born on Kenari.",
  "source_episode": "S01E06",
  "author_name": "canon-team"
}
```

**Success Response `201 Created`**

```json
{
  "canon_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "show_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "category": "lore",
  "fact_text": "Cassian Andor was born on Kenari.",
  "source_episode": "S01E06",
  "embedding": null,
  "superseded_by": null,
  "author_name": "canon-team",
  "created_at": "2026-07-28T08:05:00.000Z"
}
```

**Error `404`** — `show_id` does not exist.

---

### `GET /api/v1/canon`

Retrieve all canon facts. Optionally filter by show.

**Query Parameters**

| Param | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `show_id` | `UUID v4` | ❌ No | — | Filter results to a specific show |
| `page` | `integer` | ❌ No | min: 1, default: 1 | Page number |
| `limit` | `integer` | ❌ No | min: 1, max: 100, default: 20 | Results per page |

```
GET /api/v1/canon?show_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890&page=1&limit=20
```

**Success Response `200 OK`**

```json
{
  "data": [ ...array of canon fact objects... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

---

### `GET /api/v1/canon/:id`

Fetch a single canon fact by its UUID.

**Path Parameter:** `id` — `UUID v4`

**Success Response `200 OK`** — single canon fact object.

**Error `404`** — fact not found.

---

### `PATCH /api/v1/canon/:id`

Update fields of an existing canon fact. At least one field required.

**Path Parameter:** `id` — `UUID v4`

**Request Body** *(at least one field required)*

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `category` | `string` | ❌ No | valid category enum | Updated category |
| `fact_text` | `string` | ❌ No | min: 1, max: 5000 | Updated fact text |
| `source_episode` | `string` | ❌ No | max: 100, nullable | Updated episode reference |
| `superseded_by` | `UUID v4` | ❌ No | nullable | Point to a newer fact |
| `author_name` | `string` | ❌ No | max: 100, nullable | Updated author |

```json
{
  "superseded_by": "c3d4e5f6-a7b8-9012-cdef-123456789012"
}
```

**Success Response `200 OK`** — updated canon fact object.

**Error `404`** — fact not found.

---

### `DELETE /api/v1/canon/:id`

Delete a canon fact. Cascades to any conflicts referencing it.

**Path Parameter:** `id` — `UUID v4`

**Success Response `200 OK`** — deleted canon fact object.

**Error `404`** — fact not found.

---

## 📝 Submissions

> A submission is a raw script submitted for a show. Once processed, the AI analysis engine creates conflict records for any canon violations found.

### `POST /api/v1/submissions`

Submit a script for canon analysis. The referenced `show_id` must exist.

**Request Body**

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `show_id` | `UUID v4` | ✅ Yes | must exist | Show this script is for |
| `script` | `string` | ✅ Yes | min: 1, max: 100,000 | Full script text |
| `author_name` | `string` | ❌ No | max: 100, nullable | Script author |
| `status` | `string` | ❌ No | see enum below | Processing state (defaults to `pending`) |

**Valid `status` values:** `pending`, `processed`, `failed`

```json
{
  "show_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "script": "INT. REBEL BASE - DAY\n\nCassian walks in from Aldhani...",
  "author_name": "writer-01"
}
```

**Success Response `201 Created`**

```json
{
  "submission_id": "d4e5f6a7-b8c9-0123-def0-234567890123",
  "show_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "script": "INT. REBEL BASE - DAY\n\nCassian walks in from Aldhani...",
  "status": "pending",
  "author_name": "writer-01",
  "created_at": "2026-07-28T08:10:00.000Z"
}
```

**Error `404`** — `show_id` does not exist.

---

### `GET /api/v1/submissions`

Retrieve all submissions. Optionally filter by show.

**Query Parameters**

| Param | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `show_id` | `UUID v4` | ❌ No | — | Filter to a specific show |
| `page` | `integer` | ❌ No | min: 1, default: 1 | Page number |
| `limit` | `integer` | ❌ No | min: 1, max: 100, default: 20 | Results per page |

```
GET /api/v1/submissions?show_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890&page=1&limit=20
```

**Success Response `200 OK`**

```json
{
  "data": [ ...array of submission objects... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 34,
    "totalPages": 2
  }
}
```

---

### `GET /api/v1/submissions/:id`

Fetch a single submission by UUID.

**Path Parameter:** `id` — `UUID v4`

**Success Response `200 OK`** — single submission object.

**Error `404`** — submission not found.

---

### `PATCH /api/v1/submissions/:id`

Update a submission's script content, status, or author. At least one field required.

**Path Parameter:** `id` — `UUID v4`

**Request Body** *(at least one field required)*

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `script` | `string` | ❌ No | min: 1, max: 100,000 | Revised script |
| `status` | `string` | ❌ No | `pending`, `processed`, `failed` | New processing state |
| `author_name` | `string` | ❌ No | max: 100, nullable | Updated author |

```json
{
  "status": "processed"
}
```

**Success Response `200 OK`** — updated submission object.

**Errors:** `400` invalid ENUM value · `404` submission not found.

---

### `DELETE /api/v1/submissions/:id`

Delete a submission. Cascades to all conflicts referencing it.

**Path Parameter:** `id` — `UUID v4`

**Success Response `200 OK`** — deleted submission object.

**Error `404`** — submission not found.

---

## ⚠️ Conflicts

> A conflict represents a canon violation detected between a script submission and an existing canon fact. Tracks confidence scores and resolution status.

### `POST /api/v1/conflicts`

Log a detected conflict between a submission and a canon fact. Both `submission_id` and `canon_id` must reference existing records.

**Request Body**

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `submission_id` | `UUID v4` | ✅ Yes | must exist | The submission containing the conflict |
| `canon_id` | `UUID v4` | ✅ Yes | must exist | The canon fact being violated |
| `confidence` | `number` | ❌ No | `0.0000`–`1.0000`, nullable | AI confidence score (4 decimal places) |
| `reasoning` | `string` | ❌ No | max: 5000, nullable | Explanation of why this is a conflict |
| `status` | `string` | ❌ No | see enum below | Resolution state (defaults to `open`) |

**Valid `status` values:** `open`, `resolved`, `ignored`

```json
{
  "submission_id": "d4e5f6a7-b8c9-0123-def0-234567890123",
  "canon_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "confidence": 0.9341,
  "reasoning": "The script places Cassian on Coruscant during the Kenari incident, contradicting S01E06 canon."
}
```

**Success Response `201 Created`**

```json
{
  "conflict_id": "e5f6a7b8-c9d0-1234-ef01-345678901234",
  "submission_id": "d4e5f6a7-b8c9-0123-def0-234567890123",
  "canon_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "confidence": "0.9341",
  "reasoning": "The script places Cassian on Coruscant during the Kenari incident, contradicting S01E06 canon.",
  "status": "open",
  "created_at": "2026-07-28T08:15:00.000Z",
  "updated_at": "2026-07-28T08:15:00.000Z"
}
```

**Errors:** `400` invalid ENUM · `404` `submission_id` or `canon_id` not found.

---

### `GET /api/v1/conflicts`

Retrieve all conflict records. Optionally filter by submission.

**Query Parameters**

| Param | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `submission_id` | `UUID v4` | ❌ No | — | Filter to conflicts from a specific submission |
| `page` | `integer` | ❌ No | min: 1, default: 1 | Page number |
| `limit` | `integer` | ❌ No | min: 1, max: 100, default: 20 | Results per page |

```
GET /api/v1/conflicts?submission_id=d4e5f6a7-b8c9-0123-def0-234567890123&page=1&limit=20
```

**Success Response `200 OK`**

```json
{
  "data": [ ...array of conflict objects... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 11,
    "totalPages": 1
  }
}
```

---

### `GET /api/v1/conflicts/:id`

Fetch a single conflict report by UUID.

**Path Parameter:** `id` — `UUID v4`

**Success Response `200 OK`** — single conflict object (includes `updated_at`).

**Error `404`** — conflict not found.

---

### `PATCH /api/v1/conflicts/:id`

Update the status, confidence, or reasoning of a conflict. Automatically updates `updated_at`. At least one field required.

**Path Parameter:** `id` — `UUID v4`

**Request Body** *(at least one field required)*

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `confidence` | `number` | ❌ No | `0.0000`–`1.0000`, nullable | Revised confidence score |
| `reasoning` | `string` | ❌ No | max: 5000, nullable | Updated reasoning |
| `status` | `string` | ❌ No | `open`, `resolved`, `ignored` | New resolution state |

```json
{
  "status": "resolved",
  "reasoning": "Writer confirmed the scene was moved to a different timeline."
}
```

**Success Response `200 OK`**

```json
{
  "conflict_id": "e5f6a7b8-c9d0-1234-ef01-345678901234",
  "submission_id": "d4e5f6a7-b8c9-0123-def0-234567890123",
  "canon_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "confidence": "0.9341",
  "reasoning": "Writer confirmed the scene was moved to a different timeline.",
  "status": "resolved",
  "created_at": "2026-07-28T08:15:00.000Z",
  "updated_at": "2026-07-28T09:00:00.000Z"
}
```

**Errors:** `400` invalid ENUM value · `404` conflict not found.

---

### `DELETE /api/v1/conflicts/:id`

Permanently delete a conflict record.

**Path Parameter:** `id` — `UUID v4`

**Success Response `200 OK`**

```json
{
  "message": "Conflict deleted successfully.",
  "conflict": { ...deleted conflict object... }
}
```

**Error `404`** — conflict not found.

---

## 🔢 ENUM Reference

| Column | Table | Valid Values |
|---|---|---|
| `status` | `submissions` | `pending`, `processed`, `failed` |
| `status` | `conflicts` | `open`, `resolved`, `ignored` |
| `category` | `canon_facts` | `character`, `lore`, `timeline`, `location`, `relationship`, `other` |

---

## 🗃️ Database Schema Summary

| Table | Primary Key | Foreign Keys | Notable Columns |
|---|---|---|---|
| `shows` | `show_id` (UUID) | — | `title`, `description`, `created_at` (TIMESTAMPTZ) |
| `canon_facts` | `canon_id` (UUID) | `show_id → shows`, `superseded_by → canon_facts` | `embedding` (VECTOR 1536), `category`, `fact_text` |
| `submissions` | `submission_id` (UUID) | `show_id → shows` | `script`, `status` (ENUM), `author_name` |
| `conflicts` | `conflict_id` (UUID) | `submission_id → submissions`, `canon_id → canon_facts` | `confidence` (NUMERIC 5,4), `status` (ENUM), `updated_at` |


---

## 🗺️ Endpoint Route Map

| Method | Path | Middleware | Description |
|--------|------|------------|-------------|
| `POST` | `/api/v1/shows` | `validateBody(createShowSchema)` | Register a new show |
| `GET` | `/api/v1/shows` | `validateQuery(paginationOnlySchema)` | List all shows (paginated) |
| `GET` | `/api/v1/shows/:id` | — | Get a single show |
| `PATCH` | `/api/v1/shows/:id` | `validateBody(updateShowSchema)` | Update a show |
| `DELETE` | `/api/v1/shows/:id` | — | Delete a show |
| `POST` | `/api/v1/canon` | `validateBody(createCanonFactSchema)` | Create a canon fact |
| `GET` | `/api/v1/canon` | `validateQuery(showIdQuerySchema)` | List canon facts (filterable by show) |
| `GET` | `/api/v1/canon/:id` | — | Get a single canon fact |
| `PATCH` | `/api/v1/canon/:id` | `validateBody(updateCanonFactSchema)` | Update a canon fact |
| `DELETE` | `/api/v1/canon/:id` | — | Delete a canon fact |
| `POST` | `/api/v1/submissions` | `validateBody(createSubmissionSchema)` | Submit a script |
| `GET` | `/api/v1/submissions` | `validateQuery(showIdQuerySchema)` | List submissions (filterable by show) |
| `GET` | `/api/v1/submissions/:id` | — | Get a single submission |
| `PATCH` | `/api/v1/submissions/:id` | `validateBody(updateSubmissionSchema)` | Update a submission |
| `DELETE` | `/api/v1/submissions/:id` | — | Delete a submission |
| `POST` | `/api/v1/conflicts` | `validateBody(createConflictSchema)` | Log a conflict |
| `GET` | `/api/v1/conflicts` | `validateQuery(submissionIdQuerySchema)` | List conflicts (filterable by submission) |
| `GET` | `/api/v1/conflicts/:id` | — | Get a single conflict |
| `PATCH` | `/api/v1/conflicts/:id` | `validateBody(updateConflictSchema)` | Update a conflict |
| `DELETE` | `/api/v1/conflicts/:id` | — | Delete a conflict |

---

## 📄 Pagination

Every collection endpoint (`GET /api/v1/*`) returns a consistent paginated envelope.

**Query parameters accepted on all list endpoints:**

| Parameter | Type | Default | Maximum | Description |
|-----------|------|---------|---------|-------------|
| `page` | `integer` | `1` | — | 1-based page number |
| `limit` | `integer` | `20` | `100` | Records per page |

**Response envelope:**

```json
{
  "data": [ ...array of resource objects... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data` | `array` | The resource objects for the current page |
| `pagination.page` | `integer` | Current page number |
| `pagination.limit` | `integer` | Page size used |
| `pagination.total` | `integer` | Total number of records matching the query |
| `pagination.totalPages` | `integer` | `ceil(total / limit)` |

---

## 🛡️ Security & Middleware

The following middleware is applied globally on every request to `/api/*` in the order listed.

| # | Middleware | Package | Purpose |
|---|-----------|---------|---------|
| 1 | `helmet()` | `helmet` | Sets secure HTTP response headers (CSP, HSTS, X-Frame-Options, etc.) |
| 2 | `cors(corsOptions)` | `cors` | Restricts cross-origin access; origin controlled by `CORS_ORIGIN` env var |
| 3 | `hpp()` | `hpp` | Prevents HTTP Parameter Pollution attacks on query strings |
| 4 | `compression()` | `compression` | Gzip-compresses responses to reduce payload size |
| 5 | `rateLimit(...)` | `express-rate-limit` | 100 requests per IP per 15-minute window on all `/api/*` routes |
| 6 | `logRequest` | internal | Logs method + URL for every incoming request |
| 7 | `express.json()` | express | Parses `application/json` request bodies |
| 8 | `express.urlencoded()` | express | Parses `application/x-www-form-urlencoded` request bodies |

### Rate Limiting

| Property | Value |
|----------|-------|
| Window | 15 minutes |
| Max requests | 100 per IP |
| Scope | All `/api/*` routes |
| Headers | `RateLimit-*` (standard headers enabled) |

When the limit is exceeded the API returns:

```json
HTTP 429 Too Many Requests

{
  "error": "Too many requests from this IP, please try again later."
}
```

### CORS

The allowed origin defaults to `*` (open) and is overridden by the `CORS_ORIGIN` environment variable. In production always set `CORS_ORIGIN` to your front-end domain.

```env
CORS_ORIGIN=https://your-frontend.com
```

Allowed methods: `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`  
Allowed headers: `Content-Type`, `Authorization`

---

## ✅ Request Validation

All body and query parameters are validated with **Joi** before reaching a controller. Validation is applied per-route via two middleware factories:

| Factory | Applied to | Behaviour |
|---------|-----------|-----------|
| `validateBody(schema)` | `POST` / `PATCH` routes | Validates `req.body`; strips unknown fields; coerces types |
| `validateQuery(schema)` | `GET` collection routes | Validates `req.query`; coerces strings to integers; applies pagination defaults |

On validation failure the middleware short-circuits and returns immediately:

```json
HTTP 400 Bad Request

{
  "error": "Validation failed.",
  "details": [
    "\"title\" is required",
    "\"show_id\" must be a valid GUID"
  ]
}
```

The `details` array contains one human-readable message per failing field, collected in a single pass (`abortEarly: false`).

---

## 🔁 Data Flow — Typical Write Request

The following trace shows what happens for `POST /api/v1/submissions`:

```
1. express-rate-limit    – check IP request budget
2. logRequest            – log "POST /api/v1/submissions"
3. express.json()        – parse JSON body
4. validateBody(schema)  – Joi validates & strips unknown fields from req.body
5. SubmissionController.create()
       └─ calls SubmissionService.createSubmission(req.body)
             ├─ validates status ENUM (belt-and-braces)
             ├─ ShowRepository.findById(show_id)   → 404 if show missing
             └─ SubmissionRepository.create(data)  → INSERT … RETURNING
6. res.status(201).json(submission)
```

---

## 🪵 Logging

The application uses a custom logger (`utils/logger.js`) that writes to both the console and two log files:

| File | Contents |
|------|----------|
| `logs/combined.log` | All INFO and ERROR entries |
| `logs/error.log` | ERROR entries only |

Log entry format:

```
[2026-07-28T08:00:00.000Z] [INFO] POST /api/v1/submissions
[2026-07-28T08:00:01.000Z] [ERROR] Error processing POST /api/v1/submissions | {"message":"...","stack":"..."}
```

The `logs/` directory is created automatically on startup if it does not exist.

---

## 🗃️ Database Schema Detail

### `shows`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `show_id` | `UUID` | PK, default `gen_random_uuid()` | Unique identifier |
| `title` | `VARCHAR(255)` | NOT NULL | Show name |
| `description` | `TEXT` | nullable | Show synopsis |
| `created_at` | `TIMESTAMPTZ` | default `NOW()` | Creation timestamp |

### `canon_facts`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `canon_id` | `UUID` | PK | Unique identifier |
| `show_id` | `UUID` | FK → `shows.show_id` ON DELETE CASCADE | Parent show |
| `category` | `VARCHAR` | NOT NULL, ENUM | Thematic category |
| `fact_text` | `TEXT` | NOT NULL | The canonical statement |
| `source_episode` | `VARCHAR(100)` | nullable | e.g. `S01E06` |
| `embedding` | `VECTOR(1536)` | nullable | pgvector embedding |
| `superseded_by` | `UUID` | FK → `canon_facts.canon_id`, nullable | Newer replacement fact |
| `author_name` | `VARCHAR(100)` | nullable | Who added the fact |
| `created_at` | `TIMESTAMPTZ` | default `NOW()` | Creation timestamp |

### `submissions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `submission_id` | `UUID` | PK | Unique identifier |
| `show_id` | `UUID` | FK → `shows.show_id` ON DELETE CASCADE | Parent show |
| `script` | `TEXT` | NOT NULL | Full script content |
| `status` | `ENUM` | NOT NULL, default `pending` | Processing state |
| `author_name` | `VARCHAR(100)` | nullable | Script author |
| `created_at` | `TIMESTAMPTZ` | default `NOW()` | Submission timestamp |

### `conflicts`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `conflict_id` | `UUID` | PK | Unique identifier |
| `submission_id` | `UUID` | FK → `submissions.submission_id` ON DELETE CASCADE | Source submission |
| `canon_id` | `UUID` | FK → `canon_facts.canon_id` ON DELETE CASCADE | Violated canon fact |
| `confidence` | `NUMERIC(5,4)` | nullable | AI confidence 0.0000–1.0000 |
| `reasoning` | `TEXT` | nullable | Explanation of the conflict |
| `status` | `ENUM` | NOT NULL, default `open` | Resolution state |
| `created_at` | `TIMESTAMPTZ` | default `NOW()` | Detection timestamp |
| `updated_at` | `TIMESTAMPTZ` | default `NOW()`, auto-updated | Last modification timestamp |

---

## 🔢 ENUM Quick Reference

| ENUM | Table | Values |
|------|-------|--------|
| `category` | `canon_facts` | `character` · `lore` · `timeline` · `location` · `relationship` · `other` |
| `status` | `submissions` | `pending` · `processed` · `failed` |
| `status` | `conflicts` | `open` · `resolved` · `ignored` |

---

## ⚙️ Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | HTTP port the server listens on |
| `DB_HOST` | **Yes** | — | PostgreSQL host |
| `DB_PORT` | **Yes** | — | PostgreSQL port (typically `5432`) |
| `DB_NAME` | **Yes** | — | Database name |
| `DB_USER` | **Yes** | — | Database user |
| `DB_PASSWORD` | **Yes** | — | Database password |
| `CORS_ORIGIN` | No | `*` | Allowed CORS origin (set to your front-end URL in production) |

The server will **refuse to start** if any of the five required `DB_*` variables are missing, printing a list of every missing variable.

---

## 🚦 HTTP Status Code Reference

| Status | When it is returned |
|--------|---------------------|
| `200 OK` | Successful `GET`, `PATCH`, or `DELETE` |
| `201 Created` | Successful `POST` (resource created) |
| `400 Bad Request` | Joi validation failure, or invalid ENUM value supplied |
| `404 Not Found` | Requested resource (or a referenced FK resource) does not exist |
| `429 Too Many Requests` | Rate limit exceeded |
| `500 Internal Server Error` | Unhandled exception; details logged server-side |

---

## 📦 Dependencies

### Production

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^5.2.1 | HTTP framework |
| `pg` | ^8.22.0 | PostgreSQL client (connection pool) |
| `joi` | ^18.2.3 | Schema-based request validation |
| `dotenv` | ^17.4.2 | Environment variable loading |
| `helmet` | ^8.3.0 | Secure HTTP headers |
| `cors` | ^2.8.6 | Cross-Origin Resource Sharing |
| `hpp` | ^0.2.3 | HTTP Parameter Pollution protection |
| `compression` | ^1.8.1 | Gzip response compression |
| `express-rate-limit` | ^8.6.0 | IP-based rate limiting |
| `bcrypt` | ^6.0.0 | Password hashing (auth — planned) |
| `jsonwebtoken` | ^9.0.3 | JWT issuance and verification (auth — planned) |

### Development

| Package | Version | Purpose |
|---------|---------|---------|
| `nodemon` | ^3.1.14 | Auto-restart on file changes during development |
