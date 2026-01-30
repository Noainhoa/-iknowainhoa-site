'use client';

import { ChangeEvent, FormEvent, useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    company: "",
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [status, setStatus] = useState<FormState>("idle");
  const [error, setError] = useState("");

  const updateField = (key: keyof typeof formData) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setAttachments(files);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setError("");

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
      return;
    }

    setStatus("error");
    setError(data.error || data.message || "Something went wrong. Please try again.");
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 24,
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
      }}
      noValidate
    >
      <div style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
        <label htmlFor="company">Company</label>
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
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={updateField("name")}
          style={{
            padding: "10px 12px",
            border: "1px solid #e5e5e5",
            borderRadius: 4,
            fontFamily: "inherit",
            fontSize: "1rem",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label htmlFor="email" style={{ fontWeight: 500, fontSize: "0.95rem" }}>
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={updateField("email")}
          style={{
            padding: "10px 12px",
            border: "1px solid #e5e5e5",
            borderRadius: 4,
            fontFamily: "inherit",
            fontSize: "1rem",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label htmlFor="subject" style={{ fontWeight: 500, fontSize: "0.95rem" }}>
          Subject
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          required
          value={formData.subject}
          onChange={updateField("subject")}
          style={{
            padding: "10px 12px",
            border: "1px solid #e5e5e5",
            borderRadius: 4,
            fontFamily: "inherit",
            fontSize: "1rem",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label htmlFor="message" style={{ fontWeight: 500, fontSize: "0.95rem" }}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          value={formData.message}
          onChange={updateField("message")}
          style={{
            padding: "10px 12px",
            border: "1px solid #e5e5e5",
            borderRadius: 4,
            fontFamily: "inherit",
            fontSize: "1rem",
            resize: "vertical",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label htmlFor="attachments" style={{ fontWeight: 500, fontSize: "0.95rem" }}>
          Attach files (optional)
        </label>
        <input
          type="file"
          id="attachments"
          name="attachments"
          multiple
          onChange={handleFiles}
          style={{ fontSize: "0.95rem" }}
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        style={{
          padding: "12px 24px",
          backgroundColor: "#000",
          color: "#fff",
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
        {status === "loading" ? "Sending..." : "Send Message"}
      </button>

      {status === "success" && (
        <p style={{ color: "#0A7A0A", margin: 0 }}>Message sent! I will get back to you soon.</p>
      )}
      {status === "error" && (
        <div style={{ color: "#B00020", margin: 0, display: "grid", gap: 6 }}>
          <p style={{ margin: 0 }}>{error || "Something went wrong. Please try again."}</p>
          {error === "SERVER_CONFIG_INCOMPLETE" && (
            <p style={{ margin: 0, color: "#B00020", fontSize: "0.95rem", lineHeight: 1.5 }}>
              Contact form is not configured yet. The site owner must set SMTP_* and CONTACT_TO in Vercel environment variables.
            </p>
          )}
        </div>
      )}
    </form>
  );
}
