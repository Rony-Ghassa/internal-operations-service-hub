## Verification

### User-Facing Flow
The React frontend allows an Employee to:
- select a Request Type,
- enter a description,
- submit the Service Request,
- see the created Request with its Department and status.

The flow was verified from the React frontend through the NestJS backend to the SQLite database.

### Authorization
The Request creator is allowed to view their own Request.

Example:
- User 1 creates Request 1.
- User 1 can view Request 1.

Another Employee is denied access.

Example:
- User 2 tries to view Request 1.
- The backend returns `403 Forbidden`.

### Invalid Request
An unsupported Request Type is rejected.

Example:

```json
{
  "requestType": "Car Repair",
  "description": "My car needs repair."
}
```

Result:

`400 Bad Request`

### Expected Failure
Requesting a Request that does not exist is handled without crashing.

Example:

`GET /requests/999`

Result:

`404 Not Found`

## Automated Tests

### Business Rule Test
The automated unit test verifies that:

`Completed -> Cancelled`

is rejected.

This protects the Request status behavior implemented in Week 2.

### Database Integration Test
The integration test:
1. creates a Service Request using `RequestsService`,
2. saves it using a real SQLite test database,
3. reads it back from the database,
4. verifies its Request Type, Department, status, and creator.

### E2E Test
The E2E test:
1. sends `POST /requests`,
2. verifies the created Request,
3. sends `GET /requests/:id` as the creator,
4. verifies that the same persisted Request is returned.

The E2E test uses a separate in-memory SQLite database and does not modify the main `service-hub.db`.

## Regression Protection

The Week 2 Request status transition rule is protected by an automated test.

A `Completed` Request cannot move to `Cancelled`.

The full automated test suite and E2E test were run successfully after the Week 3 changes.