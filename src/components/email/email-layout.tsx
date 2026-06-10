import * as React from "react";
import { Body, Container, Head, Html, Tailwind, Hr, Img, Section, Text } from "react-email";

const LOGO_URL = "https://wunkathomes.com/static/logo.png";

export function EmailLayout({ children }: { children: React.ReactNode }) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white font-sans m-0 p-0">
          <Container className="mx-auto my-0 px-6 pt-12 pb-24 max-w-[580px]">
            {/* GLOBAL HEADER */}
            <Section className="mb-10">
              <Img
                src={LOGO_URL}
                width="160"
                height="auto"
                alt="WunkatHomes"
                className="block outline-none border-none"
              />
            </Section>

            {/* CONTENT INJECTION */}
            {children}

            {/* GLOBAL FOOTER */}
            <Hr className="border-[#E5E7EB] my-10" />
            <Section>
              <Text className="text-[13px] leading-[24px] text-[#6B7280] mb-6">
                Need help? Simply reply to this email to speak with our support team. We're always here for you.
              </Text>
              <Text className="text-[11px] leading-[18px] text-[#A1A1AA] uppercase tracking-widest font-medium">
                © {new Date().getFullYear()} WunkatHomes Ltd.<br />
                Accra, Ghana
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}