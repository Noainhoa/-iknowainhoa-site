/** Live input: uppercase A–Z / 0–9 / spaces only. */
export function normalizeParkingPlateInput(raw: string, max = 80): string {
  return raw.toUpperCase().replace(/[^A-Z0-9\s]/g, "").slice(0, max);
}

/** Stored / submitted plate: collapse spaces and trim. */
export function normalizeParkingPlate(raw: string, max = 80): string {
  return normalizeParkingPlateInput(raw, max).trim().replace(/\s+/g, " ");
}
