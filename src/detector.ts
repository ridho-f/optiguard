import * as devtoolsDetector from 'devtools-detector';
import { SecurityConfig } from './types';
import { renderLockScreen } from './ui';

export interface SecurityController {
  stop: () => void;
  trigger: (reason?: string) => void;
  isTriggered: () => boolean;
}

export function isLocalEnvironment(): boolean {
  if (typeof window === 'undefined') return false;

  const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(
    window.location.hostname
  );

  // Checks Vite / standard dev flags safely
  const isDevMeta =
    typeof import.meta !== 'undefined' &&
    (import.meta as any).env &&
    Boolean((import.meta as any).env.DEV);

  return isLocalHost || isDevMeta;
}

export function isRealMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Android.+Mobile|iPhone|iPod|Windows Phone|IEMobile/i.test(ua);
}

export function setupSecurityDetector(
  config: SecurityConfig = {}
): SecurityController {
  let isTriggered = false;
  let intervalId: any = null;
  const eventCleanups: Array<() => void> = [];

  const triggerAction = (reason = 'devtools_detected') => {
    if (isTriggered) return;
    isTriggered = true;

    // Call custom onDetect callback first if provided
    if (typeof config.onDetect === 'function') {
      const shouldContinue = config.onDetect({ reason });
      if (shouldContinue === false) {
        return;
      }
    }

    try {
      devtoolsDetector.stop();
    } catch {}

    try {
      localStorage.removeItem('portal_notifications');
      localStorage.removeItem('portal_notif_user_id');
    } catch {}

    const redirectBehavior = config.redirectBehavior || 'logout';

    if (redirectBehavior === 'logout') {
      renderLockScreen(config);

      const isGuestPage = [
        '/login',
        '/forgot-password',
        '/reset-password',
        '/two-factor-challenge',
        '/password/',
      ].some((p) =>
        typeof window !== 'undefined' && window.location.pathname.startsWith(p)
      );

      if (!isGuestPage && typeof document !== 'undefined') {
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
          window.location.replace(config.redirectUrl || '/login');
        }
      }
    } else if (redirectBehavior === 'back') {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
      } else if (typeof window !== 'undefined') {
        window.location.replace('about:blank');
      }
    } else if (redirectBehavior === 'google') {
      if (typeof window !== 'undefined') {
        window.location.replace('https://www.google.com');
      }
    } else if (redirectBehavior === 'home') {
      if (typeof window !== 'undefined') {
        window.location.replace('/');
      }
    } else if (redirectBehavior === 'blank') {
      renderLockScreen(config);
      if (typeof window !== 'undefined') {
        window.location.replace('about:blank');
      }
    } else if (typeof redirectBehavior === 'string' && redirectBehavior.length > 0) {
      if (typeof window !== 'undefined') {
        window.location.replace(redirectBehavior);
      }
    } else {
      renderLockScreen(config);
      if (typeof window !== 'undefined') {
        window.location.replace('about:blank');
      }
    }
  };

  // 1. Setup devtools-detector library
  try {
    devtoolsDetector.setDetectDelay(config.detectDelay || 200);
    devtoolsDetector.addListener((isOpen: boolean) => {
      if (isOpen) {
        triggerAction('devtools_detector_listener');
      }
    });
    devtoolsDetector.launch();
  } catch {}

  // 2. Setup Image getter trick for console inspecting
  const element = typeof Image !== 'undefined' ? new Image() : null;
  if (element) {
    Object.defineProperty(element, 'id', {
      get: function () {
        triggerAction('console_getter');
        return 'blocked';
      },
    });
  }

  const checkConsole = () => {
    if (!element) return;
    try {
      console.log('%c', element);
      console.clear();
    } catch {}
  };

  // 3. Debugger timing inspection (bypasses real phones)
  const checkDebugger = () => {
    if (isRealMobileDevice() || typeof performance === 'undefined') return;
    const start = performance.now();
    try {
      (function () {}.constructor('debugger')());
    } catch {}
    const end = performance.now();
    if (end - start > 100) {
      triggerAction('debugger_delay_detected');
    }
  };

  const runAllChecks = () => {
    if (isTriggered) return;
    checkConsole();
    checkDebugger();
  };

  // Periodic inspection timer
  intervalId = setInterval(() => {
    if (isTriggered) {
      clearInterval(intervalId);
      return;
    }
    runAllChecks();
  }, config.checkInterval || 300);

  // Window event triggers
  if (typeof window !== 'undefined') {
    const handleResize = () => runAllChecks();
    const handleFocus = () => runAllChecks();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        runAllChecks();
      }
    };
    const handleClick = () => runAllChecks();

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('focus', handleFocus, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility, {
      passive: true,
    });
    document.addEventListener('click', handleClick, { passive: true });

    eventCleanups.push(() => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('click', handleClick);
    });
  }

  // Framework router listener if hook is provided
  if (typeof config.onRouteChanged === 'function') {
    try {
      const unsub = config.onRouteChanged(() => runAllChecks());
      if (typeof unsub === 'function') {
        eventCleanups.push(unsub);
      }
    } catch {}
  }

  const stop = () => {
    if (intervalId) clearInterval(intervalId);
    try {
      devtoolsDetector.stop();
    } catch {}
    eventCleanups.forEach((cleanup) => {
      try {
        cleanup();
      } catch {}
    });
  };

  return {
    stop,
    trigger: triggerAction,
    isTriggered: () => isTriggered,
  };
}
