import { createHash, randomBytes, randomUUID } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function newReference(): string {
  const bytes = randomBytes(8);
  let out = "";
  for (let index = 0; index < 8; index += 1) {
    out += ALPHABET[bytes[index] % ALPHABET.length];
  }
  return out;
}

export function newCancelToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newIdempotencyKey(): string {
  return randomUUID();
}

export function isReference(value: string): boolean {
  return /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/.test(value);
}

export function isTokenHash(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(value);
}
