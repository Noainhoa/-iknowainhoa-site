import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

/**
 * IMPORTANT (hosting reality check): many serverless hosts block outbound SMTP (ports 465/587).
 * To make the contact form work everywhere, this route supports:
 *   1) SMTP via OVH (or any SMTP server) using nodemailer
 *   2) Resend HTTP API (recommended for Vercel/Netlify)
 */

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function hasResendConfig() {
  return Boolean(process.env.RESEND_API_KEY);
}

function missingConfigHint() {
  if (!hasSmtpConfig() && !hasResendConfig()) {
    return "Set SMTP_HOST/SMTP_USER/SMTP_PASS (SMTP) OR RESEND_API_KEY (Resend).";
  }
  return "";
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
  if (!hasSmtpConfig() && !hasResendConfig()) {
    console.error("Contact form missing configuration.", { hint: missingConfigHint() });
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

  try {
    const to = process.env.CONTACT_TO || process.env.SMTP_USER || "";
    const text = `Name: ${name}\nEmail: ${email}\n\n${message}`;

    // Preferred path for serverless platforms: Resend HTTP API
    if (hasResendConfig()) {
      const from = process.env.CONTACT_FROM || "Contact <onboarding@resend.dev>";

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: email,
          subject: `[Contact] ${subject}`,
          text,
        }),
      });

      if (!resendResponse.ok) {
        const details = await resendResponse.text().catch(() => "");
        console.error("Resend send failed", { status: resendResponse.status, details });
        throw new Error("Resend send failed");
      }

      return NextResponse.json({ ok: true });
    }

    // Fallback path: SMTP via nodemailer (works on VPS / OVH hosting, but often blocked on serverless)
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

    await transporter.sendMail({
      from: `"iknowainhoa.com" <${process.env.SMTP_USER}>`,
      to,
      replyTo: email,
      subject: `[Contact] ${subject}`,
      text,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact form send error", error);
    return NextResponse.json({ ok: false, error: "Unable to send message right now." }, { status: 500 });
  }
}
