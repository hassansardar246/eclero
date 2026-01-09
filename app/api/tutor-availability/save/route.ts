import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// Build a Date from date (YYYY-MM-DD) and time (HH:mm) in local time to preserve wall clock

// For @db.Time fields we can still store as UTC time-only
function toTimeDate(time: string): Date {
  const [hh, mm] = time.split(":").map(Number);
  return new Date(Date.UTC(1970, 0, 1, hh, mm, 0, 0));
}

export async function POST(req: Request) {
  try {
    const { email, newEvent } = await req.json();

    if (!email && !newEvent) {
      return NextResponse.json({ error: "userEmail or tutorId is required" }, { status: 400 });
    }

    // Resolve tutor id
    let resolvedTutorId: any;
    if (email) {
      const profile = await prisma.profiles.findUnique({
        where: { email },
        select: { id: true },
      });
      if (!profile) return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
      resolvedTutorId = profile.id;
    }
    if (!resolvedTutorId) {
      return NextResponse.json({ error: "Could not resolve tutorId" }, { status: 400 });
    }

    // Build full datetime from the provided date + time strings
// Remove the 'Z' to store as local time
const startDate = new Date(`${newEvent.startDate}T${newEvent.start_time}:00`);
const endDate = new Date(`${newEvent.endDate}T${newEvent.end_time}:00`);
    console.log('startDate',startDate)
    console.log('endDate',endDate);

    await prisma.tutorAvailability.create({
      data: {
        tutor_id: resolvedTutorId,
        day_of_week: startDate.getDay() + 1, // 1-7 Mon-Sun
        start_time: toTimeDate(newEvent.start_time),
        end_time: toTimeDate(newEvent.end_time),
        start_date: startDate, // includes selected time
        end_date: endDate,     // includes selected time
        price: parseFloat(newEvent.price) || 0,
        subject: newEvent.subject, // text subject name
        subject_id: newEvent.subject_id, // if you pass id separately
        is_active: true,
        timezone: newEvent.timezone || "UTC",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[TA_SAVE] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error?.message || error },
      { status: 500 }
    );
  }
}