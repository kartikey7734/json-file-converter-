import React, { useState } from 'react';
import { UploadIcon } from './icons';

interface InputAreaProps {
  onFileChange: (file: File | null) => void;
  onTextSubmit: (text: string) => void;
}

const InputArea: React.FC<InputAreaProps> = ({ onFileChange, onTextSubmit }) => {
  const [inputType, setInputType] = useState<'upload' | 'paste'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [pastedText, setPastedText] = useState('');

  const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmitText = () => {
    onTextSubmit(pastedText);
  };

  const tabBaseClasses = "flex-1 px-4 py-3 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent-action)] focus-visible:ring-offset-[var(--bg-secondary)] rounded-t-lg";
  const tabActiveClass = "text-[var(--accent-action)] border-b-2 border-[var(--accent-action)] bg-transparent";
  const tabInactiveClass = "text-[var(--text-secondary)] border-b-2 border-transparent hover:bg-[var(--bg-hover)]";
  
  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl flex flex-col w-full h-full shadow-lg transition-colors duration-300 border border-[var(--border-primary)]">
      <div className="flex border-b border-[var(--border-primary)] px-2">
        <button
          onClick={() => setInputType('upload')}
          className={`${tabBaseClasses} ${inputType === 'upload' ? tabActiveClass : tabInactiveClass}`}
          aria-pressed={inputType === 'upload'}
        >
          Upload File
        </button>
        <button
          onClick={() => setInputType('paste')}
          className={`${tabBaseClasses} ${inputType === 'paste' ? tabActiveClass : tabInactiveClass}`}
          aria-pressed={inputType === 'paste'}
        >
          Paste JSON
        </button>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        {inputType === 'upload' ? (
          <label
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            htmlFor="file-upload"
            className={`relative block w-full h-full rounded-lg border-2 ${
              isDragging ? 'border-[var(--accent-action)] bg-[var(--bg-primary)] ring-2 ring-offset-2 ring-[var(--accent-action)] ring-offset-[var(--bg-secondary)]' : 'border-dashed border-[var(--border-secondary)]'
            } p-12 text-center hover:border-gray-400 focus:outline-none cursor-pointer transition-all duration-200 flex flex-col justify-center items-center`}
          >
            <UploadIcon className="mx-auto h-12 w-12 text-[var(--text-secondary)]" />
            <span className="mt-2 block text-sm font-medium text-[var(--text-primary)]">
              Drag & drop your Make/n8n .json file
            </span>
            <span className="text-xs text-[var(--text-secondary)]">or click to browse</span>
            <input
              id="file-upload"
              type="file"
              accept=".json,application/json"
              onChange={(e) => onFileChange(e.target.files ? e.target.files[0] : null)}
              className="sr-only"
            />
          </label>
        ) : (
          <div className="flex flex-col h-full">
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste your JSON content here..."
              className="w-full flex-grow bg-[var(--bg-primary)] text-[var(--text-primary)] font-mono p-4 rounded-lg border border-[var(--border-secondary)] focus:ring-[var(--accent-action)] focus:border-[var(--accent-action)] transition resize-none"
              aria-label="Paste JSON content"
            />
            <button
              onClick={handleSubmitText}
              disabled={!pastedText.trim()}
              className="mt-4 bg-[var(--accent-action)] hover:bg-[var(--accent-action-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors self-end"
            >
              Use this JSON
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputArea;
