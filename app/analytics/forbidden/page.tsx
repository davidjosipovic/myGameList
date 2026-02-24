'use client';

import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red/10 border border-red/30 flex items-center justify-center">
          <svg className="w-10 h-10 text-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-white mb-2">403</h1>
        <h2 className="text-xl font-semibold text-red mb-4">Pristup odbijen</h2>
        <p className="text-white/60 mb-8 leading-relaxed">
          Analytics dashboard je dostupan samo administratorima.
          Ako smatraš da bi trebao imati pristup, kontaktiraj admina.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-green-light text-grey-dark font-bold px-6 py-3 rounded-xl hover:bg-green-dark transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Natrag na početnu
        </Link>
      </div>
    </div>
  );
}
