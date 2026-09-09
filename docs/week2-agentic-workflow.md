# Week 2 Agentic Workflow

## Bounded Behavior

Implement Request status transitions for the Internal Operations Service Hub.

## Understand

### Week 1 Sources
- `product-spec.md`
- `architecture.md`
- `data-model.md`

### States
- Submitted
- In Progress
- Completed
- Cancelled

### Rules
- A new Request starts as `Submitted`.
- `Submitted` can move to `In Progress`.
- `In Progress` can move to `Completed`.
- A Request can be `Cancelled` before it is completed.

### Invariant
- A `Completed` or `Cancelled` Request cannot move to another status.

### Implementation Area
- NestJS backend
- One simple HTTP endpoint
- In-memory data

### Non-Goals
- No frontend
- No real database
- No authentication
- No email implementation
- No request routing
- No Kafka, queues, or microservices

## Direct

### Bounded Task
Implement only Request status transitions in the NestJS backend.

### Plan
1. Define the Request states.
2. Add transition rules.
3. Add one simple HTTP endpoint.
4. Use in-memory data.
5. Test valid and invalid transitions.

### Scope Control
- Do not change unrelated files.
- Do not add features outside this task.

## Prove

### Valid Transitions
- `Submitted -> In Progress` should succeed.
- `In Progress -> Completed` should succeed.
- `Submitted -> Cancelled` should succeed.

### Invalid Transitions
- `Completed -> Cancelled` should be rejected.
- `Cancelled -> In Progress` should be rejected.

### Invariant Check
A Request in `Completed` or `Cancelled` state must stay in that final state.

### Verification
For each case:
- run the request
- compare expected and actual result
- confirm valid transitions succeed
- confirm invalid transitions are rejected

If a defect appears:
1. Reproduce it.
2. Find the cause.
3. Fix it.
4. Run the cases again.

After verification, perform a final regression check and commit the working version.