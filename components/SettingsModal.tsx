import React, { useState } from 'react';
import { Settings, AiProvider, User, Theme } from '../types';
import { CloseIcon, UserIcon, KeyIcon, LogoutIcon, DocumentReportIcon, LogoIcon, SunIcon, MoonIcon, SystemIcon, StarIcon } from './icons';
import * as authService from '../services/authService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: Settings;
  onSave: (settings: Settings) => void;
  user: User;
  onLogout: () => void;
  onUnlockClick: () => void;
  isAdmin: boolean;
  onDownloadReport: () => void;
}

const themes: { name: Theme; icon: React.FC<{ className?: string }> }[] = [
    { name: 'light', icon: SunIcon },
    { name: 'dark', icon: MoonIcon },
    { name: 'system', icon: SystemIcon },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentSettings, onSave, user, onLogout, onUnlockClick, isAdmin, onDownloadReport }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  if (!isOpen) return null;
  
  const handleApiKeyChange = (apiKey: string) => {
    onSave({ ...currentSettings, apiKey: apiKey || null });
  };
  
  const handleProviderChange = (provider: AiProvider) => {
    onSave({ ...currentSettings, provider });
  }

  const handleThemeChange = (theme: Theme) => {
    onSave({ ...currentSettings, theme });
  };

  const mailtoHref = `mailto:${authService.DEVELOPER_EMAIL}?subject=${encodeURIComponent(
    `Feedback for Workflow Converter AI (Rating: ${rating}/5)`
  )}&body=${encodeURIComponent(
    `Hi Kartikey,\n\nHere's my feedback for the Workflow Converter AI tool.\n\nRating: ${rating} out of 5 stars\n\nFeedback:\n${feedback}\n\nFrom User: ${user.email}\n------------------`
  )}`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-[var(--bg-secondary)] rounded-xl shadow-2xl w-full max-w-md m-4 flex flex-col text-[var(--text-primary)] transform transition-all border border-[var(--border-primary)]" onClick={(e) => e.stopPropagation()}>
        <header className="flex-shrink-0 flex justify-between items-center p-6 border-b border-[var(--border-primary)]">
          <div className="flex items-center gap-3">
            <LogoIcon className="w-8 h-8 text-[var(--accent-action)]" />
            <h2 className="text-2xl font-bold">Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded-full" aria-label="Close settings">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <main className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          <section className="flex items-center justify-between p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-secondary)]">
            <div className="flex items-center gap-3">
              <UserIcon className="w-6 h-6 text-[var(--text-secondary)]" />
              <div>
                <p className="font-semibold text-sm truncate">{user.email}</p>
                {user.isPro ? (
                  <p className="text-xs font-bold text-[var(--accent-yellow)]">Pro Plan</p>
                ) : (
                  <p className="text-xs text-[var(--text-secondary)]">{authService.getConversionCount(user.email)} free conversions left</p>
                )}
              </div>
            </div>
            <button onClick={onLogout} className="flex items-center gap-2 text-sm text-[var(--accent-red)] font-medium p-2 rounded-lg hover:bg-[var(--accent-red)]/10 transition-colors">
              <LogoutIcon className="w-4 h-4"/> Sign Out
            </button>
          </section>

          {!user.isPro && (
             <section className="border-t border-[var(--border-primary)] pt-6">
                <button onClick={() => { onUnlockClick(); onClose(); }} className="w-full flex items-center justify-center gap-2 text-center text-sm font-semibold text-white bg-[var(--accent-yellow)] hover:opacity-90 rounded-md py-2.5 transition-opacity">
                    <KeyIcon className="w-4 h-4"/> Unlock Pro Plan
                </button>
             </section>
           )}

          <section className="border-t border-[var(--border-primary)] pt-6 space-y-4">
            <h3 className="text-lg font-semibold">API Configuration</h3>
            <div>
              <label htmlFor="ai-provider" className="block text-sm font-medium text-[var(--text-secondary)]">AI Provider</label>
              <select id="ai-provider" value={currentSettings.provider} onChange={(e) => handleProviderChange(e.target.value as AiProvider)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-[var(--border-secondary)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-[var(--accent-action)] focus:border-[var(--accent-action)] sm:text-sm rounded-md">
                <option value="gemini">Google Gemini</option>
              </select>
            </div>
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium text-[var(--text-secondary)]">API Key</label>
              <input id="api-key" type="password" placeholder="Enter your API key" value={currentSettings.apiKey || ''} onChange={(e) => handleApiKeyChange(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-[var(--border-secondary)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-[var(--accent-action)] focus:border-[var(--accent-action)] sm:text-sm rounded-md"/>
            </div>
          </section>
          
          <section className="border-t border-[var(--border-primary)] pt-6 space-y-4">
            <h3 className="text-lg font-semibold">Appearance</h3>
            <div>
              <label htmlFor="theme-toggle" className="block text-sm font-medium text-[var(--text-secondary)]">
                Theme
              </label>
              <div id="theme-toggle" className="mt-2 grid grid-cols-3 gap-2 rounded-lg bg-[var(--bg-primary)] p-1.5 border border-[var(--border-secondary)]">
                {themes.map((themeOption) => (
                  <button
                    key={themeOption.name}
                    onClick={() => handleThemeChange(themeOption.name)}
                    className={`flex items-center justify-center gap-2 rounded-md p-2 text-sm font-medium capitalize transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-secondary)] ${
                      currentSettings.theme === themeOption.name
                        ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] shadow-sm'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                    }`}
                    aria-pressed={currentSettings.theme === themeOption.name}
                  >
                    <themeOption.icon className="w-5 h-5" />
                    <span>{themeOption.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="border-t border-[var(--border-primary)] pt-6 space-y-4">
            <h3 className="text-lg font-semibold">Feedback & Rating</h3>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Rate Your Experience</label>
              <div className="mt-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-[var(--accent-yellow)] transition-transform duration-150 hover:scale-125"
                    aria-label={`Rate ${star} star`}
                  >
                    <StarIcon className="w-7 h-7" filled={(hoverRating || rating) >= star} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="feedback-text" className="block text-sm font-medium text-[var(--text-secondary)]">Your Feedback</label>
              <textarea
                id="feedback-text"
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell me what you liked or what could be improved..."
                className="mt-1 block w-full text-base border-[var(--border-secondary)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-[var(--accent-action)] focus:border-[var(--accent-action)] sm:text-sm rounded-md resize-none"
              />
            </div>
            <a
              href={mailtoHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full flex items-center justify-center gap-2 text-center text-sm font-semibold text-white rounded-md py-2.5 transition-all ${
                  rating === 0 || !feedback.trim()
                      ? 'bg-[var(--bg-hover)] text-[var(--text-secondary)] cursor-not-allowed'
                      : 'bg-[var(--accent-action)] hover:bg-[var(--accent-action-hover)]'
              }`}
              onClick={(e) => {
                  if (rating === 0 || !feedback.trim()) {
                      e.preventDefault();
                  }
              }}
              aria-disabled={rating === 0 || !feedback.trim()}
            >
              Send Feedback
            </a>
          </section>

          {isAdmin && (
            <section className="border-t border-[var(--border-primary)] pt-6">
              <h3 className="text-base font-semibold text-[var(--text-secondary)] mb-2">Admin Tools</h3>
              <button onClick={onDownloadReport} className="w-full flex items-center justify-center gap-2 text-center text-sm font-semibold text-white bg-[var(--accent-red)] hover:opacity-90 rounded-md py-2.5 transition-opacity">
                  <DocumentReportIcon className="w-5 h-5"/> Download Debug Report
              </button>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default SettingsModal;