# Internal Operations Service Hub

The Internal Operations Service Hub allows company employees to submit internal requests to departments such as IT, HR, and Finance and track their request status.

The repository contains the product specification, architecture, data model, architecture decision record, and a narrow full-stack Service Request flow.

## Documentation

- [Product Specification](docs/product-spec.md)
- [Architecture](docs/architecture.md)
- [Data Model](docs/data-model.md)
- [ADR-001: Use a Relational Database](docs/decisions/ADR-001.md)
- [Week 2 Agentic Workflow](docs/week2-agentic-workflow.md)
- [Week 3 Full-Stack Delivery](docs/week3-full-stack-delivery.md)

## Week 3 Full-Stack Flow

An Employee can:

1. Select a Request Type.
2. Enter a description.
3. Submit the Service Request from the React frontend.
4. The NestJS backend validates the Request.
5. The backend routes it to the correct Department.
6. The Request is saved in SQLite.
7. The created Request is displayed to the Employee.

Current routing:

- `Password Reset -> IT`
- `Leave Request -> HR`
- `Reimbursement -> Finance`

## Requirements

- Node.js 22+
- npm

## Install

Clone the repository and install the backend dependencies:

```bash
cd backend
npm install
```

Install the frontend dependencies:

```bash
cd ../frontend
npm install
```

## Run the Backend

From the `backend` folder:

```bash
npm run start:dev
```

The backend runs on:

`http://localhost:3000`

SQLite persistence uses:

`backend/service-hub.db`

If the database file does not exist, it is created when the backend starts.

## Run the Frontend

Open another terminal and run:

```bash
cd frontend
npm run dev
```

The frontend runs on:

`http://localhost:5173`

## Exercise the Flow

1. Open `http://localhost:5173`.
2. Select a Request Type.
3. Enter a description.
4. Click `Submit Request`.
5. Confirm that the created Request displays its ID, Request Type, Department, and status.

Example:

- Request Type: `Password Reset`
- Description: `I cannot access my account.`

Expected routing:

`Password Reset -> IT`

Expected starting status:

`Submitted`

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

The tests use Jest with Node's VM modules enabled.

### Unit and Integration Tests

From the `backend` folder in PowerShell:

```powershell
$env:NODE_OPTIONS="--experimental-vm-modules"
npm test
```

These tests verify:

- the business rule that a `Completed` Request cannot become `Cancelled`
- persistence between the backend service and SQLite

### E2E Test

From the `backend` folder:

```powershell
$env:NODE_OPTIONS="--experimental-vm-modules"
npm run test:e2e
```

The E2E test verifies that a Service Request can be created through the HTTP API and then retrieved by its owner.

The automated tests use a separate in-memory SQLite database and do not modify `service-hub.db`.

## Current Scope

This repository currently implements one narrow full-stack Service Request flow.

It does not include:

- full authentication
- admin management
- email integration
- external integrations
- AI or RAG
- Kafka, queues, or microservices
- CI/CD or deployment
- production infrastructure