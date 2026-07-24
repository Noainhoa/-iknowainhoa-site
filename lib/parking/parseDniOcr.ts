export type ParsedDniFields = {
  name: string;
  surnames: string;
  dni: string;
};

const JUNK =
  /^(s|sur|name|names|surname|surnames|given|givennames|apellido|apellidos|nombre|nombres|dni|nie|esp|españa|espana|sex|sexo|nationality|nacionalidad|id|identity|document|documento|card|tarjeta)$/i;

function titleCaseName(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function normalizeLine(line: string): string {
  return line.replace(/\s+/g, " ").trim();
}

function isJunk(value: string): boolean {
  const v = value.trim();
  if (v.length < 2) return true;
  if (JUNK.test(v.replace(/\s+/g, ""))) return true;
  if (/^[\d\W_]+$/.test(v)) return true;
  return false;
}

function looksLikeDate(line: string): boolean {
  return /^\d{1,2}[\s./-]+\d{1,2}[\s./-]+\d{2,4}/.test(line);
}

function looksLikeDniId(line: string): boolean {
  const compact = line.replace(/\s/g, "");
  if (/^(DNI|NIE)?[XYZ]?\d{7,8}[A-Z]$/i.test(compact)) return true;
  if (/\b([XYZ]\d{7}[A-Z]|\d{8}[A-Z])\b/i.test(line)) return true;
  return false;
}

function isSectionLabel(line: string): boolean {
  const u = line.toUpperCase();
  return (
    /APELLIDOS/.test(u) ||
    /\bNOMBRE\b/.test(u) ||
    /SURNAME/.test(u) ||
    /GIVEN\s*NAMES?/.test(u) ||
    /NACIONALIDAD/.test(u) ||
    /NATIONALITY/.test(u) ||
    /\bSEXO\b/.test(u) ||
    /\bSEX\b/.test(u) ||
    /FECHA/.test(u) ||
    /BIRTH/.test(u) ||
    /DOMICILIO/.test(u) ||
    /ADDRESS/.test(u) ||
    /VALIDEZ/.test(u) ||
    /VALIDITY/.test(u) ||
    /SOPORTE/.test(u) ||
    /SUPPORT/.test(u) ||
    /IDENTIDAD/.test(u)
  );
}

/** Collect value lines after a label until the next section. */
function valuesAfterLabel(
  lines: string[],
  labelTest: (line: string) => boolean,
  maxLines: number,
  inlineExtract?: (line: string) => string | null
): string[] {
  const start = lines.findIndex(labelTest);
  if (start < 0) return [];

  const out: string[] = [];
  if (inlineExtract) {
    const inline = inlineExtract(lines[start]);
    if (inline && !isJunk(inline)) out.push(inline);
  }

  for (let i = start + 1; i < lines.length; i++) {
    const line = normalizeLine(lines[i]);
    if (!line) continue;
    if (isSectionLabel(line) && !inlineExtract?.(line)) break;
    if (isSectionLabel(line)) break;
    if (looksLikeDate(line) || looksLikeDniId(line)) break;
    if (/^(SURNAME|GIVEN NAMES?|SEX|NATIONALITY)$/i.test(line)) continue;
    if (!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2,}/.test(line)) continue;
    out.push(
      line.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s\-']/g, " ").replace(/\s+/g, " ").trim()
    );
    if (out.length >= maxLines) break;
  }
  return out.filter((v) => !isJunk(v));
}

function inlineAfter(line: string, patterns: RegExp[]): string | null {
  for (const re of patterns) {
    const m = line.match(re);
    if (m?.[1]) {
      const v = m[1]
        .replace(/\b(SURNAME|GIVEN NAMES?|SEX|NATIONALITY)\b/gi, " ")
        .replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s\-']/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (!isJunk(v)) return v;
    }
  }
  return null;
}

function parseMrz(upper: string): { name: string; surnames: string } | null {
  const mrzLines = upper
    .split("\n")
    .map((l) => l.replace(/\s+/g, "").trim())
    .filter((l) => (l.match(/</g) || []).length >= 2 && l.length >= 15);

  const nameLine = mrzLines.find(
    (l) => l.includes("<<") && !l.startsWith("ID") && !/^\d/.test(l)
  );
  if (!nameLine) return null;

  const [surnamesPart, namesPart = ""] = nameLine.split("<<");
  const surnames = titleCaseName(
    surnamesPart.replace(/</g, " ").replace(/[^A-ZÁÉÍÓÚÜÑ\s]/gi, " ").replace(/\s+/g, " ").trim()
  );
  const name = titleCaseName(
    namesPart
      .split("<")[0]
      .replace(/[^A-ZÁÉÍÓÚÜÑ\s]/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
  if (isJunk(surnames) && isJunk(name)) return null;
  return {
    surnames: isJunk(surnames) ? "" : surnames,
    name: isJunk(name) ? "" : name,
  };
}

/** Parse Spanish DNI / NIE OCR text (visual labels + optional MRZ). */
export function parseSpanishDniText(raw: string): ParsedDniFields {
  const text = raw.replace(/\r/g, "\n");
  const upper = text.toUpperCase();
  const lines = text
    .split("\n")
    .map(normalizeLine)
    .filter(Boolean);

  let dni = "";
  const nieMatch = upper.match(/\b([XYZ]\d{7}[A-Z])\b/);
  const dniMatch = upper.match(/\b(\d{8}[A-Z])\b/);
  if (nieMatch) dni = nieMatch[1];
  else if (dniMatch) dni = dniMatch[1];

  const mrz = parseMrz(upper);

  const surnameLines = valuesAfterLabel(
    lines,
    (l) => /APELLIDOS/i.test(l) || (/SURNAME/i.test(l) && !/GIVEN/i.test(l)),
    3,
    (l) =>
      inlineAfter(l, [
        /APELLIDOS\s*\/\s*SURNAME\s+(.+)/i,
        /APELLIDOS\s*[:\-]?\s+(.+)/i,
        /SURNAME\s*[:\-]?\s+(.+)/i,
      ])
  );
  const nameLines = valuesAfterLabel(
    lines,
    (l) => /\bNOMBRE\b/i.test(l) || /GIVEN\s*NAMES?/i.test(l),
    2,
    (l) =>
      inlineAfter(l, [
        /NOMBRE\s*\/\s*GIVEN\s*NAMES?\s+(.+)/i,
        /NOMBRE\s*[:\-]?\s+(.+)/i,
        /GIVEN\s*NAMES?\s*[:\-]?\s+(.+)/i,
      ])
  );

  let surnames = surnameLines.join(" ").trim();
  let name = nameLines.join(" ").trim();

  // Prefer visual card fields; fall back to MRZ
  if (isJunk(surnames) && mrz?.surnames) surnames = mrz.surnames;
  if (isJunk(name) && mrz?.name) name = mrz.name;

  // If surname capture accidentally ate English label leftovers
  surnames = surnames
    .replace(/\b(surname|surnames|given|names?)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  name = name
    .replace(/\b(surname|surnames|given|names?|nombre|apellidos?|dni|nie)\b/gi, " ")
    .replace(/\b\d{8}[A-Z]\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (isJunk(surnames)) surnames = "";
  if (isJunk(name)) name = "";

  return {
    name: name ? titleCaseName(name) : "",
    surnames: surnames ? titleCaseName(surnames) : "",
    dni,
  };
}

export async function extractDniFromImage(file: File): Promise<ParsedDniFields> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("spa+eng");
  try {
    await worker.setParameters({
      // Assume a uniform block of text (ID card photo / screenshot)
      tessedit_pageseg_mode: "6",
      user_defined_dpi: "300",
    });
    const {
      data: { text },
    } = await worker.recognize(file);
    return parseSpanishDniText(text);
  } finally {
    await worker.terminate();
  }
}
