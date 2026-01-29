'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const STORAGE_KEY = 'pwa-install-prompt-dismissed';
const DISMISS_DURATION_DAYS = 7; // Don't show again for 7 days after dismissal

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // Check if the app is already installed or if user dismissed the prompt
  const checkShouldShowPrompt = useCallback(() => {
    // Check if app is already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return false;
    }

    // Check if user dismissed the prompt recently
    const dismissedData = localStorage.getItem(STORAGE_KEY);
    if (dismissedData) {
      try {
        const { timestamp } = JSON.parse(dismissedData);
        const dismissedAt = new Date(timestamp);
        const now = new Date();
        const daysSinceDismissal = (now.getTime() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceDismissal < DISMISS_DURATION_DAYS) {
          return false;
        }
      } catch {
        // Invalid data, clear it
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    return true;
  }, []);

  useEffect(() => {
    // Check if on iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) &&
                        !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isIOSDevice);

    // For iOS, show manual instructions if conditions are met
    if (isIOSDevice && checkShouldShowPrompt()) {
      // Delay showing the prompt slightly
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // Handle beforeinstallprompt event for Android/Chrome
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();

      // Store the event for later use
      setDeferredPrompt(e);

      // Check if we should show the prompt
      if (checkShouldShowPrompt()) {
        // Delay showing the prompt slightly
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      }
    };

    // Handle app installed event
    const handleAppInstalled = () => {
      console.log('[PWA] App was installed');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem(STORAGE_KEY);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [checkShouldShowPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    console.log('[PWA] User choice:', outcome);

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);

    // Store dismissal with timestamp
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      timestamp: new Date().toISOString(),
    }));
  };

  // Don't render if app is installed or prompt shouldn't be shown
  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-sm"
      role="dialog"
      aria-labelledby="install-prompt-title"
      aria-describedby="install-prompt-description"
    >
      <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Dismiss install prompt"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-teal-600" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              id="install-prompt-title"
              className="text-sm font-semibold text-gray-900"
            >
              Install Greenfield Marketing
            </h3>
            <p
              id="install-prompt-description"
              className="mt-1 text-xs text-gray-500"
            >
              {isIOS
                ? 'Tap the share button and then "Add to Home Screen" to install.'
                : 'Add to your home screen for quick access and offline support.'}
            </p>

            {/* Action buttons */}
            <div className="mt-3 flex items-center gap-2">
              {!isIOS && deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-md hover:bg-teal-700 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Install App
                </button>
              )}
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                {isIOS ? 'Got it' : 'Not now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
