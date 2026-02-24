'use client';

interface AnalysisCardProps {
  title: string;
  result: React.ReactNode;
  interpretation: string;
  uxImplication: string;
}

/**
 * Interpretacijski panel ispod svake vizualizacije.
 * Koristi serif tipografiju za razlikovanje od ostatka UI-ja.
 */
export default function AnalysisCard({
  title,
  result,
  interpretation,
  uxImplication,
}: AnalysisCardProps) {
  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-[#111111] overflow-hidden">
      {/* Naslov */}
      <div className="px-5 py-3 border-b border-white/10 bg-white/[0.02]">
        <h3 className="text-green-light font-semibold text-sm tracking-wide uppercase">{title}</h3>
      </div>

      <div className="p-5 space-y-5">
        {/* Rezultat – tablica ili tekst */}
        <div className="text-white/90 text-sm">{result}</div>

        {/* Interpretacija */}
        <div className="rounded-lg bg-white/[0.03] border border-white/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-green-light/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-green-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-green-light/80 font-semibold text-xs tracking-wider uppercase">Interpretacija</span>
          </div>
          <p className="text-white/60 text-sm leading-relaxed" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
            {interpretation}
          </p>
        </div>

        {/* UX Implikacija */}
        <div className="rounded-lg bg-white/[0.03] border border-white/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-[#6366F1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-[#6366F1]/80 font-semibold text-xs tracking-wider uppercase">UX Implikacija</span>
          </div>
          <p className="text-white/60 text-sm leading-relaxed" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
            {uxImplication}
          </p>
        </div>
      </div>
    </div>
  );
}
