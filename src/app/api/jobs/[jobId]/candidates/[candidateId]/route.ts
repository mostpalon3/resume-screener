import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string; candidateId: string }> }
) {
  try {
    const { jobId, candidateId } = await params;
    
    const candidate = await prisma.candidate.findFirst({
      where: {
        id: candidateId,
        jobId: jobId,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Don't send the binary resume data in JSON
    const { resumeData: _, ...candidateWithoutData } = candidate;
    return NextResponse.json(candidateWithoutData);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    return NextResponse.json({ error: 'Failed to fetch candidate' }, { status: 500 });
  }
}
