'use client';

/**
 * GoogleAnalytics – klijentska komponenta koja prati promjene ruta
 * u Next.js 13 App Routeru.
 *
 * Mora biti u Suspense granici (u layout.tsx) jer koristi useSearchParams().
 */

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// Dodaj gtag na globalni window tip
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag: (...args: any[]) => void;
    dataLayer: unknown[];
    // google_tag_manager se postavlja TEK KADA se vanjska gtag.js skripta učita
    google_tag_manager?: Record<string, unknown>;
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const IS_DEV = process.env.NODE_ENV === 'development';

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_ID || GA_ID === 'G-XXXXXXXXXX') {
      console.warn('[GA4] ⚠️ Measurement ID nije postavljen ili je placeholder.');
      return;
    }

    if (typeof window === 'undefined') return;

    // ─── DIJAGNOSTIKA ──────────────────────────────────────────────────────────
    // window.gtag POSTOJI čak i bez vanjske skripte jer ga inline init definira.
    // Prava potvrda da je VANJSKA gtag.js skripta učitana je window.google_tag_manager.
    const externalScriptLoaded = typeof window.google_tag_manager !== 'undefined';

    if (!externalScriptLoaded) {
      console.warn(
        '[GA4] ⚠️ Vanjska gtag.js skripta NIJE učitana!\n' +
        '  → Najvjerojatiji uzrok: AD BLOCKER (uBlock Origin, Brave Shield, itd.)\n' +
        '  → Provjeri Network tab: filtriraj po "googletagmanager" – ako nema zahtjeva, blokirano je.\n' +
        '  → Testiraj u Incognito bez ekstenzija.'
      );
      // Nastavi – gtag() pozivi idu u dataLayer queue, ali NE šalju collect zahtjeve
    } else {
      console.log('[GA4] ✅ Vanjska gtag.js uspješno učitana | google_tag_manager prisutan');
    }

    if (typeof window.gtag !== 'function') {
      console.warn('[GA4] window.gtag nije funkcija – preskačem.');
      return;
    }

    const qs = searchParams.toString();
    const url = pathname + (qs ? `?${qs}` : '');

    window.gtag('config', GA_ID, {
      page_path: url,
      // debug_mode šalje evente u GA4 DebugView (Admin → DebugView)
      // Pomaže potvrditi da Google prima evente čak i kad collect zahtjev prođe
      ...(IS_DEV ? { debug_mode: true } : {}),
    });

    if (externalScriptLoaded) {
      console.log('[GA4] ✅ page_view + collect zahtjev poslan:', url);
    } else {
      console.log('[GA4] 📋 gtag config pozvan (queue) – collect zahtjev NIJE poslan (vanjske skripte nema):', url);
    }
  }, [pathname, searchParams]);

  return null;
}
