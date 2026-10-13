import React, { createContext, useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, Share, MoreVertical, Smartphone, Monitor, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface PWAContextType {
  isInstalled: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'other';
  installApp: () => Promise<void>;
  openInstallGuide: () => void;
  closeInstallGuide: () => void;
  markAsInstalled: () => void;
}

const PWAContext = createContext<PWAContextType | null>(null);

export const PWAProvider = ({ children }: { children: React.ReactNode }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'other'>('desktop');

  useEffect(() => {
    // 1. Detect platform
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) {
      setPlatform('ios');
    } else if (/Android/i.test(ua)) {
      setPlatform('android');
    } else if (/Windows|Macintosh|Linux/i.test(ua)) {
      setPlatform('desktop');
    } else {
      setPlatform('other');
    }

    // 2. Detect standalone mode
    const checkStandalone = () => {
      const standaloneQuery = window.matchMedia('(display-mode: standalone)').matches;
      const navigatorStandalone = (navigator as any).standalone === true;
      const isDocumentReferrer = document.referrer.includes('android-app://');
      const isWindowControlsOverlay = window.matchMedia('(display-mode: window-controls-overlay)').matches;
      const standalone = standaloneQuery || navigatorStandalone || isDocumentReferrer || isWindowControlsOverlay;

      setIsStandalone(standalone);
      if (standalone) {
        setIsInstalled(true);
        localStorage.setItem('pwa_installed', 'true');
      } else {
        const stored = localStorage.getItem('pwa_installed');
        if (stored === 'true') {
          setIsInstalled(true);
        }
      }
    };

    checkStandalone();

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = () => checkStandalone();
    try {
      mediaQuery.addEventListener('change', handleMediaChange);
    } catch {
      mediaQuery.addListener(handleMediaChange);
    }

    // 3. Check getInstalledRelatedApps if supported
    if ('getInstalledRelatedApps' in navigator) {
      (navigator as any).getInstalledRelatedApps().then((apps: any[]) => {
        if (apps && apps.length > 0) {
          setIsInstalled(true);
          localStorage.setItem('pwa_installed', 'true');
        }
      }).catch(() => {});
    }

    // 4. Capture beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // 5. Capture appinstalled
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      localStorage.setItem('pwa_installed', 'true');
      setIsInstallModalOpen(false);
      toast.success('LibraryGM installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      try {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } catch {
        mediaQuery.removeListener(handleMediaChange);
      }
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (isInstalled || isStandalone) {
      toast.success('LibraryGM is already installed on this device!');
      return;
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          setIsInstalled(true);
          localStorage.setItem('pwa_installed', 'true');
          toast.success('Installing LibraryGM...');
        }
      } catch {
        setIsInstallModalOpen(true);
      }
    } else {
      setIsInstallModalOpen(true);
    }
  };

  const markAsInstalled = () => {
    setIsInstalled(true);
    localStorage.setItem('pwa_installed', 'true');
    setIsInstallModalOpen(false);
    toast.success('Marked as installed!');
  };

  return (
    <PWAContext.Provider
      value={{
        isInstalled: isInstalled || isStandalone,
        isStandalone,
        canInstall: !!deferredPrompt,
        platform,
        installApp,
        openInstallGuide: () => setIsInstallModalOpen(true),
        closeInstallGuide: () => setIsInstallModalOpen(false),
        markAsInstalled
      }}
    >
      {children}

      {/* Installation Guide Modal for iOS / unsupported prompt */}
      {isInstallModalOpen && createPortal(
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4 animate-in fade-in duration-200"
          onClick={() => setIsInstallModalOpen(false)}
        >
          <div 
            className="bg-white/95 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80">
              <div className="flex items-center gap-3">
                <img src="/pwa-192x192.png" alt="LibraryGM" className="w-12 h-12 rounded-2xl shadow-md border border-white/80 object-cover" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Install LibraryGM</h3>
                  <p className="text-xs text-slate-500">Fast, offline-ready desktop & mobile app</p>
                </div>
              </div>
              <button 
                onClick={() => setIsInstallModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 bg-white/80 hover:bg-white p-2 rounded-full border border-slate-200/60 transition-colors shadow-xs"
              >
                <X size={18} />
              </button>
            </div>

            {/* Platform Instructions */}
            <div className="p-6 flex flex-col gap-4 text-slate-700 text-sm">
              {platform === 'ios' ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs uppercase tracking-wider bg-indigo-50/80 px-3 py-1.5 rounded-lg w-fit">
                    <Smartphone size={14} /> iOS / iPhone / iPad Safari
                  </div>
                  <ol className="flex flex-col gap-3 text-slate-600 text-xs sm:text-sm pl-1">
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs shrink-0 mt-0.5">1</span>
                      <span>Tap the <strong>Share</strong> button <Share size={15} className="inline text-indigo-600 mx-1 align-sub" /> at the bottom of Safari.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs shrink-0 mt-0.5">2</span>
                      <span>Scroll down and tap <strong>"Add to Home Screen"</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs shrink-0 mt-0.5">3</span>
                      <span>Tap <strong>"Add"</strong> in top right corner. The LibraryGM icon will appear on your home screen!</span>
                    </li>
                  </ol>
                </div>
              ) : platform === 'android' ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs uppercase tracking-wider bg-indigo-50/80 px-3 py-1.5 rounded-lg w-fit">
                    <Smartphone size={14} /> Android Chrome / Browser
                  </div>
                  <ol className="flex flex-col gap-3 text-slate-600 text-xs sm:text-sm pl-1">
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs shrink-0 mt-0.5">1</span>
                      <span>Tap the browser menu <MoreVertical size={15} className="inline text-slate-700 mx-0.5 align-sub" /> (three dots in top right).</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs shrink-0 mt-0.5">2</span>
                      <span>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs shrink-0 mt-0.5">3</span>
                      <span>Confirm by tapping <strong>Install</strong>.</span>
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs uppercase tracking-wider bg-indigo-50/80 px-3 py-1.5 rounded-lg w-fit">
                    <Monitor size={14} /> Desktop (Chrome / Edge / Brave)
                  </div>
                  <ol className="flex flex-col gap-3 text-slate-600 text-xs sm:text-sm pl-1">
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs shrink-0 mt-0.5">1</span>
                      <span>Click the <strong>Install</strong> icon <Download size={15} className="inline text-indigo-600 mx-1 align-sub" /> in your address bar (top right).</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs shrink-0 mt-0.5">2</span>
                      <span>Or click the menu <strong>⋮</strong> &rarr; <strong>"Save and share"</strong> &rarr; <strong>"Install LibraryGM"</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs shrink-0 mt-0.5">3</span>
                      <span>Click <strong>Install</strong> to add it directly to your desktop and taskbar.</span>
                    </li>
                  </ol>
                </div>
              )}

              <div className="mt-2 p-3 bg-emerald-50/80 border border-emerald-200/60 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
                <span>Already installed on this device?</span>
                <button
                  type="button"
                  onClick={markAsInstalled}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors shrink-0 ml-2"
                >
                  Mark as Installed
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex justify-end">
              <button
                type="button"
                onClick={() => setIsInstallModalOpen(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </PWAContext.Provider>
  );
};

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};
