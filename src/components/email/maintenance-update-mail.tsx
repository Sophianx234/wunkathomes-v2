import * as React from "react";
import { Heading, Text, Section } from "react-email";
import { EmailLayout } from "./EmailLayout";

interface MaintenanceUpdateProps {
  userName?: string;
  ticketNumber: string;
  ticketTitle: string;
  newStatus: string;
}

export default function MaintenanceUpdateEmail({
  userName = "Tenant",
  ticketNumber,
  ticketTitle,
  newStatus,
}: MaintenanceUpdateProps) {
  return (
    <EmailLayout>
      <Heading className="text-[20px] font-semibold text-[#111827] m-0 mb-6 tracking-tight">
        Maintenance Status Update
      </Heading>

      <Text className="text-[14px] leading-[22px] text-[#4B5563] mb-6">
        Dear {userName},
      </Text>

      <Text className="text-[14px] leading-[22px] text-[#4B5563] mb-6">
        This notification serves to inform you that the status of your maintenance request has been updated.
      </Text>

      <Section className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-5 mb-8">
        <Text className="text-[13px] text-[#111827] m-0 mb-2 font-semibold uppercase tracking-wider">
          Request Details
        </Text>
        <Text className="text-[14px] leading-[22px] text-[#4B5563] m-0">
          <strong>Reference:</strong> #{ticketNumber.slice(-8)}<br />
          <strong>Issue:</strong> {ticketTitle}<br />
          <strong>Current Status:</strong> {newStatus.replace("_", " ")}
        </Text>
      </Section>

      <Text className="text-[14px] leading-[22px] text-[#4B5563] mb-6">
        Our records indicate the request is currently marked as <strong>{newStatus.replace("_", " ")}</strong>. Please monitor your property portal for further updates regarding this matter.
      </Text>
    </EmailLayout>
  );
}