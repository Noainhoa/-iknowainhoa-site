export const TECH_PATH = "/tech-made-easy";
export const TECH_TIMEZONE = "Europe/Madrid";

export const GROUP_PRICE_CENTS = 1000;
export const INDIVIDUAL_PRICE_CENTS = 2500;
export const GROUP_MINUTES = 75;
export const INDIVIDUAL_MINUTES = 60;
export const GROUP_CAPACITY = 5;

export const SOURCES = ["facebook", "instagram", "whatsapp", "flyer", "referral"] as const;
export type TechSource = (typeof SOURCES)[number];

export const CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000;
export const REQUEST_LEAD_MS = 60 * 60 * 1000;

export const RATE_WINDOW_SECONDS = 10 * 60;
export const RATE_MAX_PER_IP = 8;
export const RATE_MAX_PER_PHONE = 4;
