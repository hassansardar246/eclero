import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('[USERS_GET] Fetching all users with profiles');

const users = await prisma.profiles.findMany({
  where: {
    role: {
      in: ['student', 'tutor']
    }
  },
  orderBy: [
    { created_at: 'desc' },
  ]
});

    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error: any) {
    console.error('[USERS_GET] Error:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      details: error?.message || error
    }), { status: 500 });
  }
}