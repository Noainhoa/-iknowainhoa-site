import "server-only";

import nodemailer from "nodemailer";

export function notifyAddress(): string | null {
  return process.env.TECH_NOTIFY_EMAIL || process.env.CONTACT_TO || process.env.SMTP_USER || null;
}

export function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransport() {
  if (!smtpConfigured()) {
    throw new Error("smtp_not_configured");
  }
  const parsedPort = Number(process.env.SMTP_PORT);
  const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 465;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendPlainMail(to: string, subject: string, body: string): Promise<void> {
  const transporter = createTransport();
  await transporter.sendMail({
    from: process.env.CONTACT_FROM || process.env.SMTP_USER,
    to,
    subject,
    text: body,
  });
}

export async function sendOwnerMail(subject: string, body: string): Promise<void> {
  const to = notifyAddress();
  if (!to) {
    throw new Error("smtp_not_configured");
  }
  await sendPlainMail(to, subject, body);
}

/** Customer confirmation. Caller must not log `body` (may contain the private manage token). */
export async function sendCustomerMail(to: string, subject: string, body: string): Promise<void> {
  const trimmed = to.trim();
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error("invalid_customer_email");
  }
  await sendPlainMail(trimmed, subject, body);
}
