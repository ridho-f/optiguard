import { PrivacyBlurConfig } from './types';
import { DEFAULT_OPTIGUARD_LOGO } from './logo';

export interface PrivacyBlurController {
  destroy: () => void;
  setBlur: (blur: boolean) => void;
}

/**
 * Automatically blurs the page and displays an anti-peeking shield matching the DevTools Lock Screen design.
 */
export function setupPrivacyBlur(
  options?: boolean | PrivacyBlurConfig
): PrivacyBlurController | null {
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

  const config: PrivacyBlurConfig =
    typeof options === 'object' && options !== null ? options : {};

  const blurAmount = config.blurAmount || '16px';
  const overlayTitle = config.overlayTitle || 'OptiGuard Privacy Shield';
  const overlaySubtitle =
    config.overlaySubtitle ||
    'Tampilan halaman telah disembunyikan secara otomatis demi menjaga kerahasiaan dan integritas data portal.';
  const badgeText = config.badgeText || 'OptiGuard Privacy Protocol';
  const footerText =
    config.footerText ||
    'OptiGuard Security Protocol • PT Tata Optima Property';
  const logoUrl = config.logoUrl;
  const unblurOnFocus =
    config.unblurOnFocus !== undefined ? config.unblurOnFocus : true;

  let overlayEl: HTMLDivElement | null = null;
  let isBlurred = false;
  let isDestroyed = false;

  // Resolve OptiGuard logo HTML
  let logoHtml = '';
  if (typeof logoUrl === 'string' && logoUrl.trim().length > 0) {
    logoHtml = `<img src="${logoUrl}" alt="OptiGuard Logo" class="optiguard-logo" onerror="this.style.display='none'" />`;
  } else if (logoUrl !== null && logoUrl !== false) {
    logoHtml = `<img src="${DEFAULT_OPTIGUARD_LOGO}" alt="OptiGuard Logo" class="optiguard-logo" />`;
  }

  const injectStyles = () => {
    if (document.getElementById('optiguard-privacy-styles')) return;
    const style = document.createElement('style');
    style.id = 'optiguard-privacy-styles';
    style.textContent = `
      body.optiguard-privacy-active > *:not(#optiguard-privacy-overlay):not(#optiguard-lockscreen):not(#optiguard-watermark-overlay) {
        filter: blur(${blurAmount}) saturate(0.5) brightness(0.85) !important;
        transition: filter 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        user-select: none !important;
        pointer-events: none !important;
      }
      #optiguard-privacy-overlay {
        position: fixed !important;
        inset: 0 !important;
        z-index: 99998 !important;
        background: radial-gradient(circle at 50% 15%, #1e1b4b 0%, #090d16 55%, #030712 100%) !important;
        backdrop-filter: blur(24px) !important;
        -webkit-backdrop-filter: blur(24px) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-family: 'Figtree', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        color: #f8fafc !important;
        text-align: center !important;
        padding: 20px !important;
        box-sizing: border-box !important;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s ease !important;
      }
      #optiguard-privacy-overlay * {
        box-sizing: border-box;
      }
      #optiguard-privacy-overlay.active {
        opacity: 1 !important;
        pointer-events: auto !important;
      }
      #optiguard-privacy-overlay .bg-ambient {
        position: fixed;
        top: 25%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 500px;
        height: 500px;
        background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(99, 102, 241, 0.1) 50%, transparent 70%);
        pointer-events: none;
        z-index: 0;
      }
      #optiguard-privacy-overlay .card {
        position: relative;
        z-index: 1;
        background: rgba(15, 23, 42, 0.88);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-top: 1px solid rgba(59, 130, 246, 0.5);
        padding: 36px 30px;
        border-radius: 24px;
        max-width: 440px;
        width: 100%;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(59, 130, 246, 0.15);
        transform: scale(0.96) translateY(12px);
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
      }
      #optiguard-privacy-overlay.active .card {
        transform: scale(1) translateY(0);
      }
      #optiguard-privacy-overlay .optiguard-logo {
        height: 38px;
        width: auto;
        margin: 0 auto 20px;
        display: block;
        filter: brightness(0) invert(1);
        opacity: 0.95;
      }
      #optiguard-privacy-overlay .shield-box {
        width: 68px;
        height: 68px;
        border-radius: 20px;
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.2));
        border: 1px solid rgba(59, 130, 246, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 18px;
        box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.2), 0 8px 20px -6px rgba(0, 0, 0, 0.4);
      }
      #optiguard-privacy-overlay .shield-box svg {
        color: #60a5fa;
        filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.5));
      }
      #optiguard-privacy-overlay h2 {
        font-size: 21px;
        font-weight: 800;
        margin: 0 0 10px 0;
        color: #ffffff;
        letter-spacing: -0.02em;
      }
      #optiguard-privacy-overlay p {
        font-size: 13.5px;
        color: #94a3b8;
        margin: 0 0 22px 0;
        line-height: 1.6;
      }
      #optiguard-privacy-overlay .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        background: rgba(3, 7, 18, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.05);
        padding: 12px;
        border-radius: 14px;
        margin-bottom: 22px;
        text-align: left;
      }
      #optiguard-privacy-overlay .info-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #64748b;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 2px;
      }
      #optiguard-privacy-overlay .info-val {
        font-size: 12.5px;
        font-weight: 600;
        color: #e2e8f0;
      }
      #optiguard-privacy-overlay .btn-reveal {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 12px 18px;
        background: linear-gradient(135deg, #2563eb, #3b82f6);
        color: #ffffff;
        font-weight: 600;
        font-size: 14px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 12px;
        cursor: pointer;
        text-decoration: none;
        box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
        transition: all 0.2s ease;
      }
      #optiguard-privacy-overlay .btn-reveal:hover {
        background: linear-gradient(135deg, #1d4ed8, #2563eb);
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
      }
      #optiguard-privacy-overlay .footer {
        font-size: 11px;
        color: #64748b;
        margin-top: 20px;
        font-weight: 500;
        letter-spacing: 0.02em;
      }
    `;
    document.head.appendChild(style);
  };

  const createOverlay = () => {
    if (overlayEl) return;
    overlayEl = document.createElement('div');
    overlayEl.id = 'optiguard-privacy-overlay';
    overlayEl.innerHTML = `
      <div class="bg-ambient"></div>
      <div class="card">
        ${logoHtml}
        <div class="shield-box">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M12 8v4"/>
            <path d="M12 16h.01"/>
          </svg>
        </div>
        <h2>${overlayTitle}</h2>
        <p>${overlaySubtitle}</p>
        <div class="info-grid">
          <div>
            <div class="info-label">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Status
            </div>
            <div class="info-val" style="color: #60a5fa;">Shield Active</div>
          </div>
          <div>
            <div class="info-label">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              Security Protocol
            </div>
            <div class="info-val">${badgeText}</div>
          </div>
        </div>
        <button type="button" class="btn-reveal" id="optiguard-reveal-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          Klik untuk Membuka Kembali Layar
        </button>
        <div class="footer">${footerText}</div>
      </div>
    `;

    // Click to reveal listener
    overlayEl.addEventListener('click', (e) => {
      if (unblurOnFocus) {
        setBlur(false);
      }
    });

    const btn = overlayEl.querySelector('#optiguard-reveal-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setBlur(false);
      });
    }

    document.body.appendChild(overlayEl);
  };

  const setBlur = (blur: boolean) => {
    if (isDestroyed) return;
    isBlurred = blur;

    if (blur) {
      document.body.classList.add('optiguard-privacy-active');
      if (overlayEl) overlayEl.classList.add('active');
    } else {
      document.body.classList.remove('optiguard-privacy-active');
      if (overlayEl) overlayEl.classList.remove('active');
    }
  };

  injectStyles();
  createOverlay();

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      setBlur(true);
    } else if (document.visibilityState === 'visible' && unblurOnFocus) {
      setBlur(false);
    }
  };

  const handleWindowBlur = () => {
    setBlur(true);
  };

  const handleWindowFocus = () => {
    if (unblurOnFocus) {
      setBlur(false);
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('blur', handleWindowBlur);
  window.addEventListener('focus', handleWindowFocus);

  return {
    destroy: () => {
      isDestroyed = true;
      setBlur(false);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);

      if (overlayEl && overlayEl.parentNode) {
        overlayEl.parentNode.removeChild(overlayEl);
      }
      const style = document.getElementById('optiguard-privacy-styles');
      if (style && style.parentNode) {
        style.parentNode.removeChild(style);
      }
      overlayEl = null;
    },
    setBlur,
  };
}
