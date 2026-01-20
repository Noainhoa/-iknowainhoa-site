import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const requiredEnv = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "CONTACT_TO"] as const;

function hasRequiredEnv() {
  return requiredEnv.every((key) => process.env[key]);
}

function validatePayload(payload: unknown) {
  if (!payload || typeof payload !== "object") return { error: "Invalid request body." };

  const { name, email, subject, message, company } = payload as Record<string, unknown>;
  const fields = { name, email, subject, message };

  for (const [key, value] of Object.entries(fields)) {
    if (typeof value !== "string" || !value.trim()) {
      return { error: `Missing required field: ${key}.` };
    }
  }

  return {
    name: String(name).trim(),
    email: String(email).trim(),
    subject: String(subject).trim(),
    message: String(message).trim(),
    company: typeof company === "string" ? company.trim() : "",
  };
}

export async function POST(request: Request) {
  if (!hasRequiredEnv()) {
    return NextResponse.json({ ok: false, error: "Server configuration incomplete." }, { status: 500 });
  }

  const validation = validatePayload(await request.json().catch(() => undefined));
  if ("error" in validation) {
    return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
  }

  const { name, email, subject, message, company } = validation;

  if (company) {
    // Honeypot triggered—act as if it worked.
    return NextResponse.json({ ok: true });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.CONTACT_TO,
      replyTo: email,
      subject: `[Contact] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact form send error", error);
    return NextResponse.json({ ok: false, error: "Unable to send message right now." }, { status: 500 });
  }
}
