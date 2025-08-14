import React, { useState, useEffect } from 'react';
import { CopyIcon, DownloadIcon, CheckIcon, CloseIcon, LogoIcon } from './icons';

interface JsonViewerProps {
  title: string;
  jsonString: string | null;
  onDownload?: () => void;
  isLoading?: boolean;
  onClear?: () => void;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ title, jsonString, onDownload, isLoading, onClear }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (jsonString) {
      navigator.clipboard.writeText(jsonString);
      setCopied(true);
    }
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl flex flex-col w-full h-full shadow-lg transition-colors duration-300 border border-[var(--border-primary)]">
      <div className="flex justify-between items-center p-4 border-b border-[var(--border-primary)] flex-shrink-0">
        <div className="flex items-center gap-3">
            <LogoIcon className="w-8 h-8 text-[var(--accent-action)]" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {onClear && (
            <button onClick={onClear} className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-red)] hover:bg-[var(--accent-red)]/10 rounded-lg transition-colors" aria-label="Clear content" title="Clear content">
                <CloseIcon className="w-5 h-5" />
            </button>
          )}
          {onDownload && jsonString && (
            <button onClick={onDownload} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors" aria-label="Download JSON" title="Download JSON">
                <DownloadIcon className="w-5 h-5" />
            </button>
          )}
          <button onClick={handleCopy} disabled={!jsonString} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Copy JSON" title="Copy JSON">
            {copied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <div className="p-1 flex-grow relative overflow-hidden bg-[var(--bg-primary)] rounded-b-xl">
        {isLoading ? (
            <div className="absolute inset-0 bg-[var(--bg-secondary)]/80 flex items-center justify-center z-10 backdrop-blur-sm">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--accent-action)]"></div>
            </div>
        ) : (
          <pre className="h-full w-full overflow-auto text-sm text-[var(--text-secondary)] font-mono whitespace-pre-wrap break-all p-4">
            {jsonString ? jsonString : <span className="text-[var(--text-secondary)]/50 select-none">Output will appear here...</span>}
          </pre>
        )}
      </div>
    </div>
  );
};

export default JsonViewer;