import React, { useState } from 'react';
import * as authService from '../services/authService';
import { LogoIcon } from './icons';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (email: string, isNewUser: boolean) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'email' | 'confirm'>('email');
  const [proCode, setProCode] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    
    const userExists = authService.doesUserExist(email);
    if (userExists) {
        onLogin(email, false);
    } else {
        setProCode(authService.generateProCodeForEmail(email));
        setStep('confirm');
    }
  };
  
  const mailtoHref = `mailto:${authService.DEVELOPER_EMAIL}?subject=${encodeURIComponent(
    `New User Signup: Workflow Converter AI`
  )}&body=${encodeURIComponent(
    `Hello Kartikey,\n\nI have just signed up for the Workflow Converter AI tool.\n\nMy email: ${email}\nMy reference code is: ${proCode}\n\nThank you!`
  )}`;

  const handleActivateAndLogin = () => {
    // Prevent multiple clicks
    if (isRedirecting) return;
    
    setIsRedirecting(true);
    
    // First, trigger the email client to open.
    window.location.href = mailtoHref;
    
    // Then, wait for a short duration to ensure the browser has processed
    // the mailto link before we log the user in and unmount this component.
    setTimeout(() => {
      onLogin(email, true);
    }, 1500); // 1.5 second delay
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity" role="dialog" aria-modal="true" aria-labelledby="login-title">
      <div className="bg-[var(--bg-secondary)] rounded-xl shadow-2xl w-full max-w-md m-4 p-8 flex flex-col gap-4 text-[var(--text-primary)] border border-[var(--border-primary)]" onClick={(e) => e.stopPropagation()}>
        {step === 'email' ? (
          <>
            <div className="text-center">
              <LogoIcon className="w-12 h-12 mx-auto mb-4" />
              <h2 id="login-title" className="text-2xl font-bold">Welcome!</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Please sign in to continue.</p>
            </div>
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="block w-full px-3 py-2 text-base border-[var(--border-secondary)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-action)] focus:border-[var(--accent-action)] sm:text-sm rounded-md"
                  autoFocus
                />
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2.5 text-sm font-medium text-white bg-[var(--accent-action)] hover:bg-[var(--accent-action-hover)] rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-action)] focus:ring-offset-[var(--bg-secondary)]"
              >
                Sign In / Get Started
              </button>
            </form>
            <p className="text-xs text-center text-[var(--text-secondary)] mt-2">New users get 5 free conversions.</p>
          </>
        ) : (
          <div className="text-center flex flex-col gap-4">
            <h2 id="login-title" className="text-2xl font-bold">One Last Step</h2>
            <p className="text-sm text-[var(--text-secondary)]">To activate your free trial, please send a signup notification. Clicking below will open your email client and log you in instantly.</p>
            
            <button
                type="button" 
                onClick={handleActivateAndLogin}
                disabled={isRedirecting}
                className="w-full px-4 py-2.5 text-sm font-medium text-white rounded-md transition-colors bg-[var(--accent-action)] hover:bg-[var(--accent-action-hover)] disabled:bg-[var(--bg-hover)] disabled:text-[var(--text-secondary)] disabled:cursor-wait"
            >
                {isRedirecting ? 'Redirecting...' : 'Activate & Continue'}
            </button>

            <button 
              onClick={() => { if (!isRedirecting) setStep('email'); }} 
              className="text-xs text-[var(--text-secondary)] hover:underline disabled:opacity-50"
              disabled={isRedirecting}
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
