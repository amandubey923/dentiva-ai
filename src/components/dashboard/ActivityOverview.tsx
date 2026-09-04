import DentalHealthOverview from "./DentalHealthOverview";
import NextAppointment from "./NextAppointment";
import type { TransformedAppointment } from "@/lib/actions/appointments";

interface ActivityOverviewProps {
  totalAppointments: number;
  completedAppointments: number;
  memberSince: Date;
  appointments: TransformedAppointment[];
}

function ActivityOverview({
  totalAppointments,
  completedAppointments,
  memberSince,
  appointments,
}: ActivityOverviewProps) {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <DentalHealthOverview
        totalAppointments={totalAppointments}
        completedAppointments={completedAppointments}
        memberSince={memberSince}
      />
      <NextAppointment appointments={appointments} />
    </div>
  );
}

export default ActivityOverview;