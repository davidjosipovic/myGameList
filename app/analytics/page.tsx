'use client';

import { useEffect, useState } from 'react';
import ActiveUsersLineChart from '@/components/charts/ActiveUsersLineChart';
import DeviceBarChart from '@/components/charts/DeviceBarChart';
import FunnelChart from '@/components/charts/FunnelChart';
import RetentionChart from '@/components/charts/RetentionChart';
import AnalysisCard from '@/components/AnalysisCard';

// ────────────────────────────────────────────────────────────
// Tipovi
// ────────────────────────────────────────────────────────────
interface ActiveUserPoint {
  date: string;
  activeUsers: number;
  sessions: number;
  eventCount: number;
}

interface DevicePoint {
  device: string;
  activeUsers: number;
  sessions: number;
}

interface FunnelStep {
  step: string;
  label: string;
  users: number;
  dropOffPercent: number;
  conversionPercent: number;
}

interface RetentionCohort {
  cohortDate: string;
  totalUsers: number;
  day1Retained: number;
  day7Retained: number;
}

interface RetentionData {
  totalUsers: number;
  day1: { retained: number; percent: number };
  day7: { retained: number; percent: number };
  cohorts: RetentionCohort[];
}

interface AnalyticsPayload {
  activeUsers: ActiveUserPoint[];
  devices: DevicePoint[];
  funnel: FunnelStep[];
  retention: RetentionData;
  meta?: {
    sources: {
      activeUsers: 'live' | 'historical' | 'mock';
      devices: 'live' | 'historical' | 'mock';
      funnel: 'live' | 'historical' | 'mock';
      retention: 'database';
    };
  };
}

// ────────────────────────────────────────────────────────────
// Source badge
// ────────────────────────────────────────────────────────────
function SourceBadge({ source }: { source?: string }) {
  if (!source) return null;
  const cfg = {
    live:       { label: 'Live',       cls: 'bg-green-light/15 text-green-light border-green-light/30', dot: 'bg-green-light animate-pulse' },
    historical: { label: 'Historijski',cls: 'bg-[#6366F1]/15 text-[#6366F1] border-[#6366F1]/30',      dot: 'bg-[#6366F1]' },
    mock:       { label: 'Demo podaci',cls: 'bg-white/5 text-white/40 border-white/10',                  dot: 'bg-white/30' },
    database:   { label: 'Baza',       cls: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30',       dot: 'bg-[#F59E0B]' },
  } as const;
  const s = cfg[source as keyof typeof cfg];
  if (!s) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ────────────────────────────────────────────────────────────
// Stat kartica za header
// ────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent = 'green' }: { label: string; value: string | number; sub?: string; accent?: 'green' | 'indigo' | 'red' }) {
  const colors = {
    green: 'from-green-light/10 to-transparent border-green-light/20 text-green-light',
    indigo: 'from-[#6366F1]/10 to-transparent border-[#6366F1]/20 text-[#6366F1]',
    red: 'from-red/10 to-transparent border-red/20 text-red',
  };
  return (
    <div className={`rounded-xl border bg-gradient-to-br p-5 ${colors[accent]}`}>
      <p className="text-white/50 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs mt-1 opacity-70">{sub}</p>}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Stranica
// ────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // ── Stanja ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 rounded-full border-2 border-t-green-light animate-spin" />
          </div>
          <p className="text-white/60 text-sm tracking-wide">Učitavanje analitike...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red/10 border border-red/20 flex items-center justify-center">
            <svg className="w-7 h-7 text-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-white font-semibold text-lg mb-1">Greška pri učitavanju</p>
          <p className="text-white/40 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // ── Metrike ────────────────────────────────────────────
  const totalActiveUsers = data.activeUsers.reduce((s, d) => s + d.activeUsers, 0);
  const avgDailyUsers = Math.round(totalActiveUsers / Math.max(1, data.activeUsers.length));
  const totalSessions = data.activeUsers.reduce((s, d) => s + d.sessions, 0);

  const topDevice = [...data.devices].sort((a, b) => b.activeUsers - a.activeUsers)[0];
  const deviceTotal = data.devices.reduce((s, d) => s + d.activeUsers, 0);

  const funnelFirst = data.funnel[0];
  const funnelLast = data.funnel[data.funnel.length - 1];
  const overallConversion = funnelFirst
    ? ((funnelLast.users / funnelFirst.users) * 100).toFixed(1)
    : '0';

  const biggestDrop = [...data.funnel]
    .filter((s) => s.dropOffPercent > 0)
    .sort((a, b) => b.dropOffPercent - a.dropOffPercent)[0];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Analytics Dashboard
              </h1>
              <p className="text-white/40 text-sm mt-1">
                Analiza korisničkog ponašanja i metrike angažiranosti
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-green-light animate-pulse" />
              <span className="text-white/50 text-xs">Live</span>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            <StatCard label="Prosj. dnevnih korisnika" value={avgDailyUsers} sub="zadnjih 30 dana" accent="green" />
            <StatCard label="Ukupno sesija" value={totalSessions.toLocaleString()} sub="zadnjih 30 dana" accent="indigo" />
            <StatCard label="Konverzija" value={`${overallConversion}%`} sub="home → add to list" accent="green" />
            <StatCard
              label="Day 7 Retention"
              value={`${data.retention.day7.percent}%`}
              sub={`${data.retention.day7.retained} od ${data.retention.totalUsers}`}
              accent={data.retention.day7.percent > 30 ? 'green' : 'red'}
            />
          </div>
        </div>
      </div>

      {/* ── Charts Grid ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Row 1: Line Chart + Devices */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Users – spans 2 cols */}
          <div className="lg:col-span-2">
            <div className="bg-[#111111] rounded-xl border border-white/[0.06] p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-base">Trend aktivnih korisnika</h2>
                <div className="flex items-center gap-2">
                  <SourceBadge source={data.meta?.sources.activeUsers} />
                  <span className="text-white/30 text-xs">
                    {data.meta?.sources.activeUsers === 'live' ? 'zadnjih 29 min' : '30 dana'}
                  </span>
                </div>
              </div>
              <ActiveUsersLineChart data={data.activeUsers} />
            </div>

            <AnalysisCard
              title="Active Users Trend — Rezultat"
              result={
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-white/[0.03]">
                    <p className="text-white/40 text-xs mb-1">Ukupno korisnika</p>
                    <p className="text-white font-bold text-lg">{totalActiveUsers}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/[0.03]">
                    <p className="text-white/40 text-xs mb-1">Prosj. dnevnih</p>
                    <p className="text-white font-bold text-lg">{avgDailyUsers}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/[0.03]">
                    <p className="text-white/40 text-xs mb-1">Ukupno sesija</p>
                    <p className="text-white font-bold text-lg">{totalSessions}</p>
                  </div>
                </div>
              }
              interpretation={`Prosječan dnevni broj aktivnih korisnika iznosi ${avgDailyUsers}, s ukupno ${totalSessions} sesija u zadnjih 30 dana. Vidljiv je blagi rast angažiranosti kroz vrijeme, s povremenim vrhovima koji koreliraju s vikendima — što ukazuje na to da je primarna korisnička baza casual gamera koji koriste platformu u slobodno vrijeme.`}
              uxImplication="Preporuka je slanje push notifikacija ili email newslettera petkom popodne kako bi se iskoristio vikend peak. Također, gamifikacija (npr. streakovi, tjedni izazovi) mogla bi izravnati krivulju korištenja tijekom radnih dana."
            />
          </div>

          {/* Devices – 1 col */}
          <div>
            <div className="bg-[#111111] rounded-xl border border-white/[0.06] p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-base">Uređaji</h2>
                <div className="flex items-center gap-2">
                  <SourceBadge source={data.meta?.sources.devices} />
                  <span className="text-white/30 text-xs">{deviceTotal} ukupno</span>
                </div>
              </div>
              <DeviceBarChart data={data.devices} />
            </div>

            <AnalysisCard
              title="Device Distribution — Rezultat"
              result={
                <div className="space-y-2">
                  {data.devices.map((d) => {
                    const pct = deviceTotal > 0 ? (d.activeUsers / deviceTotal) * 100 : 0;
                    return (
                      <div key={d.device} className="flex items-center gap-3">
                        <span className="text-white/70 text-xs capitalize w-16">{d.device}</span>
                        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-green-light/70 transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-white/50 text-xs font-mono w-12 text-right">{pct.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              }
              interpretation={`Najveći udio korisnika dolazi s ${topDevice?.device || 'desktop'} uređaja (${topDevice ? ((topDevice.activeUsers / deviceTotal) * 100).toFixed(1) : 0}%). Mobile segment čini značajan dio prometa, ali ima niži omjer sesija po korisniku — što može ukazivati na kraće, manje angažirane posjete s mobilnih uređaja.`}
              uxImplication="Mobile korisnici zaslužuju optimiziraniji UX: brže učitavanje, jednostavnija navigacija, i swipe gestures za pregled igara. Tablet korisnici su najmanji segment — ne treba ulagati u tablet-specifičan dizajn, ali responsive layout mora pokrivati te breakpointove."
            />
          </div>
        </div>

        {/* Row 2: Funnel + Retention */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funnel */}
          <div>
            <div className="bg-[#111111] rounded-xl border border-white/[0.06] p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-base">Funnel konverzije</h2>
                <div className="flex items-center gap-2">
                  <SourceBadge source={data.meta?.sources.funnel} />
                  <span className="text-white/30 text-xs">{overallConversion}% ukupno</span>
                </div>
              </div>
              <FunnelChart data={data.funnel} />
            </div>

            <AnalysisCard
              title="Conversion Funnel — Rezultat"
              result={
                <div className="space-y-2">
                  {data.funnel.map((step, i) => (
                    <div key={step.step} className="flex items-center gap-3">
                      <span className="text-white/30 text-xs font-mono w-4">{i + 1}.</span>
                      <span className="text-white/70 text-xs flex-1 truncate">{step.label}</span>
                      <span className="text-white font-mono text-xs">{step.users}</span>
                      <span className={`font-mono text-xs w-16 text-right ${step.dropOffPercent > 20 ? 'text-red' : 'text-green-light'}`}>
                        {step.dropOffPercent > 0 ? `−${step.dropOffPercent}%` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              }
              interpretation={`Ukupna konverzija od posjeta do dodavanja igre u listu iznosi ${overallConversion}%. ${biggestDrop ? `Najveći pad (${biggestDrop.dropOffPercent}%) događa se na koraku "${biggestDrop.label}" — to je kritična točka gdje korisnici napuštaju proces.` : ''} Ovo ukazuje na potencijalnu frikciju u korisničkom iskustvu na tom koraku.`}
              uxImplication={`Fokus poboljšanja treba biti na smanjenju drop-off-a kod ${biggestDrop?.label || 'pregledavanja igara'}. Prijedlozi: dodati "Quick Add" gumb direktno na search rezultate (bez potrebe za otvaranjem detalja), implementirati one-click dodavanje putem tooltipa, te smanjiti broj klikova potrebnih za dodavanje igre s trenutna 3 na 1.`}
            />
          </div>

          {/* Retention */}
          <div>
            <div className="bg-[#111111] rounded-xl border border-white/[0.06] p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-base">Retention analiza</h2>
                <div className="flex items-center gap-2">
                  <SourceBadge source={data.meta?.sources.retention} />
                  <span className="text-white/30 text-xs">kohortna</span>
                </div>
              </div>
              <RetentionChart data={data.retention} />
            </div>

            <AnalysisCard
              title="User Retention — Rezultat"
              result={
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-white/[0.03]">
                    <p className="text-white/40 text-xs mb-1">Ukupno</p>
                    <p className="text-white font-bold text-lg">{data.retention.totalUsers}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-light/5 border border-green-light/10">
                    <p className="text-white/40 text-xs mb-1">Day 1</p>
                    <p className="text-green-light font-bold text-lg">{data.retention.day1.percent}%</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-[#6366F1]/5 border border-[#6366F1]/10">
                    <p className="text-white/40 text-xs mb-1">Day 7</p>
                    <p className="text-[#6366F1] font-bold text-lg">{data.retention.day7.percent}%</p>
                  </div>
                </div>
              }
              interpretation={`Day 1 retention iznosi ${data.retention.day1.percent}%, što znači da je ${data.retention.day1.percent}% korisnika izvršilo interakciju (dodalo igru) unutar prvog dana od registracije. Day 7 retention pada na ${data.retention.day7.percent}%, što ukazuje da gotovo ${(100 - data.retention.day7.percent).toFixed(0)}% korisnika ne ostaje aktivno nakon prvog tjedna.`}
              uxImplication="Za poboljšanje Day 1 retention-a, implementirajte onboarding flow koji vodi novog korisnika da odmah doda barem 3 igre u listu. Za Day 7 retention, uvedite tjedne email podsjetnike s personaliziranim preporukama igara (koristeći sustav preporuka s Cosine Similarity). Push notifikacije o novim igrama iz omiljenih žanrova mogu dodatno poboljšati dugoročno zadržavanje."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
