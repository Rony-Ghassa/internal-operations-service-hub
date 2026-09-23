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

An Employee can submit a Service Request through the React frontend.

The NestJS backend:
1. validates the Request,
2. determines the correct Department,
3. saves the Request in SQLite,
4. returns the created Request.

Current routing:

- `Password Reset -> IT`
- `Leave Request -> HR`
- `Reimbursement -> Finance`

## AI-Assisted Request Intake

Week 4 adds AI-assisted classification for free-text Service Requests.

The Employee can provide text such as:

`I forgot my password and cannot log in.`

Gemini suggests one of the allowed Request Types:

- Password Reset
- Leave Request
- Reimbursement

The AI does not control Department routing and does not write to the database.

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

## Requirements

- Node.js 22+
- npm
- Gemini API key

## Install

Clone the repository.

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

## Environment Setup

Inside the `backend` folder, create:

`.env`

Add:

```env
GEMINI_API_KEY=your_gemini_api_key
```

The `.env` file is ignored by Git and must not be committed.

## Run the Backend

From the `backend` folder:

```bash
npm run start:dev
```

The backend runs on:

`http://localhost:3000`

SQLite persistence uses:

`backend/service-hub.db`

The database file is created automatically when the backend starts.

## Run the Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

The frontend runs on:

`http://localhost:5173`

## Exercise the Standard Flow

1. Open `http://localhost:5173`.
2. Select a Request Type.
3. Enter a description.
4. Click `Submit Request`.
5. Confirm that the created Request displays its ID, Request Type, Department, and status.

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

### View Request

`GET /requests/:id`

The creator of the Request is allowed to view it.

Another Employee receives:

`403 Forbidden`

### Invalid Request

An unsupported Request Type returns:

`400 Bad Request`

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

## Current Scope

The repository currently includes:
- React frontend
- NestJS backend
- SQLite persistence
- Service Request routing
- authorization rule
- automated tests
- AI-assisted Request Type classification using Gemini

It does not include:
- full authentication
- admin management UI
- AI chatbot
- automatic AI replies
- RAG
- MCP
- AI database access
- Kafka or queues
- microservices
- CI/CD or deployment
- monitoring
- production infrastructure