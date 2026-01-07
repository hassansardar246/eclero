import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { event } = body;

    if (!event) {
      return new Response(JSON.stringify({ error: 'no Event found' }), { status: 400 });
    }
    console.log('event',body)
    return;

    // console.log('[PROFILE_UPDATE] Profile updated successfully:', result);

    // return new Response(JSON.stringify(result), { status: 200 });
  } catch (error: any) {
    console.error('[PROFILE_UPDATE] Error:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      details: error?.message || error
    }), { status: 500 });
  }
}