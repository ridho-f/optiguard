import { SecurityIncident, TelemetryConfig } from './types';

export interface TelemetryReporter {
  report: (incident: Omit<SecurityIncident, 'timestamp' | 'url' | 'userAgent'>) => void;
}

/**
 * Creates a telemetry reporter to log incidents locally and dispatch to backend API / Webhook.
 */
export function setupTelemetry(
  options?: string | TelemetryConfig
): TelemetryReporter {
  const config: TelemetryConfig =
    typeof options === 'string'
      ? { endpoint: options }
      : typeof options === 'object' && options !== null
      ? options
      : {};

  let lastSentMap: Record<string, number> = {};

  const report = (
    partialIncident: Omit<SecurityIncident, 'timestamp' | 'url' | 'userAgent'>
  ) => {
    if (typeof window === 'undefined') return;

    const fullIncident: SecurityIncident = {
      ...partialIncident,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // 1. Dispatch custom DOM event for custom client listeners
    try {
      const customEvent = new CustomEvent('optiguard:incident', {
        detail: fullIncident,
      });
      window.dispatchEvent(customEvent);
    } catch {}

    // 2. Trigger onIncident callback
    if (typeof config.onIncident === 'function') {
      try {
        config.onIncident(fullIncident);
      } catch {}
    }

    // 3. Send to backend endpoint with 2-second rate-limiting per incident type
    if (config.endpoint) {
      const now = Date.now();
      const lastSent = lastSentMap[fullIncident.type] || 0;
      if (now - lastSent < 2000) {
        return; // debounce burst incidents
      }
      lastSentMap[fullIncident.type] = now;

      let extraMeta = {};
      if (typeof config.metadata === 'function') {
        try {
          extraMeta = config.metadata();
        } catch {}
      } else if (typeof config.metadata === 'object' && config.metadata !== null) {
        extraMeta = config.metadata;
      }

      const payload = JSON.stringify({
        ...fullIncident,
        metadata: extraMeta,
      });

      // Try Beacon API first (works during page unload / redirects)
      if (navigator.sendBeacon) {
        try {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon(config.endpoint, blob);
          return;
        } catch {}
      }

      // Fallback to fetch
      try {
        fetch(config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(config.headers || {}),
          },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      } catch {}
    }
  };

  return { report };
}
