import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { scoreAndRankResumes } from '@/lib/scorer';

type AnalyzeCandidate = {
  id: string;
  resumeText: string;
  experience: string | null;
  education: string | null;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    
    // Get job and candidates
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { candidates: true },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.candidates.length === 0) {
      return NextResponse.json({ error: 'No candidates to analyze' }, { status: 400 });
    }

    const candidates = job.candidates as AnalyzeCandidate[];

    // Score and rank all candidates
    const rankedResults = await scoreAndRankResumes(
      candidates.map((c) => ({
        id: c.id,
        text: c.resumeText,
        experience: c.experience,
        education: c.education,
      })),
      job.description
    );

    // Update each candidate in the database
    const updates = rankedResults.map((r) =>
      prisma.candidate.update({
        where: { id: r.id },
        data: {
          matchScore: r.result.totalScore,
          rank: r.rank,
          skillsMatched: r.result.matchedSkills,
          skillsMissing: r.result.missingSkills,
          scoreBreakdown: r.result.breakdown as object,
        },
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({
      analyzed: rankedResults.length,
      topScore: rankedResults[0]?.result.totalScore || 0,
      averageScore: Math.round(
        rankedResults.reduce((sum, r) => sum + r.result.totalScore, 0) / rankedResults.length
      ),
    });
  } catch (error) {
    console.error('Error analyzing candidates:', error);
    return NextResponse.json({ error: 'Failed to analyze candidates' }, { status: 500 });
  }
}
