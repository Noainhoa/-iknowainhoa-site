export type Shortcut = {
  slug: string;
  name: string;
  description: string;
  metaDescription: string;
  words: string;
  downloadUrl: string;
  screenshots?: string[];
  iosVersion: string;
  permissions: string[];
  terms?: string;
};

export const shortcuts: Shortcut[] = [
  {
    slug: "merge-vertically",
    name: "Merge Vertically",
    description:
      "Merge multiple photos into one tall strip. Ideal for iPhone automation fans who share before/after shots, receipts, or app walkthroughs without juggling separate files.",
    metaDescription: "Merge several photos into one tall image with a single tap. Great for receipts, before/after shots, and iPhone workflow demos.",
    words:
      "This iOS shortcut lets you select 2–10 photos and stacks them in order into a single PNG. It trims transparent edges, keeps the original width, and saves to Photos or shares via the sheet. Great for productivity hacks like combining receipt pages or stitching app screens without exporting to a Mac. Use it when you want a clean, scroll-friendly image for Messages, Twitter, or bug reports. Requires the Photos permission and iCloud Shortcuts sync.",
    downloadUrl: "https://www.icloud.com/shortcuts/merge-vertically-placeholder",
    screenshots: ["/images/shortcuts/merge-vertically.png"],
    iosVersion: "iOS 17+",
    permissions: ["Photos read/write"],
    terms: "No guarantees; use at your own risk. Do not share sensitive content."
  },
  {
    slug: "merge-horizontal",
    name: "Merge Horizontal",
    description:
      "Drop 2–6 photos and get a single side‑by‑side collage. Perfect for app comparisons, colorway lineups, or quick mood boards.",
    metaDescription: "Combine multiple photos side-by-side in one tap. Handy for comparisons, design lineups, and iPhone automation workflows.",
    words:
      "Select your photos, pick the order, and the shortcut builds a single horizontal strip. It auto-crops empty space, keeps aspect ratios, and outputs a PNG to Photos or Share Sheet. Useful for product shots, UI comparisons, or before/after tests you want in one glance. Works well in an iPhone workflow where you document experiments without opening a desktop editor.",
    downloadUrl: "https://www.icloud.com/shortcuts/merge-horizontal-placeholder",
    screenshots: ["/images/shortcuts/merge-horizontal.png"],
    iosVersion: "iOS 17+",
    permissions: ["Photos read/write"],
    terms: "Provided as-is. Check your exports before sharing."
  },
  {
    slug: "screen-autolock-toggle",
    name: "Screen AutoLock Toggle",
    description:
      "One-tap switch between normal auto-lock and a long session mode. Built for focus sessions, cooking timers, and camera rigs where the screen must stay awake.",
    metaDescription: "Toggle iPhone auto-lock duration with one tap. Great for focus sessions, filming, and hands-free timers.",
    words:
      "This shortcut flips your auto-lock between standard (30s/1m) and a longer ‘stay awake’ preset. It also gives a quick haptic and banner so you know which mode you’re in. Ideal for productivity hacks like coding from your phone, reading recipes, or running camera teleprompters. It slots neatly into iPhone automation scenes or Focus filters.",
    downloadUrl: "https://www.icloud.com/shortcuts/screen-autolock-toggle-placeholder",
    screenshots: ["/images/shortcuts/screen-autolock.png"],
    iosVersion: "iOS 16+",
    permissions: [],
    terms: "You control your battery; use responsibly."
  },
  {
    slug: "one-image-to-chatgpt",
    name: "One Image to ChatGPT",
    description:
      "Send a single annotated image to ChatGPT instead of spamming 10 uploads. Compresses, renames, and hands off via share sheet for faster AI prompts.",
    metaDescription: "Pipe one optimized image into ChatGPT with context—no need to upload a batch. Great for quick AI Q&A.",
    words:
      "Pick a photo, optionally mark it up, and the shortcut reduces size, renames it, and opens ChatGPT ready to paste. It’s built for iPhone workflows where you want one clear visual with your prompt—UX reviews, bug reports, or mood references—without juggling multiple files. If you live in iOS shortcuts and AI, this keeps the loop tight.",
    downloadUrl: "https://www.icloud.com/shortcuts/one-image-chatgpt-placeholder",
    screenshots: ["/images/shortcuts/one-image-chatgpt.png"],
    iosVersion: "iOS 17+",
    permissions: ["Photos read"],
    terms: "No data is stored; you share directly to ChatGPT."
  },
  {
    slug: "daily-reset",
    name: "Daily Reset",
    description:
      "A gentle evening routine shortcut that dims your screen, turns on Do Not Disturb, logs a quick mood, and queues tomorrow’s reminders.",
    metaDescription: "Evening iPhone workflow: DND on, screen dimmed, mood logged, tomorrow’s reminders queued—one tap daily reset.",
    words:
      "Tap once and the shortcut lowers brightness, toggles a Focus, prompts you for a 20-second mood/micro-journal, and preps a checklist for the next morning. It’s for people who like iPhone automation but want a human-feeling wind-down. Works with Reminders, Health journaling, or just a notes file. Keeps the routine under a minute so it’s sustainable.",
    downloadUrl: "https://www.icloud.com/shortcuts/daily-reset-placeholder",
    screenshots: ["/images/shortcuts/daily-reset.png"],
    iosVersion: "iOS 16+",
    permissions: ["Reminders write", "Notifications"],
    terms: "Not medical advice; customize to your needs."
  }
];

export function getShortcut(slug: string) {
  return shortcuts.find((s) => s.slug === slug) || null;
}
