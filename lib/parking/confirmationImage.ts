import { formatSpanishDate } from "@/lib/parking/types";

export type ConfirmationImageInput = {
  name: string;
  surnames: string;
  dni: string;
  phone: string;
  startDate: string;
  endDate: string;
  priceEur: number;
};

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let cy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = word;
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cy);
  return cy;
}

/** Draws a booking confirmation card and returns a PNG blob. */
export async function buildConfirmationImage(
  input: ConfirmationImageInput
): Promise<Blob> {
  const width = 720;
  const height = 960;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible");

  // Background
  ctx.fillStyle = "#f7f4ef";
  ctx.fillRect(0, 0, width, height);

  // Accent bar
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, width, 12);

  ctx.fillStyle = "#1a1a1a";
  ctx.font = "700 34px system-ui, -apple-system, sans-serif";
  ctx.fillText("Parking Guardamar Centro", 48, 80);

  ctx.fillStyle = "#555";
  ctx.font = "500 22px system-ui, -apple-system, sans-serif";
  ctx.fillText("Jorge Juan 13", 48, 118);

  ctx.fillStyle = "#1a1a1a";
  ctx.font = "700 28px system-ui, -apple-system, sans-serif";
  ctx.fillText("Confirmación de reserva", 48, 180);

  const rows: [string, string][] = [
    ["Nombre", `${input.name} ${input.surnames}`.trim()],
    ["DNI / NIE", input.dni],
    ["Teléfono", input.phone],
    ["Desde", formatSpanishDate(input.startDate)],
    ["Hasta", formatSpanishDate(input.endDate)],
    [
      "Importe",
      `${input.priceEur.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} €`,
    ],
  ];

  let y = 240;
  for (const [label, value] of rows) {
    ctx.fillStyle = "#777";
    ctx.font = "600 16px system-ui, -apple-system, sans-serif";
    ctx.fillText(label.toUpperCase(), 48, y);
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "600 26px system-ui, -apple-system, sans-serif";
    y = wrapText(ctx, value, 48, y + 34, width - 96, 32) + 48;
  }

  ctx.fillStyle = "#888";
  ctx.font = "400 16px system-ui, -apple-system, sans-serif";
  wrapText(
    ctx,
    "Reserva confirmada. Conserva este comprobante. Altura máxima del vehículo: 1,79 m.",
    48,
    height - 90,
    width - 96,
    24
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("No se pudo generar la imagen"));
        else resolve(blob);
      },
      "image/png",
      1
    );
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Normalize a Spanish phone for wa.me (digits only, default +34). */
export function phoneToWhatsAppDigits(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("34") && digits.length >= 11) return digits;
  if (digits.length === 9) return `34${digits}`;
  return digits;
}

export function customerWhatsAppHref(phone: string, message: string): string {
  const digits = phoneToWhatsAppDigits(phone);
  if (!digits) return `https://wa.me/?text=${encodeURIComponent(message)}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
