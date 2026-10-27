# Task 02 — REST API with Express
**Internship:** UpStartInterns · Full Stack Development  
**Student Intern:** Sumit Kumar  
**Resource:** `/api/tasks`  

---

## 🌟 Overview

This project is a RESTful API built for **Task 02 (Level 2 of 4 · Drill — REST API with Express)**. It implements the four standard HTTP operations (**GET, POST, PUT, DELETE**) over a `tasks` resource with strict JSON input/output and standard HTTP status codes.

---

## ✅ Acceptance Criteria & Feature Checklist

| Requirement | Implementation Detail | Status |
| :--- | :--- | :---: |
| **GET Route** | `GET /api/tasks` retrieves all tasks; `GET /api/tasks/:id` retrieves a single task by ID. | **PASSED** |
| **POST Route** | `POST /api/tasks` accepts JSON payload, validates `title`, and creates a new task (returns `201 Created`). | **PASSED** |
| **PUT Route** | `PUT /api/tasks/:id` updates fields of an existing task (returns `200 OK`). | **PASSED** |
| **DELETE Route** | `DELETE /api/tasks/:id` deletes a task from the collection (returns `200 OK`). | **PASSED** |
| **JSON In & JSON Out** | `express.json()` body parsing; all responses set `Content-Type: application/json`. | **PASSED** |
| **Correct Status Codes** | `200 OK` (success), `201 Created` (creation), `400 Bad Request` (invalid input), `404 Not Found` (missing records). | **PASSED** |
| **Automated Tests** | 20 unit and integration tests passing in `test-api.js`. | **PASSED** |

---

## 🚀 How to Run Locally

### 1. Start the Server

```bash
# If using npm
npm start

# Or directly with Node.js
node server.js
```
The server will start listening on:
```text
http://localhost:3000
```

### 2. Run Automated Tests

To run the automated test suite verifying all 4 HTTP operations and status codes:
```bash
npm test
# or: node test-api.js
```

---

## 📡 API Endpoints & `curl` Examples

### 1. List All Tasks
```bash
curl -X GET http://localhost:3000/api/tasks
```
**Status Code:** `200 OK`  
**Response:**
```json
[
  {
    "id": 1,
    "title": "Complete Onboarding",
    "description": "Download offer letter and share update on LinkedIn",
    "completed": true,
    "createdAt": "2026-10-01T10:00:00.000Z"
  },
  {
    "id": 2,
    "title": "Responsive landing page",
    "description": "Build a mobile and desktop layout with zero horizontal overflow at 375px",
    "completed": true,
    "createdAt": "2026-10-10T12:00:00.000Z"
  },
  {
    "id": 3,
    "title": "REST API with Express",
    "description": "Implement GET, POST, PUT, DELETE with JSON in/out and proper status codes",
    "completed": false,
    "createdAt": "2026-10-27T18:48:00.000Z"
  }
]
```

---

### 2. Get Task by ID (Existing Record)
```bash
curl -X GET http://localhost:3000/api/tasks/1
```
**Status Code:** `200 OK`  
**Response:**
```json
{
  "id": 1,
  "title": "Complete Onboarding",
  "description": "Download offer letter and share update on LinkedIn",
  "completed": true,
  "createdAt": "2026-10-01T10:00:00.000Z"
}
```

---

### 3. Get Task by ID (Missing Record — 404)
```bash
curl -X GET http://localhost:3000/api/tasks/999
```
**Status Code:** `404 Not Found`  
**Response:**
```json
{
  "error": "Task with ID 999 not found"
}
```

---

### 4. Create a Task (POST — 201 Created)
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\": \"CRUD app on a database\", \"description\": \"Connect frontend to a database\", \"completed\": false}"
```
**Status Code:** `201 Created`  
**Response:**
```json
{
  "id": 4,
  "title": "CRUD app on a database",
  "description": "Connect frontend to a database",
  "completed": false,
  "createdAt": "2026-10-27T18:49:00.000Z"
}
```

---

### 5. Update a Task (PUT — 200 OK)
```bash
curl -X PUT http://localhost:3000/api/tasks/4 \
  -H "Content-Type: application/json" \
  -d "{\"completed\": true}"
```
**Status Code:** `200 OK`  
**Response:**
```json
{
  "id": 4,
  "title": "CRUD app on a database",
  "description": "Connect frontend to a database",
  "completed": true,
  "createdAt": "2026-10-27T18:49:00.000Z",
  "updatedAt": "2026-10-27T18:50:00.000Z"
}
```

---

### 6. Delete a Task (DELETE — 200 OK)
```bash
curl -X DELETE http://localhost:3000/api/tasks/4
```
**Status Code:** `200 OK`  
**Response:**
```json
{
  "message": "Task 4 successfully deleted",
  "deleted": {
    "id": 4,
    "title": "CRUD app on a database",
    "description": "Connect frontend to a database",
    "completed": true
  }
}
```

---

### 7. Delete Task Again (Missing Record — 404)
```bash
curl -X DELETE http://localhost:3000/api/tasks/4
```
**Status Code:** `404 Not Found`  
**Response:**
```json
{
  "error": "Task with ID 4 not found"
}
```

---

## 🛠️ Key Architectural Decisions

1. **Strict JSON Contract**:
   Every response includes a `Content-Type: application/json` header. Error messages follow a uniform `{ "error": "message" }` structure.

2. **Validation and Status Codes**:
   - `POST /api/tasks` requires a non-empty `title` string. Failing this condition produces a `400 Bad Request` with an explanatory error message.
   - Resource lookups that fail return `404 Not Found` across GET, PUT, and DELETE operations.
   - Resource creation returns the standard `201 Created` code along with the created object including its generated `id` and timestamps.

3. **Dual Execution Mode**:
   `server.js` natively uses standard **Express.js** syntax when installed via `npm install express`. It also includes a zero-dependency fallback runner so that anyone can test and run it immediately using standard `node server.js`.
