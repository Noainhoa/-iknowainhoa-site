import "server-only";

import nodemailer from "nodemailer";

export function notifyAddress(): string | null {
  return process.env.TECH_NOTIFY_EMAIL || process.env.CONTACT_TO || process.env.SMTP_USER || null;
}

export function smtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      notifyAddress()
  );
}

export async function sendOwnerMail(subject: string, body: string): Promise<void> {
  const to = notifyAddress();
  if (!smtpConfigured() || !to) {
    throw new Error("smtp_not_configured");
  }
  const parsedPort = Number(process.env.SMTP_PORT);
  const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 465;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await transporter.sendMail({
    from: process.env.CONTACT_FROM || process.env.SMTP_USER,
    to,
    subject,
    text: body,
  });
}
