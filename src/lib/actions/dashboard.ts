"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { TransformedAppointment } from "@/lib/actions/appointments";
import { AppointmentStatus } from "@prisma/client";

export type DashboardData = {
  user: {
    firstName: string | null;
    lastName: string | null;
    createdAt: Date;
  };
  stats: {
    totalAppointments: number;
    completedAppointments: number;
  };
  appointments: TransformedAppointment[];
};

/**
 * Single optimized server action for the dashboard page.
 *
 * Reduces the original 4 Clerk calls + 5 DB queries down to:
 * - 1 Clerk auth() call
 * - 1 Clerk currentUser() call
 * - 1 DB user lookup
 * - 2 DB queries (count + findMany) run in parallel
 *
 * Total: 2 Clerk calls + 3 DB queries, with parallelism.
 */
export async function getDashboardData(): Promise<DashboardData> {
  // Single Clerk auth call
  const { userId } = await auth();
  if (!userId) throw new Error("You must be logged in");

  // Resolve Clerk user (for createdAt / display name) and DB user in parallel
  const [clerkUser, dbUser] = await Promise.all([
    currentUser(),
    prisma.user.findUnique({ where: { clerkId: userId } }),
  ]);

  if (!dbUser) throw new Error("User not found. Please ensure your account is properly set up.");
  if (!clerkUser) throw new Error("Clerk user not found");

  // Fetch appointment count stats and appointment list in parallel
  const [totalCount, completedCount, appointments] = await Promise.all([
    prisma.appointment.count({ where: { userId: dbUser.id } }),
    prisma.appointment.count({ where: { userId: dbUser.id, status: AppointmentStatus.COMPLETED } }),
    prisma.appointment.findMany({
      where: { userId: dbUser.id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        doctor: { select: { name: true, imageUrl: true } },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    }),
  ]);

  // Transform appointments to the shared format
  const transformedAppointments: TransformedAppointment[] = appointments.map((a) => ({
    id: a.id,
    date: a.date.toISOString().split("T")[0],
    time: a.time,
    duration: a.duration,
    status: a.status,
    notes: a.notes,
    reason: a.reason,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    userId: a.userId,
    doctorId: a.doctorId,
    patientName: `${a.user.firstName || ""} ${a.user.lastName || ""}`.trim(),
    patientEmail: a.user.email,
    doctorName: a.doctor.name,
    doctorImageUrl: a.doctor.imageUrl || "",
  }));

  return {
    user: {
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      createdAt: new Date(clerkUser.createdAt),
    },
    stats: {
      totalAppointments: totalCount,
      completedAppointments: completedCount,
    },
    appointments: transformedAppointments,
  };
}
