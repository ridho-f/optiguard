import { setupSecurityDetector, isLocalEnvironment, SecurityController } from './detector';
import { setupShortcutsBlocker } from './shortcuts';
import { setupWatermark, WatermarkController } from './watermark';
import { setupPrivacyBlur, PrivacyBlurController } from './privacy';
import { setupIdleLock, IdleLockController } from './idle';
import { setupPrintBlocker, PrintBlockController } from './print';
import { setupTelemetry, TelemetryReporter } from './telemetry';
import { wipeStorage } from './storage';
import { SecurityConfig } from './types';

export * from './types';
export * from './ui';
export * from './detector';
export * from './shortcuts';
export * from './watermark';
export * from './privacy';
export * from './idle';
export * from './print';
export * from './telemetry';
export * from './storage';
export * from './logo';
export * from './react';

export interface OptiGuardInstance {
  detector: SecurityController | null;
  watermark: WatermarkController | null;
  privacy: PrivacyBlurController | null;
  idle: IdleLockController | null;
  print: PrintBlockController | null;
  telemetry: TelemetryReporter;
  stop: () => void;
  trigger: (reason?: string) => void;
}

let activeInstance: OptiGuardInstance | null = null;
let activeShortcutsCleanup: (() => void) | null = null;

/**
 * Initializes full frontend security protection (Anti-DevTools, Anti-Debugger, Forensic Watermarking,
 * Tab-Switch Privacy Shield, Inactivity Auto-Lock, Anti-Print, Content Copy Protection, Telemetry).
 * Automatically reads window.__SECURITY_CONFIG__ if available.
 */
export function initSecurityProtection(
  options: SecurityConfig = {}
): OptiGuardInstance | null {
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
    contentProtection: {
      ...(globalConfig.contentProtection || {}),
      ...(options.contentProtection || {}),
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

  // 1. Setup Telemetry Reporter
  const telemetry = setupTelemetry(mergedConfig.telemetry);

  // 2. Setup Shortcuts, Right Click, & Content Protection
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
    contentProtection: mergedConfig.contentProtection,
    onBlocked: (reason, details) => {
      telemetry.report({
        type: reason === 'contextmenu_blocked' ? 'contextmenu_blocked' : 'shortcut_blocked',
        reason,
        details,
      });
    },
  });

  // 3. Setup Anti-Print Protection
  let printController: PrintBlockController | null = null;
  if (mergedConfig.blockPrint) {
    printController = setupPrintBlocker(mergedConfig.blockPrint, () => {
      telemetry.report({
        type: 'print_blocked',
        reason: 'print_attempted',
      });
    });
  }

  // 4. Setup Dynamic Forensic Watermarking
  let watermarkController: WatermarkController | null = null;
  if (mergedConfig.watermark) {
    watermarkController = setupWatermark(mergedConfig.watermark);
  }

  // 5. Setup Tab-Switch Privacy Shield
  let privacyController: PrivacyBlurController | null = null;
  if (mergedConfig.privacyBlur) {
    privacyController = setupPrivacyBlur(mergedConfig.privacyBlur);
  }

  // 6. Setup Inactivity / Idle Auto-Lock
  let idleController: IdleLockController | null = null;
  if (mergedConfig.idleLock) {
    idleController = setupIdleLock(mergedConfig.idleLock, mergedConfig);
  }

  // 7. Setup Core DevTools / Debugger Detector
  const detectorController = setupSecurityDetector(mergedConfig);

  const instance: OptiGuardInstance = {
    detector: detectorController,
    watermark: watermarkController,
    privacy: privacyController,
    idle: idleController,
    print: printController,
    telemetry,
    stop: () => stopSecurityProtection(),
    trigger: (reason?: string) => detectorController.trigger(reason),
  };

  activeInstance = instance;
  (window as any).__OPTIGUARD_INSTANCE__ = instance;

  return instance;
}

/**
 * Cleanly stops and tears down any active security detectors, watermarks, privacy screens, and listeners.
 */
export function stopSecurityProtection(): void {
  if (activeInstance) {
    if (activeInstance.detector) activeInstance.detector.stop();
    if (activeInstance.watermark) activeInstance.watermark.destroy();
    if (activeInstance.privacy) activeInstance.privacy.destroy();
    if (activeInstance.idle) activeInstance.idle.destroy();
    if (activeInstance.print) activeInstance.print.destroy();
    activeInstance = null;
  }
  if (activeShortcutsCleanup) {
    activeShortcutsCleanup();
    activeShortcutsCleanup = null;
  }
}

export default initSecurityProtection;
