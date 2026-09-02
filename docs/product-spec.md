# Internal Operations Service Hub

## Problem /Context

Employees may not know  where or how  to request an internal help, they may use paperwork to send request which can got lost and they also may  not know what is their request status.The Internal Operations Service Hub helps employees send requests to departments like IT or HR and track their status

## known facts

- Employees can send requests to departments like IT,HR,Finance
- Each employee can track the status of  their  requests
- different departments handle different types of requests

## actors / stakeholders

- employee /user: send internal requests
- department staff:receive the request and handles the requests
- admin user: manage users, departments and  requests

## functional requirements

- employees can send an internal request
- employees can track and view the status of their requests
- department staff can see requests assigned to their department
- department staff can update the status of their request
- admin user can add,delete,edit users departments and requests
- Employees can cancel their own request before it is completed.
- the system should route each request to its correct department based on request type
- Employees receive an email notification when department staff updates their request status.

## Non-Functional Requirements

- The system should show the current request status within 2 seconds.
- The system should handle many requests at the same time without slowing down significantly.
- the system should be available when an employee needs  to submit or track a request
- Only authorized users can view or manage requests based on their role and department.

## assumption

- we assume that each employee has their own account to access the platform .
- we assume that each request belongs to a main department such as IT,finance,HR.
- we assume that department staff will update the request status when they work on it.

## constraints

- Employees should have internet connection to use the platform.
- the platform should only be used by company employees.

## unknown

- will requests have different priority levels such as normal or urgent?

## non goals

- the system will not include AI chatbot or  automatic replies.
- the system does not perform the depatment's actual work.
- Employees cannot edit a request after submitting it.

## acceptance criteria

- when an employee submits a request, the request should be successfully created.
- the employee should see the status of their request
- the request is routed to the correct department based on the type
- admin users can delete,edit and add users,departments and requests
- department staff can update the status of the request
- the current request status should be displayed within 2 seconds
- an employee can cancel their own request if the request is not completed
- Department staff can see requests assigned to their department
- Unauthorized users should not be able to view or manage request they do not have permission to access it.
- when department staff updates the request status, the employee should receive an email notification.

## incorrect behavior examples

- A request is sent to the wrong department
- A submitted request is not saved or disappears from the system.
- An unauthorized user can view a request.
- Too many request at the same time  cause  the system to crash
- Department staff updates a status but the employee's view doesn't reflect it within the 2-second period.
- Department staff updates the request status but the employee does not receive the email notification.