import { useState, useEffect } from 'react'
import { createClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import { FileSystem } from './proto/filesystem_pb';
import './App.css'

async function getFilenames(): Promise<string[]> {
  const transport = createConnectTransport({
    baseUrl: 'https://f45d-146-70-186-166.ngrok-free.app/',
    useBinaryFormat: false,
  });
  
  const client = createClient(FileSystem, transport);

  const response = await client.listFiles({ path: 'C:/Users/pryft/Documents/DumbPics/Wedding/' });
  return response.filenames;
}

function App() {
  const [filenames, setFilenames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFilenames()
      .then(setFilenames)
      .catch((err) => setError(err.message || 'Error fetching filenames'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="card">
        <h2>Filenames</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && (
          <ul>
            {filenames.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

export default App
