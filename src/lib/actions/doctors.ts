"use server";

import { Gender, Prisma } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../prisma";
import { generateAvatar } from "../utils";
import { revalidatePath } from "next/cache";

async function verifyAdmin(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) throw new Error("Admin email is not configured");

  const user = await currentUser();
  if (!user) throw new Error("Unauthorized: authentication required");

  const userEmail = user.emailAddresses[0]?.emailAddress;
  if (userEmail !== adminEmail) {
    throw new Error("Forbidden: admin access required");
  }
}

export async function getDoctors() {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        _count: { select: { appointments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return doctors.map((doctor) => ({
      ...doctor,
      appointmentCount: doctor._count.appointments,
    }));
  } catch (error) {
    console.error("Error fetching doctors:", error);
    throw new Error("Failed to fetch doctors");
  }
}

interface CreateDoctorInput {
  name: string;
  email: string;
  phone: string;
  speciality: string;
  gender: Gender;
  isActive: boolean;
}

export async function createDoctor(input: CreateDoctorInput) {
  try {
    await verifyAdmin();

    if (!input.name || !input.email) throw new Error("Name and email are required");

    const doctor = await prisma.doctor.create({
      data: {
        ...input,
        imageUrl: generateAvatar(input.name, input.gender),
      },
    });

    revalidatePath("/admin");

    return doctor;
  } catch (error: unknown) {
    console.error("Error creating doctor:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("A doctor with this email already exists");
    }

    if (error instanceof Error) throw error;
    throw new Error("Failed to create doctor");
  }
}

interface UpdateDoctorInput extends Partial<CreateDoctorInput> {
  id: string;
}

export async function updateDoctor(input: UpdateDoctorInput) {
  try {
    await verifyAdmin();

    if (!input.name || !input.email) throw new Error("Name and email are required");

    const currentDoctor = await prisma.doctor.findUnique({
      where: { id: input.id },
      select: { email: true },
    });

    if (!currentDoctor) throw new Error("Doctor not found");

    if (input.email !== currentDoctor.email) {
      const existingDoctor = await prisma.doctor.findUnique({
        where: { email: input.email },
      });

      if (existingDoctor) {
        throw new Error("A doctor with this email already exists");
      }
    }

    const doctor = await prisma.doctor.update({
      where: { id: input.id },
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        speciality: input.speciality,
        gender: input.gender,
        isActive: input.isActive,
      },
    });

    revalidatePath("/admin");

    return doctor;
  } catch (error) {
    console.error("Error updating doctor:", error);
    if (error instanceof Error) throw error;
    throw new Error("Failed to update doctor");
  }
}

export async function getAvailableDoctors() {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { appointments: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return doctors.map((doctor) => ({
      ...doctor,
      appointmentCount: doctor._count.appointments,
    }));
  } catch (error) {
    console.error("Error fetching available doctors:", error);
    throw new Error("Failed to fetch available doctors");
  }
}