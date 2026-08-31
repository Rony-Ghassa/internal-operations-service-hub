# Internal Operations Service Hub Architecture

## Purpose + Scope

This architecture describes the main components, responsibilities, flows, boundaries, and authorization decisions needed for the Internal Operations Service Hub based on the product specification.

### Requirements for the Design

- Employees can submit internal request
- The system routes each request to the correct department based on request type
- Department staff can view and update requests assigned to their department.
- Employees can track the status of their requests.
- Admin users can add, edit, and delete users, departments, and requests.
- Only authorized users can view or manage requests based on their role and department.
- Employees receive an email notification when department staff updates their request status.

### Actors

- Employee/User: submits internal requests and tracks their status.
- Department Staff: receives requests assigned to their department and updates their status.
- Admin User: manages users, departments, and requests.

### system boundaries

#### inside the system

- User interface used by employees, department staff, and admins.
- Request management logic.
- Request routing based on request type.
- Role and permission checks.
- Request status management.
- Data storage for users, departments, and requests.

#### Outside the System

- Employees, department staff, and admin users.
- The actual work performed by IT, HR, or Finance departments.
- Internet connection.
- Email Service used to send status update notifications.

## Structure + Flow

### Main Components

- User Interface: allows employees, department staff, and admins to interact with the system.
- Application Backend: handles request creation, routing, status updates, cancellations, and authorization checks.
- Database: stores users, departments, requests, and request statuses.
- Email Service: external dependency used to send email notifications when department staff updates a request status.

### Component Responsibilities

#### User Interface

- Allows employees to submit and track requests.
- Allows department staff to view and update assigned requests.
- Allows admins to manage users, departments, and requests.

#### Application Backend

- Receives and validates requests.
- Routes each request to the correct department.
- Checks user roles and permissions.
- Handles request status updates and cancellations.
- Reads and saves data in the Database.
- Handles admin management operations after checking the admin role.
- Sends an email notification request when department staff updates a request status.

#### Database

- Stores users and their roles.
- Stores departments.
- Stores requests and their current status.
- Stores which employee created a request and which department it belongs to.
- Stores the mapping between request types and their correct departments.

# Main Flow

### Request Submission Flow

1. Employee submits an internal request through the User Interface.
2. The User Interface sends the request to the Application Backend.
3. The Backend checks the request information and the employee's permission.
4. The Backend identifies the correct department based on the request type.
5. The request is saved in the Database with its department and status.
6. Department staff can then view the request assigned to their department.

### Status Update Flow

1. Department staff opens a request assigned to their department.
2. Department staff updates the request status.
3. The User Interface sends the update to the Application Backend.
4. The Backend checks that the staff member has permission to update that request.
5. The new status is saved in the Database.
6. The Backend sends a notification request to the Email Service.
7. The Email Service sends an email notification to the employee.
8. When the employee views the request again, the updated status is displayed.

### Request Cancellation Flow

1. Employee selects one of their own requests to cancel.
2. The User Interface sends the cancellation request to the Application Backend.
3. The Backend checks that the request belongs to that employee.
4. The Backend checks that the request is not already completed.
5. The request status is updated to cancelled in the Database.
6. The employee sees the updated cancelled status.

### Admin Management Flow

1. Admin selects an action to add, edit, or delete a user, department, or request.
2. The User Interface sends the action to the Application Backend.
3. The Backend checks that the user has the Admin role.
4. The Backend performs the requested change.
5. The Database is updated.
6. The result is shown to the Admin.

# Trust + Resilience

### Authorization

- The Application Backend checks the user's role before allowing access to a request.
- Employees can view their own requests and cancel them before completion.
- Department staff can only view and update requests assigned to their department.
- Admin users can manage users, departments, and requests.

### Reliability / Failure Handling

- If a request cannot be saved, the system should retry once. If it still fails, the user should see an error instead of a successful submission message.
- The system should handle many requests at the same time without crashing.
- If the internet connection is lost, the user should be informed that the request could not be completed.
- Request status information should be returned within the 2-seconds when the system is operating normally.
- If the Email Service fails, the request status should still be updated and saved in the Database.

# Decisions

- Use one Application Backend to handle the main system logic.
- Keep request routing inside the Backend.
- Keep authorization checks inside the Backend.
- Use one Database to keep users, departments, requests, and request statuses.
- Use an external Email Service to send notifications when department staff updates request statuses.

# Communication + Trust Decisions

- Communication between the User Interface and Application Backend is synchronous because users need an immediate response.
- Communication between the Application Backend and Database is synchronous for the current request flows.
- Authorization checks are performed by the Application Backend and not trusted to the User Interface.
- Only the Application Backend communicates directly with the Database.
- The overall request handling process is asynchronous because an employee can submit a request and the department staff may handle and update it later.
- Sending the email notification should not block the request status update.

# Traceability

- Employees can submit requests -> User Interface + Application Backend + Database
- Requests must be routed to the correct department -> Application Backend.
- Admin can manage users, departments, and requests -> User Interface + Backend authorization + Database.
- Department staff can update request status -> User Interface + Application Backend + Database.
- Employees can track request status -> User Interface + Application Backend + Database.
- Only authorized users can access requests -> Application Backend authorization checks.
- Employees can cancel their own request before completion -> Application Backend checks ownership and request status.
- Employees receive an email when department staff updates their request status -> Application Backend + Email Service.

### Architecture Diagram

![Internal Operations Service Hub Architecture](architecture-diagram.png)i wa