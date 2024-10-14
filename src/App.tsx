import React, { useState, ChangeEvent } from 'react';
import axios from 'axios';
import { Upload, Image as ImageIcon, Loader, AlertCircle } from 'lucide-react';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultUrl(null);
      setError(null);
    }
  };

  const removeBackground = async () => {
    if (!selectedFile) return;
    if (!apiKey) {
      setError('Please enter your Remove.bg API key.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image_file', selectedFile);

    try {
      const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
        headers: {
          'X-Api-Key': apiKey,
        },
        responseType: 'arraybuffer',
      });

      const blob = new Blob([response.data], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (error: any) {
      console.error('Error removing background:', error);
      if (error.response && error.response.status === 403) {
        setError('Invalid API key. Please check your Remove.bg API key and try again.');
      } else {
        setError('An error occurred while removing the background. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">Image Background Remover</h1>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <div className="mb-4">
          <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
            Remove.bg API Key
          </label>
          <input
            type="text"
            id="api-key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your Remove.bg API key"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="file-upload" className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 flex items-center justify-center">
            <Upload className="mr-2" size={20} />
            Choose Image
          </label>
          <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>
        {previewUrl && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Preview:</h2>
            <img src={previewUrl} alt="Preview" className="max-w-full h-auto rounded-md" />
          </div>
        )}
        {selectedFile && (
          <button
            onClick={removeBackground}
            disabled={isLoading}
            className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-300 flex items-center justify-center w-full"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin mr-2" size={20} />
                Processing...
              </>
            ) : (
              <>
                <ImageIcon className="mr-2" size={20} />
                Remove Background
              </>
            )}
          </button>
        )}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
            <AlertCircle className="mr-2" size={20} />
            <p>{error}</p>
          </div>
        )}
        {resultUrl && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">Result:</h2>
            <img src={resultUrl} alt="Result" className="max-w-full h-auto rounded-md" />
            <a
              href={resultUrl}
              download="removed_background.png"
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 inline-block"
            >
              Download Result
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;