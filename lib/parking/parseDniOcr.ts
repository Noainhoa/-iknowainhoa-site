export type ParsedDniFields = {
  name: string;
  surnames: string;
  dni: string;
};

const JUNK =
  /^(s|sur|name|names|surname|surnames|given|givennames|apellido|apellidos|cognom|cognoms|nombre|nombres|nom|dni|nie|esp|españa|espana|sex|sexo|sexe|nationality|nacionalidad|nacionalitat|id|identity|document|documento|card|tarjeta|soport|suport)$/i;

const BILINGUAL_LEFTOVER =
  /\b(surname|surnames|given|names?|cognoms?|nom|sexe|nacionalitat|nationality|naixement)\b/gi;

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
    /COGNOMS/.test(u) ||
    /\bNOMBRE\b/.test(u) ||
    /\/\s*NOM\b/.test(u) ||
    /^\s*NOM\b/.test(u) ||
    /SURNAME/.test(u) ||
    /GIVEN\s*NAMES?/.test(u) ||
    /NACIONALIDAD/.test(u) ||
    /NACIONALITAT/.test(u) ||
    /NATIONALITY/.test(u) ||
    /\bSEXO\b/.test(u) ||
    /\bSEXE\b/.test(u) ||
    /\bSEX\b/.test(u) ||
    /FECHA/.test(u) ||
    /NAIXEMENT/.test(u) ||
    /BIRTH/.test(u) ||
    /DOMICILIO/.test(u) ||
    /ADDRESS/.test(u) ||
    /VALIDEZ/.test(u) ||
    /VALIDESA/.test(u) ||
    /VALIDITY/.test(u) ||
    /SOPORT/.test(u) ||
    /SUPORT/.test(u) ||
    /SUPPORT/.test(u) ||
    /IDENTIDAD/.test(u)
  );
}

function isBilingualOnlyLine(line: string): boolean {
  return /^(SURNAME|GIVEN NAMES?|SEX|SEXE|NATIONALITY|NACIONALITAT|COGNOMS|NOM)$/i.test(
    line
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
    if (isSectionLabel(line)) break;
    if (looksLikeDate(line) || looksLikeDniId(line)) break;
    if (isBilingualOnlyLine(line)) continue;
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
        .replace(BILINGUAL_LEFTOVER, " ")
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
    surnamesPart
      .replace(/</g, " ")
      .replace(/[^A-ZÁÉÍÓÚÜÑ\s]/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
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

function isSurnameLabel(line: string): boolean {
  return (
    /APELLIDOS/i.test(line) ||
    /COGNOMS/i.test(line) ||
    (/SURNAME/i.test(line) && !/GIVEN/i.test(line))
  );
}

function isNameLabel(line: string): boolean {
  return (
    /\bNOMBRE\b/i.test(line) ||
    /GIVEN\s*NAMES?/i.test(line) ||
    /NOMBRE\s*\/\s*NOM\b/i.test(line) ||
    /\/\s*NOM\b/i.test(line)
  );
}

/** Parse Spanish DNI / NIE OCR text (ES / CA / EN labels + optional MRZ). */
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
    isSurnameLabel,
    3,
    (l) =>
      inlineAfter(l, [
        /APELLIDOS\s*\/\s*COGNOMS?\s+(.+)/i,
        /APELLIDOS\s*\/\s*SURNAME\s+(.+)/i,
        /APELLIDOS\s*[:\-]?\s+(.+)/i,
        /COGNOMS?\s*[:\-]?\s+(.+)/i,
        /SURNAME\s*[:\-]?\s+(.+)/i,
      ])
  );
  const nameLines = valuesAfterLabel(
    lines,
    isNameLabel,
    2,
    (l) =>
      inlineAfter(l, [
        /NOMBRE\s*\/\s*NOM\s+(.+)/i,
        /NOMBRE\s*\/\s*GIVEN\s*NAMES?\s+(.+)/i,
        /NOMBRE\s*[:\-]?\s+(.+)/i,
        /\bNOM\s*[:\-]?\s+(.+)/i,
        /GIVEN\s*NAMES?\s*[:\-]?\s+(.+)/i,
      ])
  );

  let surnames = surnameLines.join(" ").trim();
  let name = nameLines.join(" ").trim();

  if (isJunk(surnames) && mrz?.surnames) surnames = mrz.surnames;
  if (isJunk(name) && mrz?.name) name = mrz.name;

  surnames = surnames.replace(BILINGUAL_LEFTOVER, " ").replace(/\s+/g, " ").trim();
  name = name
    .replace(BILINGUAL_LEFTOVER, " ")
    .replace(/\b(nombre|apellidos?|dni|nie)\b/gi, " ")
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
