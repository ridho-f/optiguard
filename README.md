# @ridhof_1/optiguard-security 🛡️

Enterprise-grade frontend security shield: **Anti-DevTools**, **Anti-Debugger**, **Keyboard & Context Menu Blocker**, dan customizable **OptiGuard Lock Screen** untuk aplikasi Web & SPA (React, Next.js, Vue, Inertia.js, Vite, dan Vanilla JS).

[![NPM Version](https://img.shields.io/npm/v/@ridhof_1/optiguard-security.svg?color=3b82f6)](https://www.npmjs.com/package/@ridhof_1/optiguard-security)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

---

## 📑 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Instalasi](#-instalasi)
- [Panduan Penggunaan Cepat (Quick Start)](#-panduan-penggunaan-cepat-quick-start)
- [Contoh Integrasi Framework](#-contoh-integrasi-framework)
  - [1. React / Vite SPA](#1-react--vite-spa)
  - [2. Laravel + Inertia.js (React / Vue)](#2-laravel--inertiajs-react--vue)
  - [3. Next.js (App Router & Pages Router)](#3-nextjs)
  - [4. Vanilla JavaScript / HTML Biasa](#4-vanilla-javascript--html-biasa)
  - [5. Laravel Blade Template (Backend Config)](#5-laravel-blade-template-backend-config)
- [Kustomisasi Lock Screen](#-kustomisasi-lock-screen)
- [Konfigurasi Lengkap (Options API)](#-konfigurasi-lengkap-options-api)
- [Fungsi & Helper Tambahan](#-fungsi--helper-tambahan)
- [Cara Menghentikan Proteksi (Cleanup)](#-cara-menghentikan-proteksi-cleanup)
- [Build & Publish ke NPM](#-build--publish-ke-npm)
- [Lisensi](#-lisensi)

---

## ✨ Fitur Utama

- 🔍 **Real-time DevTools & Inspector Detection**: Mendeteksi pembukaan console (docked/undocked), inspect element, debugger trap, dan perubahan ukuran window inspector secara presisi.
- 🚫 **Keyboard Shortcut Blocker**: Memblokir shortcut developer seperti `F12`, `Ctrl+Shift+I`, `Ctrl+Shift+J`, `Ctrl+Shift+C`, `Ctrl+U` (view-source), dan `Ctrl+S`.
- 🖱️ **Context Menu Blocker**: Mencegah klik kanan untuk mematikan menu context inspect element bawaan browser.
- 🔒 **Customizable Lock Screen**: Dialog modal keamanan modern (Glassmorphism dark-mode) dengan animasi proteksi, pesan peringatan, custom logo, dan tombol navigasi/logout.
- ⚙️ **Fleksibilitas Aksi Redirect**: Pilihan aksi otomatis saat terdeteksi (`logout`, `back`, `google`, `home`, `blank`, atau custom URL).
- 📱 **Mobile & Touch Friendly**: Proteksi pintar yang aman dari false-positive debugger pada browser mobile (Android/iOS).
- 🛡️ **Dev-Safe Mode**: Otomatis nonaktif di lingkungan development (`localhost`, `127.0.0.1`, Vite dev) sehingga tidak mengganggu saat coding.

---

## 📦 Instalasi

Install melalui package manager favorit Anda:

```bash
# npm
npm install @ridhof_1/optiguard-security

# yarn
yarn add @ridhof_1/optiguard-security

# pnpm
pnpm add @ridhof_1/optiguard-security
```

---

## 🚀 Panduan Penggunaan Cepat (Quick Start)

Cukup import dan panggil `initSecurityProtection()` pada file entry point aplikasi Anda:

```typescript
import { initSecurityProtection } from '@ridhof_1/optiguard-security';

// Inisialisasi proteksi dengan konfigurasi default
initSecurityProtection();
```

> 💡 **Info:** Secara default `disableInDev: true`, sehingga proteksi akan nonaktif di `localhost` atau `127.0.0.1`. Jika Anda ingin menguji di localhost, atur `disableInDev: false`.

---

## 💻 Contoh Integrasi Framework

### 1. React / Vite SPA

Di `src/main.tsx` atau `src/App.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initSecurityProtection } from '@ridhof_1/optiguard-security';

// Jalankan sebelum / saat render aplikasi
initSecurityProtection({
  disableInDev: false, // Set true di production
  redirectBehavior: 'logout',
  redirectUrl: '/login',
  branding: {
    title: 'Akses Pengembang Dibatasi',
    message: 'Aplikasi ini dilindungi oleh OptiGuard Security System.',
    badgeText: 'Security Shield Active',
    footerText: 'PT Tata Optima Property',
    buttonText: 'Kembali ke Beranda',
    buttonUrl: '/',
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

### 2. Laravel + Inertia.js (React / Vue)

Buat helper wrapper di `resources/js/lib/security.ts` untuk mendengarkan navigasi halaman Inertia:

```typescript
// resources/js/lib/security.ts
import { router } from '@inertiajs/react';
import {
  initSecurityProtection as baseInitSecurityProtection,
  SecurityConfig,
  SecurityController,
} from '@ridhof_1/optiguard-security';

export function initSecurityProtection(options: SecurityConfig = {}): SecurityController | null {
  return baseInitSecurityProtection({
    ...options,
    onRouteChanged: (checkCallback: () => void) => {
      try {
        router.on('navigate', checkCallback);
        router.on('finish', checkCallback);
      } catch {
        // Router belum siap
      }
    },
  });
}

export { stopSecurityProtection } from '@ridhof_1/optiguard-security';
```

Lalu panggil di `resources/js/app.tsx`:

```tsx
// resources/js/app.tsx
import { initSecurityProtection } from './lib/security';

initSecurityProtection();
```

---

### 3. Next.js

#### **Next.js App Router (`app/layout.tsx`)**:

```tsx
'use client';

import { useEffect } from 'react';
import { initSecurityProtection, stopSecurityProtection } from '@ridhof_1/optiguard-security';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const controller = initSecurityProtection({
      disableInDev: process.env.NODE_ENV === 'development',
      redirectBehavior: 'logout',
      redirectUrl: '/login',
    });

    return () => {
      stopSecurityProtection();
    };
  }, []);

  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
```

---

### 4. Vanilla JavaScript / HTML Biasa

Gunakan di script browser standar:

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Portal Web</title>
</head>
<body>
  <h1>Selamat Datang</h1>

  <!-- Jika menggunakan bundling (Webpack/Vite/Rollup) -->
  <script type="module">
    import { initSecurityProtection } from '@ridhof_1/optiguard-security';

    initSecurityProtection({
      disableInDev: false,
      blockContextMenu: true,
      blockShortcuts: true,
      redirectBehavior: 'logout',
    });
  </script>
</body>
</html>
```

---

### 5. Laravel Blade Template (Backend Config)

Anda dapat menyuntikkan konfigurasi langsung dari file Blade `resources/views/app.blade.php` sebelum bundle JS dijalankan:

```blade
<!DOCTYPE html>
<html>
<head>
    <!-- Konfigurasi Global OptiGuard Security -->
    <script>
        window.__SECURITY_CONFIG__ = {
            enabled: @json(config('security.enabled', true)),
            disableInDev: @json(app()->isLocal()),
            redirectBehavior: 'logout',
            redirectUrl: '/login',
            blockContextMenu: true,
            blockShortcuts: true,
            branding: {
                title: 'Akses Pengembang Dibatasi',
                badgeText: 'OptiGuard Protection',
                footerText: 'PT Tata Optima Property'
            }
        };
    </script>

    @viteReactRefresh
    @vite(['resources/js/app.tsx'])
</head>
<body>
    @inertia
</body>
</html>
```

---

## 🎨 Kustomisasi Lock Screen

Saat DevTools terdeteksi, modal Lock Screen dengan gaya gelap futuristik akan otomatis muncul. Anda dapat mengkustomisasi setiap bagian teks, logo, maupun aksi tombol:

```typescript
initSecurityProtection({
  branding: {
    title: 'Akses Pengembang Dibatasi',
    message: 'Inspeksi source code dan penggunaan developer tools dilarang pada sistem ini.',
    badgeText: 'Security Protocol Level 1',
    footerText: 'PT Tata Optima Property • Security Protocol',
    logoUrl: '/storage/OptiGuard.png', // URL gambar logo kustom
    buttonText: 'Keluar & Kembali ke Login',
    buttonUrl: '/login',
  }
});
```

---

## ⚙️ Konfigurasi Lengkap (Options API)

Objek `SecurityConfig` mendukung parameter berikut:

| Parameter | Tipe Data | Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `enabled` | `boolean` | `true` | Mengaktifkan atau menonaktifkan seluruh sistem proteksi. |
| `disableInDev` | `boolean` | `true` | Jika `true`, otomatis nonaktif di `localhost`, `127.0.0.1`, dan mode dev. |
| `redirectBehavior` | `string` | `'logout'` | Tindakan saat inspeksi terdeteksi:<br>• `'logout'`: Munculkan Lock Screen & opsi redirect.<br>• `'back'`: Kembali ke riwayat halaman sebelumnya.<br>• `'google'`: Alihkan ke Google.<br>• `'home'`: Alihkan ke root `/`.<br>• `'blank'`: Buka `about:blank`.<br>• `'/custom-path'`: Alihkan ke URL spesifik. |
| `redirectUrl` | `string` | `'/login'` | URL tujuan jika `redirectBehavior` bernilai `'logout'` atau custom path. |
| `blockContextMenu` | `boolean` | `true` | Memblokir klik kanan (*Right Click Context Menu*). |
| `blockShortcuts` | `boolean` | `true` | Memblokir tombol `F12`, `Ctrl+Shift+I`, `Ctrl+Shift+J`, `Ctrl+Shift+C`, `Ctrl+U`, `Ctrl+S`. |
| `detectDelay` | `number` | `200` | Delay waktu polling detektor DevTools (milidetik). |
| `checkInterval` | `number` | `300` | Interval pemeriksaan rutin DevTools (milidetik). |
| `branding` | `SecurityBrandingConfig` | `{}` | Objek kustomisasi teks, logo, dan tombol pada Lock Screen modal. |
| `onDetect` | `(details) => boolean \| void` | `undefined` | Callback custom saat DevTools terdeteksi. Return `false` jika ingin membatalkan aksi redirect default. |
| `onRouteChanged` | `(cb) => () => void` | `undefined` | Listener hook router (seperti Inertia router, Vue Router, dsb). |

---

## 🛠️ Fungsi & Helper Tambahan

Package ini juga mengekspor berbagai helper modular:

```typescript
import {
  initSecurityProtection,
  stopSecurityProtection,
  renderLockScreen,
  setupSecurityDetector,
  setupShortcutsBlocker,
  isLocalEnvironment,
  isRealMobileDevice,
} from '@ridhof_1/optiguard-security';

// Cek apakah berjalan di lingkungan localhost
if (isLocalEnvironment()) {
  console.log('Running locally');
}

// Cek apakah perangkat adalah mobile device asli
if (isRealMobileDevice()) {
  console.log('Mobile device detected');
}

// Tampilkan Lock Screen secara manual jika dibutuhkan
renderLockScreen({
  branding: {
    title: 'Sesi Terkunci',
  }
});
```

---

## 🛑 Cara Menghentikan Proteksi (Cleanup)

Untuk menghentikan semua listener shortcut dan loop pemeriksaan DevTools (misalnya saat component unmount):

```typescript
import { stopSecurityProtection } from '@ridhof_1/optiguard-security';

stopSecurityProtection();
```

---

## 🚀 Build & Publish ke NPM

Jika Anda ingin mengompilasi dan mem-publish versi terbaru package ini:

```bash
# 1. Masuk ke direktori package
cd packages/optiguard-security

# 2. Build TypeScript & Bundle via tsup
npm run build

# 3. Login ke akun NPM (jika belum)
npm login

# 4. Publish ke NPM publik
npm publish --access public
```

---

## 📄 Lisensi

Didistribusikan di bawah Lisensi MIT. Hak Cipta © **PT Tata Optima Property**.
