import * as React from "react";
import { Preview, Heading, Text, Section } from "react-email";
import { EmailLayout } from "./email-layout";

interface TeamUpdateProps {
  userName?: string;
  title: string;
  message: string;
}

export default function TeamUpdateEmail({ userName = "there", title, message }: TeamUpdateProps) {
  return (
    <EmailLayout>
      <Preview>Important update regarding your WunkatHomes account.</Preview>
      <Heading className="text-[24px] font-semibold text-[#111827] m-0 mb-6 tracking-tight leading-tight">
        {title}
      </Heading>
      <Text className="text-[15px] leading-[26px] text-[#4B5563] mb-6">
        Hi {userName.split(" ")[0]},
      </Text>
      <Text className="text-[15px] leading-[26px] text-[#4B5563] mb-10">
        {message}
      </Text>
      <Section className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-6">
        <Text className="text-[14px] leading-[24px] text-[#4B5563] m-0">
          If you have questions or believe this is an error, please reach out to the administrative team directly.
        </Text>
      </Section>
    </EmailLayout>
  );
}