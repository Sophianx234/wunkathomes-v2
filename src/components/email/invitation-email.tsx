import * as React from "react";
import { Preview, Heading, Text, Button, Section } from "react-email";
import { EmailLayout } from "./email-layout";

interface InviteProps {
  role: string;
  inviteLink: string;
}

export default function InvitationEmail({ role, inviteLink }: InviteProps) {
  return (
    <EmailLayout>
      <Preview>You have been invited to join the WunkatHomes team.</Preview>
      <Heading className="text-[24px] font-semibold text-[#111827] m-0 mb-6 tracking-tight leading-tight">
        You've been invited
      </Heading>
      <Text className="text-[15px] leading-[26px] text-[#4B5563] mb-6">
        You have been invited to join the WunkatHomes administrative team as an <strong>{role}</strong>. 
      </Text>
      <Text className="text-[15px] leading-[26px] text-[#4B5563] mb-8">
        Click the button below to accept the invitation and set up your account access.
      </Text>
      <Section className="mb-10">
        <Button href={inviteLink} className="bg-[#111827] text-white px-8 py-3.5 rounded-lg text-[14px] font-semibold tracking-wide block w-[240px] text-center">
          Accept Invitation
        </Button>
      </Section>
    </EmailLayout>
  );
}