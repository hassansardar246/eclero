import { prisma } from "@/lib/prisma";
import { NextRequest } from 'next/server';


export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[PROFILE_UPDATE] Received body:', body);
    const { email } = body;
    const result = await prisma.$transaction(async (tx:any) => {
      // Update the main profile
      const updatedProfile = await tx.profiles.update({
        where: { email },
        data: {
          profile_setup: true,
        },
      });
    });

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error: any) {
    console.error('[PROFILE_UPDATE] Error:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      details: error?.message || error
    }), { status: 500 });
  }
}