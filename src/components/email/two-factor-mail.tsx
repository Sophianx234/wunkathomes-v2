import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "react-email";
import * as React from "react";

interface TwoFactorEmailProps {
  userName?: string;
  otpCode?: string;
}

export const TwoFactorEmail = ({
  userName = "Admin",
  otpCode = "123456",
}: TwoFactorEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your WunkatHomes Admin Verification Code</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Login Verification</Heading>
          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            We detected a login attempt to the WunkatHomes Admin Portal. Please use the following 6-digit verification code to complete your login.
          </Text>
          <Section style={codeContainer}>
            <Text style={code}>{otpCode}</Text>
          </Section>
          <Text style={text}>
            This code will expire in 5 minutes. If you did not attempt to log in, please ignore this email or secure your account.
          </Text>
          <Text style={footer}>
            WunkatHomes Security Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default TwoFactorEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  maxWidth: "600px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
};

const text = {
  color: "#555",
  fontSize: "16px",
  lineHeight: "24px",
  marginBottom: "16px",
};

const codeContainer = {
  background: "#f4f4f4",
  borderRadius: "4px",
  margin: "24px 0",
  padding: "24px",
  textAlign: "center" as const,
};

const code = {
  color: "#111",
  fontSize: "32px",
  fontWeight: "bold",
  letterSpacing: "8px",
  margin: "0",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  marginTop: "32px",
  textAlign: "center" as const,
};
