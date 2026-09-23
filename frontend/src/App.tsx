import { useState } from 'react';
import './App.css';

type CreatedRequest = {
  id: number;
  requestType: string;
  department: string;
  description: string;
  status: string;
  createdByUserId: number;
};

function App() {
  const [requestType, setRequestType] = useState('Password Reset');
  const [description, setDescription] = useState('');
  const [aiText, setAiText] = useState('');
  const [createdRequest, setCreatedRequest] =
    useState<CreatedRequest | null>(null);
  const [error, setError] = useState('');

  const [standardLoading, setStandardLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const getAiHint = () => {
    const text = aiText.toLowerCase();

    if (text.includes('password') || text.includes('login')) {
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

  const getSuggestedNextStep = (type: string) => {
    if (type === 'Password Reset') {
      return 'Try resetting your password using your company password reset option. If you still cannot sign in, IT will review your request.';
    }

    if (type === 'Leave Request') {
      return 'Make sure your requested leave dates and any important details are included so HR can review your request.';
    }

    if (type === 'Reimbursement') {
      return 'Keep your receipt or proof of payment ready in case Finance needs it while reviewing your request.';
    }

    return 'Your request has been submitted and will be reviewed by the appropriate department.';
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError('');
    setCreatedRequest(null);
    setStandardLoading(true);

    try {
      const response = await fetch('http://localhost:3000/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': '1',
        },
        body: JSON.stringify({
          requestType,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error('Request could not be created.');
      }

      const data = await response.json();

      setCreatedRequest(data);
      setDescription('');
    } catch {
      setError('Request could not be created.');
    } finally {
      setStandardLoading(false);
    }
  };

  const handleAiSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError('');
    setCreatedRequest(null);
    setAiLoading(true);

    try {
      const response = await fetch(
        'http://localhost:3000/requests/classify-and-create',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': '1',
          },
          body: JSON.stringify({
            text: aiText,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Unable to classify the request.',
        );
      }

      setCreatedRequest(data);
      setAiText('');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Unable to classify the request.');
      }
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <main className="page">
      <div className="background-shape shape-one" />
      <div className="background-shape shape-two" />

      <div className="app-shell">
        <header className="header">
          <div>
            <p className="eyebrow">Employee Service Portal</p>

            <h1>Internal Operations Service Hub</h1>

            <p className="subtitle">
              Submit internal company requests and route them to the
              correct department.
            </p>
          </div>

          <div className="employee-badge">
            <span className="employee-dot" />
            Employee #1
          </div>
        </header>

        <section className="request-panel">
          <div className="panel-heading">
            <div>
              <p className="section-label">Create a request</p>
              <h2>How would you like to submit it?</h2>
            </div>

            <p className="panel-description">
              Choose the request type yourself or let AI classify your
              description.
            </p>
          </div>

          <div className="request-options">
            <div className="request-option">
              <div className="option-top">
                <span className="mode-badge">Standard</span>

                <h3>Choose Request Type</h3>

                <p>
                  Select the request category yourself and submit it
                  directly.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <label>
                  Request Type
                  <select
                    value={requestType}
                    onChange={(event) =>
                      setRequestType(event.target.value)
                    }
                  >
                    <option>Password Reset</option>
                    <option>Leave Request</option>
                    <option>Reimbursement</option>
                  </select>
                </label>

                <label>
                  Description
                  <textarea
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    placeholder="Describe your request..."
                    required
                  />
                </label>

                <button
                  type="submit"
                  disabled={standardLoading}
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

                <h3>Describe Your Request</h3>

                <p>
                  Write what you need and AI will suggest the request
                  type.
                </p>
              </div>

              <form onSubmit={handleAiSubmit}>
                <label>
                  Request Description
                  <textarea
                    value={aiText}
                    onChange={(event) =>
                      setAiText(event.target.value)
                    }
                    placeholder="Example: I forgot my password and cannot log in."
                    required
                  />
                </label>

                <div className="ai-hint">
                  <span className="hint-icon">✦</span>

                  <div>
                    <strong>AI tip</strong>
                    <p>{getAiHint()}</p>
                  </div>
                </div>

                <button
                  className="ai-button"
                  type="submit"
                  disabled={aiLoading}
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
            <div className="success-icon">✓</div>

            <div className="result-content">
              <p className="success-text">
                Request Created Successfully
              </p>

              <h2>Your request has been submitted</h2>

              <div className="result-grid">
                <div className="result-item">
                  <span>Request Type</span>
                  <strong>{createdRequest.requestType}</strong>
                </div>

                <div className="result-item">
                  <span>Department</span>
                  <strong>{createdRequest.department}</strong>
                </div>

                <div className="result-item">
                  <span>Status</span>
                  <strong>{createdRequest.status}</strong>
                </div>
              </div>

              <div className="request-description">
                <span>Description</span>
                <p>{createdRequest.description}</p>
              </div>

              <div className="next-step-card">
                <div className="next-step-icon">✦</div>

                <div>
                  <span>Suggested next step</span>

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
            <strong>Request not created</strong>
            <span>{error}</span>
          </div>
        )}
      </div>
    </main>
  );
}

export default App;