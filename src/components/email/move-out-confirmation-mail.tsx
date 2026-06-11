import * as React from "react";
import { Heading, Text, Section, Hr } from "react-email";
import { EmailLayout } from "./email-layout";

interface MoveOutConfirmationEmailProps {
  userName?: string;
  propertyTitle: string;
  moveOutDate: string;
}

export default function MoveOutConfirmationEmail({
  userName = "Tenant",
  propertyTitle,
  moveOutDate,
}: MoveOutConfirmationEmailProps) {
  const firstName = userName.split(" ")[0];

  return (
    <EmailLayout>
      <Heading className="text-[20px] font-semibold text-[#111827] mb-6">
        Notice to Vacate Confirmed
      </Heading>

      <Text className="text-[14px] leading-[22px] text-[#4B5563] mb-6">
        Dear {firstName},
      </Text>

      <Text className="text-[14px] leading-[22px] text-[#4B5563] mb-6">
        This email confirms that we have received and processed your official notice to vacate the premises.
      </Text>

      {/* MOVE-OUT DETAILS CARD */}
      <Section className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-5 mb-8">
        <Text className="text-[13px] text-[#111827] m-0 mb-3 font-semibold uppercase tracking-wider">
          Move-Out Details
        </Text>
        <Text className="text-[14px] leading-[24px] text-[#4B5563] m-0">
          <strong>Property:</strong> {propertyTitle} <br />
          <strong>Official Move-Out Date:</strong> {moveOutDate}
        </Text>
      </Section>

      <Text className="text-[14px] leading-[22px] text-[#4B5563] mb-4 font-medium text-[#111827]">
        What happens next?
      </Text>

      {/* NEXT STEPS LIST */}
      <Section className="mb-8">
        <Text className="text-[14px] leading-[24px] text-[#4B5563] m-0 mb-3 flex items-start">
          <span className="text-[#9CA3AF] mr-3 mt-0.5">•</span> 
          <span><strong>Smart Lock Access:</strong> Your digital access PIN will automatically expire at 11:59 PM on your official move-out date.</span>
        </Text>
        <Text className="text-[14px] leading-[24px] text-[#4B5563] m-0 mb-3 flex items-start">
          <span className="text-[#9CA3AF] mr-3 mt-0.5">•</span> 
          <span><strong>Property Inspection:</strong> Our property management team will conduct a final condition walkthrough after your departure. Ensure all personal belongings are removed.</span>
        </Text>
        <Text className="text-[14px] leading-[24px] text-[#4B5563] m-0 flex items-start">
          <span className="text-[#9CA3AF] mr-3 mt-0.5">•</span> 
          <span><strong>Security Deposit:</strong> Eligible deposit refunds will be processed to your original payment method following the successful completion of the inspection.</span>
        </Text>
      </Section>

      <Hr className="border-[#E5E7EB] my-8" />

      {/* DISCLAIMER */}
      <Text className="text-[13px] leading-[22px] text-[#6B7280]">
        We appreciate the time you have spent with WunkatHomes. If your move-out plans change, please contact administration immediately, as the property is now actively being relisted for future tenants.
      </Text>
    </EmailLayout>
  );
}