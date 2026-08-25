import { setupSecurityDetector, isLocalEnvironment, SecurityController } from './detector';
import { setupShortcutsBlocker } from './shortcuts';
import { SecurityConfig } from './types';

export * from './types';
export * from './ui';
export * from './detector';
export * from './shortcuts';
export * from './logo';

let activeController: SecurityController | null = null;
let activeShortcutsCleanup: (() => void) | null = null;

/**
 * Initializes frontend security protection (Anti-DevTools, Anti-Debugger, Shortcut & Context Menu Blocker).
 * Automatically reads window.__SECURITY_CONFIG__ if available.
 */
export function initSecurityProtection(
  options: SecurityConfig = {}
): SecurityController | null {
  if (typeof window === 'undefined') return null;

  const globalConfig: SecurityConfig =
    typeof window !== 'undefined'
      ? (window as any).__SECURITY_CONFIG__ || {}
      : {};

  const mergedConfig: SecurityConfig = {
    ...globalConfig,
    ...options,
    branding: {
      ...(globalConfig.branding || {}),
      ...(options.branding || {}),
    },
  };

  const isEnabled =
    mergedConfig.enabled !== undefined ? mergedConfig.enabled : true;

  if (!isEnabled) {
    return null;
  }

  const disableInDev =
    mergedConfig.disableInDev !== undefined
      ? mergedConfig.disableInDev
      : true;

  if (disableInDev && isLocalEnvironment()) {
    return null;
  }

  // Stop any previously active instance before re-initializing
  stopSecurityProtection();

  // Setup shortcuts and right click blocker
  const blockContextMenu =
    mergedConfig.blockContextMenu !== undefined
      ? mergedConfig.blockContextMenu
      : true;

  const blockShortcuts =
    mergedConfig.blockShortcuts !== undefined
      ? mergedConfig.blockShortcuts
      : true;

  activeShortcutsCleanup = setupShortcutsBlocker({
    blockContextMenu,
    blockShortcuts,
  });

  // Setup detectors
  activeController = setupSecurityDetector(mergedConfig);

  return activeController;
}

/**
 * Cleanly stops and tears down any active security detectors and shortcut listeners.
 */
export function stopSecurityProtection(): void {
  if (activeController) {
    activeController.stop();
    activeController = null;
  }
  if (activeShortcutsCleanup) {
    activeShortcutsCleanup();
    activeShortcutsCleanup = null;
  }
}

export default initSecurityProtection;
