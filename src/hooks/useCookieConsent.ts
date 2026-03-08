import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'cookie_consent';
const CONSENT_VERSION = 1;

export interface CookieConsentState {
  version: number;
  timestamp: string;
  essential: true;
  functional: boolean;
}

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((l) => l());
}

function getSnapshot(): CookieConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsentState;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useCookieConsent() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, () => null);

  const saveConsent = useCallback((functional: boolean) => {
    const state: CookieConsentState = {
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      essential: true,
      functional,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    emitChange();
  }, []);

  const acceptAll = useCallback(() => saveConsent(true), [saveConsent]);
  const refuseAll = useCallback(() => saveConsent(false), [saveConsent]);
  const resetConsent = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    emitChange();
  }, []);

  const hasConsent = useCallback(
    (category: 'essential' | 'functional') => {
      if (category === 'essential') return true;
      return consent?.functional ?? false;
    },
    [consent],
  );

  return {
    consent,
    showBanner: consent === null,
    acceptAll,
    refuseAll,
    saveConsent,
    resetConsent,
    hasConsent,
  };
}
