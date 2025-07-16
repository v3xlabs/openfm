import { useCallback, useState } from 'react';
import type { FC } from 'react';
import classnames from 'classnames';
import { IoCloudUploadOutline, IoDocumentOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';
import { parseFlitsmeisterZip } from '../utils/dataParser';
import type { ExtendedFlitsmeisterData } from '../types/dataTypes';

interface FileUploadProps {
  onDataLoaded: (data: ExtendedFlitsmeisterData) => void;
  isLoading?: boolean;
}

const FileUpload: FC<FileUploadProps> = ({ onDataLoaded, isLoading = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    if (!file.name.endsWith('.zip')) {
      setError('Please select a valid ZIP file');
      return;
    }

    setError(null);
    
    try {
      const data = await parseFlitsmeisterZip(file);
      onDataLoaded(data);
    } catch (err) {
      console.error('Error parsing file:', err);
      setError('Error parsing the ZIP file. Please make sure it\'s a valid Flitsmeister export.');
    }
  }, [onDataLoaded]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    handleFiles(e.target.files);
  }, [handleFiles]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={classnames(
          'relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200',
          {
            'border-blue-400 bg-blue-50 scale-105': dragActive && !isLoading,
            'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50': !dragActive && !isLoading,
            'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed': isLoading,
          }
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".zip"
          onChange={handleChange}
          disabled={isLoading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="space-y-6">
          <div className="mx-auto w-20 h-20 text-gray-400">
            {isLoading ? (
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            ) : (
              <IoCloudUploadOutline className="w-full h-full" />
            )}
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              {isLoading ? 'Processing Your Data...' : 'Upload Flitsmeister Data'}
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              {isLoading 
                ? 'Parsing your data export and preparing the visualization...' 
                : 'Drag and drop your ZIP file here, or click to select'
              }
            </p>
          </div>
          
          {!isLoading && (
            <div className="space-y-4">
              <button
                type="button"
                className="inline-flex items-center gap-3 px-8 py-4 border border-transparent text-lg font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <IoDocumentOutline className="h-6 w-6" />
                Choose File
              </button>
              
              <div className="text-sm text-gray-500">
                Supports ZIP files up to 100MB
              </div>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-6 p-6 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-red-500 mt-0.5">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-base font-medium text-red-800 mb-1">Upload Error</h4>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <IoCheckmarkCircleOutline className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-base font-medium text-blue-900 mb-2">How to Export Your Data</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Visit{' '}
                <a
                  href="https://account.flitsmeister.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline hover:text-blue-900"
                >
                  account.flitsmeister.com
                </a>
              </li>
              <li>Request your GDPR data export</li>
              <li>Wait for the email with download link</li>
              <li>Download the ZIP file and upload it here</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload; 