import { env } from "@/config/env";
import { sendMail } from "@/lib/mailer";
import type { ContactMessageInput } from "../schemas/contact.schemas";

/**
 * Demo use case showing how to wire transactional email.
 * In development the email lands in Mailpit: http://localhost:8025
 */
export async function sendContactMessage(input: ContactMessageInput): Promise<void> {
  await sendMail({
    to: env.MAIL_TO,
    subject: `New contact message from ${input.name}`,
    text: `${input.message}\n\n— ${input.name} <${input.email}>`,
    html: `
      <h2>New contact message</h2>
      <p><strong>${input.name}</strong> &lt;${input.email}&gt; writes:</p>
      <blockquote>${input.message}</blockquote>
    `,
  });
}
