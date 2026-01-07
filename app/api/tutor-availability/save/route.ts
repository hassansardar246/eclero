import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type SlotInput = { dayOfWeek: number; start: string; end: string };

function isValidTimeString(t: string) {
  return /^\d{2}:\d{2}$/.test(t);
}

function toTimeDate(time: string): Date {
  // Expect HH:mm, store as 1970-01-01T..Z to preserve time component only
  return new Date(`1970-01-01T${time}:00.000Z`);
}

export async function POST(req: Request) {
  try {
    const { email, newEvent, id } = await req.json();
    console.log('[TUTOR_AVAILABILITY_SAVE] Received request:', { newEvent});
    // return;

    if (!email && !newEvent) {
      return NextResponse.json({ error: 'userEmail or tutorId is required' }, { status: 400 });
    }

    // Resolve tutor id
    let resolvedTutorId: any;
    if (email) {
      const profile = await prisma.profiles.findUnique({ where: { email: email }, select: { id: true } });
      if (!profile) return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
      resolvedTutorId = profile.id;
    }
    if (!resolvedTutorId) {
      return NextResponse.json({ error: 'Could not resolve tutorId' }, { status: 400 });
    }

    // Validate slots
    // const toCreate: SlotInput[] = [];
    // for (const s of slots as SlotInput[]) {
    //   if (typeof s.dayOfWeek !== 'number' || s.dayOfWeek < 0 || s.dayOfWeek > 6) {
    //     return NextResponse.json({ error: 'Invalid dayOfWeek' }, { status: 400 });
    //   }
    //   if (!isValidTimeString(s.start) || !isValidTimeString(s.end)) {
    //     return NextResponse.json({ error: 'Invalid time format (HH:mm expected)' }, { status: 400 });
    //   }
    //   if (s.start === s.end) continue;
    //   toCreate.push(s);
    // }

    // Replace existing active slots
    await prisma.tutorAvailability.create({
  data: {
    tutor_id: resolvedTutorId,
    
    // Day of week from the start date (adjust based on your system)
    // getUTCDay() returns 0-6 (Sun-Sat)
    day_of_week: new Date(newEvent.start).getUTCDay() + 1, // Convert to 1-7 (Mon-Sun)
    
    // Convert time strings to Date objects for @db.Time fields
    start_time: convertTimeStringToDate(newEvent.start_time), // "10:00" → Time object
    end_time: convertTimeStringToDate(newEvent.end_time),     // "10:30" → Time object
    
    // Optional date fields - use the full datetime
    start_date: new Date(newEvent.start),  // 2026-01-06T05:00:00.000Z
    end_date: new Date(newEvent.end),      // 2026-01-07T05:30:00.000Z
    
    // Other fields
    price: parseFloat(newEvent.price) || 0,
    subject: newEvent.title,
    // If you have subject_id, add it. Otherwise store title:
    // subject_id: newEvent.subjectId,
    is_active: true,
    timezone: "UTC" // Or use user's timezone
  }
});

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[TA_SAVE] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error?.message || error }, { status: 500 });
  }
}

function convertTimeStringToDate(timeString:any) {
  // Handle formats: "10:00", "10:00:00", "10:00 AM", etc.
  const timeParts = timeString.split(':');
  const hours = parseInt(timeParts[0]);
  const minutes = parseInt(timeParts[1]);
  const seconds = timeParts[2] ? parseInt(timeParts[2]) : 0;
  
  // Create a date with the time portion (date doesn't matter for @db.Time)
  return new Date(Date.UTC(1970, 0, 1, hours, minutes, seconds));
}