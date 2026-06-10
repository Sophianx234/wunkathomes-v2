import * as React from "react";
import { Preview, Heading, Text, Button, Section } from "react-email";
import { EmailLayout } from "./email-layout";

interface WelcomeEmailProps {
  userName?: string;
  exploreUrl?: string;
}

export default function WelcomeEmail({
  userName = "there",
  exploreUrl = "https://wunkathomes.com/explore",
}: WelcomeEmailProps) {
  const firstName = userName.split(" ")[0];

  return (
    <EmailLayout>
      <Preview>Welcome to WunkatHomes! Your modern rental journey starts here.</Preview>
      
      <Heading className="text-[24px] font-semibold text-[#111827] m-0 mb-6 tracking-tight leading-tight">
        Welcome to the future of renting.
      </Heading>

      <Text className="text-[15px] leading-[26px] text-[#4B5563] mb-6">
        Hi {firstName},
      </Text>

      <Text className="text-[15px] leading-[26px] text-[#4B5563] mb-6">
        We are so glad you're here. WunkatHomes was built to make finding, securing, and managing your perfect home simple, transparent, and completely digital.
      </Text>

      <Text className="text-[15px] leading-[26px] font-medium text-[#111827] mb-4 mt-8">
        Here is what you can do right now:
      </Text>

      <Section className="mb-10">
        <Text className="text-[15px] leading-[26px] text-[#4B5563] m-0 mb-2 flex items-start">
          <span className="text-[#9CA3AF] mr-3 mt-0.5">•</span> 
          Browse verified, premium homes that match your lifestyle.
        </Text>
        <Text className="text-[15px] leading-[26px] text-[#4B5563] m-0 mb-2 flex items-start">
          <span className="text-[#9CA3AF] mr-3 mt-0.5">•</span> 
          Instantly book physical or virtual property tours.
        </Text>
        <Text className="text-[15px] leading-[26px] text-[#4B5563] m-0 flex items-start">
          <span className="text-[#9CA3AF] mr-3 mt-0.5">•</span> 
          Save your favorites and manage your journey in one place.
        </Text>
      </Section>

      <Section className="mb-12">
        <Button
          href={exploreUrl}
          className="bg-[#111827] text-white px-8 py-3.5 rounded-lg text-[14px] font-semibold tracking-wide block w-[220px] text-center"
        >
          Start Exploring
        </Button>
      </Section>
    </EmailLayout>
  );
}