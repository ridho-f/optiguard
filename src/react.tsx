import React, { useEffect, useRef } from 'react';
import { SecurityConfig, WatermarkConfig } from './types';
import {
  initSecurityProtection,
  stopSecurityProtection,
  OptiGuardInstance,
} from './index';
import { setupWatermark, WatermarkController } from './watermark';

export interface UseOptiGuardOptions extends SecurityConfig {}

/**
 * React Hook for declarative OptiGuard Security protection inside React apps / Next.js / Inertia.js.
 */
export function useOptiGuard(options: UseOptiGuardOptions = {}) {
  const instanceRef = useRef<OptiGuardInstance | null>(null);

  useEffect(() => {
    instanceRef.current = initSecurityProtection(options);

    return () => {
      if (instanceRef.current) {
        stopSecurityProtection();
        instanceRef.current = null;
      }
    };
  }, [
    options.enabled,
    options.disableInDev,
    options.blockContextMenu,
    options.blockShortcuts,
    options.blockPrint,
    options.privacyBlur,
    options.idleLock,
    options.watermark,
  ]);

  return {
    getInstance: () => instanceRef.current,
    triggerLock: (reason?: string) =>
      instanceRef.current?.detector?.trigger(reason),
    stop: () => stopSecurityProtection(),
  };
}

export interface OptiGuardShieldProps extends SecurityConfig {
  children?: React.ReactNode;
}

/**
 * React component wrapper that automatically enables OptiGuard protection for the mounted tree.
 */
export const OptiGuardShield: React.FC<OptiGuardShieldProps> = ({
  children,
  ...config
}) => {
  useOptiGuard(config);
  return <>{children}</>;
};

export interface OptiGuardWatermarkProps extends WatermarkConfig {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Dedicated React Watermark Component for wrapping sensitive sections or pages.
 */
export const OptiGuardWatermark: React.FC<OptiGuardWatermarkProps> = ({
  children,
  className,
  style,
  ...watermarkConfig
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const watermarkCtrl = useRef<WatermarkController | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      watermarkCtrl.current = setupWatermark({
        ...watermarkConfig,
        container: containerRef.current,
      });
    }

    return () => {
      if (watermarkCtrl.current) {
        watermarkCtrl.current.destroy();
        watermarkCtrl.current = null;
      }
    };
  }, [
    typeof watermarkConfig.text === 'function' ? null : watermarkConfig.text,
    watermarkConfig.opacity,
    watermarkConfig.fontSize,
    watermarkConfig.color,
    watermarkConfig.rotate,
    watermarkConfig.appendTimestamp,
  ]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', ...style }}
    >
      {children}
    </div>
  );
};
