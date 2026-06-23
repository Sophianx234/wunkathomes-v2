import * as React from "react";
import { Heading, Text, Section } from "react-email";
import { EmailLayout } from "./email-layout";

export default function PaymentReceiptEmail({ 
  propertyTitle, amount, reference 
}: { 
  propertyTitle: string, 
  amount: number, 
  reference: string 
}) {
  return (
    <EmailLayout>
      <Heading className="text-[20px] font-semibold text-[#111827] mb-6">Payment Confirmed</Heading>
      <Text className="text-[14px] text-[#4B5563] mb-6">
        We have successfully received your payment for <strong>{propertyTitle}</strong>.
      </Text>
      <Section className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-5 mb-8">
        <Text className="text-[14px] text-[#4B5563] m-0">
          <strong>Amount Paid:</strong> GHS {amount?.toLocaleString()}<br/>
          <strong>Transaction Ref:</strong> {reference}<br/>
          <strong>Status:</strong> Pending Admin Verification
        </Text>
      </Section>
      <Text className="text-[14px] text-[#4B5563]">
        Your application is currently under review. You will receive an update once your identity has been verified.
      </Text>
    </EmailLayout>
  );
}
