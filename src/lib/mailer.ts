import nodemailer from "nodemailer";
import { env } from "@/config/env";
import { logger } from "@/config/logger";

/**
 * Shared nodemailer transport. In development it points at Mailpit
 * (docker-compose.yml) — open http://localhost:8025 to see everything sent.
 * Swap SMTP_* env vars for a real provider (Resend, SES, Postmark…) in production.
 */
export const mailer = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
});

export interface SendMailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendMail(input: SendMailInput): Promise<void> {
  await mailer.sendMail({ from: env.MAIL_FROM, ...input });
  logger.info({ to: input.to, subject: input.subject }, "Email sent");
}
