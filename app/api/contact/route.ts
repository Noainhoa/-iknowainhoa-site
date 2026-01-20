import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const requiredEnv = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"] as const;

function missingEnvKeys() {
  return requiredEnv.filter((key) => !process.env[key]);
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

  const trimmedEmail = String(email).trim();
  // Basic email sanity check
  const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmedEmail);
  if (!emailValid) {
    return { error: "Invalid email address." };
  }

  const trimmedSubject = String(subject).trim();
  if (trimmedSubject.length > 200) {
    return { error: "Subject is too long." };
  }

  const trimmedMessage = String(message).trim();
  if (trimmedMessage.length > 5000) {
    return { error: "Message is too long." };
  }

  return {
    name: String(name).trim(),
    email: trimmedEmail,
    subject: trimmedSubject,
    message: trimmedMessage,
    company: typeof company === "string" ? company.trim() : "",
  };
}

export async function POST(request: Request) {
  const missingKeys = missingEnvKeys();
  if (missingKeys.length > 0) {
    console.error("Contact form missing env keys:", missingKeys);
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

  const parsedPort = Number(process.env.SMTP_PORT);
  const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 465;
  const secure = port === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"iknowainhoa.com" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_TO || process.env.SMTP_USER,
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
