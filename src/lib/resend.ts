import { Resend } from "resend";
import { ReactElement } from "react";

// 1. Initialize the client once
export const resend = new Resend(process.env.RESEND_API_KEY);

// 2. Define your verified sender domain (Must be verified in your Resend Dashboard)
// If you haven't verified a domain yet, use "onboarding@resend.dev" for testing.
// const SENDER_EMAIL = "WunkatHomes <hello@wunkathomes.com>";
const SENDER_EMAIL = "WunkatHomes <onboarding@resend.dev>";


interface SendEmailParams {
  to: string | string[];
  subject: string;
  react: ReactElement; // This forces you to pass a React Email template
}

/**
 * DRY Utility for sending emails. 
 * Use this in all your Server Actions instead of calling resend directly.
 */
export async function sendEmail({ to, subject, react }: SendEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to,
      subject,
      react,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Failed to send email:", error.message);
    return { success: false, error: "Internal server error while sending email" };
  }
}
