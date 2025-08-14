import React, { useState } from 'react';
import { Button } from './Button';

export const DocumentUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(selectedFiles);
    setMessage('');
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const response = await fetch('/api/upload-documents', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        setFiles([]);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-4 p-6 border border-zinc-700 rounded-lg bg-zinc-800">
      <h3 className="text-lg font-semibold text-white">Upload Knowledge Documents</h3>
      
      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-300">
          Supported formats: TXT (Max 10 files)
        </label>
        <input
          type="file"
          multiple
          accept=".txt"
          onChange={handleFileSelect}
          className="text-white bg-zinc-700 border border-zinc-600 rounded px-3 py-2"
          disabled={uploading}
        />
        
        {files.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            <label className="text-sm text-zinc-300">Selected files:</label>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-zinc-700 p-2 rounded">
                <span className="text-sm text-white">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-400 hover:text-red-300 text-sm"
                  disabled={uploading}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button 
        onClick={handleUpload} 
        disabled={files.length === 0 || uploading}
        className="w-full"
      >
        {uploading ? 'Processing Documents...' : 'Upload and Process Documents'}
      </Button>

      {message && (
        <div className={`text-sm p-3 rounded ${
          message.includes('✅') 
            ? 'text-green-400 bg-green-900/20 border border-green-700' 
            : 'text-red-400 bg-red-900/20 border border-red-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};