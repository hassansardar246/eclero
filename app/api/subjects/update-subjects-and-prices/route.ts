import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, subjects } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get the profile ID
    const profile = await prisma.profiles.findUnique({
      where: { email },
      select: { id: true }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (!subjects || !Array.isArray(subjects)) {
      return NextResponse.json(
        { error: 'Subjects must be provided as an array' },
        { status: 400 }
      );
    }

    // Filter valid subjects with non-empty IDs
    const validSubjects = subjects.filter(s => s?.id?.trim());

    if (validSubjects.length === 0) {
      return NextResponse.json(
        { error: 'No valid subjects provided' },
        { status: 400 }
      );
    }

    // Use a transaction for data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get existing subject connections
      const existingConnections = await tx.profilesOnSubjects.findMany({
        where: { profile_id: profile.id }
      });

      // Extract IDs of new subjects
      const newSubjectIds = validSubjects.map(s => s.id.trim());

      // Delete subjects that are no longer in the list
      const subjectsToDelete = existingConnections.filter(
        connection => !newSubjectIds.includes(connection.subject_id)
      );

      if (subjectsToDelete.length > 0) {
        await tx.profilesOnSubjects.deleteMany({
          where: {
            profile_id: profile.id,
            subject_id: {
              in: subjectsToDelete.map(s => s.subject_id)
            }
          }
        });
      }

      // Create/update operations for each subject
      const upsertOperations = validSubjects.map(subject => {
        const subjectId = subject.id.trim();
        const price = Number(subject.price) || 0;
        const duration = Number(subject.duration) || 0;

        return tx.profilesOnSubjects.upsert({
          where: {
            profile_id_subject_id: {
              profile_id: profile.id,
              subject_id: subjectId
            }
          },
          update: {
            price,
            duration
          },
          create: {
            profile_id: profile.id,
            subject_id: subjectId,
            price,
            duration
          }
        });
      });

      // Execute all upsert operations
      await Promise.all(upsertOperations);

      // Return updated profile with subjects
      return tx.profiles.findUnique({
        where: { id: profile.id },
        include: {
          subjects: {
            include: {
              Subjects: true
            }
          }
        }
      });
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('[PROFILE_UPDATE] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}