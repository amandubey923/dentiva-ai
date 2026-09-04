"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../prisma";

/**
 * Synchronizes the currently-authenticated Clerk user to the database.
 * If the user already exists in the DB, returns the existing record.
 * If not, creates a new user record.
 *
 * Safe to call only when the user is authenticated.
 */
export async function syncUser() {
  try {
    const user = await currentUser();
    if (!user) return;

    // User already exists — nothing to do
    const existingUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (existingUser) return existingUser;

    // Create new user record
    const dbUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses[0].emailAddress,
        phone: user.phoneNumbers[0]?.phoneNumber,
      },
    });

    return dbUser;
  } catch (error) {
    console.error("Error in syncUser server action", error);
  }
}