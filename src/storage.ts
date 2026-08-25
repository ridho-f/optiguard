import { StorageWipeConfig } from './types';

/**
 * Wipes sensitive application storage (localStorage, sessionStorage, auth cookies) on security breach.
 */
export function wipeStorage(options?: boolean | StorageWipeConfig): void {
  if (typeof window === 'undefined') return;

  const config: StorageWipeConfig =
    typeof options === 'object' && options !== null
      ? options
      : { localStorage: true, sessionStorage: true };

  // 1. Wipe selective keys or all localStorage
  try {
    if (config.keys && config.keys.length > 0) {
      config.keys.forEach((key) => {
        try {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        } catch {}
      });
    } else {
      if (config.localStorage !== false) {
        localStorage.clear();
      }
      if (config.sessionStorage !== false) {
        sessionStorage.clear();
      }
    }
  } catch {}

  // 2. Wipe cookies if requested
  if (config.cookies && typeof document !== 'undefined') {
    try {
      if (Array.isArray(config.cookies)) {
        config.cookies.forEach((cookieName) => {
          document.cookie = `${cookieName}=; Max-Age=0; path=/; domain=${window.location.hostname}`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
      } else if (config.cookies === true) {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          document.cookie = `${name}=; Max-Age=0; path=/; domain=${window.location.hostname}`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      }
    } catch {}
  }
}
