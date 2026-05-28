import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const { searchParams } = new URL(request.url);
    
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'rank';
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';

    const where: Record<string, unknown> = { jobId };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { resumeFileName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Record<string, string> = {};
    if (sortBy === 'score') {
      orderBy.matchScore = sortOrder === 'asc' ? 'asc' : 'desc';
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else {
      orderBy.rank = 'asc';
    }

    const candidates = await prisma.candidate.findMany({
      where,
      orderBy,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        resumeFileName: true,
        matchScore: true,
        rank: true,
        skillsMatched: true,
        skillsMissing: true,
        experience: true,
        education: true,
        scoreBreakdown: true,
        createdAt: true,
      },
    });

    return NextResponse.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
  }
}
