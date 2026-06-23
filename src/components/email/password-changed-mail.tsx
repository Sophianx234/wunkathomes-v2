import * as React from "react";
import { Preview, Heading, Text, Section } from "react-email";
import { EmailLayout } from "./email-layout";

interface PasswordChangedEmailProps {
  userName?: string;
}

export default function PasswordChangedEmail({
  userName = "there",
}: PasswordChangedEmailProps) {
  const firstName = userName.split(" ")[0];

  return (
    <EmailLayout>
      <Preview>Security Alert: Your password was changed.</Preview>

      <Heading className="text-[24px] font-semibold text-[#111827] m-0 mb-6 tracking-tight leading-tight">
        Your password has been updated
      </Heading>

      <Text className="text-[15px] leading-[26px] text-[#4B5563] mb-6">
        Hi {firstName},
      </Text>

      <Text className="text-[15px] leading-[26px] text-[#4B5563] mb-6">
        This is a quick security confirmation that the password for your WunkatHomes account was successfully changed. 
      </Text>

      <Text className="text-[15px] leading-[26px] text-[#4B5563] mb-10 font-medium">
        If you made this change, no further action is required.
      </Text>

      {/* SECURITY WARNING */}
      <Section className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-6 mb-10">
        <Text className="text-[14px] leading-[24px] text-[#111827] font-semibold m-0 mb-2">
          Didn't do this?
        </Text>
        <Text className="text-[14px] leading-[24px] text-[#4B5563] m-0">
          If you did not authorize this change, please secure your account immediately by contacting our security team at <span className="font-semibold text-[#111827]">support@wunkathomes.com</span>.
        </Text>
      </Section>
    </EmailLayout>
  );
}
