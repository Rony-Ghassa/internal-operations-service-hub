import { useEffect, useState } from 'react';

type ServiceRequest = {
  id: number;
  requestType: string;
  department: string;
  description: string;
  status: string;
  createdByUserId: number;
};

function StaffView() {
  const [department, setDepartment] =
    useState('IT');

  const [requests, setRequests] =
    useState<ServiceRequest[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const loadRequests = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `http://localhost:3000/requests/department/${encodeURIComponent(
          department,
        )}`,
      );

      if (!response.ok) {
        throw new Error(
          'Could not load department requests.',
        );
      }

      const data = await response.json();

      setRequests(data);
    } catch {
      setError(
        'Could not load department requests.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [department]);

  const updateStatus = async (
    requestId: number,
    status: string,
  ) => {
    setError('');

    try {
      const response = await fetch(
        `http://localhost:3000/requests/${requestId}/status`,
        {
          method: 'PATCH',

          headers: {
            'Content-Type': 'application/json',

            'x-department': department,
          },

          body: JSON.stringify({
            status,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Could not update request status.',
        );
      }

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status: data.newStatus,
              }
            : request,
        ),
      );
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          'Could not update request status.',
        );
      }
    }
  };

  return (
    <main className="staff-page">
      <div className="staff-container">
        <header className="staff-header">
          <div>
            <p className="eyebrow">
              Department Staff Portal
            </p>

            <h1>Service Requests</h1>

            <p>
              View and manage requests assigned
              to your department.
            </p>
          </div>

          <label>
            Department

            <select
              value={department}
              onChange={(event) =>
                setDepartment(
                  event.target.value,
                )
              }
            >
              <option value="IT">
                IT
              </option>

              <option value="HR">
                HR
              </option>

              <option value="Finance">
                Finance
              </option>

              <option value="Admin Review">
                Admin Review
              </option>
            </select>
          </label>
        </header>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {loading ? (
          <p>Loading requests...</p>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <h2>No requests</h2>

            <p>
              There are currently no requests
              assigned to {department}.
            </p>
          </div>
        ) : (
          <div className="staff-request-list">
            {requests.map((request) => (
              <article
                className="staff-request-card"
                key={request.id}
              >
                <div className="staff-request-top">
                  <div>
                    <span className="request-type">
                      {request.requestType}
                    </span>

                    <h2>
                      {request.description}
                    </h2>
                  </div>

                  <span className="status-badge">
                    {request.status}
                  </span>
                </div>

                <div className="staff-request-details">
                  <div>
                    <span>Department</span>

                    <strong>
                      {request.department}
                    </strong>
                  </div>

                  <div>
                    <span>Employee</span>

                    <strong>
                      Employee #
                      {request.createdByUserId}
                    </strong>
                  </div>
                </div>

                <div className="staff-actions">
                  {request.status ===
                    'Submitted' && (
                    <button
                      onClick={() =>
                        updateStatus(
                          request.id,
                          'In Progress',
                        )
                      }
                    >
                      Start Request
                    </button>
                  )}

                  {request.status ===
                    'In Progress' && (
                    <button
                      onClick={() =>
                        updateStatus(
                          request.id,
                          'Completed',
                        )
                      }
                    >
                      Mark Completed
                    </button>
                  )}

                  {request.status ===
                    'Completed' && (
                    <span className="completed-text">
                      Request completed
                    </span>
                  )}

                  {request.status ===
                    'Cancelled' && (
                    <span className="completed-text">
                      Request cancelled
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default StaffView;