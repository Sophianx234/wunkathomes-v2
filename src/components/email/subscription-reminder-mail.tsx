import * as React from "react";
import { Heading, Text, Section, Button, Hr } from "react-email";
import { EmailLayout } from "./email-layout"; // Adjust path if necessary

interface DynamicReminderEmailProps {
  userName?: string;
  propertyTitle: string;
  daysRemaining: number;
  endDate: string;
}

export default function SubscriptionReminderEmail({
  userName = "Tenant",
  propertyTitle,
  daysRemaining,
  endDate,
}: DynamicReminderEmailProps) {
  const firstName = userName.split(" ")[0];
  const isExpired = daysRemaining === 0;
  const isApproaching = daysRemaining > 0 && daysRemaining <= 30; // 30 days or less

  // Dynamically adjust the headline based on urgency
  let headline = "Lease Status Update";
  if (isExpired) headline = "Action Required: Lease Expired";
  else if (isApproaching) headline = "Upcoming Lease Expiry";

  return (
    <EmailLayout>
      <Heading className="text-[20px] font-semibold text-[#111827] m-0 mb-6 tracking-tight">
        {headline}
      </Heading>

      <Text className="text-[14px] leading-[22px] text-[#4B5563] mb-6">
        Dear {firstName},
      </Text>

      {/* DYNAMIC INTRODUCTORY TEXT */}
      <Text className="text-[14px] leading-[22px] text-[#4B5563] mb-6">
        {isExpired ? (
          "This is an official notice that your lease agreement has officially expired. To avoid uninterrupted access to the property and potential smart-lock restrictions, immediate action is required."
        ) : isApproaching ? (
          `Your lease agreement is approaching its conclusion in just ${daysRemaining} days. We are reaching out to ensure you have ample time to review your renewal options.`
        ) : (
          "We hope you are enjoying your stay. This is a routine check-in to provide you with your current lease standing."
        )}
      </Text>

      {/* STATUS CARD */}
      <Section className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-5 mb-8">
        <Text className="text-[13px] text-[#111827] m-0 mb-3 font-semibold uppercase tracking-wider">
          Lease Details
        </Text>
        <Text className="text-[14px] leading-[24px] text-[#4B5563] m-0">
          <strong>Property:</strong> {propertyTitle} <br />
          <strong>Expiry Date:</strong> {endDate} <br />
          <strong>Status:</strong>{" "}
          <span
            className={`font-semibold ${
              isExpired ? "text-[#DC2626]" : "text-[#111827]"
            }`}
          >
            {isExpired ? "Expired" : `${daysRemaining} Days Remaining`}
          </span>
        </Text>
      </Section>

      {/* DYNAMIC CALL TO ACTION */}
      <Text className="text-[14px] leading-[22px] text-[#4B5563] mb-6 font-medium">
        {isExpired
          ? "Please log in to your dashboard immediately to renew your lease or initiate the move-out process."
          : "You can easily renew your lease or notify us of your intent to vacate via your tenant dashboard."}
      </Text>

      <Section className="mb-10 mt-2">
        <Button
          href={`${process.env.NEXT_PUBLIC_APP_URL}/user/leases`}
          className="bg-[#111827] text-white px-8 py-3.5 rounded-lg text-[14px] font-semibold tracking-wide block w-[240px] text-center"
        >
          {isExpired ? "Resolve Lease Status" : "View Lease Options"}
        </Button>
      </Section>

      <Hr className="border-[#E5E7EB] my-8" />

      <Text className="text-[13px] leading-[22px] text-[#6B7280]">
        If you have already submitted your renewal payment or a notice to vacate, please disregard this automated message.
      </Text>
    </EmailLayout>
  );
}