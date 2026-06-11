import * as React from "react";
import { Heading, Text, Section } from "react-email";
import { EmailLayout } from "./email-layout";

export default function RenewalConfirmationEmail({ 
  propertyTitle, newEndDate 
}: { 
  propertyTitle: string, 
  newEndDate: string 
}) {
  return (
    <EmailLayout>
      <Heading className="text-[20px] font-semibold text-[#111827] mb-6">Lease Renewal Successful</Heading>
      <Text className="text-[14px] text-[#4B5563] mb-6">
        Your lease for <strong>{propertyTitle}</strong> has been successfully extended.
      </Text>
      <Section className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-5 mb-8">
        <Text className="text-[14px] text-[#4B5563] m-0">
          <strong>New Lease Expiry:</strong> {newEndDate}
        </Text>
      </Section>
      <Text className="text-[14px] text-[#4B5563]">
        You can view your updated lease agreement in your user dashboard.
      </Text>
    </EmailLayout>
  );
}