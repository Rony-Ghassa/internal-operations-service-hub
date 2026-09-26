# Internal Operations Service Hub

The Internal Operations Service Hub allows company employees to submit internal requests to departments such as IT, HR, and Finance and track their request status.

The repository contains the product specification, architecture, data model, full-stack Service Request flow, automated tests, and AI-assisted request intake.

## Documentation

- [Product Specification](docs/product-spec.md)
- [Architecture](docs/architecture.md)
- [Data Model](docs/data-model.md)
- [ADR-001: Use a Relational Database](docs/decisions/ADR-001.md)
- [Week 2 Agentic Workflow](docs/week2-agentic-workflow.md)
- [Week 3 Full-Stack Delivery](docs/week3-full-stack-delivery.md)
- [Week 4 AI-Assisted Request Intake](docs/week4-ai-assisted-intake.md)

## Current Flow

An Employee can submit a Service Request through the React frontend using either:

- a standard Request Type selection,
- or AI-assisted free-text classification.

The NestJS backend:

1. validates the Request,
2. determines the correct Department,
3. saves the Request in SQLite,
4. returns the created Request.

Current manual routing:

- `Password Reset -> IT`
- `Leave Request -> HR`
- `Reimbursement -> Finance`
- `Other -> Admin Review`

The Employee Portal also includes a My Requests panel where the employee can:

- view previously submitted Requests,
- view the assigned Department,
- view the current status,
- refresh the list,
- cancel a Request while it is still active.

A Request may be cancelled by its creator while its status is:

- `Submitted`
- `In Progress`

A `Completed` or already `Cancelled` Request cannot be cancelled.

## Department Staff Flow

The frontend also includes a Department Staff Portal used to demonstrate department-based request handling.

Department Staff can:

- view Requests assigned to a selected Department,
- move a Request from `Submitted` to `In Progress`,
- move a Request from `In Progress` to `Completed`.

The backend checks that the Department supplied by the staff request matches the Department assigned to the Service Request.

For example, HR staff cannot update an IT Request.

Allowed staff status transitions are:

`Submitted -> In Progress`

`In Progress -> Completed`

Invalid transitions are rejected.

## AI-Assisted Request Intake

Week 4 adds AI-assisted classification for free-text Service Requests.

The Employee can provide text such as:

`I forgot my password and cannot log in.`

Gemini suggests one of the allowed Request Types:

- Password Reset
- Leave Request
- Reimbursement

The AI does not control Department routing and does not write directly to the database.

The backend:

1. sends only the minimum required context to Gemini,
2. validates the AI result,
3. rejects values outside the allowed Request Types,
4. uses the existing product-owned routing,
5. saves the Request only after successful validation.

Example:

`I need annual leave next week.`

Gemini suggests:

`Leave Request`

The application then applies its own routing rule:

`Leave Request -> HR`

If Gemini fails or returns an invalid value, the backend returns:

`Unable to classify the request.`

No Service Request is saved when classification fails.

`Other` is available in the standard manual submission flow, but it is not one of the AI classification outputs.

## Request Status Lifecycle

The current Request lifecycle is:

`Submitted -> In Progress -> Completed`

An Employee may also cancel a Request before completion:

`Submitted -> Cancelled`

`In Progress -> Cancelled`

`Completed` and `Cancelled` are terminal states.

## Requirements

- Node.js 22+
- npm
- Gemini API key

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Rony-Ghassa/internal-operations-service-hub.git
cd internal-operations-service-hub
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure the Backend

Inside the `backend` folder, create a `.env` file.

Add:

```env
GEMINI_API_KEY=your_gemini_api_key
```

The `.env` file is ignored by Git and must not be committed.

### 4. Run the Backend

From the `backend` folder:

```bash
npm run start:dev
```

The backend runs on:

`http://localhost:3000`

SQLite persistence uses:

`backend/service-hub.db`

The database file is created automatically when the backend starts.

### 5. Install Frontend Dependencies

Open a second terminal from the project root:

```bash
cd frontend
npm install
```

### 6. Run the Frontend

From the `frontend` folder:

```bash
npm run dev
```

The frontend runs on:

`http://localhost:5173`

### 7. Open the Application

Open:

`http://localhost:5173`

Keep both terminals running while using the application.

Backend terminal:

```bash
cd backend
npm run start:dev
```

Frontend terminal:

```bash
cd frontend
npm run dev
```

## Exercise the Employee Flow

1. Open `http://localhost:5173`.
2. Select a Request Type.
3. Enter a description.
4. Click `Submit Request`.
5. Confirm that the created Request shows its Request Type, Department, status, description, and suggested next step.
6. Confirm that the Request also appears in the My Requests panel.
7. Use the My Requests panel to track status changes.
8. Cancel an active Request if needed.

## Exercise the Department Staff Flow

1. Open the Staff Portal from the frontend.
2. Select a Department.
3. View Requests assigned to that Department.
4. Click `Start Request` on a `Submitted` Request.
5. Confirm that the Request becomes `In Progress`.
6. Click `Mark Completed`.
7. Confirm that the Request becomes `Completed`.

If a Department attempts to update a Request assigned to another Department, the backend returns:

`403 Forbidden`

## Exercise the AI-Assisted Flow

Use:

`POST /requests/classify-and-create`

Header:

`x-user-id: 1`

Example body:

```json
{
  "text": "I forgot my password and cannot log in."
}
```

Expected classification:

`Password Reset`

Expected product-owned routing:

`Password Reset -> IT`

If Gemini fails or returns an invalid value, the backend returns:

`Unable to classify the request.`

No Service Request is saved when classification fails.

## API Contract

### Create Request

`POST /requests`

Header:

`x-user-id: 1`

Example body:

```json
{
  "requestType": "Password Reset",
  "description": "I cannot access my account."
}
```

### AI-Assisted Create Request

`POST /requests/classify-and-create`

Header:

`x-user-id: 1`

Example body:

```json
{
  "text": "I need annual leave next week."
}
```

### View My Requests

`GET /requests/my`

Header:

`x-user-id: 1`

Returns Requests created by the current simulated Employee identity.

### View One Request

`GET /requests/:id`

Header:

`x-user-id: 1`

The creator of the Request is allowed to view it.

Another Employee receives:

`403 Forbidden`

### View Department Requests

`GET /requests/department/:department`

Example:

`GET /requests/department/IT`

Returns Requests assigned to that Department.

### Cancel Request

`PATCH /requests/:id/cancel`

Header:

`x-user-id: 1`

The Request creator may cancel the Request while it is `Submitted` or `In Progress`.

A `Completed` or already `Cancelled` Request cannot be cancelled.

### Update Request Status

`PATCH /requests/:id/status`

Header example:

`x-department: IT`

Example body:

```json
{
  "status": "In Progress"
}
```

The Department in the request header must match the Department assigned to the Service Request.

### Invalid Request

An unsupported Request Type returns:

`400 Bad Request`

### Invalid Status Transition

An invalid status transition returns:

`400 Bad Request`

Example:

`Completed -> In Progress`

### Wrong Department

If a Department attempts to update a Request assigned to another Department, the backend returns:

`403 Forbidden`

### Missing Request

A Request ID that does not exist returns:

`404 Not Found`

## Automated Tests

Automated tests use a fake classifier instead of Gemini so they are repeatable and do not depend on external AI availability.

### Unit and Integration Tests

From the `backend` folder in PowerShell:

```powershell
$env:NODE_OPTIONS="--experimental-vm-modules"
npm test
```

The tests verify:

- a Completed Request cannot become Cancelled,
- Service Requests persist in SQLite,
- valid classified text uses product-owned routing,
- invalid classification does not change database state,
- requester text cannot override product-owned routing,
- AI provider failure produces a stable failure without changing database state.

### E2E Test

```powershell
$env:NODE_OPTIONS="--experimental-vm-modules"
npm run test:e2e
```

The E2E test verifies that a Service Request can be created through the HTTP API and then retrieved by its owner.

Test databases use in-memory SQLite and do not modify `service-hub.db`.

## Authentication and Authorization Scope

The current project demonstrates authorization rules but does not implement a full authentication system.

Employee identity is currently simulated using:

`x-user-id`

Department Staff identity is currently simulated using:

`x-department`

The frontend also includes a development-only switch between the Employee Portal and Staff Portal.

These mechanisms are used to demonstrate the required request workflow and access-control behavior without introducing a full login system.

In a production system:

- users would authenticate through a secure login mechanism,
- the backend would obtain the Employee ID from the authenticated user,
- the backend would obtain Staff role and Department from the authenticated user,
- users would not be able to freely provide their own identity or Department through request headers,
- the frontend would display the correct portal based on the authenticated user's role.

## Current Scope

The repository currently includes:

- React frontend
- Employee Portal
- Department Staff Portal
- scrollable My Requests panel
- NestJS backend
- SQLite persistence
- Service Request routing
- manual fallback using `Other -> Admin Review`
- Employee request tracking
- Employee request cancellation
- Department Staff status updates
- ownership authorization rule
- Department-based authorization rule
- request lifecycle validation
- automated tests
- AI-assisted Request Type classification using Gemini
- deterministic AI failure handling

It does not include:

- full authentication
- JWT login
- production role management
- admin management UI
- AI chatbot
- automatic AI replies
- RAG
- MCP
- AI database access
- Kafka or queues
- microservices
- CI/CD
- deployment
- monitoring
- production infrastructure

## Future Production Improvements

Future production work may include:

- secure authentication,
- role-based access control using authenticated users,
- storing staff Department assignments in the user model,
- replacing the development portal switch with role-based navigation,
- moving from local SQLite to a production database,
- deployment configuration,
- monitoring and operational logging.