import type { LifeEntryInput } from "@/lib/life/types";

export function validateLifeEntryInput(input: LifeEntryInput): string | null {
  const title = input.title.trim();
  if (!title) return "Title is required.";

  if (!input.startDate) return "Start date is required.";

  if (input.entryType === "event") {
    if (input.endDate || input.endPrecision || input.isOngoing) {
      return "Events cannot have an end date or ongoing state.";
    }
    return null;
  }

  if (input.isOngoing) {
    if (input.endDate || input.endPrecision) {
      return "Ongoing periods cannot have an end date.";
    }
    return null;
  }

  if (!input.endDate || !input.endPrecision) {
    return "Periods need an end date or “still ongoing”.";
  }

  if (input.endDate < input.startDate) {
    return "End date cannot be before start date.";
  }

  return null;
}
