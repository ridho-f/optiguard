import { WatermarkConfig } from './types';

export interface WatermarkController {
  destroy: () => void;
  update: (config: Partial<WatermarkConfig>) => void;
}

/**
 * Renders a high-security forensic watermark overlay on the page or specific container.
 * Protected against tampering via MutationObserver.
 */
export function setupWatermark(
  options: WatermarkConfig | boolean
): WatermarkController | null {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !options) {
    return null;
  }

  let currentConfig: WatermarkConfig =
    typeof options === 'boolean'
      ? { text: 'CONFIDENTIAL • PROTECTED' }
      : { ...options };

  let containerEl: HTMLElement | null = null;
  let watermarkEl: HTMLDivElement | null = null;
  let observer: MutationObserver | null = null;
  let isDestroyed = false;

  const getContainer = (): HTMLElement | null => {
    if (typeof currentConfig.container === 'string') {
      const el = document.querySelector(
        currentConfig.container
      ) as HTMLElement;
      if (el) return el;
    } else if (currentConfig.container instanceof HTMLElement) {
      return currentConfig.container;
    }
    return document.body || document.documentElement;
  };

  const generateDataUrl = (): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const fontSize = currentConfig.fontSize || 14;
    const fontFamily =
      currentConfig.fontFamily ||
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    // Auto-detect contrast if not explicitly specified
    const isDarkMode =
      document.documentElement.classList.contains('dark') ||
      document.body?.classList.contains('dark');
    const defaultColor = isDarkMode
      ? 'rgba(255, 255, 255, 0.85)'
      : 'rgba(15, 23, 42, 0.85)';
    const color = currentConfig.color || defaultColor;

    const rotate =
      currentConfig.rotate !== undefined ? currentConfig.rotate : -25;
    const [gapX, gapY] = currentConfig.gap || [200, 110];

    // Resolve text
    let rawText = currentConfig.text;
    if (typeof rawText === 'function') {
      rawText = rawText();
    }
    let lines: string[] = Array.isArray(rawText) ? rawText : [rawText || ''];

    if (currentConfig.appendTimestamp) {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timestampStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
        now.getDate()
      )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
        now.getSeconds()
      )}`;
      lines = [...lines, timestampStr];
    }

    ctx.font = `600 ${fontSize}px ${fontFamily}`;
    let maxLineWidth = 0;
    lines.forEach((line) => {
      const m = ctx.measureText(line);
      if (m.width > maxLineWidth) maxLineWidth = m.width;
    });

    const lineHeight = fontSize * 1.5;
    const blockHeight = lines.length * lineHeight;

    const width = Math.max(maxLineWidth + gapX, 260);
    const height = Math.max(blockHeight + gapY, 140);

    canvas.width = width;
    canvas.height = height;

    // Reset context properties after canvas resize
    ctx.font = `600 ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotate * Math.PI) / 180);

    const startY = -((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, idx) => {
      ctx.fillText(line, 0, startY + idx * lineHeight);
    });

    ctx.restore();

    return canvas.toDataURL('image/png');
  };

  const createWatermarkElement = (): HTMLDivElement => {
    const el = document.createElement('div');
    el.setAttribute('data-optiguard-watermark', 'true');
    el.id = 'optiguard-watermark-overlay';

    const bgUrl = generateDataUrl();
    const opacity =
      currentConfig.opacity !== undefined ? currentConfig.opacity : 0.12;
    const zIndex =
      currentConfig.zIndex !== undefined ? currentConfig.zIndex : 9999;

    el.style.cssText = `
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      pointer-events: none !important;
      user-select: none !important;
      -webkit-user-select: none !important;
      z-index: ${zIndex} !important;
      opacity: ${opacity} !important;
      background-repeat: repeat !important;
      background-image: url(${bgUrl}) !important;
      display: block !important;
      visibility: visible !important;
    `;

    return el;
  };

  const attach = () => {
    if (isDestroyed) return;
    containerEl = getContainer();

    if (!containerEl) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => attach(), {
          once: true,
        });
      } else {
        setTimeout(attach, 50);
      }
      return;
    }

    // Remove existing if any
    const existing = document.getElementById('optiguard-watermark-overlay');
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    watermarkEl = createWatermarkElement();
    containerEl.appendChild(watermarkEl);

    // Setup Anti-Tampering Protection via MutationObserver
    if (currentConfig.antiTamper !== false && typeof MutationObserver !== 'undefined') {
      if (observer) observer.disconnect();

      observer = new MutationObserver((mutations) => {
        if (isDestroyed) return;
        let needsReattach = false;

        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            for (let i = 0; i < mutation.removedNodes.length; i++) {
              const node = mutation.removedNodes[i];
              if (
                node === watermarkEl ||
                (node as HTMLElement).id === 'optiguard-watermark-overlay'
              ) {
                needsReattach = true;
                break;
              }
            }
          }
          if (
            mutation.type === 'attributes' &&
            mutation.target === watermarkEl
          ) {
            needsReattach = true;
            break;
          }
        }

        if (needsReattach && !isDestroyed) {
          if (observer) observer.disconnect();
          attach();
        }
      });

      observer.observe(containerEl, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'hidden', 'id'],
      });
    }
  };

  attach();

  return {
    destroy: () => {
      isDestroyed = true;
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      if (watermarkEl && watermarkEl.parentNode) {
        watermarkEl.parentNode.removeChild(watermarkEl);
      }
      watermarkEl = null;
    },
    update: (newConfig: Partial<WatermarkConfig>) => {
      currentConfig = { ...currentConfig, ...newConfig };
      attach();
    },
  };
}
