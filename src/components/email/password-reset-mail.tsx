import * as React from "react";
import { Preview, Heading, Text, Button, Section } from "react-email";
import { EmailLayout } from "./email-layout";

interface PasswordResetEmailProps {
  userName?: string;
  resetUrl: string;
}

export default function PasswordResetEmail({
  userName = "there",
  resetUrl = "https://wunkathomes.com/reset-password?token=example",
}: PasswordResetEmailProps) {
  const firstName = userName.split(" ")[0];

  return (
    <EmailLayout>
      <Preview>Reset your WunkatHomes password.</Preview>
      
      <Heading className="text-[24px] font-semibold text-[#111827] m-0 mb-6 tracking-tight leading-tight">
        Reset your password
      </Heading>

      <Text className="text-[15px] leading-[26px] text-[#4B5563] mb-6">
        Hi {firstName},
      </Text>

      <Text className="text-[15px] leading-[26px] text-[#4B5563] mb-8">
        We received a request to reset the password associated with your WunkatHomes account. You can securely set a new password by clicking the button below:
      </Text>

      <Section className="mb-10">
        <Button
          href={resetUrl}
          className="bg-[#111827] text-white px-8 py-3.5 rounded-lg text-[14px] font-semibold tracking-wide block w-[240px] text-center"
        >
          Reset Password
        </Button>
      </Section>

      <Text className="text-[15px] leading-[26px] text-[#4B5563] mb-6">
        For your security, this link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email and your password will remain unchanged.
      </Text>
    </EmailLayout>
  );
}
