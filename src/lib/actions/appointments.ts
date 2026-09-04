"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "../prisma";
import { AppointmentStatus, Prisma } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

// Shared return type used across the app for a transformed appointment
export type TransformedAppointment = {
  id: string;
  date: string; // ISO date string "YYYY-MM-DD"
  time: string;
  duration: number;
  status: AppointmentStatus;
  notes: string | null;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  doctorId: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  doctorImageUrl: string;
};

// Internal type for the raw Prisma appointment with user+doctor joined
type AppointmentWithRelations = Prisma.AppointmentGetPayload<{
  include: {
    user: { select: { firstName: true; lastName: true; email: true } };
    doctor: { select: { name: true; imageUrl: true } };
  };
}>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function transformAppointment(appointment: AppointmentWithRelations): TransformedAppointment {
  return {
    id: appointment.id,
    date: appointment.date.toISOString().split("T")[0],
    time: appointment.time,
    duration: appointment.duration,
    status: appointment.status,
    notes: appointment.notes,
    reason: appointment.reason,
    createdAt: appointment.createdAt,
    updatedAt: appointment.updatedAt,
    userId: appointment.userId,
    doctorId: appointment.doctorId,
    patientName: `${appointment.user.firstName || ""} ${appointment.user.lastName || ""}`.trim(),
    patientEmail: appointment.user.email,
    doctorName: appointment.doctor.name,
    doctorImageUrl: appointment.doctor.imageUrl || "",
  };
}

/** Resolves Clerk auth to the DB user record in one call. Throws if not authenticated. */
async function getAuthenticatedDbUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("You must be logged in");
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) throw new Error("User not found. Please ensure your account is properly set up.");
  return user;
}

/** Returns true if the currently-authenticated Clerk user is the configured admin. */
async function isAdminUser(): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;
  const clerkUser = await currentUser();
  if (!clerkUser) return false;
  const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
  return userEmail === adminEmail;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/** Admin: fetch all appointments (limited to 100 most recent). */
export async function getAppointments() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        doctor: { select: { name: true, imageUrl: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100, // prevent unbounded fetch
    });

    return appointments.map(transformAppointment);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw new Error("Failed to fetch appointments");
  }
}

/** User: fetch all appointments for the currently authenticated user. */
export async function getUserAppointments() {
  try {
    const user = await getAuthenticatedDbUser();

    const appointments = await prisma.appointment.findMany({
      where: { userId: user.id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        doctor: { select: { name: true, imageUrl: true } },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    return appointments.map(transformAppointment);
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    throw new Error("Failed to fetch user appointments");
  }
}

/** User: get appointment count stats for the currently authenticated user. */
export async function getUserAppointmentStats() {
  try {
    const user = await getAuthenticatedDbUser();

    // Run both counts in parallel — no sequential dependency
    const [totalCount, completedCount] = await Promise.all([
      prisma.appointment.count({ where: { userId: user.id } }),
      prisma.appointment.count({ where: { userId: user.id, status: "COMPLETED" } }),
    ]);

    return {
      totalAppointments: totalCount,
      completedAppointments: completedCount,
    };
  } catch (error) {
    console.error("Error fetching user appointment stats:", error);
    return { totalAppointments: 0, completedAppointments: 0 };
  }
}

/** Public (server only): get booked time slots for a doctor on a given date. */
export async function getBookedTimeSlots(doctorId: string, date: string) {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: new Date(date),
        status: {
          in: ["CONFIRMED", "COMPLETED"], // both statuses block the slot
        },
      },
      select: { time: true },
    });

    return appointments.map((a) => a.time);
  } catch (error) {
    console.error("Error fetching booked time slots:", error);
    return [];
  }
}

interface BookAppointmentInput {
  doctorId: string;
  date: string;
  time: string;
  reason?: string;
}

const VALID_TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
];

/** User: book an appointment. Validates input server-side. */
export async function bookAppointment(input: BookAppointmentInput) {
  try {
    const user = await getAuthenticatedDbUser();

    // Server-side input validation
    if (!input.doctorId || !input.date || !input.time) {
      throw new Error("Doctor, date, and time are required");
    }

    // Validate time slot is one of the allowed values
    if (!VALID_TIME_SLOTS.includes(input.time)) {
      throw new Error("Invalid time slot selected");
    }

    // Validate date is not in the past
    const appointmentDate = new Date(input.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDate < today) {
      throw new Error("Cannot book an appointment in the past");
    }

    // Verify the doctor exists and is active
    const doctor = await prisma.doctor.findUnique({
      where: { id: input.doctorId, isActive: true },
      select: { id: true },
    });
    if (!doctor) throw new Error("Doctor not found or is not available");

    // Check the slot is still available (race-condition guard)
    const existingSlot = await prisma.appointment.findFirst({
      where: {
        doctorId: input.doctorId,
        date: appointmentDate,
        time: input.time,
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
    });
    if (existingSlot) throw new Error("This time slot has just been booked. Please choose another.");

    const appointment = await prisma.appointment.create({
      data: {
        userId: user.id,
        doctorId: input.doctorId,
        date: appointmentDate,
        time: input.time,
        reason: input.reason || "General consultation",
        status: "CONFIRMED",
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
        doctor: { select: { name: true, imageUrl: true } },
      },
    });

    return transformAppointment(appointment);
  } catch (error) {
    console.error("Error booking appointment:", error);
    if (error instanceof Error) throw error; // re-throw known errors with their message
    throw new Error("Failed to book appointment. Please try again later.");
  }
}

/** Admin only: update the status of any appointment. */
export async function updateAppointmentStatus(input: { id: string; status: AppointmentStatus }) {
  try {
    // Authorization: only admins can update appointment status
    const admin = await isAdminUser();
    if (!admin) throw new Error("Unauthorized: admin access required");

    const appointment = await prisma.appointment.update({
      where: { id: input.id },
      data: { status: input.status },
    });

    return appointment;
  } catch (error) {
    console.error("Error updating appointment:", error);
    if (error instanceof Error) throw error;
    throw new Error("Failed to update appointment");
  }
}