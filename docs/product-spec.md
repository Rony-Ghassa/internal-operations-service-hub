# Internal Operations Service Hub

## Problem / Context

Employees may not know where or how to request internal help. They may use paperwork or informal methods that can get lost, and they may not know the current status of their request.

The Internal Operations Service Hub helps employees submit internal requests to departments such as IT, HR, and Finance and track their status.

## Known Facts

- Employees can send requests to departments such as IT, HR, and Finance.
- Each employee can track the status of their requests.
- Different departments handle different types of requests.
- Requests follow a controlled status lifecycle.
- AI can assist employees by classifying free-text descriptions into supported Request Types.

## Actors / Stakeholders

- Employee / User: submits internal requests, tracks their status, and can cancel their own active requests.
- Department Staff: views requests assigned to a department and updates their status.
- Admin User: intended to manage users, departments, and requests in a future version.

## Functional Requirements

- Employees can submit an internal request.
- Employees can track and view the status of their requests.
- Employees can cancel their own request before it is completed.
- Department Staff can see requests assigned to their department.
- Department Staff can update the status of requests assigned to their department.
- The system should route each request to the correct department based on Request Type.
- Employees can submit free-text request descriptions for AI-assisted Request Type classification.
- AI-assisted classification must only return one of the Request Types allowed by the system.
- Manual Request Types are routed as follows:
  - `Password Reset -> IT`
  - `Leave Request -> HR`
  - `Reimbursement -> Finance`
  - `Other -> Admin Review`
- AI-assisted classification only supports:
  - Password Reset
  - Leave Request
  - Reimbursement
- `Other` is a manual fallback and is not returned by the AI classifier.
- Requests follow this status lifecycle:
  - `Submitted -> In Progress -> Completed`
  - `Submitted -> Cancelled`
  - `In Progress -> Cancelled`
- `Completed` and `Cancelled` are terminal states.

## Non-Functional Requirements

- The system should show the current request status within 2 seconds.
- The system should handle multiple requests at the same time without slowing down significantly.
- The system should be available when an employee needs to submit or track a request.
- Only authorized users should be able to view or manage requests based on their role and department.
- AI failure should not result in invalid data being saved.

## Assumptions

- We assume that employees and staff would have their own accounts in a production version.
- We assume that each request belongs to a main department or review destination such as IT, Finance, HR, or Admin Review.
- We assume that Department Staff will update the request status when they work on it.
- In the current prototype, employee identity and staff department are simulated through request headers rather than a full login system.

## Constraints

- Employees should have an internet connection to use the platform.
- The platform should only be used by company employees.
- The current version uses simulated identity rather than full authentication.

## Unknown

- Will requests have different priority levels such as normal or urgent?

## Non-Goals

- The system will not include a conversational AI chatbot or multi-turn AI conversations. AI is only used to assist with Request Type classification.
- The system does not perform the department's actual work.
- Employees cannot edit a request after submitting it.
- Email notifications are not implemented in the current version.
- Full authentication and JWT-based login are not implemented in the current version.
- Admin management UI is not implemented in the current version.

## Acceptance Criteria

- When an employee submits a valid request, the request should be successfully created.
- The employee should be able to view their submitted requests.
- The employee should see the current status of each request.
- The request should be routed to the correct department or review destination based on Request Type.
- An employee can cancel their own request if the request is not completed.
- Department Staff can see requests assigned to the selected department.
- Department Staff can move a request from `Submitted` to `In Progress`.
- Department Staff can move a request from `In Progress` to `Completed`.
- Invalid status transitions should be rejected.
- Department Staff should not be able to update a request assigned to another department.
- The current request status should be displayed within 2 seconds.
- An unauthorized employee should not be able to view another employee's request.
- When AI-assisted classification succeeds, the result should be one of the Request Types allowed by the AI classifier.
- If AI-assisted classification fails or returns an invalid Request Type, the Request should not be saved.
- A `Completed` or `Cancelled` request should not move to another status.

## Incorrect Behavior Examples

- A request is sent to the wrong department.
- A submitted request is not saved or disappears from the system.
- An unauthorized employee can view another employee's request.
- Department Staff can update a request assigned to another department.
- A `Completed` request is moved back to `In Progress`.
- A `Completed` request is cancelled.
- Too many requests at the same time cause the system to crash.
- Department Staff updates a status but the employee's view does not reflect it within the 2-second period.
- The AI returns a Request Type that is not allowed by the system and the backend accepts it.
- The AI fails but a Request is still saved in the database.