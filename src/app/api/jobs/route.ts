import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseResume } from '@/lib/parser';

// GET - List all jobs
export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { candidates: true },
        },
      },
    });
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

// POST - Create a new job
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    let description = formData.get('description') as string;
    const jdFile = formData.get('jdFile') as File | null;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Job title is required' }, { status: 400 });
    }

    // If a JD file was uploaded, parse it for the description
    if (jdFile && jdFile.size > 0) {
      const buffer = Buffer.from(await jdFile.arrayBuffer());
      const parseResult = await parseResume(buffer, jdFile.name);
      if (parseResult.success) {
        description = parseResult.text;
      }
    }

    if (!description?.trim()) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }

    const job = await prisma.job.create({
      data: {
        title: title.trim(),
        description: description.trim(),
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
