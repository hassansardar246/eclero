import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  try {
    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }

    // Remove the availability slot
    const deleted = await prisma.tutorAvailability.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ success: true, deleted });
  } catch (error: any) {
    console.error("[TA_DELETE] Error:", error);
    // Prisma throws if not found; surface as 404
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal Server Error", details: error?.message || error },
      { status: 500 }
    );
  }
}