# Internal Operations Service Hub Data Model

## Domain

### Intended Main Entities

- User
- Department
- Request
- Request Type

These entities describe the intended domain model of the system.

The current implementation uses a simplified persistence model focused on the Service Request flow.

### Intended Relationships

- One User can create multiple Requests.
- Each Request is created by one User.
- One Department can handle multiple Requests.
- Each Request belongs to one Department or review destination.
- One Request Type can be used by multiple Requests.
- Each Request has one Request Type.
- Each Request Type maps to one Department or review destination.
- One Department can have multiple Request Types.
- A Department may have multiple Department Staff users.
- Each Department Staff user would belong to one Department in a production version.

## Current Implemented Storage Model

The current SQLite implementation stores Service Requests using one main entity.

### ServiceRequest

The current ServiceRequest record contains:

- `id`
- `requestType`
- `department`
- `description`
- `status`
- `createdByUserId`

`requestType` and `department` are currently stored as string values rather than foreign keys to separate Request Type and Department tables.

`createdByUserId` represents the simulated Employee identity used by the current prototype.

Separate User, Department, and Request Type database tables are not implemented in the current version.

## Lifecycle + Rules

### Request Lifecycle

- A new Request starts with the status `Submitted`.
- Department Staff can change a Request from `Submitted` to `In Progress`.
- Department Staff can change a Request from `In Progress` to `Completed`.
- An Employee can change their own Request to `Cancelled` while it is `Submitted` or `In Progress`.
- `Completed` and `Cancelled` are terminal states.

### Rules

- A Request must always have one creator identifier.
- A Request must always have one Department or review destination.
- A Request must always have one Request Type.
- The Department or review destination assigned to a Request must match the mapping for its Request Type.
- An Employee can only view their own Requests.
- An Employee can only cancel their own Request before it is completed.
- Department Staff can only update Requests assigned to their Department.
- Department Staff can only move a Request from `Submitted` to `In Progress` and from `In Progress` to `Completed`.
- A Completed Request cannot be cancelled.
- A Cancelled Request cannot be moved back to another status.
- A Completed Request cannot be moved back to another status.

Current manual routing is:

- `Password Reset -> IT`
- `Leave Request -> HR`
- `Reimbursement -> Finance`
- `Other -> Admin Review`

AI-assisted classification only returns:

- Password Reset
- Leave Request
- Reimbursement

`Other` is used only as a manual fallback and is not returned by the AI classifier.

## Storage

### Storage Choice

- A relational database is a good fit because the intended system contains Users, Departments, Request Types, and Requests with clear relationships.
- SQLite is used in the current implementation because it provides simple relational persistence for the current project scope.
- The system needs request ownership, routing, and status information to remain consistent.
- One relational database is enough for the current requirements.
- A NoSQL database is not required for the current structured data model.

### Durable Data

The current implementation stores:

- Requests.
- Request descriptions.
- Request Types as string values.
- Departments or review destinations as string values.
- Request status.
- The creator identifier for each Request.

In a future production version, durable data could also include:

- Users and their roles.
- User account information.
- Departments.
- Staff Department assignments.
- Request Types and their Department mappings.

### Derived Data

The Department or review destination for a new Request is derived from its Request Type using the application-owned routing mapping.

For example:

`Password Reset -> IT`

The AI classifier does not determine the Department directly.

## Access

### Current Access Patterns

- An Employee needs to retrieve the Requests they created.
- An Employee needs to retrieve the current status of their Requests.
- An Employee may cancel their own active Request.
- Department Staff need to retrieve Requests assigned to a Department.
- Department Staff need to update the status of Requests assigned to their Department.
- The system needs to determine the Department or review destination mapped to a Request Type when a new Request is submitted.

### Current Identity Limitation

The current version does not include a full authentication or user-account database model.

Employee identity is simulated using:

`x-user-id`

Department Staff identity is simulated using:

`x-department`

In a production version, these values would come from authenticated User and Department relationships instead of being supplied directly through request headers.

## Future Data Model Improvements

A production version may introduce separate relational tables for:

- Users
- Departments
- Request Types

This would allow:

- authenticated user accounts,
- persistent user roles,
- persistent Staff Department assignments,
- database-managed Request Type mappings,
- Admin management of Users and Departments,
- foreign-key relationships instead of storing related values as strings.