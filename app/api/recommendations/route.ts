import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getRecommendations } from '@/lib/recommender';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized – please log in to get recommendations.' },
        { status: 401 },
      );
    }

    // Dohvati userId iz baze po emailu
    const { default: prisma } = await import('@/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const recommendations = await getRecommendations(user.id, 10);

    return NextResponse.json(recommendations);
  } catch (error: any) {
    console.error('[API] /recommendations error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
