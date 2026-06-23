import * as React from "react";
import { Heading, Text, Section, Button } from "react-email";
import { EmailLayout } from "./email-layout";

interface Props {
  userName?: string;
  propertyTitle: string;
  isApproved: boolean;
}

export default function ApplicationStatusEmail({ userName = "there", propertyTitle, isApproved }: Props) {
  const firstName = userName.split(" ")[0];

  return (
    <EmailLayout>
      <Heading className="text-[20px] font-semibold text-[#111827] mb-6">
        {isApproved ? "Application Approved" : "Action Required: Application Review"}
      </Heading>

      <Text className="text-[14px] leading-[22px] text-[#4B5563] mb-6">
        Hi {firstName},
      </Text>

      <Text className="text-[14px] leading-[22px] text-[#4B5563] mb-6">
        {isApproved 
          ? `We are pleased to inform you that your application for ${propertyTitle} has been approved.`
          : `We have reviewed your application for ${propertyTitle}. To proceed, some information requires your attention.`
        }
      </Text>

      <Section className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-5 mb-8">
        <Text className="text-[14px] text-[#4B5563] m-0">
          {isApproved 
            ? "Your lease is now being prepared for final activation. We will notify you once you are ready to move in."
            : "Please log in to your dashboard to view the feedback and resubmit the necessary documents."
          }
        </Text>
      </Section>

      <Button href={`${process.env.NEXT_PUBLIC_APP_URL}/user/leases`} className="bg-[#111827] text-white px-8 py-3.5 rounded-lg text-[14px] font-semibold text-center">
        {isApproved ? "View Dashboard" : "View Application"}
      </Button>
    </EmailLayout>
  );
}
