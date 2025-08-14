import React, { useState } from 'react';
import { CloseIcon, KeyIcon, LogoIcon } from './icons';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: (code: string) => boolean;
}

const UnlockModal: React.FC<UnlockModalProps> = ({ isOpen, onClose, onUnlock }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSuccess(false);

    if (!code.trim()) {
      setError('Please enter a code.');
      return;
    }

    const success = onUnlock(code);
    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setCode('');
        setIsSuccess(false);
      }, 2000);
    } else {
      setError('Invalid code. Please try again.');
    }
  };
  
  const handleClose = () => {
    setCode('');
    setError('');
    setIsSuccess(false);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="bg-[var(--bg-secondary)] rounded-xl shadow-2xl w-full max-w-sm m-4 p-8 flex flex-col gap-4 text-[var(--text-primary)] transform transition-all border border-[var(--border-primary)]" onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-4 right-4">
            <button onClick={handleClose} className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded-full" aria-label="Close">
                <CloseIcon className="w-6 h-6" />
            </button>
        </div>

        <div className="text-center">
            <LogoIcon className="w-12 h-12 text-[var(--accent-action)] mx-auto mb-2" />
            <KeyIcon className="w-8 h-8 text-[var(--accent-yellow)] mx-auto" />
            <h2 className="text-2xl font-bold mt-2">Unlock Pro Plan</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Enter your personal Pro code you received.</p>
        </div>
        
        {isSuccess ? (
            <div className="text-center p-4 bg-green-500/10 text-green-500 rounded-lg">
                <p className="font-bold">Success!</p>
                <p>Your Pro plan has been activated.</p>
            </div>
        ) : (
            <form onSubmit={handleUnlock} className="flex flex-col gap-4">
                <div>
                    <label htmlFor="pro-code" className="sr-only">Pro Code</label>
                    <input
                        id="pro-code"
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="Enter your personal Pro code"
                        className="block w-full px-3 py-2 text-base border-[var(--border-secondary)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-action)] focus:border-[var(--accent-action)] sm:text-sm rounded-md uppercase tracking-widest text-center"
                        autoFocus
                    />
                     {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
                </div>
                <button
                    type="submit"
                    className="w-full px-4 py-2.5 text-sm font-medium text-white bg-[var(--accent-action)] hover:bg-[var(--accent-action-hover)] rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-action)] focus:ring-offset-[var(--bg-secondary)]"
                >
                    Unlock
                </button>
            </form>
        )}
      </div>
    </div>
  );
};

export default UnlockModal;