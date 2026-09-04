import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface AppointmentConfirmationEmailProps {
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  duration: string;
  price: string;
}

export function AppointmentConfirmationEmail({
  doctorName,
  appointmentDate,
  appointmentTime,
  appointmentType,
  duration,
  price,
}: AppointmentConfirmationEmailProps) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://dentiva-ai-aman.netlify.app").replace(/\/$/, "");

  return (
    <Html>
      <Head />
      <Preview>Your dental appointment has been confirmed</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src="https://i.ibb.co.com/tRy6cC2/logo1.png"
              width="50"
              height="50"
              alt="Dentiva"
              style={logo}
            />
            <Text style={logoText}>Dentiva</Text>
          </Section>

          <Heading style={h1}>Appointment Confirmed! 🦷</Heading>

          <Text style={text}>Hi there,</Text>

          <Text style={text}>
            Your dental appointment has been successfully booked. Here are the details:
          </Text>

          <Section style={appointmentDetails}>
            <Text style={detailLabel}>Doctor</Text>
            <Text style={detailValue}>{doctorName}</Text>

            <Text style={detailLabel}>Appointment Type</Text>
            <Text style={detailValue}>{appointmentType}</Text>

            <Text style={detailLabel}>Date</Text>
            <Text style={detailValue}>{appointmentDate}</Text>

            <Text style={detailLabel}>Time</Text>
            <Text style={detailValue}>{appointmentTime}</Text>

            <Text style={detailLabel}>Duration</Text>
            <Text style={detailValue}>{duration}</Text>

            <Text style={detailLabel}>Cost</Text>
            <Text style={detailValue}>{price}</Text>

            <Text style={detailLabel}>Location</Text>
            <Text style={detailValue}>Dental Center</Text>
          </Section>

          <Text style={text}>
            Please arrive 15 minutes early for your appointment. If you need to reschedule or
            cancel, please contact us at least 24 hours in advance.
          </Text>

          <Section style={buttonContainer}>
            <Link style={button} href={`${appUrl}/appointments`}>
              View My Appointments
            </Link>
          </Section>

          <Text style={footer}>
            Best regards,
            <br />
            The Dentiva Team
          </Text>

          <Text style={footerText}>
            If you have any questions, please contact us at support@dentiva.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default AppointmentConfirmationEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const logoContainer = {
  display: "flex",
  alignItems: "center",
  marginBottom: "32px",
};

const logo = {
  borderRadius: "8px",
};

const logoText = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#16a34a",
  marginLeft: "12px",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "30px 0",
  padding: "0",
};

const text = {
  color: "#444",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
};

const appointmentDetails = {
  padding: "24px",
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  margin: "24px 0",
};

const detailLabel = {
  color: "#6b7280",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 4px 0",
};

const detailValue = {
  color: "#111827",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 16px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#16a34a",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const footer = {
  color: "#898989",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "32px 0 0 0",
};

const footerText = {
  color: "#898989",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "16px 0 0 0",
};