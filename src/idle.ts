import { IdleLockConfig, SecurityConfig } from './types';
import { renderLockScreen } from './ui';

export interface IdleLockController {
  destroy: () => void;
  resetTimer: () => void;
  triggerLock: () => void;
}

/**
 * Tracks user activity (mousemove, keydown, click, scroll, touch) and triggers an auto-lock or logout when idle.
 */
export function setupIdleLock(
  options: boolean | IdleLockConfig,
  parentConfig: SecurityConfig = {}
): IdleLockController | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }

  const isEnabled =
    typeof options === 'boolean'
      ? options
      : options?.enabled !== undefined
      ? options.enabled
      : true;

  if (!isEnabled) return null;

  const config: IdleLockConfig =
    typeof options === 'object' && options !== null ? options : {};

  const timeoutMs = config.timeout || 5 * 60 * 1000; // default 5 minutes
  const warnBeforeSeconds = config.warnBeforeSeconds || 30;
  const warnMs = Math.max(timeoutMs - warnBeforeSeconds * 1000, 0);

  let idleTimer: any = null;
  let warnTimer: any = null;
  let isDestroyed = false;
  let isLocked = false;

  const triggerLock = () => {
    if (isDestroyed || isLocked) return;
    isLocked = true;

    clearTimers();

    if (typeof config.action === 'function') {
      config.action({ resetTimer, triggerLock });
      return;
    }

    const action = config.action || 'lockscreen';

    if (action === 'lockscreen') {
      renderLockScreen({
        ...parentConfig,
        branding: {
          title: 'Sesi Terkunci Karena Tidak Aktif',
          message:
            'Aplikasi telah dikunci secara otomatis demi keamanan karena tidak ada aktivitas pengguna dalam beberapa menit.',
          badgeText: 'Inactivity Auto-Lock Protocol',
          buttonText: 'Masuk Kembali',
          ...(parentConfig.branding || {}),
        },
      });
    } else if (action === 'logout') {
      renderLockScreen({
        ...parentConfig,
        branding: {
          title: 'Sesi Berakhir (Inactivity)',
          message: 'Sesi login Anda telah kedaluwarsa karena tidak aktif.',
          buttonText: 'Login Kembali',
          ...(parentConfig.branding || {}),
        },
      });

      try {
        const csrfToken =
          (
            document.querySelector(
              'meta[name="csrf-token"]'
            ) as HTMLMetaElement
          )?.content || '';
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/logout';

        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);

        document.body.appendChild(form);
        form.submit();
      } catch {
        window.location.replace(parentConfig.redirectUrl || '/login');
      }
    } else if (action === 'redirect') {
      window.location.replace(parentConfig.redirectUrl || '/login');
    }
  };

  const clearTimers = () => {
    if (idleTimer) clearTimeout(idleTimer);
    if (warnTimer) clearTimeout(warnTimer);
    idleTimer = null;
    warnTimer = null;
  };

  const resetTimer = () => {
    if (isDestroyed || isLocked) return;
    clearTimers();

    if (config.onWarning && warnMs > 0) {
      warnTimer = setTimeout(() => {
        if (!isLocked && !isDestroyed && config.onWarning) {
          config.onWarning(warnBeforeSeconds);
        }
      }, warnMs);
    }

    idleTimer = setTimeout(() => {
      triggerLock();
    }, timeoutMs);
  };

  // Throttle activity event handlers
  let lastActivity = 0;
  const handleActivity = () => {
    const now = Date.now();
    if (now - lastActivity > 1000) {
      lastActivity = now;
      resetTimer();
    }
  };

  const events = [
    'mousemove',
    'mousedown',
    'keydown',
    'touchstart',
    'touchmove',
    'scroll',
    'wheel',
  ];

  events.forEach((evt) => {
    window.addEventListener(evt, handleActivity, { passive: true });
  });

  resetTimer();

  return {
    destroy: () => {
      isDestroyed = true;
      clearTimers();
      events.forEach((evt) => {
        window.removeEventListener(evt, handleActivity);
      });
    },
    resetTimer,
    triggerLock,
  };
}
