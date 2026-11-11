export const LOCALES = ["en", "es", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** BCP 47 tag for dates / Intl. */
export function localeTag(locale: Locale): string {
  if (locale === "es") return "es-ES";
  if (locale === "fr") return "fr-FR";
  return "en-GB";
}

type Dictionary = {
  header: {
    blog: string;
    work: string;
    about: string;
    contact: string;
    gallery: string;
    aboutMenu: string;
    openMenu: string;
    closeMenu: string;
    siteMenu: string;
    whatsAppAria: string;
    techHelp: string;
  };
  footer: {
    support: string;
    description: string;
  };
  home: {
    lead: string;
    featuresLabel: string;
    previous: string;
    next: string;
    open: string;
  };
  work: {
    title: string;
    subtitle: string;
    empty: string;
    more: string;
    visitLive: string;
    productPage: string;
    openProduct: (name: string) => string;
    sections: {
      apps: string;
      websites: string;
      systems: string;
      "product-design": string;
    };
  };
  about: {
    title: string;
    intro1: string;
    intro2: string;
    whatIDoTitle: string;
    whatIDoIntro: string;
    bullet1: string;
    bullet2: string;
    bullet3: string;
    touchTitle: string;
    touchBody: string;
    touchButton: string;
  };
  contact: {
    title: string;
    intro: string;
    emailTitle: string;
    emailSubtitle: string;
    socialTitle: string;
    socialSubtitle: string;
    formTitle: string;
    responseTitle: string;
    responseBody: string;
    form: {
      name: string;
      email: string;
      subject: string;
      message: string;
      company: string;
      attachments: string;
      attachmentsHint: string;
      addFiles: string;
      send: string;
      sending: string;
      sent: string;
      errName: string;
      errEmail: string;
      errSubject: string;
      errMessage: string;
      errFilesCount: string;
      errFilesSize: string;
      errFilesType: string;
      errGeneric: string;
      errConfig: string;
      errRate: string;
    };
  };
  blog: {
    title: string;
    subtitle: string;
    search: string;
    showing: (n: number, q: string) => string;
    clear: string;
    empty: string;
    draftBadge: string;
    brandLine1: string;
    brandLine2: string;
    openMenu: string;
    closeMenu: string;
    menu: string;
    navLearn: string;
    navConnect: string;
    navBest: string;
    navMore: string;
    allPosts: string;
    blueGallery: string;
    blueStory: string;
    sayHello: string;
    home: string;
    bestBlue: string;
    bestStart: string;
    bestJar: string;
    bestKeep: string;
  };
  gallery: {
    kicker: string;
    title: string;
    intro: string;
    openPhoto: (title: string) => string;
    openVideo: (title: string) => string;
    openReel: (title: string) => string;
  };
  thanks: {
    kicker: string;
    title: string;
    body: string;
    backAnicca: string;
    home: string;
  };
  support: {
    title: string;
    subtitle: string;
    custom: string;
    processing: string;
    contributeFor: string;
    chooseAmount: string;
    customAmount: string;
    enterAmount: string;
    checkoutFail: string;
  };
  apps: {
    product: string;
    support: string;
    privacy: string;
    backTo: (name: string) => string;
    privacyPolicy: (name: string) => string;
    supportPage: (name: string) => string;
  };
};

const en: Dictionary = {
  header: {
    blog: "Blog",
    work: "Work",
    about: "About",
    contact: "Contact",
    gallery: "Gallery",
    aboutMenu: "About menu",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    siteMenu: "Site menu",
    whatsAppAria: "WhatsApp enquiry",
    techHelp: "Tech help",
  },
  footer: {
    support: "Support this work",
    description: "Writing, projects, and ideas.",
  },
  home: {
    lead: "I design and build small, honest internet things.",
    featuresLabel: "Published work and writing",
    previous: "Previous",
    next: "Next",
    open: "Open",
  },
  work: {
    title: "Work",
    subtitle:
      "Apps, websites, systems, and product design — future-focused work for everyday use.",
    empty: "Nothing here yet.",
    more: "More work",
    visitLive: "Visit live site",
    productPage: "Product page",
    openProduct: (name) => `Open the ${name} page for features, support, and privacy.`,
    sections: {
      apps: "Apps",
      websites: "Websites",
      systems: "Systems",
      "product-design": "Product design",
    },
  },
  about: {
    title: "About Ainhoa",
    intro1:
      "I design and build small, honest internet things — from simple landing pages and personal sites to tiny tools and experiments that make everyday work a bit lighter.",
    intro2:
      "My defaults are calm: minimal interfaces, clear language, and considerate flows that respect people's time and attention.",
    whatIDoTitle: "What I do",
    whatIDoIntro: "I work with individuals and small teams on:",
    bullet1: "New or refreshed personal sites and portfolios",
    bullet2: "Focused product pages for small launches",
    bullet3: "Simple web tools and interfaces built with Next.js",
    touchTitle: "How to get in touch",
    touchBody:
      "If you'd like to work together, or you're curious about something I've built, you can reach out any time.",
    touchButton: "Go to contact page",
  },
  contact: {
    title: "Get in Touch",
    intro: "Get in touch with Ainhoa. Questions, collaborations, or just to say hello.",
    emailTitle: "Email",
    emailSubtitle: "The most direct way to reach me:",
    socialTitle: "Social Media",
    socialSubtitle: "Connect or follow along:",
    formTitle: "Send a Message",
    responseTitle: "Response Time",
    responseBody:
      "I try to respond to all messages within 48 hours. If it is urgent, feel free to reach out on social media or LinkedIn as well.",
    form: {
      name: "Name",
      email: "Email",
      subject: "Subject",
      message: "Message",
      company: "Company",
      attachments: "Attachments (optional)",
      attachmentsHint: "Up to 3 files (PDF, JPG, PNG, TXT). Max 4 MB total.",
      addFiles: "Add files",
      send: "Send Message",
      sending: "Sending...",
      sent: "Message sent! I will get back to you soon.",
      errName: "Name is required and must be under 100 characters.",
      errEmail: "Email is required and must be under 200 characters.",
      errSubject: "Subject is required and must be under 200 characters.",
      errMessage: "Message is required and must be under 5000 characters.",
      errFilesCount: "You can attach up to 3 files.",
      errFilesSize: "Attachments must be 4 MB or smaller in total.",
      errFilesType: "Files must be PDF, JPG, PNG, or TXT.",
      errGeneric: "Something went wrong. Please try again.",
      errConfig:
        "Contact form is not configured yet. The site owner must set SMTP_* and CONTACT_TO in Vercel environment variables.",
      errRate: "You’re sending messages too quickly. Please wait a moment and try again.",
    },
  },
  blog: {
    title: "Blog",
    subtitle: "Writing, notes, and longer stories.",
    search: "Search",
    showing: (n, q) =>
      n === 1
        ? `Showing 1 result for “${q}”.`
        : `Showing ${n} results for “${q}”.`,
    clear: "Clear",
    empty: "No posts matched.",
    draftBadge: "Draft — visible locally, hidden in production",
    brandLine1: "Ainhoa's",
    brandLine2: "Blog",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    menu: "Blog menu",
    navLearn: "Learn",
    navConnect: "Connect",
    navBest: "Best of",
    navMore: "More",
    allPosts: "All posts",
    blueGallery: "Blue gallery",
    blueStory: "Blue — the story",
    sayHello: "Say hello",
    home: "Home",
    bestBlue: "Blue",
    bestStart: "I start here",
    bestJar: "Jar of awesome",
    bestKeep: "I get to keep them",
  },
  gallery: {
    kicker: "Gallery",
    title: "Blue",
    intro:
      "A patchwork timeline — not an equal grid. Local photos and clips sit beside public Instagram posts and reels. Each piece is stamped with when it happened; places open in Google Maps.",
    openPhoto: (title) => `Open ${title}`,
    openVideo: (title) => `Open video ${title}`,
    openReel: (title) => `Open reel on Instagram: ${title}`,
  },
  thanks: {
    kicker: "Thank you",
    title: "Your order is confirmed.",
    body: "Payment went through successfully. You will receive a confirmation from Stripe, and the token will be prepared for dispatch.",
    backAnicca: "Back to Anicca",
    home: "Home",
  },
  support: {
    title: "Support my work",
    subtitle: "Your support helps me create more content",
    custom: "Custom",
    processing: "Processing…",
    contributeFor: "Contribute for",
    chooseAmount: "Choose amount",
    customAmount: "Custom amount",
    enterAmount: "Please enter an amount greater than 0.",
    checkoutFail: "Could not start checkout. Please try again.",
  },
  apps: {
    product: "Product",
    support: "Support",
    privacy: "Privacy",
    backTo: (name) => `Back to ${name}`,
    privacyPolicy: (name) => `${name} Privacy Policy`,
    supportPage: (name) => `${name} Support`,
  },
};

const es: Dictionary = {
  header: {
    blog: "Blog",
    work: "Trabajo",
    about: "Sobre mí",
    contact: "Contacto",
    gallery: "Galería",
    aboutMenu: "Menú sobre mí",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    siteMenu: "Menú del sitio",
    whatsAppAria: "Consulta por WhatsApp",
    techHelp: "Ayuda tecnológica",
  },
  footer: {
    support: "Apoyar este trabajo",
    description: "Escritos, proyectos e ideas.",
  },
  home: {
    lead: "Diseño y construyo cosas pequeñas y honestas para internet.",
    featuresLabel: "Trabajo y escritos publicados",
    previous: "Anterior",
    next: "Siguiente",
    open: "Abrir",
  },
  work: {
    title: "Trabajo",
    subtitle: "Apps, webs, sistemas y diseño de producto, para el uso diario.",
    empty: "Todavía no hay nada aquí.",
    more: "Más proyectos",
    visitLive: "Ver el sitio",
    productPage: "Página del producto",
    openProduct: (name) =>
      `Abre la página de ${name} para ver funciones, soporte y privacidad.`,
    sections: {
      apps: "Apps",
      websites: "Webs",
      systems: "Sistemas",
      "product-design": "Diseño de producto",
    },
  },
  about: {
    title: "Sobre Ainhoa",
    intro1:
      "Diseño y construyo cosas pequeñas y honestas para internet: desde landing pages y webs personales hasta herramientas y experimentos que hacen el día a día más ligero.",
    intro2:
      "Mi enfoque por defecto es tranquilo: interfaces mínimas, lenguaje claro y flujos cuidados que respetan el tiempo y la atención de las personas.",
    whatIDoTitle: "Qué hago",
    whatIDoIntro: "Trabajo con personas y equipos pequeños en:",
    bullet1: "Webs personales y portfolios nuevos o renovados",
    bullet2: "Páginas de producto enfocadas para lanzamientos pequeños",
    bullet3: "Herramientas web sencillas e interfaces con Next.js",
    touchTitle: "Cómo contactar",
    touchBody:
      "Si te gustaría trabajar conmigo, o tienes curiosidad por algo que he construido, puedes escribirme cuando quieras.",
    touchButton: "Ir a la página de contacto",
  },
  contact: {
    title: "Contacto",
    intro: "Escríbeme para preguntas, colaboraciones o simplemente para saludar.",
    emailTitle: "Email",
    emailSubtitle: "La forma más directa de contactarme:",
    socialTitle: "Redes sociales",
    socialSubtitle: "Conecta o sígueme en:",
    formTitle: "Enviar un mensaje",
    responseTitle: "Tiempo de respuesta",
    responseBody:
      "Intento responder todos los mensajes en menos de 48 horas. Si es urgente, también puedes escribirme por redes sociales o LinkedIn.",
    form: {
      name: "Nombre",
      email: "Email",
      subject: "Asunto",
      message: "Mensaje",
      company: "Empresa",
      attachments: "Archivos (opcional)",
      attachmentsHint: "Hasta 3 archivos (PDF, JPG, PNG, TXT). Máximo 4 MB en total.",
      addFiles: "Añadir archivos",
      send: "Enviar mensaje",
      sending: "Enviando...",
      sent: "Mensaje enviado. Te responderé pronto.",
      errName: "El nombre es obligatorio y debe tener menos de 100 caracteres.",
      errEmail: "El email es obligatorio y debe tener menos de 200 caracteres.",
      errSubject: "El asunto es obligatorio y debe tener menos de 200 caracteres.",
      errMessage: "El mensaje es obligatorio y debe tener menos de 5000 caracteres.",
      errFilesCount: "Puedes adjuntar hasta 3 archivos.",
      errFilesSize: "Los archivos no pueden superar 4 MB en total.",
      errFilesType: "Los archivos deben ser PDF, JPG, PNG o TXT.",
      errGeneric: "Algo ha fallado. Inténtalo de nuevo.",
      errConfig:
        "El formulario de contacto aún no está configurado. Hay que definir SMTP_* y CONTACT_TO en las variables de entorno de Vercel.",
      errRate: "Estás enviando mensajes demasiado rápido. Espera un momento e inténtalo de nuevo.",
    },
  },
  blog: {
    title: "Blog",
    subtitle: "Escritos, notas e historias más largas.",
    search: "Buscar",
    showing: (n, q) =>
      n === 1
        ? `Mostrando 1 resultado para “${q}”.`
        : `Mostrando ${n} resultados para “${q}”.`,
    clear: "Limpiar",
    empty: "No hay entradas que coincidan.",
    draftBadge: "Borrador — visible en local, oculto en producción",
    brandLine1: "Blog de",
    brandLine2: "Ainhoa",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    menu: "Menú del blog",
    navLearn: "Leer",
    navConnect: "Conectar",
    navBest: "Lo mejor",
    navMore: "Más",
    allPosts: "Todas las entradas",
    blueGallery: "Galería Blue",
    blueStory: "Blue — la historia",
    sayHello: "Saludar",
    home: "Inicio",
    bestBlue: "Blue",
    bestStart: "Empiezo aquí",
    bestJar: "Bote de lo bueno",
    bestKeep: "Me los puedo quedar",
  },
  gallery: {
    kicker: "Galería",
    title: "Blue",
    intro:
      "Una línea de tiempo irregular, no una cuadrícula. Fotos y vídeos locales junto a publicaciones y reels de Instagram. Cada pieza lleva la fecha; los lugares se abren en Google Maps.",
    openPhoto: (title) => `Abrir ${title}`,
    openVideo: (title) => `Abrir vídeo ${title}`,
    openReel: (title) => `Abrir reel en Instagram: ${title}`,
  },
  thanks: {
    kicker: "Gracias",
    title: "Pedido confirmado.",
    body: "El pago se ha completado. Recibirás una confirmación de Stripe y la ficha se preparará para el envío.",
    backAnicca: "Volver a Anicca",
    home: "Inicio",
  },
  support: {
    title: "Apoya mi trabajo",
    subtitle: "Tu apoyo me ayuda a crear más contenido",
    custom: "Otro",
    processing: "Procesando…",
    contributeFor: "Aportar",
    chooseAmount: "Elige cantidad",
    customAmount: "Cantidad personalizada",
    enterAmount: "Introduce una cantidad mayor que 0.",
    checkoutFail: "No se ha podido iniciar el pago. Inténtalo de nuevo.",
  },
  apps: {
    product: "Producto",
    support: "Soporte",
    privacy: "Privacidad",
    backTo: (name) => `Volver a ${name}`,
    privacyPolicy: (name) => `Política de privacidad de ${name}`,
    supportPage: (name) => `Soporte de ${name}`,
  },
};

const dictionaries: Record<Locale, Dictionary> = {
  en,
  es,
  // Site chrome falls back to English until a full French site copy exists.
  fr: en,
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
