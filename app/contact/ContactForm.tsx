'use client';

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { Paperclip, X } from "lucide-react";
import type { Locale } from "@/lib/i18n/shared";
import { getDictionary } from "@/lib/i18n/shared";

type FormState = "idle" | "loading" | "success" | "error";

export function ContactForm({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).contact.form;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    company: "",
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentsError, setAttachmentsError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [clientError, setClientError] = useState("");
  const [status, setStatus] = useState<FormState>("idle");
  const [error, setError] = useState("");

  const updateField = (key: keyof typeof formData) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    const combined = [...attachments, ...files];

    const maxFiles = 3;
    const maxTotalBytes = 4 * 1024 * 1024;
    const allowedTypes = new Set([
      "application/pdf",
      "image/jpeg",
      "image/png",
      "text/plain",
    ]);

    const totalBytes = combined.reduce((sum, f) => sum + f.size, 0);

    if (combined.length > maxFiles) {
      setAttachmentsError(t.errFilesCount);
      event.target.value = "";
      return;
    }

    if (totalBytes > maxTotalBytes) {
      setAttachmentsError(t.errFilesSize);
      event.target.value = "";
      return;
    }

    const hasInvalid = combined.some((file) => !allowedTypes.has(file.type));
    if (hasInvalid) {
      setAttachmentsError(t.errFilesType);
      event.target.value = "";
      return;
    }

    setAttachmentsError("");
    setAttachments(combined);
  };

  const removeAttachment = (name: string) => {
    setAttachments((prev) => prev.filter((file) => file.name !== name));
    setAttachmentsError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setError("");
    setClientError("");

    // Client-side validation mirrors server limits
    if (!formData.name.trim() || formData.name.length > 100) {
      setStatus("error");
      setClientError(t.errName);
      return;
    }

    if (!formData.email.trim() || formData.email.length > 200) {
      setStatus("error");
      setClientError(t.errEmail);
      return;
    }

    if (!formData.subject.trim() || formData.subject.length > 200) {
      setStatus("error");
      setClientError(t.errSubject);
      return;
    }

    if (!formData.message.trim() || formData.message.length > 5000) {
      setStatus("error");
      setClientError(t.errMessage);
      return;
    }

    const body = new FormData();
    body.append("name", formData.name);
    body.append("email", formData.email);
    body.append("subject", formData.subject);
    body.append("message", formData.message);
    body.append("company", formData.company);

    attachments.forEach((file) => {
      body.append("attachments", file, file.name);
    });

    const response = await fetch("/api/contact", {
      method: "POST",
      body,
    });

    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string; message?: string };

    if (data.ok) {
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "", company: "" });
      setAttachments([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setStatus("error");
    setError(data.error || data.message || t.errGeneric);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 24,
        backgroundColor: "var(--card)",
        borderRadius: 8,
      }}
      noValidate
    >
      <div style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
        <label htmlFor="company">{t.company}</label>
        <input
          type="text"
          id="company"
          name="company"
          value={formData.company}
          onChange={updateField("company")}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label htmlFor="name" style={{ fontWeight: 500, fontSize: "0.95rem" }}>
          {t.name}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={updateField("name")}
          className="contact-input"
          style={{
            padding: "10px 12px",
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontFamily: "inherit",
            fontSize: "1rem",
            backgroundColor: "var(--card)",
            color: "var(--foreground)",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label htmlFor="email" style={{ fontWeight: 500, fontSize: "0.95rem" }}>
          {t.email}
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={updateField("email")}
          className="contact-input"
          style={{
            padding: "10px 12px",
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontFamily: "inherit",
            fontSize: "1rem",
            backgroundColor: "var(--card)",
            color: "var(--foreground)",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label htmlFor="subject" style={{ fontWeight: 500, fontSize: "0.95rem" }}>
          {t.subject}
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          required
          value={formData.subject}
          onChange={updateField("subject")}
          className="contact-input"
          style={{
            padding: "10px 12px",
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontFamily: "inherit",
            fontSize: "1rem",
            backgroundColor: "var(--card)",
            color: "var(--foreground)",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label htmlFor="message" style={{ fontWeight: 500, fontSize: "0.95rem" }}>
          {t.message}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          value={formData.message}
          onChange={updateField("message")}
          className="contact-textarea"
          style={{
            padding: "10px 12px",
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontFamily: "inherit",
            fontSize: "1rem",
            resize: "vertical",
            backgroundColor: "var(--card)",
            color: "var(--foreground)",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontWeight: 500, fontSize: "0.95rem" }}>{t.attachments}</span>
          <span style={{ fontSize: "0.9rem", color: "#4b5563" }}>
            {t.attachmentsHint}
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          id="attachments"
          name="attachments"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.txt"
          onChange={handleFiles}
          style={{ display: "none" }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            borderRadius: 6,
            border: "1px solid var(--border)",
            backgroundColor: "var(--card)",
            cursor: "pointer",
            fontWeight: 600,
            color: "var(--foreground)",
          }}
          className="hover:opacity-80"
        >
          <Paperclip size={16} /> {t.addFiles}
        </button>

        {attachments.length > 0 && (
          <div style={{ display: "grid", gap: 6 }}>
            {attachments.map((file) => (
              <div
                key={file.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "8px 10px",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  backgroundColor: "var(--muted)",
                  fontSize: "0.95rem",
                }}
              >
                <span style={{ wordBreak: "break-all" }}>
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(file.name)}
                  aria-label={`Remove ${file.name}`}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: 4,
                    cursor: "pointer",
                    color: "#6b7280",
                    display: "inline-flex",
                  }}
                  className="hover:opacity-70"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {attachmentsError && (
          <p style={{ margin: 0, color: "#B00020", fontSize: "0.95rem" }}>{attachmentsError}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        style={{
          padding: "12px 24px",
          backgroundColor: "var(--primary)",
          color: "var(--primary-contrast)",
          border: "none",
          borderRadius: 4,
          fontWeight: 600,
          fontSize: "1rem",
          cursor: "pointer",
          transition: "opacity 0.2s",
          alignSelf: "flex-start",
          opacity: status === "loading" ? 0.7 : 1,
        }}
        className="hover:opacity-80"
      >
        {status === "loading" ? t.sending : t.send}
      </button>

      {status === "success" && (
        <p style={{ color: "var(--success, #16a34a)", margin: 0 }}>{t.sent}</p>
      )}
      {status === "error" && (
        <div style={{ color: "var(--error, #ef4444)", margin: 0, display: "grid", gap: 6 }}>
          <p style={{ margin: 0 }}>{clientError || error || t.errGeneric}</p>
          {error === "SERVER_CONFIG_INCOMPLETE" && (
            <p style={{ margin: 0, color: "var(--error, #ef4444)", fontSize: "0.95rem", lineHeight: 1.5 }}>
              {t.errConfig}
            </p>
          )}
          {error === "RATE_LIMITED" && (
            <p style={{ margin: 0, color: "var(--error, #ef4444)", fontSize: "0.95rem", lineHeight: 1.5 }}>
              {t.errRate}
            </p>
          )}
        </div>
      )}
    </form>
  );
}
