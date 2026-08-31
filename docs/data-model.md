# Internal Operations Service Hub Data Model

## Domain 

### Main Entities
- User
- Department
- Request
- Request Type

### Relationships
- One User can create multiple Requests.
- Each Request is created by one User.
- One Department can handle multiple Requests.
- Each Request belongs to one Department.
- One Request Type can be used by multiple Requests.
- Each Request has one Request Type.
- Each Request Type maps to one Department.
- One Department can have multiple Request Types.
- A Department can have multiple Department Staff users.
- Each Department Staff user belongs to one Department.

### Ownership and Cardinality
- A User can create many Requests, but each Request has one creator.
- A Department can handle many Requests, but each Request belongs to one Department.
- A Request Type can be used by many Requests, but each Request has one Request Type.
- A Department can have many Request Types, but each Request Type maps to one Department.
- A Department can have multiple Department Staff users, but each Department Staff user belongs to one Department.

## Lifecycle + Rules

 ### Request Lifecycle
- A new Request starts with the status `Submitted`.
- Department Staff can change it to `In Progress` when they start handling it.
- A Request can become `Completed` when the department finishes handling it.
- An Employee can change their own Request to `Cancelled` only before its completed.

### Rules
- A Request must always have one creator.
- A Request must always belong to one Department.
- A Request must always have one Request Type.
- The Department assigned to a Request must match the Department mapped to its Request Type.
- An Employee can only view their own Requests.
- Department Staff can only view and update Requests assigned to their Department.
- An Employee can only cancel their own Request before it is completed.
- Only an Admin can manage users, departments, and requests.
- A Completed Request cannot be cancelled.
- A Cancelled Request cannot be moved back to another status.

## Storage

### Storage Choice
- A relational database is a good fit because Users, Departments, Request Types, and Requests have clear relationships with each other.
- The system needs these relationships to stay consistent, especially for request ownership, department assignment, and request routing.
- A NoSQL database is not the best fit for the current requirements because the data is structured and strongly related, and there is no requirement for flexible or unstructured data.
- One relational database is enough for the current requirements.

### Durable vs Derived Data

#### Durable Data
- Users, their roles, and their email addresses.
- Departments.
- Request Types and their mapped Departments.
- Requests and their current status.
- Which User created each Request.
- Which Department each Request belongs to.

#### Derived Data
- The Department for a new Request can be derived from its Request Type using the Request Type to Department mapping.

## Access

### Main Access Patterns
- An Employee needs to view the Requests they created.
- Department Staff need to view Requests assigned to their Department.
- Department Staff need to update the status of Requests assigned to their Department.
- An Admin needs to view and manage Users, Departments, and Requests.
- The system needs to find the Department mapped to a Request Type when a new Request is submitted.
- The system needs to retrieve the current status of a Request when an Employee tracks it.