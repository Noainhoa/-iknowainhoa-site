/** Claude V2 SVG illustrations — decorative only. */

export function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

export function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
    </svg>
  );
}

export function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function IconChat() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19l1.2-4A8 8 0 1 1 9 18.8z" />
      <path d="M9 10h6M9 13h4" />
    </svg>
  );
}

export function IconPhotos() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="M4 18l5-5 4 4 3-3 5 5" />
    </svg>
  );
}

/**
 * Apple Photos flower (iOS “Fotos” mark) — eight radial petals.
 * Overlapping ellipses match the system app icon; tuned for ~24px on the white hero badge.
 */
export function IconApplePhotos() {
  const petals: ReadonlyArray<{ fill: string; rot: number }> = [
    { fill: "#FF8F44", rot: 0 },
    { fill: "#FFD426", rot: 45 },
    { fill: "#A8D948", rot: 90 },
    { fill: "#5EC6B8", rot: 135 },
    { fill: "#5DAEE8", rot: 180 },
    { fill: "#9B84C8", rot: 225 },
    { fill: "#D67AAD", rot: 270 },
    { fill: "#F26B4E", rot: 315 },
  ];
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g transform="translate(12 12)">
        {petals.map(({ fill, rot }) => (
          <ellipse
            key={rot}
            cx="0"
            cy="-5.35"
            rx="3.45"
            ry="6.15"
            fill={fill}
            fillOpacity={0.94}
            transform={`rotate(${rot})`}
          />
        ))}
      </g>
    </svg>
  );
}

export function IconCloud() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 18a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 18 8.5 4.8 4.8 0 0 1 17.5 18z" />
    </svg>
  );
}

/** Storage-full warning — gauge + exclamation. */
export function IconStorageFull() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.5 16.5a8.5 8.5 0 1 1 15 0" />
      <path d="M7.2 16.5a5.8 5.8 0 0 1 9.7-4.1" />
      <path d="M12 16.5V11.2" />
      <circle cx="12" cy="16.5" r="1.15" fill="currentColor" stroke="none" />
      <path d="M17.6 6.2v3.2" />
      <circle cx="17.6" cy="11.2" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** iCloud-style filled cloud with “storage full” exclamation badge. */
export function IconICloud() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M16.85 17.85H7.55a4.55 4.55 0 0 1-.35-9.08 6.05 6.05 0 0 1 11.35.85 3.7 3.7 0 0 1 1.55 7.05 5.6 5.6 0 0 0-3.25 1.18z"
      />
      {/* Full-storage warning badge (cloud + !). */}
      <circle cx="17.6" cy="17.35" r="5.45" fill="currentColor" />
      <circle cx="17.6" cy="17.35" r="4.2" fill="#fff" />
      <rect x="16.85" y="14.2" width="1.5" height="3.55" rx="0.75" fill="currentColor" />
      <circle cx="17.6" cy="19.55" r="0.85" fill="currentColor" />
    </svg>
  );
}

export function IconSpark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />
    </svg>
  );
}

export function IconVideo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="6" width="12" height="12" rx="3" />
      <path d="M15 10.5l6-3.5v10l-6-3.5" />
    </svg>
  );
}

/** Warning / “something broke” mark. */
export function IconError() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5" />
      <path d="M12 16.5h.01" />
    </svg>
  );
}

/** Settings / gear wheel (tapped something in Settings). */
export function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3.1" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

/**
 * FaceTime camera glyph from Wikimedia Commons (FaceTime_iOS.svg, public domain).
 * @see https://commons.wikimedia.org/wiki/File:FaceTime_iOS.svg
 * White glyph paths only (no app-icon gradient); `currentColor` for the green badge.
 */
export function IconFaceTime() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g transform="scale(0.04)">
        <path
          fill="currentColor"
          d="M91.5 227.3v146.1c0 31.9 25.9 57.7 57.7 57.7H325c31.9 0 57.7-25.9 57.7-57.7V227.3c0-31.9-25.9-57.7-57.7-57.7H149.3c-31.9-.1-57.8 25.8-57.8 57.7zm379.3-39.1-66.2 54.6c-5.9 4.9-9.3 12.1-9.3 19.7v75.6c0 7.6 3.3 14.7 9.1 19.6l66.2 55.6c15.1 12.6 38 1.9 38-17.7V206c.1-19.5-22.7-30.3-37.8-17.8z"
        />
      </g>
    </svg>
  );
}

export function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l8 3v6c0 4.5-3.3 7.8-8 9-4.7-1.2-8-4.5-8-9V6z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
    </svg>
  );
}

/**
 * Official Cl@ve orange mark (corporate @ + keyhole) from the brand SVG.
 * Drawn on a white badge so the orange identity reads clearly.
 */
export function IconClave() {
  return (
    <svg viewBox="0 0 293 293" aria-hidden="true" focusable="false">
      <path
        fill="#FF5A00"
        fillRule="evenodd"
        d="M146.5,0 C226.600619,0 291.686662,64.2850375 292.980373,144.077355 L293,146.5 L270.80303,146.5 C270.80303,77.849332 215.150668,22.1969697 146.5,22.1969697 C77.849332,22.1969697 22.1969697,77.849332 22.1969697,146.5 C22.1969697,214.464161 76.74185,269.688683 144.444422,270.786377 L146.5,270.80303 L146.5,293 C65.5902842,293 0,227.409716 0,146.5 C0,65.5902842 65.5902842,0 146.5,0 Z M142.060606,77.6893939 C162.561588,77.6893939 180.898789,87.2624499 193.114137,102.318555 L193.113636,95.4469697 L215.310606,95.4469697 L215.310606,197.55303 L193.113636,197.55303 L193.113929,190.681702 C180.89858,205.737659 162.561471,215.310606 142.060606,215.310606 C105.283462,215.310606 75.469697,184.503048 75.469697,146.5 C75.469697,108.496952 105.283462,77.6893939 142.060606,77.6893939 Z M142.060606,126.522727 C134.705177,126.522727 128.742424,132.48548 128.742424,139.840909 C128.742424,144.655855 131.297558,148.874018 135.125868,151.213438 L135.401467,151.377327 L135.401515,166.477273 L140.950758,173.136364 L145.390152,173.136364 L145.390152,166.477273 L146.5,166.477273 L146.5,164.257576 L145.390152,164.257576 L145.390152,160.92803 L147.609848,160.92803 L147.610039,151.951395 C152.194787,149.847065 155.378788,145.215819 155.378788,139.840909 C155.378788,132.48548 149.416035,126.522727 142.060606,126.522727 Z M142.060606,137.621212 C143.286511,137.621212 144.280303,138.615004 144.280303,139.840909 C144.280303,141.066814 143.286511,142.060606 142.060606,142.060606 C140.834701,142.060606 139.840909,141.066814 139.840909,139.840909 C139.840909,138.615004 140.834701,137.621212 142.060606,137.621212 Z"
      />
    </svg>
  );
}

/** @deprecated Prefer IconClave for the Cl@ve bubble. */
export function IconKey() {
  return <IconClave />;
}

/** Suspicious / scam message warning. */
export function IconScamAlert() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19l1.2-4A8 8 0 1 1 9 18.8z" />
      <path d="M12 8.2v4.2" />
      <circle cx="12" cy="15.2" r="0.85" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconWhatsAppBubble() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19l1.2-4A8 8 0 1 1 9 18.8z" />
    </svg>
  );
}

/** Official-style WhatsApp phone-bubble mark (filled, currentColor). */
export function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
      />
    </svg>
  );
}

/** OpenAI / ChatGPT flower mark (filled, currentColor). */
export function IconChatGPT() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .5157 4.9111 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0555 6.0555 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7581a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.1412.0852 4.783 2.758a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.1419-.0852-4.783-2.7625a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.097-.993l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
      />
    </svg>
  );
}

const TOPIC_ICONS = [IconWhatsApp, IconPhotos, IconCloud, IconChatGPT, IconVideo, IconShield] as const;

export function TopicIcon({ index }: { index: number }) {
  const Icon = TOPIC_ICONS[index % TOPIC_ICONS.length];
  return <Icon />;
}

/**
 * Hero icons: real app marks only where recognition helps
 * (WhatsApp, FaceTime); photos uses a simple picture glyph; others use clear symbols.
 */
const HERO_BUBBLE_ICONS = [
  IconWhatsApp,
  IconPhotos,
  IconSettings,
  IconFaceTime,
  // Slot 4 / li:nth-child(5) (“no space” bubble) — user-approved final; do not swap without design review.
  IconICloud,
  IconCalendar,
  IconClave,
  IconScamAlert,
] as const;

export function HeroBubbleIcon({ index }: { index: number }) {
  const Icon = HERO_BUBBLE_ICONS[index % HERO_BUBBLE_ICONS.length];
  return <Icon />;
}

/**
 * Three rounded comic strips (“–”) from one origin (−28° / 0° / +28°).
 * Capsule bars with fully rounded ends — not needles or commas.
 */
export function BubbleEmphasisBurst() {
  return (
    <svg
      className="tme-bubble-rays-svg"
      viewBox="0 0 28 22"
      width="28"
      height="22"
      focusable="false"
      aria-hidden="true"
    >
      {/* Origin ~30% closer to the viewBox bottom so strokes sit nearer the pill edge. */}
      <g transform="translate(14 20.95)">
        <g transform="translate(-4 -0.28) rotate(-28)">
          <rect className="tme-ray" x="-1.2" y="-11.5" width="2.4" height="10.5" rx="1.2" />
        </g>
        <g transform="translate(0 -0.56) rotate(0)">
          <rect className="tme-ray" x="-1.35" y="-12.5" width="2.7" height="11.5" rx="1.35" />
        </g>
        <g transform="translate(4 -0.28) rotate(28)">
          <rect className="tme-ray" x="-1.2" y="-11.5" width="2.4" height="10.5" rx="1.2" />
        </g>
      </g>
    </svg>
  );
}
