

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Platform, Settings, User } from './types';
import { convertWorkflow } from './services/conversionService';
import * as settingsService from './services/settingsService';
import * as authService from './services/authService';
import { SwapIcon, SettingsIcon, ArrowRightIcon, LogoIcon } from './components/icons';
import JsonViewer from './components/JsonViewer';
import InputArea from './components/InputArea';
import SettingsModal from './components/SettingsModal';
import { LoginModal } from './components/LoginModal';
import UpgradeModal from './components/UpgradeModal';
import UnlockModal from './components/UnlockModal';

const ADMIN_EMAIL = authService.DEVELOPER_EMAIL;

export const App: React.FC = () => {
  // --- A. STATE MANAGEMENT ---

  // 1. Core Conversion State
  const [sourceJsonContent, setSourceJsonContent] = useState<string | null>(null);
  const [convertedJson, setConvertedJson] = useState<object | null>(null);
  const [sourcePlatform, setSourcePlatform] = useState<Platform>('make');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Settings State
  const [settings, setSettings] = useState<Settings>(settingsService.loadSettings);

  // 3. Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());

  // 4. UI/Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(!authService.getCurrentUser());
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  // --- B. DERIVED STATE & MEMOS ---

  const targetPlatform = useMemo(() => (sourcePlatform === 'make' ? 'n8n' : 'make'), [sourcePlatform]);
  const convertedJsonString = useMemo(() => convertedJson ? JSON.stringify(convertedJson, null, 2) : null, [convertedJson]);
  const isAdmin = useMemo(() => currentUser?.email === ADMIN_EMAIL, [currentUser]);

  // --- C. EFFECTS ---

  // Effect to apply theme changes whenever settings.theme or the app loads.
  // This is the definitive, robust implementation based on standard patterns.
  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
        if (e.matches) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    };

    // Clean up previous settings before applying new ones
    root.classList.remove('dark');
    mediaQuery.removeEventListener('change', handleSystemThemeChange);

    if (settings.theme === 'dark') {
        root.classList.add('dark');
    } else if (settings.theme === 'light') {
        // 'dark' class is already removed, so nothing more to do
    } else if (settings.theme === 'system') {
        handleSystemThemeChange(mediaQuery);
        mediaQuery.addEventListener('change', handleSystemThemeChange);
    }
    
    // Return a cleanup function to be safe
    return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
}, [settings.theme]);


  // Effect for managing login modal visibility based on user status
  useEffect(() => {
    setIsLoginModalOpen(!currentUser);
  }, [currentUser]);

  // Effect for content protection (anti-dev-tools)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
        (e.metaKey && e.altKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()))
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // --- D. HANDLERS & LOGIC ---

  // 1. Authentication Handlers
  const handleLogin = useCallback((email: string, isNewUser: boolean) => {
    const user = authService.login(email, isNewUser);
    setCurrentUser(user);
    setIsLoginModalOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    authService.logout();
    setCurrentUser(null);
    setIsSettingsOpen(false);
  }, []);

  const handleUnlockPro = useCallback((code: string): boolean => {
    if (currentUser) {
      const unlockedUser = authService.unlockPro(currentUser.email, code);
      if (unlockedUser) {
        setCurrentUser(unlockedUser);
        setIsUnlockModalOpen(false);
        return true;
      }
    }
    return false;
  }, [currentUser]);

  // 2. Settings Handlers
  const handleSaveSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
    settingsService.saveSettings(newSettings);
  }, []);

  // 3. File & Content Handlers
  const processJsonContent = useCallback((text: string | null) => {
    setConvertedJson(null);
    setError(null);

    if (!text || !text.trim()) {
      setSourceJsonContent(null);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      const formattedText = JSON.stringify(parsed, null, 2);
      setSourceJsonContent(formattedText);
      
      // Platform auto-detection
      if (parsed.nodes && parsed.connections) {
        setSourcePlatform('n8n');
      } else if (parsed.flow || parsed.blueprint) {
        setSourcePlatform('make');
      } else {
        setSourcePlatform('make'); // Default assumption
      }
    } catch (err) {
      setSourceJsonContent(text); // Show the invalid text to the user
      setError("Invalid JSON format. Please check the provided content.");
    }
  }, []);

  const handleFileChange = useCallback((file: File | null) => {
    if (!file) {
      handleClear();
      return;
    }
    if (file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => processJsonContent(e.target?.result as string);
      reader.onerror = () => setError("Failed to read the file.");
      reader.readAsText(file);
    } else {
      setError('Please upload a valid .json file.');
    }
  }, [processJsonContent]);

  const handleClear = useCallback(() => {
    setSourceJsonContent(null);
    setConvertedJson(null);
    setError(null);
  }, []);

  const handleSwapPlatforms = useCallback(() => {
    setSourcePlatform(prev => (prev === 'make' ? 'n8n' : 'make'));
  }, []);

  // 4. Core Conversion Action
  const handleConvert = useCallback(async () => {
    if (!sourceJsonContent) return setError('Please provide a source workflow first.');
    if (!currentUser) return setIsLoginModalOpen(true);
    if (!settings.apiKey) {
      setError('API Key is not set. Please add it in settings.');
      setIsSettingsOpen(true);
      return;
    }
    if (!currentUser.isPro && authService.getConversionCount(currentUser.email) <= 0) {
      setIsUpgradeModalOpen(true);
      return;
    }
    
    setError(null);
    setIsLoading(true);
    setConvertedJson(null);

    const result = await convertWorkflow(sourceJsonContent, targetPlatform, settings);
    
    setIsLoading(false);
    
    if (result.error) {
      setError(result.error);
    } else {
      setConvertedJson(result.json);
      if (currentUser && !currentUser.isPro) {
        const updatedUser = authService.decrementConversionCount(currentUser.email);
        setCurrentUser(updatedUser);
      }
    }
  }, [sourceJsonContent, targetPlatform, settings, currentUser]);

  const handleDownload = useCallback(() => {
    if (!convertedJsonString) return;
    const blob = new Blob([convertedJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted_${targetPlatform}_workflow.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [convertedJsonString, targetPlatform]);
  
  const handleDownloadDebugReport = useCallback(() => {
      const report = authService.getDebugReport(settings);
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workflow_converter_debug_report_${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
  }, [settings]);


  // --- E. RENDER ---
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 flex flex-col p-4 md:p-6 lg:p-8 font-sans">
      
      {/* --- Modals --- */}
      {currentUser && (
          <SettingsModal 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)} 
            currentSettings={settings} 
            onSave={handleSaveSettings}
            user={currentUser}
            onLogout={handleLogout}
            onUnlockClick={() => setIsUnlockModalOpen(true)}
            isAdmin={isAdmin}
            onDownloadReport={handleDownloadDebugReport}
          />
      )}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onLogin={handleLogin}
      />
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
      {currentUser && (
        <UnlockModal
          isOpen={isUnlockModalOpen}
          onClose={() => setIsUnlockModalOpen(false)}
          onUnlock={handleUnlockPro}
        />
      )}

      {/* --- Header --- */}
      <header className="flex-shrink-0 flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <LogoIcon className="w-10 h-10 text-[var(--accent-action)]" />
          <div>
            <h1 className="text-2xl font-bold">Workflow Converter AI</h1>
            <p className="text-sm text-[var(--text-secondary)]">Convert Make.com & n8n workflows with AI</p>
          </div>
        </div>
        <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors" aria-label="Open settings">
          <SettingsIcon className="w-6 h-6"/>
        </button>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
        <div className="flex flex-col gap-6">
            <InputArea onFileChange={handleFileChange} onTextSubmit={processJsonContent} />
            <div className="bg-[var(--bg-secondary)] rounded-xl p-4 flex flex-col gap-4 shadow-lg border border-[var(--border-primary)]">
                <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                        <p className="text-sm font-semibold text-[var(--text-secondary)]">FROM</p>
                        <p className="text-2xl font-bold uppercase">{sourcePlatform}</p>
                    </div>
                    <button 
                        onClick={handleSwapPlatforms}
                        className="p-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-full transition-colors"
                        aria-label="Swap platforms"
                        title="Swap platforms"
                    >
                        <SwapIcon className="w-6 h-6" />
                    </button>
                    <div className="text-center flex-1">
                        <p className="text-sm font-semibold text-[var(--text-secondary)]">TO</p>
                        <p className="text-2xl font-bold uppercase">{targetPlatform}</p>
                    </div>
                </div>

                <button onClick={handleConvert} disabled={isLoading || !sourceJsonContent} className="group w-full flex items-center justify-center bg-[var(--accent-action)] hover:bg-[var(--accent-action-hover)] disabled:bg-[var(--bg-hover)] disabled:text-[var(--text-secondary)] disabled:cursor-not-allowed text-white font-bold p-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-action)] focus:ring-offset-[var(--bg-secondary)]">
                    {isLoading ? (
                        <div className="w-6 h-6 animate-spin rounded-full border-4 border-t-white border-white/30"></div>
                    ) : (
                       <div className="flex items-center gap-2">
                            <span>Convert Now</span>
                            <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1"/>
                        </div>
                    )}
                </button>
            </div>
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg text-sm transition-all" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}
        </div>
        <JsonViewer 
          title={`Converted ${targetPlatform.toUpperCase()} JSON`} 
          jsonString={convertedJsonString}
          isLoading={isLoading}
          onDownload={handleDownload}
          onClear={handleClear}
        />
      </main>

      <footer className="text-center mt-8 text-sm text-[var(--text-secondary)]">
        <p>A Project by [Your Name Here]</p>
      </footer>
    </div>
  );
};
