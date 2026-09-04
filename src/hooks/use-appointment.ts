"use client";

import {
  bookAppointment,
  getAppointments,
  getBookedTimeSlots,
  getUserAppointments,
  updateAppointmentStatus,
} from "@/lib/actions/appointments";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** Admin: get all appointments (limited 100). */
export function useGetAppointments() {
  return useQuery({
    queryKey: ["getAppointments"],
    queryFn: getAppointments,
  });
}

/**
 * Get booked time slots for a specific doctor on a specific date.
 * IMPORTANT: doctorId and date are part of the query key so the cache
 * is keyed per-doctor-per-date, preventing stale slot data when
 * switching doctors or dates.
 */
export function useBookedTimeSlots(doctorId: string, date: string) {
  return useQuery({
    queryKey: ["getBookedTimeSlots", doctorId, date], // FIX: include doctorId + date
    queryFn: () => getBookedTimeSlots(doctorId, date),
    enabled: !!doctorId && !!date, // only run when both are provided
  });
}

/** Book an appointment and invalidate relevant caches on success. */
export function useBookAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookAppointment,
    onSuccess: (_data, variables) => {
      // Refresh the user's appointment list
      queryClient.invalidateQueries({ queryKey: ["getUserAppointments"] });
      // Invalidate the booked slots for the specific doctor + date so
      // the newly booked slot shows as unavailable immediately
      queryClient.invalidateQueries({
        queryKey: ["getBookedTimeSlots", variables.doctorId, variables.date],
      });
      // Also invalidate all slot queries for this doctor (other dates may be cached)
      queryClient.invalidateQueries({ queryKey: ["getBookedTimeSlots"] });
    },
    onError: (error) => console.error("Failed to book appointment:", error),
  });
}

/** User: get all appointments for the current user. */
export function useUserAppointments() {
  return useQuery({
    queryKey: ["getUserAppointments"],
    queryFn: getUserAppointments,
  });
}

/** Admin: toggle appointment status between CONFIRMED and COMPLETED. */
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAppointmentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAppointments"] });
    },
    onError: (error) => console.error("Failed to update appointment:", error),
  });
}