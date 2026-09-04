import { format } from "date-fns";
import Image from "next/image";
import { CalendarIcon, ClockIcon } from "lucide-react";
import type { TransformedAppointment } from "@/lib/actions/appointments";

interface UpcomingAppointmentsProps {
  appointments: TransformedAppointment[];
}

export function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  if (appointments.length === 0) return null;

  return (
    <div className="mb-8 max-w-7xl mx-auto px-6 py-8">
      <h2 className="text-xl font-semibold mb-4">Your Upcoming Appointments</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="bg-card border rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                {appointment.doctorImageUrl ? (
                  <Image
                    src={appointment.doctorImageUrl}
                    alt={appointment.doctorName}
                    width={40}
                    height={40}
                    className="size-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="size-10 bg-primary/20 rounded-full" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{appointment.doctorName}</p>
                <p className="text-muted-foreground text-xs">{appointment.reason}</p>
              </div>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarIcon className="size-3.5 text-primary shrink-0" />
                <span>{format(new Date(appointment.date), "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ClockIcon className="size-3.5 text-primary shrink-0" />
                <span>{appointment.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

