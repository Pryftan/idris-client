import { useState, useEffect } from 'react'
import { createClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import { FileSystem } from './proto/filesystem_connect';
import { type FileInfo } from './proto/filesystem_pb';
import './App.css'
import rwLogo from './assets/RWlogo.svg'

const transport = createConnectTransport({
  baseUrl: 'https://f45d-146-70-186-166.ngrok-free.app/',
  useBinaryFormat: false,
});

const client = createClient(FileSystem, transport);

async function getFilenames(folder: string[]): Promise<FileInfo[]> {
  const response = await client.listFiles({ path: folder.join("/") });
  return response.files;
}

async function getPicture(folder: string[], filename: string, width?: number): Promise<Uint8Array> {
  const response = await client.getImage({ 
    path: folder.join("/") + "/" + filename,
    ...(width !== undefined && { width }) 
  });
  return response.imageData;
}

async function downloadFile(folder: string[], filename: string): Promise<void> {
  try {
    const response = await client.getFile({ path: folder.join("/") + "/" + filename });
    const blob = new Blob([response.fileData]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || 'Error downloading file');
    }
    throw new Error('Unknown error occurred while downloading file');
  }
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
  const [isDarkMode, setIsDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      if (folder.length > 0) {
        setFolder(folder.slice(0, -1));
        setCurrentImageIndex(-1);
        setPicture(null);
        setSelectedFile(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [folder]);

  // Update history when folder changes
  useEffect(() => {
    if (folder.length > 0) {
      window.history.pushState({ folder }, '', `#${folder.join('/')}`);
    } else {
      window.history.pushState({ folder: [] }, '', window.location.pathname);
    }
  }, [folder]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    getFilenames(folder)
      .then(files => {
        // Sort files: directories first, then alphabetically
        const sortedFiles = [...files].sort((a, b) => {
          if (a.isDir && !b.isDir) return -1;
          if (!a.isDir && b.isDir) return 1;
          return a.filename.localeCompare(b.filename);
        });
        setFilenames(sortedFiles);
      })
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
      // Check if the file is an image based on extension
      const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.filename);
      
      if (isImage) {
        const imageIndex = filenames.findIndex(f => f.filename === file.filename);
        setCurrentImageIndex(imageIndex);
        setPicture(null);
        setImageLoading(true);
        getPicture(folder, file.filename, windowWidth).then((image) => {
          const blob = new Blob([image], { type: 'image/jpeg' });
          const url = URL.createObjectURL(blob);
          setPicture(url);
          setImageLoading(false);
        }).catch((err) => {
          setError(err.message || 'Error loading image');
          setImageLoading(false);
        });
      } else {
        // For non-image files, trigger download
        setError(null);
        downloadFile(folder, file.filename).catch((err) => {
          setError(err.message || 'Error downloading file');
        });
      }
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
    getPicture(folder, nextFile.filename, windowWidth).then((image) => {
      const blob = new Blob([image], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      setPicture(url);
      setImageLoading(false);
    }).catch((err) => {
      setError(err.message || 'Error loading image');
      setImageLoading(false);
    });
  }

  const goBack = () => {
    if (folder.length > 0) {
      setFolder(folder.slice(0, -1));
      setCurrentImageIndex(-1);
      setPicture(null);
      setSelectedFile(null);
    }
  }

  const loadFullSize = () => {
    if (currentImageIndex === -1) return;
    
    const imageFiles = filenames.filter(f => !f.isDir);
    const currentFile = imageFiles[currentImageIndex];
    if (!currentFile) return;
    
    setImageLoading(true);
    getPicture(folder, currentFile.filename).then((image) => {
      const blob = new Blob([image], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      setPicture(url);
      setImageLoading(false);
    }).catch((err) => {
      setError(err.message || 'Error loading full size image');
      setImageLoading(false);
    });
  }

  return (
    <>
      <div className="card">
        <img 
          src={rwLogo} 
          alt="RW Logo" 
          className={`logo ${isDarkMode ? 'dark-mode' : ''}`}
        />
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
              <>
                <div className="image-wrapper">
                  <img src={picture} alt="Picture" />
                  {currentImageIndex !== -1 && (
                    <div className="image-comment">
                      {filenames[currentImageIndex]?.comment || filenames[currentImageIndex]?.filename}
                    </div>
                  )}
                </div>
                <button 
                  className="full-size-button" 
                  onClick={loadFullSize}
                >
                  View Full Size
                </button>
              </>
            )}
          </div>
        )}
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && folder.length > 0 && (
          <ul>
            <li key={"..."} className="parent-dir" onClick={goBack}>...</li>
          </ul>
        )}
        {!loading && !error && (
          <ul>
            {filenames.map((file) => (
              <li 
                key={file.filename} 
                onClick={() => selectRow(file)}
                className={`${selectedFile === file.filename ? 'selected' : ''} ${file.isDir ? 'directory' : ''}`}
              >
                {file.isDir ? '📁 ' : ''}{file.filename}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

export default App
