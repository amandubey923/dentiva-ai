import { useGetAppointments, useUpdateAppointmentStatus } from "@/hooks/use-appointment";
import type { TransformedAppointment } from "@/lib/actions/appointments";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Calendar } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";

function RecentAppointments() {
  const { data: appointments = [] } = useGetAppointments();
  const updateAppointmentMutation = useUpdateAppointmentStatus();

  const handleToggleAppointmentStatus = (appointmentId: string) => {
    const appointment = appointments.find((apt: TransformedAppointment) => apt.id === appointmentId);
    const newStatus = appointment?.status === "CONFIRMED" ? "COMPLETED" : "CONFIRMED";
    updateAppointmentMutation.mutate({ id: appointmentId, status: newStatus });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Confirmed</Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Recent Appointments
        </CardTitle>
        <CardDescription>Monitor and manage all patient appointments</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {appointments.map((appointment: TransformedAppointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{appointment.patientName}</div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.patientEmail}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-medium">{appointment.doctorName}</div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <div>{appointment.date}</div>
                      <div className="text-sm text-muted-foreground">{appointment.time}</div>
                    </div>
                  </TableCell>

                  <TableCell>{appointment.reason}</TableCell>

                  <TableCell>{getStatusBadge(appointment.status)}</TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleAppointmentStatus(appointment.id)}
                      disabled={updateAppointmentMutation.isPending}
                    >
                      {appointment.status === "CONFIRMED" ? "Complete" : "Reopen"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default RecentAppointments;