"use client";

import { createDoctor, getAvailableDoctors, getDoctors, updateDoctor } from "@/lib/actions/doctors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetDoctors() {
  const result = useQuery({
    queryKey: ["getDoctors"],
    queryFn: getDoctors,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });

  return result;
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();

  const result = useMutation({
    mutationFn: createDoctor,
    onSuccess: () => {
      // invalidate related queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["getDoctors"] });
      queryClient.invalidateQueries({ queryKey: ["getAvailableDoctors"] });
    },
    onError: (error) => console.error("Error while creating a doctor:", error),
  });

  return result;
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getDoctors"] });
      queryClient.invalidateQueries({ queryKey: ["getAvailableDoctors"] });
    },
    onError: (error) => console.error("Failed to update doctor:", error),
  });
}

// get available doctors for appointments
export function useAvailableDoctors() {
  const result = useQuery({
    queryKey: ["getAvailableDoctors"],
    queryFn: getAvailableDoctors,
    staleTime: 5 * 60 * 1000, // 5 minutes - doctors list is stable during booking
  });

  return result;
}