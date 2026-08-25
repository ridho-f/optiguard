import { SecurityConfig } from './types';
import { DEFAULT_OPTIGUARD_LOGO } from './logo';

/**
 * Removes any active Lock Screen overlay from the DOM.
 */
export function closeLockScreen(): void {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById('optiguard-lockscreen');
  if (existing) {
    existing.remove();
  }
}

/**
 * Generates and displays the Lock Screen overlay on document.body.
 */
export function renderLockScreen(config: SecurityConfig = {}): void {
  if (typeof document === 'undefined') return;

  // Remove existing overlay before rendering new one
  closeLockScreen();

  const branding = config.branding || {};
  if (typeof branding.customHtml === 'function') {
    const customHtml = branding.customHtml(config);
    const container = document.createElement('div');
    container.id = 'optiguard-lockscreen';
    container.innerHTML = customHtml;
    if (document.body) {
      document.body.appendChild(container);
    } else {
      document.documentElement.innerHTML = customHtml;
    }
    return;
  }

  const title = branding.title || 'Developer Tools Terdeteksi';
  const message =
    branding.message ||
    'Sesi Anda telah dihentikan secara otomatis demi menjaga integritas dan kerahasiaan sistem. Silakan tutup Developer Tools untuk melanjutkan.';
  const badgeText = branding.badgeText || 'OptiGuard Security Protocol';
  const footerText =
    branding.footerText || 'OptiGuard Security Protocol • PT Tata Optima Property';
  const logoUrl = branding.logoUrl;
  const buttonText = branding.buttonText || 'Kembali ke Portal Login';
  const buttonUrl = branding.buttonUrl || config.redirectUrl || '/login';

  // Exact OptiGuard.png image embedded directly into package
  let logoHtml = '';
  if (typeof logoUrl === 'string' && logoUrl.trim().length > 0) {
    logoHtml = `<img src="${logoUrl}" alt="OptiGuard Logo" class="optiguard-logo" onerror="this.style.display='none'" />`;
  } else if (logoUrl !== null && logoUrl !== false) {
    logoHtml = `<img src="${DEFAULT_OPTIGUARD_LOGO}" alt="OptiGuard Logo" class="optiguard-logo" />`;
  }

  try {
    const overlay = document.createElement('div');
    overlay.id = 'optiguard-lockscreen';
    overlay.innerHTML = `
      <style>
        #optiguard-lockscreen {
          position: fixed;
          inset: 0;
          z-index: 2147483647;
          margin: 0;
          padding: 20px;
          background: radial-gradient(circle at 50% 15%, #1e1b4b 0%, #090d16 55%, #030712 100%);
          color: #f8fafc;
          font-family: 'Figtree', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          text-align: center;
          overflow-y: auto;
          box-sizing: border-box;
        }
        #optiguard-lockscreen * {
          box-sizing: border-box;
        }
        #optiguard-lockscreen .bg-ambient {
          position: fixed;
          top: 20%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(225, 29, 72, 0.15) 0%, rgba(99, 102, 241, 0.08) 50%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        #optiguard-lockscreen .card {
          position: relative;
          z-index: 1;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-top: 1px solid rgba(244, 63, 94, 0.4);
          padding: 36px 28px;
          border-radius: 24px;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(225, 29, 72, 0.12);
          animation: optigateFadeIn 0.35s ease-out;
        }
        @keyframes optigateFadeIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        #optiguard-lockscreen .optiguard-logo {
          height: 38px;
          width: auto;
          margin: 0 auto 20px;
          display: block;
          filter: brightness(0) invert(1);
          opacity: 0.95;
        }
        #optiguard-lockscreen .shield-box {
          width: 68px;
          height: 68px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(99, 102, 241, 0.15));
          border: 1px solid rgba(244, 63, 94, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px;
          box-shadow: inset 0 0 20px rgba(244, 63, 94, 0.15), 0 8px 20px -6px rgba(0, 0, 0, 0.4);
        }
        #optiguard-lockscreen h1 {
          font-size: 21px;
          font-weight: 800;
          margin: 0 0 10px 0;
          color: #ffffff;
          letter-spacing: -0.02em;
        }
        #optiguard-lockscreen p {
          font-size: 13.5px;
          color: #94a3b8;
          margin: 0 0 22px 0;
          line-height: 1.6;
        }
        #optiguard-lockscreen .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          background: rgba(3, 7, 18, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 12px;
          border-radius: 14px;
          margin-bottom: 24px;
          text-align: left;
        }
        #optiguard-lockscreen .info-label {
          font-size: 10.5px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.04em;
          display: block;
          margin-bottom: 3px;
        }
        #optiguard-lockscreen .info-val {
          font-size: 12px;
          font-weight: 700;
        }
        #optiguard-lockscreen .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          color: white;
          font-weight: 700;
          padding: 13px 24px;
          border-radius: 14px;
          text-decoration: none;
          font-size: 14px;
          transition: all 0.2s ease;
          box-shadow: 0 10px 20px -5px rgba(5, 150, 105, 0.4);
          border: none;
          cursor: pointer;
        }
        #optiguard-lockscreen .btn:hover {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          transform: translateY(-1px);
          box-shadow: 0 14px 24px -5px rgba(5, 150, 105, 0.5);
        }
        #optiguard-lockscreen .footer {
          margin-top: 18px;
          font-size: 11px;
          color: #475569;
          font-weight: 500;
        }
      </style>
      <div class="bg-ambient"></div>
      <div class="card">
        ${logoHtml}

        <div class="shield-box">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fb7185" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <circle cx="12" cy="11" r="2.5" fill="#fb7185"/>
            <path d="M12 13.5V17"/>
          </svg>
        </div>

        <h1>${title}</h1>
        <p>${message}</p>

        <div class="info-grid">
          <div>
            <span class="info-label">Status Sesi</span>
            <span class="info-val" style="color: #fb7185;">Nonaktif (Logged Out)</span>
          </div>
          <div>
            <span class="info-label">Proteksi</span>
            <span class="info-val" style="color: #34d399;">Anti-Inspect Shield</span>
          </div>
        </div>

        <button type="button" class="btn" id="optiguard-action-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          <span>${buttonText}</span>
        </button>

        <div class="footer">
          ${footerText}
        </div>
      </div>
    `;

    if (document.body) {
      document.body.appendChild(overlay);
    } else {
      document.documentElement.appendChild(overlay);
    }

    const actionBtn = overlay.querySelector('#optiguard-action-btn');
    if (actionBtn) {
      actionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!buttonUrl || buttonUrl === '#' || buttonUrl === '' || buttonUrl === 'close' || buttonUrl === 'dismiss') {
          closeLockScreen();
        } else {
          window.location.href = buttonUrl;
        }
      });
    }
  } catch {
    // Fail-safe
  }
}
