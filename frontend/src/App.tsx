import {
  useEffect,
  useState,
} from 'react';

import './App.css';
import StaffView from './StaffView';

type CreatedRequest = {
  id: number;
  requestType: string;
  department: string;
  description: string;
  status: string;
  createdByUserId: number;
};

type PortalView =
  | 'employee'
  | 'staff';

function App() {
  const [portalView, setPortalView] =
    useState<PortalView>('employee');

  const [requestType, setRequestType] =
    useState('Password Reset');

  const [description, setDescription] =
    useState('');

  const [aiText, setAiText] =
    useState('');

  const [
    createdRequest,
    setCreatedRequest,
  ] =
    useState<CreatedRequest | null>(
      null,
    );

  const [
    myRequests,
    setMyRequests,
  ] =
    useState<CreatedRequest[]>([]);

  const [error, setError] =
    useState('');

  const [
    myRequestsError,
    setMyRequestsError,
  ] =
    useState('');

  const [
    standardLoading,
    setStandardLoading,
  ] =
    useState(false);

  const [
    aiLoading,
    setAiLoading,
  ] =
    useState(false);

  const [
    myRequestsLoading,
    setMyRequestsLoading,
  ] =
    useState(false);

  const [
    cancellingRequestId,
    setCancellingRequestId,
  ] =
    useState<number | null>(null);

  const getAiHint = () => {
    const text =
      aiText.toLowerCase();

    if (
      text.includes('password') ||
      text.includes('login')
    ) {
      return 'Mention whether you forgot your password, it expired, or you cannot log in.';
    }

    if (
      text.includes('leave') ||
      text.includes('vacation') ||
      text.includes('day off')
    ) {
      return 'Mention the dates or period you need for your leave request.';
    }

    if (
      text.includes('reimbursement') ||
      text.includes('refund') ||
      text.includes('paid')
    ) {
      return 'Mention what you paid for and why the expense was work-related.';
    }

    return 'Describe what happened, what you need, and any useful details. Clear information helps the AI classify your request correctly.';
  };

  const getSuggestedNextStep = (
    type: string,
  ) => {
    if (
      type === 'Password Reset'
    ) {
      return 'Try resetting your password using your company password reset option. If you still cannot sign in, IT will review your request.';
    }

    if (
      type === 'Leave Request'
    ) {
      return 'Make sure your requested leave dates and any important details are included so HR can review your request.';
    }

    if (
      type === 'Reimbursement'
    ) {
      return 'Keep your receipt or proof of payment ready in case Finance needs it while reviewing your request.';
    }

    if (type === 'Other') {
      return 'Your request will be reviewed manually and directed to the appropriate department.';
    }

    return 'Your request has been submitted and will be reviewed by the appropriate department.';
  };

  const loadMyRequests =
    async () => {
      setMyRequestsLoading(true);
      setMyRequestsError('');

      try {
        const response =
          await fetch(
            'http://localhost:3000/requests/my',
            {
              headers: {
                'x-user-id': '1',
              },
            },
          );

        if (!response.ok) {
          throw new Error(
            'Could not load your requests.',
          );
        }

        const data =
          await response.json();

        setMyRequests(data);
      } catch {
        setMyRequestsError(
          'Could not load your requests.',
        );
      } finally {
        setMyRequestsLoading(
          false,
        );
      }
    };

  useEffect(() => {
    if (
      portalView === 'employee'
    ) {
      loadMyRequests();
    }
  }, [portalView]);

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    setError('');
    setCreatedRequest(null);
    setStandardLoading(true);

    try {
      const response =
        await fetch(
          'http://localhost:3000/requests',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
              'x-user-id': '1',
            },

            body:
              JSON.stringify({
                requestType,
                description,
              }),
          },
        );

      if (!response.ok) {
        throw new Error(
          'Request could not be created.',
        );
      }

      const data =
        await response.json();

      setCreatedRequest(data);
      setDescription('');

      await loadMyRequests();
    } catch {
      setError(
        'Request could not be created.',
      );
    } finally {
      setStandardLoading(false);
    }
  };

  const handleAiSubmit =
    async (
      event: React.FormEvent,
    ) => {
      event.preventDefault();

      setError('');
      setCreatedRequest(null);
      setAiLoading(true);

      try {
        const response =
          await fetch(
            'http://localhost:3000/requests/classify-and-create',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
                'x-user-id': '1',
              },

              body:
                JSON.stringify({
                  text: aiText,
                }),
            },
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              'Unable to classify the request.',
          );
        }

        setCreatedRequest(data);
        setAiText('');

        await loadMyRequests();
      } catch (error) {
        if (
          error instanceof Error
        ) {
          setError(
            error.message,
          );
        } else {
          setError(
            'Unable to classify the request.',
          );
        }
      } finally {
        setAiLoading(false);
      }
    };

  const cancelRequest =
    async (
      requestId: number,
    ) => {
      setMyRequestsError('');
      setCancellingRequestId(
        requestId,
      );

      try {
        const response =
          await fetch(
            `http://localhost:3000/requests/${requestId}/cancel`,
            {
              method: 'PATCH',

              headers: {
                'x-user-id': '1',
              },
            },
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              'Could not cancel the request.',
          );
        }

        setMyRequests(
          (currentRequests) =>
            currentRequests.map(
              (request) =>
                request.id ===
                requestId
                  ? {
                      ...request,
                      status:
                        data.newStatus,
                    }
                  : request,
            ),
        );

        setCreatedRequest(
          (currentRequest) => {
            if (
              !currentRequest ||
              currentRequest.id !==
                requestId
            ) {
              return currentRequest;
            }

            return {
              ...currentRequest,
              status:
                data.newStatus,
            };
          },
        );
      } catch (error) {
        if (
          error instanceof Error
        ) {
          setMyRequestsError(
            error.message,
          );
        } else {
          setMyRequestsError(
            'Could not cancel the request.',
          );
        }
      } finally {
        setCancellingRequestId(
          null,
        );
      }
    };

  if (
    portalView === 'staff'
  ) {
    return (
      <>
        <div className="portal-switch-bar">
          <button
            type="button"
            className="portal-switch-button"
            onClick={() =>
              setPortalView(
                'employee',
              )
            }
          >
            ← Employee Portal
          </button>
        </div>

        <StaffView />
      </>
    );
  }

  return (
    <main className="page">
      <div className="background-shape shape-one" />
      <div className="background-shape shape-two" />

      <div className="app-shell">
        <header className="header">
          <div>
            <p className="eyebrow">
              Employee Service Portal
            </p>

            <h1>
              Internal Operations Service Hub
            </h1>

            <p className="subtitle">
              Submit internal company requests
              and track their progress.
            </p>
          </div>

          <div className="header-actions">
            <div className="employee-badge">
              <span className="employee-dot" />
              Employee #1
            </div>

            <button
              type="button"
              className="portal-switch-button"
              onClick={() =>
                setPortalView(
                  'staff',
                )
              }
            >
              Staff Portal
            </button>
          </div>
        </header>

        <div className="employee-layout">

          <aside className="requests-sidebar">
            <div className="sidebar-header">
              <div>
                <p className="section-label">
                  Track requests
                </p>

                <h2>
                  My Requests
                </h2>
              </div>

              <button
                type="button"
                className="sidebar-refresh-button"
                onClick={
                  loadMyRequests
                }
                disabled={
                  myRequestsLoading
                }
              >
                ↻
              </button>
            </div>

            {myRequestsError && (
              <div className="sidebar-error">
                {myRequestsError}
              </div>
            )}

            {myRequestsLoading &&
            myRequests.length ===
              0 ? (
              <p className="sidebar-loading">
                Loading requests...
              </p>
            ) : myRequests.length ===
              0 ? (
              <div className="sidebar-empty">
                <p>
                  You have no requests yet.
                </p>
              </div>
            ) : (
              <div className="sidebar-request-list">
                {myRequests.map(
                  (request) => (
                    <article
                      className="sidebar-request-card"
                      key={request.id}
                    >
                      <div className="sidebar-request-heading">
                        <span className="request-type">
                          {
                            request.requestType
                          }
                        </span>

                        <span
                          className={`sidebar-status sidebar-status-${request.status
                            .toLowerCase()
                            .replace(
                              ' ',
                              '-',
                            )}`}
                        >
                          {
                            request.status
                          }
                        </span>
                      </div>

                      <p className="sidebar-request-description">
                        {
                          request.description
                        }
                      </p>

                      <div className="sidebar-request-department">
                        <span>
                          Department
                        </span>

                        <strong>
                          {
                            request.department
                          }
                        </strong>
                      </div>

                      {(request.status ===
                        'Submitted' ||
                        request.status ===
                          'In Progress') && (
                        <button
                          type="button"
                          className="cancel-request-button"
                          disabled={
                            cancellingRequestId ===
                            request.id
                          }
                          onClick={() =>
                            cancelRequest(
                              request.id,
                            )
                          }
                        >
                          {cancellingRequestId ===
                          request.id
                            ? 'Cancelling...'
                            : 'Cancel Request'}
                        </button>
                      )}

                      {request.status ===
                        'Completed' && (
                        <p className="request-finished">
                          ✓ Completed
                        </p>
                      )}

                      {request.status ===
                        'Cancelled' && (
                        <p className="request-cancelled">
                          Cancelled
                        </p>
                      )}
                    </article>
                  ),
                )}
              </div>
            )}
          </aside>

          <div className="employee-main">

            <section className="request-panel">
              <div className="panel-heading">
                <div>
                  <p className="section-label">
                    Create a request
                  </p>

                  <h2>
                    How would you like
                    to submit it?
                  </h2>
                </div>

                <p className="panel-description">
                  Choose the request
                  type yourself or let
                  AI classify your
                  description.
                </p>
              </div>

              <div className="request-options">

                <div className="request-option">
                  <div className="option-top">
                    <span className="mode-badge">
                      Standard
                    </span>

                    <h3>
                      Choose Request Type
                    </h3>

                    <p>
                      Select the request
                      category yourself
                      and submit it
                      directly.
                    </p>
                  </div>

                  <form
                    onSubmit={
                      handleSubmit
                    }
                  >
                    <label>
                      Request Type

                      <select
                        value={
                          requestType
                        }
                        onChange={(
                          event,
                        ) =>
                          setRequestType(
                            event.target
                              .value,
                          )
                        }
                      >
                        <option>
                          Password Reset
                        </option>

                        <option>
                          Leave Request
                        </option>

                        <option>
                          Reimbursement
                        </option>

                        <option>
                          Other
                        </option>
                      </select>
                    </label>

                    <label>
                      Description

                      <textarea
                        value={
                          description
                        }
                        onChange={(
                          event,
                        ) =>
                          setDescription(
                            event.target
                              .value,
                          )
                        }
                        placeholder="Describe your request..."
                        required
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={
                        standardLoading
                      }
                    >
                      {standardLoading
                        ? 'Submitting...'
                        : 'Submit Request'}
                    </button>
                  </form>
                </div>

                <div className="divider">
                  <span>OR</span>
                </div>

                <div className="request-option ai-option">
                  <div className="option-top">
                    <span className="mode-badge ai-badge">
                      AI Assisted
                    </span>

                    <h3>
                      Describe Your Request
                    </h3>

                    <p>
                      Write what you need
                      and AI will suggest
                      the request type.
                    </p>
                  </div>

                  <form
                    onSubmit={
                      handleAiSubmit
                    }
                  >
                    <label>
                      Request Description

                      <textarea
                        value={aiText}
                        onChange={(
                          event,
                        ) =>
                          setAiText(
                            event.target
                              .value,
                          )
                        }
                        placeholder="Example: I forgot my password and cannot log in."
                        required
                      />
                    </label>

                    <div className="ai-hint">
                      <span className="hint-icon">
                        ✦
                      </span>

                      <div>
                        <strong>
                          AI tip
                        </strong>

                        <p>
                          {getAiHint()}
                        </p>
                      </div>
                    </div>

                    <button
                      className="ai-button"
                      type="submit"
                      disabled={
                        aiLoading
                      }
                    >
                      {aiLoading
                        ? 'Classifying...'
                        : 'AI Classify & Submit'}
                    </button>
                  </form>
                </div>
              </div>
            </section>

            {createdRequest && (
              <section className="result-card">
                <div className="success-icon">
                  ✓
                </div>

                <div className="result-content">
                  <p className="success-text">
                    Request Created Successfully
                  </p>

                  <h2>
                    Your request has been submitted
                  </h2>

                  <div className="result-grid">
                    <div className="result-item">
                      <span>
                        Request Type
                      </span>

                      <strong>
                        {
                          createdRequest.requestType
                        }
                      </strong>
                    </div>

                    <div className="result-item">
                      <span>
                        Department
                      </span>

                      <strong>
                        {
                          createdRequest.department
                        }
                      </strong>
                    </div>

                    <div className="result-item">
                      <span>
                        Status
                      </span>

                      <strong>
                        {
                          createdRequest.status
                        }
                      </strong>
                    </div>
                  </div>

                  <div className="request-description">
                    <span>
                      Description
                    </span>

                    <p>
                      {
                        createdRequest.description
                      }
                    </p>
                  </div>

                  <div className="next-step-card">
                    <div className="next-step-icon">
                      ✦
                    </div>

                    <div>
                      <span>
                        Suggested next step
                      </span>

                      <p>
                        {getSuggestedNextStep(
                          createdRequest.requestType,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {error && (
              <div className="error-box">
                <strong>
                  Request not created
                </strong>

                <span>
                  {error}
                </span>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}

export default App;