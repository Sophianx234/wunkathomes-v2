import * as React from "react";
import { Heading, Text, Section } from "react-email";
import { EmailLayout } from "./email-layout";

export default function LeaseActivationEmail({ pin, propertyTitle }: { pin: string, propertyTitle: string }) {
  return (
    <EmailLayout>
      <Heading className="text-[20px] font-semibold text-[#111827] mb-6">
        Lease Active: Access Credentials
      </Heading>
      <Text className="text-[14px] leading-[22px] text-[#4B5563] mb-6">
        Your lease for <strong>{propertyTitle}</strong> is now officially active.
      </Text>
      <Text className="text-[14px] leading-[22px] text-[#4B5563] mb-4">
        Your secure smart lock PIN for property access:
      </Text>
      <Section className="bg-black rounded-lg p-6 text-center mb-6">
        <Text className="text-white text-[32px] font-mono font-bold m-0 tracking-[0.2em]">{pin}</Text>
      </Section>
      <Text className="text-[12px] text-[#9CA3AF]">
        Keep this PIN secure and do not share it with unauthorized individuals.
      </Text>
    </EmailLayout>
  );
}