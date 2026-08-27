import type { Locale } from "@/lib/i18n/shared";

export type ListenEasyCopy = {
  meta: { title: string; description: string };
  tagline: string;
  summary: string;
  whyLabel: string;
  alsoHeading: string;
  support: string;
  privacy: string;
  standouts: { title: string; line: string }[];
  more: { title: string; line: string }[];
  actions: {
    join: string;
    share: string;
    copied: string;
    copyFail: string;
    shareTitle: (name: string) => string;
    shareText: (name: string) => string;
    stepInstall: string;
    stepTestFlight: string;
    stepJoin: string;
  };
};

const en: ListenEasyCopy = {
  meta: {
    title: "ListenEasy",
    description:
      "For the audiobooks you already own. Multi-file books stay together, and you never lose your place. Join the ListenEasy open beta on TestFlight.",
  },
  tagline: "For the audiobooks you already own.",
  summary:
    "Stop managing folders of tracks. ListenEasy turns audiobooks you already own into a real library on iPhone · multi-file sets stay one book, and you never lose your place.",
  whyLabel: "Why ListenEasy",
  alsoHeading: "Also in the beta",
  support: "Support",
  privacy: "Privacy",
  standouts: [
    {
      title: "Stop living in folders of tracks",
      line: "Multi-file and CD/disc sets become one book · not dozens of separate files.",
    },
    {
      title: "A library for books you already own",
      line: "Import from Files. No audiobook store, subscription, or account.",
    },
    {
      title: "Never lose your place",
      line: "Position saved for every book. Resume exactly where you stopped.",
    },
  ],
  more: [
    { title: "Easy importing", line: "Files, folders, Share, or AirDrop." },
    {
      title: "Notes made for listening",
      line: "Timestamped notes and bookmarks. Jump back to the exact moment.",
    },
    {
      title: "Library that shows where you are",
      line: "Not Started, Continuing, Finished · plus search, sort, favourites, progress.",
    },
    { title: "Chapters & parts", line: "Browse and jump to the section you want." },
    { title: "Flexible playback", line: "0.5×–3× speed, seek, custom skip intervals." },
    { title: "Sleep timer", line: "Stop automatically after 5–60 minutes." },
    {
      title: "Background & lock screen",
      line: "Listen locked; control from Lock Screen, Control Centre, or Bluetooth.",
    },
    {
      title: "Covers & metadata",
      line: "Use embedded info, or fill in artwork when you want.",
    },
    {
      title: "Companion PDFs",
      line: "Keep a book’s PDF with it and open from details.",
    },
    {
      title: "Offline by design",
      line: "Books live on device. No connection needed to listen.",
    },
    {
      title: "Private & account-free",
      line: "No login. Online metadata lookup is optional and off by default.",
    },
    {
      title: "Broad formats",
      line: "M4B, MP3, M4A, FLAC, WAV, AIFF/AIF, and other iOS media.",
    },
  ],
  actions: {
    join: "Join the beta",
    share: "Share invite",
    copied: "Link copied",
    copyFail: "Couldn’t copy",
    shareTitle: (name) => `${name} beta`,
    shareText: (name) => `Join the ${name} beta on TestFlight:`,
    stepInstall: "Install",
    stepTestFlight: "from the App Store (on your phone)",
    stepJoin: "Tap Join the beta on this page",
  },
};

const es: ListenEasyCopy = {
  meta: {
    title: "ListenEasy",
    description:
      "Para los audiolibros que ya tienes. Los libros en varios archivos se quedan juntos y no pierdes el punto. Únete a la beta abierta de ListenEasy en TestFlight.",
  },
  tagline: "Para los audiolibros que ya tienes.",
  summary:
    "Deja de vivir entre carpetas de pistas. ListenEasy convierte los audiolibros que ya tienes en una biblioteca de verdad en el iPhone: los sets de varios archivos son un solo libro y no pierdes el punto.",
  whyLabel: "Por qué ListenEasy",
  alsoHeading: "También en la beta",
  support: "Soporte",
  privacy: "Privacidad",
  standouts: [
    {
      title: "Deja de vivir entre carpetas de pistas",
      line: "Los sets de varios archivos o CDs se convierten en un solo libro, no en decenas de archivos sueltos.",
    },
    {
      title: "Una biblioteca para los libros que ya tienes",
      line: "Importa desde Archivos. Sin tienda de audiolibros, suscripción ni cuenta.",
    },
    {
      title: "Nunca pierdes el punto",
      line: "La posición se guarda en cada libro. Retomas exactamente donde lo dejaste.",
    },
  ],
  more: [
    { title: "Importar es fácil", line: "Archivos, carpetas, Compartir o AirDrop." },
    {
      title: "Notas pensadas para escuchar",
      line: "Notas y marcadores con marca de tiempo. Vuelves al momento exacto.",
    },
    {
      title: "La biblioteca dice dónde estás",
      line: "Sin empezar, En curso, Terminados · más búsqueda, orden, favoritos y progreso.",
    },
    { title: "Capítulos y partes", line: "Navega y salta a la sección que quieras." },
    { title: "Reproducción flexible", line: "Velocidad 0,5×–3×, salto y intervalos a medida." },
    { title: "Temporizador de sueño", line: "Se para solo a los 5–60 minutos." },
    {
      title: "Segundo plano y pantalla bloqueada",
      line: "Escucha con el teléfono bloqueado; controla desde la pantalla de bloqueo, el Centro de control o Bluetooth.",
    },
    {
      title: "Portadas y metadatos",
      line: "Usa la información incrustada o añade la portada cuando quieras.",
    },
    {
      title: "PDFs de acompañamiento",
      line: "Guarda el PDF del libro y ábrelo desde los detalles.",
    },
    {
      title: "Offline de serie",
      line: "Los libros viven en el dispositivo. No hace falta conexión para escuchar.",
    },
    {
      title: "Privado y sin cuenta",
      line: "Sin inicio de sesión. La búsqueda de metadatos online es opcional y viene desactivada.",
    },
    {
      title: "Muchos formatos",
      line: "M4B, MP3, M4A, FLAC, WAV, AIFF/AIF y otros de iOS.",
    },
  ],
  actions: {
    join: "Unirme a la beta",
    share: "Compartir invitación",
    copied: "Enlace copiado",
    copyFail: "No se ha podido copiar",
    shareTitle: (name) => `Beta de ${name}`,
    shareText: (name) => `Únete a la beta de ${name} en TestFlight:`,
    stepInstall: "Instala",
    stepTestFlight: "desde el App Store (en el teléfono)",
    stepJoin: "Toca Unirme a la beta en esta página",
  },
};

export function getListenEasyCopy(locale: Locale | "en" | "es" = "en"): ListenEasyCopy {
  return locale === "es" ? es : en;
}
