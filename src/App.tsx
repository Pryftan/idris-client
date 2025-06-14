import { useState, useEffect } from 'react'
import { createClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import { FileSystem } from './proto/filesystem_connectweb';
import { type FileInfo } from './proto/filesystem_pb';
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
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(-1);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFilenames(folder)
      .then(setFilenames)
      .catch((err) => setError(err.message || 'Error fetching filenames'))
      .finally(() => setLoading(false));
  }, [folder]);

  const selectRow = (file: FileInfo) => {
    setSelectedFile(file.filename);
    if (file.isDir) {
      setFolder([...folder, file.filename]);
      setCurrentImageIndex(-1);
      setPicture(null);
    } else {
      const imageIndex = filenames.findIndex(f => f.filename === file.filename);
      setCurrentImageIndex(imageIndex);
      setPicture(null);
      setImageLoading(true);
      getPicture(folder, file.filename).then((image) => {
        const blob = new Blob([image], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        setPicture(url);
        setImageLoading(false);
      }).catch((err) => {
        setError(err.message || 'Error loading image');
        setImageLoading(false);
      });
    }
  }

  const navigateImage = (direction: 'prev' | 'next') => {
    const imageFiles = filenames.filter(f => !f.isDir);
    if (imageFiles.length === 0) return;

    let newIndex = currentImageIndex;
    if (direction === 'prev') {
      newIndex = (currentImageIndex - 1 + imageFiles.length) % imageFiles.length;
    } else {
      newIndex = (currentImageIndex + 1) % imageFiles.length;
    }

    const nextFile = imageFiles[newIndex];
    setCurrentImageIndex(newIndex);
    setSelectedFile(null);
    setPicture(null);
    setImageLoading(true);
    getPicture(folder, nextFile.filename).then((image) => {
      const blob = new Blob([image], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      setPicture(url);
      setImageLoading(false);
    }).catch((err) => {
      setError(err.message || 'Error loading image');
      setImageLoading(false);
    });
  }

  return (
    <>
      <div className="card">
        <h2>Pictures</h2>
        {picture && (
          <div className="image-container">
            <div className="navigation">
              <button onClick={() => navigateImage('prev')}>Previous</button>
              <button onClick={() => navigateImage('next')}>Next</button>
            </div>
            {imageLoading ? (
              <div className="image-loading">
                <div className="spinner"></div>
                <p>Loading image...</p>
              </div>
            ) : (
              <img src={picture} alt="Picture" />
            )}
          </div>
        )}
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && folder.length > 0 && (
          <ul>
            <li key={"..."} className="parent-dir" onClick={() => {
              setFolder(folder.slice(0, -1));
              setCurrentImageIndex(-1);
              setPicture(null);
              setSelectedFile(null);
            }}>...</li>
          </ul>
        )}
        {!loading && !error && (
          <ul>
            {filenames.map((file) => (
              <li 
                key={file.filename} 
                onClick={() => selectRow(file)}
                className={selectedFile === file.filename ? 'selected' : ''}
              >
                {file.filename}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

export default App
