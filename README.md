# @ridhof_1/optiguard-security 🛡️

Enterprise-grade frontend security shield: **Anti-DevTools**, **Anti-Debugger**, **Forensic Watermarking**, **Tab-Switch Privacy Shield**, **Inactivity Auto-Lock**, **Anti-Print**, **Content Protection**, **Security Incident Telemetry**, dan customizable **OptiGuard Lock Screen** untuk aplikasi Web & SPA (React, Next.js, Vue, Inertia.js, Vite, dan Vanilla JS).

[![GitHub Repository](https://img.shields.io/badge/GitHub-ridho--f%2Foptiguard-181717.svg?logo=github)](https://github.com/ridho-f/optiguard)
[![NPM Version](https://img.shields.io/npm/v/@ridhof_1/optiguard-security.svg?color=3b82f6)](https://www.npmjs.com/package/@ridhof_1/optiguard-security)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

---

## 📑 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Instalasi](#-instalasi)
- [Panduan Penggunaan Cepat (Quick Start)](#-panduan-penggunaan-cepat-quick-start)
- [Fitur Lanjutan & Konfigurasi](#-fitur-lanjutan--konfigurasi)
  - [1. Dynamic Forensic Watermark](#1-dynamic-forensic-watermark)
  - [2. Tab-Switch Privacy Shield (Anti-Peeking)](#2-tab-switch-privacy-shield-anti-peeking)
  - [3. Inactivity & Idle Auto-Lock](#3-inactivity--idle-auto-lock)
  - [4. Anti-Print & Anti-Save PDF](#4-anti-print--anti-save-pdf)
  - [5. Content Protection (Copy, Cut, Drag, Selection)](#5-content-protection-copy-cut-drag-selection)
  - [6. Security Incident Telemetry & Webhooks](#6-security-incident-telemetry--webhooks)
  - [7. Storage Wiper on Breach](#7-storage-wiper-on-breach)
- [Integrasi React (Component & Hook)](#-integrasi-react-component--hook)
- [Konfigurasi Lengkap (Full Options API)](#-konfigurasi-lengkap-full-options-api)
- [Lisensi](#-lisensi)

---

## ✨ Fitur Utama

- 🔍 **Real-time DevTools & Inspector Detection**: Mendeteksi pembukaan console (docked/undocked), inspect element, debugger trap, dan console sniffing secara presisi.
- 💧 **Dynamic Forensic Watermark**: Menghasilkan watermark dinamis transparan (Email, IP, Timestamp, Nama User) dengan proteksi anti-tamper MutationObserver.
- 👁️ **Tab-Switch Privacy Shield**: Otomatis mem-blur layar dan memunculkan barrier anti-peeking saat pengguna berpindah tab / minimize window.
- ⏱️ **Inactivity & Idle Auto-Lock**: Mengunci layar atau logout otomatis saat pengguna tidak melakukan aktivitas (mouse/keyboard/scroll) selama waktu yang ditentukan.
- 🖨️ **Anti-Print & PDF Blocker**: Memblokir shortcut `Ctrl+P`/`Cmd+P` dan mematikan tampilan dokumen pada mode print preview.
- 📋 **Content Copy & Selection Blocker**: Mencegah copy-paste, cut, drag-and-drop, dan text selection pada data sensitif.
- 🚨 **Incident Telemetry & Webhooks**: Mengirimkan laporan insiden keamanan ke backend API / Webhook saat ada upaya manipulasi.
- 🧹 **Storage Wiper on Breach**: Otomatis menghapus `localStorage`, `sessionStorage`, atau cookies saat terjadi pelanggaran keamanan sebelum redirect.
- 🔒 **Modern Lock Screen Dialog**: Tampilan glassmorphism dark-mode beranimasi dengan custom branding dan logo.
- ⚛️ **React Support**: Dilengkapi hook `useOptiGuard` dan komponen `<OptiGuardShield>`, `<OptiGuardWatermark>`.

---

## 📦 Instalasi

```bash
# Melalui GitHub Repository langsung:
npm install github:ridho-f/optiguard

# Atau melalui package NPM:
npm install @ridhof_1/optiguard-security
```

---

## 🚀 Panduan Penggunaan Cepat (Quick Start)

### 1. Inisialisasi Paling Sederhana (JavaScript / TypeScript)

```typescript
import { initSecurityProtection } from '@ridhof_1/optiguard-security';

// Aktifkan semua proteksi standar
initSecurityProtection({
  disableInDev: true, // Nonaktif di localhost saat coding
  redirectBehavior: 'logout',
  watermark: {
    text: ['PT Tata Optima Property', 'user@domain.com'],
    appendTimestamp: true,
  },
  privacyBlur: true,
  blockPrint: true,
});
```

---

## 🛡️ Fitur Lanjutan & Konfigurasi

### 1. Dynamic Forensic Watermark

Menambahkan overlay watermark semi-transparan untuk pelacakan forensik foto layar:

```typescript
initSecurityProtection({
  watermark: {
    text: ['John Doe (NIK: 884920)', 'IP: 182.253.110.22', 'CONFIDENTIAL'],
    opacity: 0.08,
    fontSize: 14,
    rotate: -25,
    gap: [200, 100],
    appendTimestamp: true, // Otomatis menambahkan tanggal & jam real-time
    antiTamper: true,      // Otomatis recreate jika dihapus lewat DevTools
  },
});
```

### 2. Tab-Switch Privacy Shield (Anti-Peeking)

Menutup tampilan layar saat user membuka tab lain:

```typescript
initSecurityProtection({
  privacyBlur: {
    enabled: true,
    blurAmount: '16px',
    overlayTitle: 'OptiGuard Privacy Shield',
    overlaySubtitle: 'Tampilan disembunyikan untuk menjaga kerahasiaan data.',
    unblurOnFocus: true, // Otomatis kembali normal saat tab dibuka lagi
  },
});
```

### 3. Inactivity & Idle Auto-Lock

Mengunci aplikasi jika user tidak menyentuh mouse/keyboard selama 5 menit:

```typescript
initSecurityProtection({
  idleLock: {
    enabled: true,
    timeout: 5 * 60 * 1000, // 5 menit
    action: 'lockscreen',    // 'lockscreen' | 'logout' | 'redirect' | custom callback
    warnBeforeSeconds: 30,
    onWarning: (secondsLeft) => {
      console.warn(`Sesi akan terkunci dalam ${secondsLeft} detik`);
    },
  },
});
```

### 4. Anti-Print & Anti-Save PDF

```typescript
initSecurityProtection({
  blockPrint: {
    enabled: true,
    hideContent: true,
    printMessage: 'DOKUMEN DILINDUNGI: Dilarang mencetak atau menyimpan dokumen ini.',
  },
});
```

### 5. Content Protection (Copy, Cut, Drag, Selection)

```typescript
initSecurityProtection({
  contentProtection: {
    blockCopy: true,          // Blokir Ctrl+C & Copy context
    blockCut: true,           // Blokir Ctrl+X
    blockDragDrop: true,      // Blokir Drag gambar / teks
    blockTextSelection: true, // user-select: none
  },
});
```

### 6. Security Incident Telemetry & Webhooks

Otomatis mengirim payload telemetry ke endpoint backend atau webhook Slack/Discord:

```typescript
initSecurityProtection({
  telemetry: {
    endpoint: '/api/security/incidents',
    headers: {
      'X-CSRF-TOKEN': '...',
    },
    metadata: () => ({
      userId: 123,
      role: 'Finance Admin',
    }),
    onIncident: (incident) => {
      console.warn('Security Incident Detected:', incident);
    },
  },
});
```

### 7. Storage Wiper on Breach

Membersihkan token di `localStorage` & `sessionStorage` saat ada hacker/user membuka Inspect Element:

```typescript
initSecurityProtection({
  wipeStorageOnDetect: {
    localStorage: true,
    sessionStorage: true,
    cookies: ['auth_session', 'jwt_token'],
  },
});
```

---

## ⚛️ Integrasi React (Component & Hook)

Tersedia import khusus untuk ekosistem React:

```tsx
import React from 'react';
import {
  OptiGuardShield,
  OptiGuardWatermark,
  useOptiGuard
} from '@ridhof_1/optiguard-security/react';

export function App() {
  // Opsi 1: Menggunakan Hook
  const { triggerLock } = useOptiGuard({
    watermark: { text: 'INTERNAL USE ONLY' },
    privacyBlur: true,
  });

  return (
    // Opsi 2: Menggunakan Component Shield
    <OptiGuardShield
      disableInDev={true}
      privacyBlur={true}
      idleLock={{ enabled: true, timeout: 300000 }}
    >
      <div className="container">
        <h1>Financial Dashboard</h1>

        {/* Opsi 3: Watermark hanya pada area sensitif */}
        <OptiGuardWatermark text="CONFIDENTIAL SALARY DATA">
          <table className="salary-table">
            {/* Tabel Data Gaji */}
          </table>
        </OptiGuardWatermark>
      </div>
    </OptiGuardShield>
  );
}
```

---

## 🛠️ Konfigurasi Lengkap (Full Options API)

```typescript
interface SecurityConfig {
  enabled?: boolean;                           // Default: true
  disableInDev?: boolean;                      // Default: true
  redirectBehavior?: 'logout' | 'back' | 'google' | 'home' | 'blank' | string;
  redirectUrl?: string;                        // Default: '/login'
  blockContextMenu?: boolean;                  // Default: true
  blockShortcuts?: boolean;                    // Default: true
  detectDelay?: number;                        // Default: 200
  checkInterval?: number;                      // Default: 300

  // Fitur Baru v1.1.0:
  watermark?: boolean | WatermarkConfig;
  privacyBlur?: boolean | PrivacyBlurConfig;
  idleLock?: boolean | IdleLockConfig;
  blockPrint?: boolean | PrintBlockConfig;
  contentProtection?: ContentProtectionConfig;
  telemetry?: string | TelemetryConfig;
  wipeStorageOnDetect?: boolean | StorageWipeConfig;

  // Custom UI & Callbacks:
  branding?: SecurityBrandingConfig;
  onDetect?: (details?: { reason?: string }) => boolean | void;
  onRouteChanged?: (callback: () => void) => (() => void) | void;
}
```

---

## 📄 Lisensi

Distributed under the **MIT License**. Created & Maintained by **PT Tata Optima Property** & [ridho-f](https://github.com/ridho-f).
