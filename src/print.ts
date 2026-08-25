import { PrintBlockConfig } from './types';

export interface PrintBlockController {
  destroy: () => void;
}

/**
 * Injects CSS and event listeners to completely prevent printing or saving the document to PDF.
 */
export function setupPrintBlocker(
  options?: boolean | PrintBlockConfig,
  onPrintAttempt?: () => void
): PrintBlockController | null {
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

  const config: PrintBlockConfig =
    typeof options === 'object' && options !== null ? options : {};

  const hideContent =
    config.hideContent !== undefined ? config.hideContent : true;
  const printMessage =
    config.printMessage ||
    'DOKUMEN DILINDUNGI: Mencetak atau menyimpan halaman ini dilarang oleh OptiGuard Security Policy.';

  let styleEl: HTMLStyleElement | null = null;
  let isDestroyed = false;

  const injectPrintStyles = () => {
    if (document.getElementById('optiguard-print-styles')) return;

    styleEl = document.createElement('style');
    styleEl.id = 'optiguard-print-styles';

    if (hideContent) {
      styleEl.textContent = `
        @media print {
          html, body {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            overflow: hidden !important;
          }
          body::after {
            display: block !important;
            visibility: visible !important;
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            font-family: sans-serif !important;
            font-size: 20pt !important;
            font-weight: bold !important;
            color: #dc2626 !important;
            text-align: center !important;
            content: "${printMessage}" !important;
          }
        }
      `;
    }

    document.head.appendChild(styleEl);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    if (isCtrlOrCmd && (e.key === 'p' || e.key === 'P' || e.keyCode === 80)) {
      e.preventDefault();
      e.stopPropagation();
      if (onPrintAttempt) onPrintAttempt();
      return false;
    }
  };

  const handleBeforePrint = () => {
    if (onPrintAttempt) onPrintAttempt();
  };

  injectPrintStyles();
  document.addEventListener('keydown', handleKeyDown, { capture: true });
  window.addEventListener('beforeprint', handleBeforePrint);

  return {
    destroy: () => {
      isDestroyed = true;
      document.removeEventListener('keydown', handleKeyDown, {
        capture: true,
      });
      window.removeEventListener('beforeprint', handleBeforePrint);

      if (styleEl && styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl);
      }
      styleEl = null;
    },
  };
}
