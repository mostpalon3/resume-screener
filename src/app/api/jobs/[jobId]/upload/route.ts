import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseResume } from '@/lib/parser';
import { extractInfo } from '@/lib/extractor';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    
    // Verify job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const files = formData.getAll('resumes') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (const file of files) {
      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push({ file: file.name, error: `Unsupported file type: ${file.type}` });
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push({ file: file.name, error: 'File too large (max 10MB)' });
        continue;
      }

      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const parseResult = await parseResume(buffer, file.name);

        if (!parseResult.success) {
          errors.push({ file: file.name, error: parseResult.error || 'Failed to parse' });
          continue;
        }

        // Extract structured info
        const info = extractInfo(parseResult.text);

        // Save candidate to database
        const candidate = await prisma.candidate.create({
          data: {
            name: info.name,
            email: info.email,
            phone: info.phone,
            resumeFileName: file.name,
            resumeText: parseResult.text,
            resumeData: buffer,
            experience: info.experience,
            education: info.education,
            summary: info.summary,
            skillsMatched: info.skills,
            jobId: jobId,
          },
        });

        results.push({
          id: candidate.id,
          name: candidate.name,
          fileName: file.name,
          status: 'success',
        });
      } catch (err) {
        console.error(`Error processing ${file.name}:`, err);
        errors.push({ file: file.name, error: 'Processing failed' });
      }
    }

    return NextResponse.json({
      uploaded: results.length,
      failed: errors.length,
      results,
      errors,
    });
  } catch (error) {
    console.error('Error uploading resumes:', error);
    return NextResponse.json({ error: 'Failed to upload resumes' }, { status: 500 });
  }
}
