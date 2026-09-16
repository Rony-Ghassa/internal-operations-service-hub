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
  const [createdRequest, setCreatedRequest] =
    useState<CreatedRequest | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError('');
    setCreatedRequest(null);

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
        throw new Error('Request could not be created');
      }

      const data = await response.json();
      setCreatedRequest(data);
      setDescription('');
    } catch {
      setError('Request could not be created');
    }
  };

  return (
    <main>
      <h1>Internal Operations Service Hub</h1>

      <h2>Submit a Service Request</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Request Type
          <select
            value={requestType}
            onChange={(event) => setRequestType(event.target.value)}
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
            onChange={(event) => setDescription(event.target.value)}
            required
          />
        </label>

        <button type="submit">Submit Request</button>
      </form>

      {createdRequest && (
        <section>
          <h2>Request Created</h2>
          <p>Request ID: {createdRequest.id}</p>
          <p>Type: {createdRequest.requestType}</p>
          <p>Department: {createdRequest.department}</p>
          <p>Status: {createdRequest.status}</p>
        </section>
      )}

      {error && <p>{error}</p>}
    </main>
  );
}

export default App;