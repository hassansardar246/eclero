import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email,subjects } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 });
    }

    // Start a transaction to handle the profile update and subject relationships
    const result = await prisma.$transaction(async (tx:any) => {

      // Handle subjects - first get the profile ID
      const profile = await tx.profiles.findUnique({
        where: { email },
        select: { id: true }
      });

      if (profile && subjects && Array.isArray(subjects)) {
        // Clear existing subject relationships
        await tx.profilesOnSubjects.deleteMany({
          where: { profile_id: profile.id }
        });

        // Create new subject relationships
        for (const s of subjects) {
          if (s.id.trim()) {
            await tx.profilesOnSubjects.create({
              data: {
                profile_id: profile.id,
                subject_id: s.id.trim()
              }
            });
          }
        }
      }

      return profile;
    });

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      details: error?.message || error
    }), { status: 500 });
  }
}