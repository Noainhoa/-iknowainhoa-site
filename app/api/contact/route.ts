import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

function hasSmtpConfig() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    (process.env.CONTACT_TO || process.env.SMTP_USER)
  );
}

type Attachment = {
  filename: string;
  content: Buffer;
  contentType: string;
  size: number;
};

async function readMultipart(request: Request) {
  const form = await request.formData();

  const payload = {
    name: form.get("name"),
    email: form.get("email"),
    subject: form.get("subject"),
    message: form.get("message"),
    company: form.get("company"),
  };

  const attachments = form
    .getAll("attachments")
    .filter((f): f is File => f instanceof File);

  return { payload, attachments };
}

async function readJson(request: Request) {
  const payload = await request.json().catch(() => undefined);
  return { payload, attachments: [] as File[] };
}

async function parseRequest(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.toLowerCase().includes("multipart/form-data")) {
    return readMultipart(request);
  }
  return readJson(request);
}

function sanitizeFilename(name: string) {
  return name.replace(/[/\\]/g, "").slice(0, 200) || "attachment";
}

async function normalizeAttachments(files: File[]): Promise<{ attachments: Attachment[]; error?: string }> {
  if (files.length > 3) return { attachments: [], error: "Too many attachments (max 3)." };

  const allowedTypes = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "text/plain",
  ]);

  let total = 0;
  const parsed: Attachment[] = [];

  for (const file of files) {
    if (!allowedTypes.has(file.type)) {
      return { attachments: [], error: "Unsupported file type. Allowed: PDF, JPG, PNG, TXT." };
    }

    total += file.size;
    if (total > 4 * 1024 * 1024) {
      return { attachments: [], error: "Attachments exceed 4MB total." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    parsed.push({
      filename: sanitizeFilename(file.name),
      content: buffer,
      contentType: file.type,
      size: file.size,
    });
  }

  return { attachments: parsed };
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
  if (!hasSmtpConfig()) {
    console.error("Contact form missing SMTP configuration.");
    return NextResponse.json(
      { ok: false, error: "SERVER_CONFIG_INCOMPLETE", message: "Server configuration incomplete." },
      { status: 500 }
    );
  }

  const { payload, attachments: rawAttachments } = await parseRequest(request);

  const validation = validatePayload(payload);
  if ("error" in validation) {
    return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
  }

  const { name, email, subject, message, company } = validation;

  const attachmentsResult = await normalizeAttachments(rawAttachments);
  if (attachmentsResult.error) {
    return NextResponse.json({ ok: false, error: attachmentsResult.error }, { status: 400 });
  }
  const attachments = attachmentsResult.attachments;

  if (company) {
    // Honeypot triggered—act as if it worked.
    return NextResponse.json({ ok: true });
  }

  try {
    const to = process.env.CONTACT_TO || process.env.SMTP_USER || "";
    const text = `Name: ${name}\nEmail: ${email}\n\n${message}`;

    // SMTP via nodemailer (OVH)
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
      from: process.env.CONTACT_FROM || process.env.SMTP_USER,
      to,
      replyTo: email,
      subject: `[Contact] ${subject}`,
      text,
      attachments,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact form send error", error);
    return NextResponse.json({ ok: false, error: "Unable to send message right now." }, { status: 500 });
  }
}
