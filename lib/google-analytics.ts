/**
 * Google Analytics 4 Data API – Server-side utility
 *
 * Ako GA4 credentials postoje u env varijablama, koristi pravi API.
 * Ako ne postoje, vraća realistične mock podatke koji točno simuliraju
 * GA4 RunReportResponse JSON strukturu.
 */

// ────────────────────────────────────────────────────────────
// Tipovi koji preslikavaju GA4 Data API RunReportResponse
// ────────────────────────────────────────────────────────────
export interface GA4DimensionHeader {
  name: string;
}

export interface GA4MetricHeader {
  name: string;
  type: string;
}

export interface GA4DimensionValue {
  value: string;
}

export interface GA4MetricValue {
  value: string;
}

export interface GA4Row {
  dimensionValues: GA4DimensionValue[];
  metricValues: GA4MetricValue[];
}

export interface GA4RunReportResponse {
  dimensionHeaders: GA4DimensionHeader[];
  metricHeaders: GA4MetricHeader[];
  rows?: GA4Row[];
  rowCount: number;
  metadata: { currencyCode: string; timeZone: string };
}

// ────────────────────────────────────────────────────────────
// Konfiguracijska provjera
// ────────────────────────────────────────────────────────────
const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || '';
const GA4_CLIENT_EMAIL = process.env.GA4_CLIENT_EMAIL || '';
const GA4_PRIVATE_KEY = (process.env.GA4_PRIVATE_KEY || '').replace(/\\n/g, '\n');

// Provjeri da ključ izgleda kao validan PEM (počinje s -----BEGIN)
const isGA4Configured = Boolean(
  GA4_PROPERTY_ID &&
    GA4_CLIENT_EMAIL &&
    GA4_PRIVATE_KEY &&
    GA4_PRIVATE_KEY.includes('-----BEGIN'),
);

// ────────────────────────────────────────────────────────────
// Pomoćne funkcije za Google Auth (samo ako su credentials prisutni)
// ────────────────────────────────────────────────────────────
async function getAccessToken(): Promise<string> {
  // Dinamički importaj google-auth-library samo kad je potrebno
  const { GoogleAuth } = await import('google-auth-library');

  const auth = new GoogleAuth({
    credentials: {
      client_email: GA4_CLIENT_EMAIL,
      private_key: GA4_PRIVATE_KEY,
    },
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });

  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return tokenResponse.token || '';
}

async function runGA4Report(
  dimensions: string[],
  metrics: string[],
  startDate: string = '30daysAgo',
  endDate: string = 'today',
): Promise<GA4RunReportResponse> {
  const accessToken = await getAccessToken();

  const body = {
    dimensions: dimensions.map((name) => ({ name })),
    metrics: metrics.map((name) => ({ name })),
    dateRanges: [{ startDate, endDate }],
  };

  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GA4 API error ${res.status}: ${errText}`);
  }

  return (await res.json()) as GA4RunReportResponse;
}

// Realtime API – vraća podatke zadnjih 30 minuta (nema 24-48h delay-a)
async function runGA4RealtimeReport(
  dimensions: string[],
  metrics: string[],
): Promise<GA4RunReportResponse> {
  const accessToken = await getAccessToken();

  const body = {
    dimensions: dimensions.map((name) => ({ name })),
    metrics: metrics.map((name) => ({ name })),
    minuteRanges: [{ startMinutesAgo: 29, endMinutesAgo: 0 }], // GA4 Realtime max je 29 minuta
  };

  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runRealtimeReport`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GA4 Realtime API error ${res.status}: ${errText}`);
  }

  return (await res.json()) as GA4RunReportResponse;
}

// ────────────────────────────────────────────────────────────
// Mock podaci – simuliraju GA4 RunReportResponse
// ────────────────────────────────────────────────────────────

function generateDateRange(days: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10).replace(/-/g, ''));
  }
  return dates;
}

function mockActiveUsersOverTime(): GA4RunReportResponse {
  const dates = generateDateRange(30);
  const rows: GA4Row[] = dates.map((date, i) => {
    const base = 40 + Math.round(Math.sin(i / 4) * 15) + Math.round(Math.random() * 20);
    return {
      dimensionValues: [{ value: date }],
      metricValues: [
        { value: String(Math.max(10, base)) },           // activeUsers
        { value: String(Math.max(15, base + Math.round(Math.random() * 30))) }, // sessions
        { value: String(Math.max(20, base * 3 + Math.round(Math.random() * 50))) }, // eventCount
      ],
    };
  });

  return {
    dimensionHeaders: [{ name: 'date' }],
    metricHeaders: [
      { name: 'activeUsers', type: 'TYPE_INTEGER' },
      { name: 'sessions', type: 'TYPE_INTEGER' },
      { name: 'eventCount', type: 'TYPE_INTEGER' },
    ],
    rows,
    rowCount: rows.length,
    metadata: { currencyCode: 'EUR', timeZone: 'Europe/Zagreb' },
  };
}

function mockUsersByDeviceCategory(): GA4RunReportResponse {
  const devices = [
    { device: 'desktop', users: '487', sessions: '1231' },
    { device: 'mobile', users: '312', sessions: '643' },
    { device: 'tablet', users: '58', sessions: '97' },
  ];

  return {
    dimensionHeaders: [{ name: 'deviceCategory' }],
    metricHeaders: [
      { name: 'activeUsers', type: 'TYPE_INTEGER' },
      { name: 'sessions', type: 'TYPE_INTEGER' },
    ],
    rows: devices.map((d) => ({
      dimensionValues: [{ value: d.device }],
      metricValues: [{ value: d.users }, { value: d.sessions }],
    })),
    rowCount: devices.length,
    metadata: { currencyCode: 'EUR', timeZone: 'Europe/Zagreb' },
  };
}

function mockEventFunnel(): GA4RunReportResponse {
  const steps = [
    { event: 'page_view_home', count: '1000' },
    { event: 'search_game', count: '620' },
    { event: 'view_game_detail', count: '385' },
    { event: 'add_to_list', count: '142' },
  ];

  return {
    dimensionHeaders: [{ name: 'eventName' }],
    metricHeaders: [{ name: 'eventCount', type: 'TYPE_INTEGER' }],
    rows: steps.map((s) => ({
      dimensionValues: [{ value: s.event }],
      metricValues: [{ value: s.count }],
    })),
    rowCount: steps.length,
    metadata: { currencyCode: 'EUR', timeZone: 'Europe/Zagreb' },
  };
}

// ────────────────────────────────────────────────────────────
// Javni API – koristi pravi GA4 ili mock
// Svaka funkcija vraća { result, source } gdje source je:
//   'live'       – GA4 Realtime API (zadnjih 24h, bez delay-a)
//   'historical' – GA4 runReport (30 dana, 24-48h delay)
//   'mock'       – simulirani podaci (GA4 nije konfiguriran ili nema podataka)
// ────────────────────────────────────────────────────────────

export type DataSource = 'live' | 'historical' | 'mock';

export interface FetchResult {
  result: GA4RunReportResponse;
  source: DataSource;
}

export async function fetchActiveUsersOverTime(): Promise<FetchResult> {
  if (isGA4Configured) {
    // 1. Pokušaj historijski runReport (30 dana, 24-48h delay)
    try {
      const result = await runGA4Report(['date'], ['activeUsers', 'sessions', 'eventCount'], '30daysAgo', 'today');
      if (result.rows && result.rows.length > 0) {
        console.log('[GA4] activeUsersOverTime: historical data, rows:', result.rows.length);
        return { result, source: 'historical' };
      }
      console.warn('[GA4] activeUsersOverTime: historical empty (24-48h delay), trying realtime...');
    } catch (err) {
      console.error('[GA4] activeUsersOverTime historical failed:', err);
    }

    // 2. Fallback: Realtime API s minutesAgo dimenzijom (zadnjih 29 minuta)
    try {
      const rtResult = await runGA4RealtimeReport(['minutesAgo'], ['activeUsers', 'eventCount']);
      if (rtResult.rows && rtResult.rows.length > 0) {
        console.log('[GA4] activeUsersOverTime: LIVE realtime (minutesAgo), rows:', rtResult.rows.length);

        // Sortiraj po minutesAgo DESC ("28" je najstariji) i pretvori u YYYYMMDDHHMM timestamp
        const now = new Date();
        const sorted = [...rtResult.rows].sort((a, b) => {
          // dimensionValues[0].value dolazi kao "0", "1"..."28"
          return parseInt(b.dimensionValues[0].value, 10) - parseInt(a.dimensionValues[0].value, 10);
        });

        const rows: GA4Row[] = sorted.map((row) => {
          const minsAgo = parseInt(row.dimensionValues[0].value, 10);
          const ts = new Date(now.getTime() - minsAgo * 60 * 1000);
          const pad = (n: number) => String(n).padStart(2, '0');
          // Format: YYYYMMDDHHMM (12 znakova) – chart će prepoznati ovu dužinu
          const dateKey =
            String(ts.getFullYear()) +
            pad(ts.getMonth() + 1) +
            pad(ts.getDate()) +
            pad(ts.getHours()) +
            pad(ts.getMinutes());
          return {
            dimensionValues: [{ value: dateKey }],
            metricValues: [
              row.metricValues[0],          // activeUsers
              row.metricValues[0],          // sessions – realtime nema sessions, koristi activeUsers
              row.metricValues[1] ?? { value: '0' }, // eventCount
            ],
          };
        });

        return {
          result: { ...rtResult, rows },
          source: 'live',
        };
      }
    } catch (err) {
      console.warn('[GA4] activeUsersOverTime realtime failed:', err);
    }
  }
  return { result: mockActiveUsersOverTime(), source: 'mock' };
}

export async function fetchUsersByDevice(): Promise<FetchResult> {
  if (isGA4Configured) {
    // Pokušaj Realtime API prvi (nema delay-a)
    try {
      const result = await runGA4RealtimeReport(['deviceCategory'], ['activeUsers']);
      if (result.rows && result.rows.length > 0) {
        console.log('[GA4] usersByDevice: LIVE realtime data, rows:', result.rows.length);
        // Realtime vraća samo activeUsers, sessions nema – dodaj 0 kao fallback
        result.rows = result.rows.map((row) => ({
          ...row,
          metricValues: [row.metricValues[0], { value: '0' }],
        }));
        return { result, source: 'live' };
      }
    } catch (err) {
      console.warn('[GA4] usersByDevice realtime failed, trying historical:', err);
    }
    // Fallback na historijski runReport
    try {
      const result = await runGA4Report(['deviceCategory'], ['activeUsers', 'sessions'], '30daysAgo', 'today');
      if (result.rows && result.rows.length > 0) {
        console.log('[GA4] usersByDevice: historical data');
        return { result, source: 'historical' };
      }
    } catch (err) {
      console.error('[GA4] usersByDevice historical failed:', err);
    }
  }
  return { result: mockUsersByDeviceCategory(), source: 'mock' };
}

export async function fetchFunnelEvents(): Promise<FetchResult> {
  if (isGA4Configured) {
    // Pokušaj Realtime API prvi
    try {
      const result = await runGA4RealtimeReport(['eventName'], ['eventCount']);
      if (result.rows && result.rows.length > 0) {
        console.log('[GA4] funnelEvents: LIVE realtime data, rows:', result.rows.length);
        return { result, source: 'live' };
      }
    } catch (err) {
      console.warn('[GA4] funnelEvents realtime failed, trying historical:', err);
    }
    // Fallback na historijski runReport
    try {
      const result = await runGA4Report(['eventName'], ['eventCount'], '30daysAgo', 'today');
      if (result.rows && result.rows.length > 0) {
        console.log('[GA4] funnelEvents: historical data');
        return { result, source: 'historical' };
      }
    } catch (err) {
      console.error('[GA4] funnelEvents historical failed:', err);
    }
  }
  return { result: mockEventFunnel(), source: 'mock' };
}
