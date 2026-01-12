import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email,subjects } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 });
    }

      // Handle subjects - first get the profile ID
      const profile = await prisma.profiles.findUnique({
        where: { email },
        select: { id: true }
      });

      if (profile && subjects && Array.isArray(subjects)) {
        for (const s of subjects) {
          if (s.id.trim()) {
if (profile && subjects && Array.isArray(subjects)) {
  for (const s of subjects) {
    if (s.id.trim()) {
      // First, try to find existing record
      const existing = await prisma.tutorAvailability.findFirst({
        where: {
          tutor_id: profile.id,
          subject_id: s.id.trim()
        }
      });

      if (existing) {
        // Update existing
        await prisma.tutorAvailability.update({
          where: {
            id: existing.id
          },
          data: {
            subject: s.name,
            price: s.price * 1,
            duration: s.duration * 1,
            updated_at: new Date()
          }
        });
      } else {
        await prisma.tutorAvailability.create({
          data: {
            tutor_id: profile.id,
            subject_id: s.id.trim(),
            subject: s.name,
            price: s.price * 1,
            duration: s.duration * 1,
          }
        });
      }
    }
  }
}
          }
        }
      }

    return new Response(JSON.stringify(profile), { status: 200 });
  } catch (error: any) {
    console.error('[PROFILE_UPDATE] Error:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      details: error?.message || error
    }), { status: 500 });
  }
}