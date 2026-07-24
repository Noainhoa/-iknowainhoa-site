export type ParsedDniFields = {
  name: string;
  surnames: string;
  dni: string;
};

function titleCaseName(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function cleanMrzName(raw: string): string {
  return raw
    .replace(/</g, " ")
    .replace(/[^A-ZÁÉÍÓÚÜÑ\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Parse Spanish DNI / NIE OCR text (labels + optional MRZ). */
export function parseSpanishDniText(raw: string): ParsedDniFields {
  const text = raw.replace(/\r/g, "\n");
  const upper = text.toUpperCase();

  let dni = "";
  const nieMatch = upper.match(/\b([XYZ]\d{7}[A-Z])\b/);
  const dniMatch = upper.match(/\b(\d{8}[A-Z])\b/);
  if (nieMatch) dni = nieMatch[1];
  else if (dniMatch) dni = dniMatch[1];

  // TD1 MRZ line 3: APELLIDO1<APELLIDO2<<NOMBRE<...
  const mrzLines = upper
    .split("\n")
    .map((l) => l.replace(/\s+/g, "").trim())
    .filter((l) => l.includes("<") && l.length >= 20);

  let surnames = "";
  let name = "";

  const nameLine = mrzLines.find((l) => l.includes("<<") && !l.startsWith("ID"));
  if (nameLine) {
    const [surnamesPart, namesPart] = nameLine.split("<<");
    surnames = titleCaseName(cleanMrzName(surnamesPart || ""));
    name = titleCaseName(cleanMrzName((namesPart || "").split("<")[0] || ""));
  }

  if (!surnames) {
    const apellidos =
      text.match(/apellidos?\s*[:\-]?\s*([A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s\-']{2,60})/i) ||
      text.match(/surname[s]?\s*[:\-]?\s*([A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s\-']{2,60})/i);
    if (apellidos) surnames = titleCaseName(apellidos[1].split("\n")[0].trim());
  }

  if (!name) {
    const nombre =
      text.match(/\bnombre\s*[:\-]?\s*([A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s\-']{2,40})/i) ||
      text.match(/\bgiven\s*names?\s*[:\-]?\s*([A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s\-']{2,40})/i);
    if (nombre) name = titleCaseName(nombre[1].split("\n")[0].trim());
  }

  // Avoid capturing labels as values
  if (/^(nombre|apellidos?|dni|nie|espana|españa)$/i.test(name)) name = "";
  if (/^(nombre|apellidos?|dni|nie|espana|españa)$/i.test(surnames)) surnames = "";

  return { name, surnames, dni };
}

export async function extractDniFromImage(file: File): Promise<ParsedDniFields> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("spa+eng");
  try {
    const {
      data: { text },
    } = await worker.recognize(file);
    return parseSpanishDniText(text);
  } finally {
    await worker.terminate();
  }
}
