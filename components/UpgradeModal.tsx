import React from 'react';
import { CloseIcon, KeyIcon, LogoIcon } from './icons';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-[var(--bg-secondary)] rounded-xl shadow-2xl w-full max-w-md m-4 p-8 flex flex-col gap-6 text-[var(--text-primary)] text-center transform transition-all border border-[var(--border-primary)]" onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-4 right-4">
            <button onClick={onClose} className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded-full" aria-label="Close">
                <CloseIcon className="w-6 h-6" />
            </button>
        </div>
        
        <LogoIcon className="w-12 h-12 text-[var(--accent-action)] mx-auto" />

        <div className="mx-auto bg-[var(--accent-yellow)]/20 p-3 rounded-full -mt-4 relative">
            <KeyIcon className="w-8 h-8 text-[var(--accent-yellow)]" />
        </div>

        <div>
            <h2 className="text-2xl font-bold">You're out of free conversions!</h2>
            <p className="text-md text-[var(--text-secondary)] mt-2">
                Upgrade to the Pro plan for just <span className="font-bold text-[var(--text-primary)]">$5</span> and get unlimited lifetime conversions.
            </p>
        </div>

        <div className="text-sm bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border-secondary)]">
            <p className="font-semibold">How to Upgrade:</p>
            <p className="mt-2 text-[var(--text-secondary)]">
                To get your personal Pro unlock code, please contact the developer via email. After payment, you'll receive your unique code to unlock the Pro plan forever.
            </p>
            <a href="mailto:your.email@example.com?subject=Workflow Converter AI - Pro Upgrade" className="block w-full mt-4 py-2.5 text-sm font-medium text-white bg-[var(--accent-action)] hover:bg-[var(--accent-action-hover)] rounded-md transition-colors">
                Contact to Upgrade
            </a>
        </div>
        
        <p className="text-xs text-[var(--text-secondary)]">Thank you for supporting an indie developer!</p>
      </div>
    </div>
  );
};

export default UpgradeModal;