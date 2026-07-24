export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

type Dictionary = {
  header: {
    blog: string;
    work: string;
    about: string;
    contact: string;
  };
  footer: {
    support: string;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    featuredTitle: string;
    viewAllWork: string;
    aboutCtaTitle: string;
    aboutCtaBody: string;
    aboutButton: string;
    contactButton: string;
  };
  work: {
    title: string;
    subtitle: string;
    empty: string;
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
  };
};

const dictionaries: Record<Locale, Dictionary> = {
  en: {
    header: { blog: "Blog", work: "Work", about: "About", contact: "Contact" },
    footer: { support: "Support this work" },
    home: {
      heroTitle: "Ainhoa designs and builds calm, human websites, apps, and small products.",
      heroSubtitle: "This is where new experiments, client work, and tiny tools quietly ship.",
      featuredTitle: "Featured work",
      viewAllWork: "View all work",
      aboutCtaTitle: "About & contact",
      aboutCtaBody:
        "I work with small teams and individuals who care about thoughtful, quiet internet things: simple product pages, tiny tools, and honest personal sites.",
      aboutButton: "Read a bit more",
      contactButton: "Start a conversation",
    },
    work: {
      title: "Work",
      subtitle: "Apps, products, and projects in one quiet list.",
      empty: "Nothing to show yet.",
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
    },
  },
  es: {
    header: { blog: "Blog", work: "Proyectos", about: "Sobre mí", contact: "Contacto" },
    footer: { support: "Apoyar este trabajo" },
    home: {
      heroTitle: "Ainhoa diseña y desarrolla webs, apps y pequeños productos con calma y enfoque humano.",
      heroSubtitle: "Aquí comparto experimentos, trabajo con clientes y herramientas pequeñas que voy lanzando.",
      featuredTitle: "Proyectos destacados",
      viewAllWork: "Ver todos los proyectos",
      aboutCtaTitle: "Sobre mí y contacto",
      aboutCtaBody:
        "Trabajo con equipos pequeños y personas que valoran un internet más cuidado: páginas de producto simples, herramientas útiles y webs personales honestas.",
      aboutButton: "Leer un poco más",
      contactButton: "Empezar una conversación",
    },
    work: {
      title: "Proyectos",
      subtitle: "Apps, productos y proyectos en una sola vista.",
      empty: "Todavía no hay nada para mostrar.",
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
    },
  },
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

