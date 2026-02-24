import { NextResponse } from 'next/server';
import { fetchActiveUsersOverTime, fetchUsersByDevice } from '@/lib/google-analytics';
import { calculateFunnel, calculateRetention } from '@/lib/behavioral-analytics';

/**
 * GET /api/analytics
 *
 * Vraća sve analitičke podatke za analytics dashboard.
 * `meta.sources` indicira izvor podataka za svaku sekciju:
 *   'live'       – GA4 Realtime API (odmah, bez delay-a)
 *   'historical' – GA4 runReport (30 dana, 24-48h delay)
 *   'mock'       – simulirani podaci
 */
export async function GET() {
  try {
    const [activeUsersResult, devicesResult, funnelResult, retention] = await Promise.all([
      fetchActiveUsersOverTime(),
      fetchUsersByDevice(),
      calculateFunnel(),
      calculateRetention(),
    ]);

    const activeUsers = (activeUsersResult.result.rows || []).map((row) => ({
      date: row.dimensionValues[0].value,
      activeUsers: parseInt(row.metricValues[0].value, 10),
      sessions: parseInt(row.metricValues[1].value, 10),
      eventCount: parseInt(row.metricValues[2]?.value ?? '0', 10),
    }));

    const devices = (devicesResult.result.rows || []).map((row) => ({
      device: row.dimensionValues[0].value,
      activeUsers: parseInt(row.metricValues[0].value, 10),
      sessions: parseInt(row.metricValues[1].value, 10),
    }));

    return NextResponse.json({
      activeUsers,
      devices,
      funnel: funnelResult.funnel,
      retention,
      meta: {
        sources: {
          activeUsers: activeUsersResult.source,
          devices: devicesResult.source,
          funnel: funnelResult.source,
          retention: 'database' as const,
        },
      },
    });
  } catch (error: any) {
    console.error('[API] /analytics error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
