import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  try {
    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }

    // Remove the availability slot
    const found = await prisma.tutorAvailability.findFirst({
      where: { id: eventId },
    });

    if (!found) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

  await prisma.tutorAvailability.update({
    where: { id: found.id },
    data: { start_date: null, end_date: null, start_time: null, end_time: null },
  });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[TA_DELETE] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}