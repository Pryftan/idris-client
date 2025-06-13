import { useState, useEffect } from 'react'
import { createClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import { FileSystem, type FileInfo } from './proto/filesystem_pb';
import './App.css'

const transport = createConnectTransport({
  baseUrl: 'https://f45d-146-70-186-166.ngrok-free.app/',
  useBinaryFormat: false,
});

const client = createClient(FileSystem, transport);

async function getFilenames(folder: string[]): Promise<FileInfo[]> {
  const response = await client.listFiles({ path: folder.join("/") });
  return response.files;
}

async function getPicture(folder: string[], filename: string): Promise<Uint8Array> {
  const response = await client.getImage({ path: folder.join("/") + "/" + filename });
  return response.imageData;
}

function App() {
  const [folder, setFolder] = useState<string[]>([]);
  const [filenames, setFilenames] = useState<FileInfo[]>([]);
  const [picture, setPicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFilenames(folder)
      .then(setFilenames)
      .catch((err) => setError(err.message || 'Error fetching filenames'))
      .finally(() => setLoading(false));
  }, [folder]);

  const selectRow = (file: FileInfo) => {
    if (file.isDir) {
      setFolder([...folder, file.filename]);
    } else {
      setPicture(null);
      getPicture(folder, file.filename).then((image) => {
        const blob = new Blob([image], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        setPicture(url);
      });
    }
  }

  return (
    <>
      <div className="card">
        <h2>Pictures</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && folder.length > 0 && (
          <ul>
            <li key={"..."} onClick={() => setFolder(folder.slice(0, -1))}>...</li>
          </ul>
        )}
        {!loading && !error && (
          <ul>
            {filenames.map((file) => (
              <li key={file.filename} onClick={() => selectRow(file)}>{file.filename}</li>
            ))}
          </ul>
        )}
        {picture && <img src={picture} alt="Picture" />}
      </div>
    </>
  )
}

export default App
