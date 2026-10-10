import * as React from "react";
import { Body, Container, Head, Html, Tailwind, Hr, Img, Section, Text, Row, Column } from "react-email";

const LOGO_URL = "https://res.cloudinary.com/dtytb8qrc/image/upload/v1761591015/home_yevjdg.png";

export function EmailLayout({ children }: { children: React.ReactNode }) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white font-sans m-0 p-0">
          <Container className="mx-auto my-0 px-6 pt-12 pb-24 max-w-[580px]">
            {/* GLOBAL Email HEADER */}
            <Section className="mb-10">
              <Row>
                <Column style={{ width: "45px" }}>
                  <Img
                    src={LOGO_URL}
                    width="45"
                    height="auto"
                    alt="WunkatHomes"
                    className="outline-none border-none"
                  />
                </Column>
                <Column style={{ paddingLeft: "12px", paddingTop: "8px" }}>
                  <Text className="m-0 text-2xl font-bold tracking-tight text-zinc-800">
                    Wunkat<span className="text-zinc-500">Homes</span>
                  </Text>
                </Column>
              </Row>
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
