import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';

type ExportCandidate = {
  name: string;
  email: string | null;
  phone: string | null;
  resumeFileName: string;
  matchScore: number;
  rank: number;
  skillsMatched: unknown;
  skillsMissing: unknown;
  education: string | null;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const candidates = await prisma.candidate.findMany({
      where: { jobId },
      orderBy: { rank: 'asc' },
      select: {
        name: true,
        email: true,
        phone: true,
        resumeFileName: true,
        matchScore: true,
        rank: true,
        skillsMatched: true,
        skillsMissing: true,
        education: true,
      },
    });

    const exportCandidates = candidates as ExportCandidate[];

    // Transform data for export
    const exportData = exportCandidates.map((c) => ({
      'Rank': c.rank,
      'Name': c.name,
      'Email': c.email || 'N/A',
      'Phone': c.phone || 'N/A',
      'Match Score': c.matchScore,
      'Resume File': c.resumeFileName,
      'Matched Skills': (c.skillsMatched as string[])?.join(', ') || '',
      'Missing Skills': (c.skillsMissing as string[])?.join(', ') || '',
      'Education': c.education || 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates');

    // Set column widths
    worksheet['!cols'] = [
      { wch: 6 }, { wch: 25 }, { wch: 30 }, { wch: 18 },
      { wch: 12 }, { wch: 30 }, { wch: 50 }, { wch: 50 }, { wch: 40 },
    ];

    if (format === 'xlsx') {
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${job.title}-candidates.xlsx"`,
        },
      });
    } else {
      const csvContent = XLSX.utils.sheet_to_csv(worksheet);
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${job.title}-candidates.csv"`,
        },
      });
    }
  } catch (error) {
    console.error('Error exporting candidates:', error);
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 });
  }
}
