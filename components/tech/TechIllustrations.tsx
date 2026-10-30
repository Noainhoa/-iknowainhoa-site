/** Claude V2 SVG illustrations — decorative only. */

export function TechBrandMark({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden="true">
      <circle cx="22" cy="22" r="22" fill="#0E4F5A" />
      <circle cx="22" cy="16" r="6.5" fill="#F6BC3B" />
      <path
        d="M6 27c5-4 9-4 13 0s8 4 12 0 6-3 7-2"
        stroke="#9CC8E4"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M9 34c4-3 7-3 10 0s7 3 10 0 5-2 6-1"
        stroke="#FBF1DC"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        opacity=".7"
      />
    </svg>
  );
}

export function TechHeroCoast() {
  return (
    <svg viewBox="0 0 360 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="tme-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9CC8E4" />
          <stop offset=".6" stopColor="#F7E8C8" />
        </linearGradient>
      </defs>
      <rect width="360" height="450" fill="url(#tme-sky)" />
      <circle cx="238" cy="150" r="80" fill="#F6BC3B" opacity=".16" />
      <circle cx="238" cy="150" r="54" fill="#F6BC3B" opacity=".3" />
      <circle cx="238" cy="150" r="34" fill="#F6BC3B" />
      <path d="M0 250Q90 238 180 250T360 250V450H0Z" fill="#6FA9CF" />
      <path d="M0 290Q90 276 180 290T360 290V450H0Z" fill="#3F86AE" />
      <path d="M0 335Q90 320 180 335T360 335V450H0Z" fill="#1F6C84" />
      <path d="M0 385Q100 365 200 385T360 372V450H0Z" fill="#0E4F5A" />
      <path
        d="M200 262h64M212 274h40M224 286h18"
        stroke="#FBE3A3"
        strokeWidth="3"
        strokeLinecap="round"
        opacity=".85"
      />
      <g transform="translate(78 212)">
        <path d="M0 32h48l-8 10H8z" fill="#FBF1DC" />
        <path d="M23 0v30H4z" fill="#fff" />
        <path d="M27 8v22h19z" fill="#FBF1DC" />
      </g>
      <g transform="translate(298 328)">
        <path d="M0 76V24" stroke="#5B3B22" strokeWidth="5" />
        <ellipse cx="0" cy="20" rx="34" ry="14" fill="#2F6B4A" />
        <ellipse cx="-8" cy="14" rx="20" ry="8" fill="#3C8059" />
      </g>
      <path d="M150 450C215 392 300 380 360 392V450z" fill="#EAD3A0" />
      <path d="M200 450C250 415 310 410 360 418V450z" fill="#DDBF84" />
    </svg>
  );
}

export function TechPortrait() {
  return (
    <svg viewBox="0 0 240 300" aria-hidden="true">
      <rect width="240" height="300" fill="#8DBBD9" />
      <circle cx="170" cy="70" r="30" fill="#F6BC3B" />
      <path d="M0 230q60-30 120-8t120-10v90H0z" fill="#3F86AE" opacity=".6" />
      <circle cx="120" cy="140" r="42" fill="#E9B896" />
      <path d="M72 138c-2-40 22-60 50-60s52 18 48 62c-8-22-22-30-48-30s-42 8-50 28z" fill="#4A2E22" />
      <path d="M40 300c6-60 40-90 80-90s74 30 80 90z" fill="#FBF1DC" />
      <path d="M100 212l20 22 20-22" fill="#E9B896" />
      <circle cx="106" cy="144" r="3.5" fill="#3A2418" />
      <circle cx="134" cy="144" r="3.5" fill="#3A2418" />
      <path
        d="M107 160c8 8 18 8 26 0"
        stroke="#B9472F"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TechWave() {
  return (
    <svg className="tme-wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 80V40C160 8 320 8 480 40s320 32 480 0 320-32 480 0v40z" fill="currentColor" />
    </svg>
  );
}

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

export function IconCloud() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 18a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 18 8.5 4.8 4.8 0 0 1 17.5 18z" />
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

export function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l8 3v6c0 4.5-3.3 7.8-8 9-4.7-1.2-8-4.5-8-9V6z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
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

const TOPIC_ICONS = [IconChat, IconPhotos, IconCloud, IconSpark, IconVideo, IconShield] as const;

export function TopicIcon({ index }: { index: number }) {
  const Icon = TOPIC_ICONS[index % TOPIC_ICONS.length];
  return <Icon />;
}
