import type { Locale } from "@/lib/i18n/shared";

export const PARKING_PRIVACY_PATH = "/parking-guardamar-centro/privacidad";

export type PrivacySection = {
  heading: string;
  paragraphs: string[];
};

export type ParkingPrivacyCopy = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  updated: string;
  intro: string;
  sections: PrivacySection[];
  backToParking: string;
};

const es: ParkingPrivacyCopy = {
  metaTitle: "Política de Privacidad | Parking Guardamar Centro",
  metaDescription:
    "Información sobre el tratamiento de datos personales de las solicitudes de plaza de garaje en Guardamar del Segura (GDPR / LOPDGDD).",
  title: "Política de Privacidad",
  updated: "Última actualización: 26 de julio de 2026",
  intro:
    "Esta política explica cómo se tratan los datos personales que envías a través de la página de solicitud de Parking Guardamar Centro, de conformidad con el Reglamento (UE) 2016/679 (GDPR) y la Ley Orgánica 3/2018 (LOPDGDD).",
  sections: [
    {
      heading: "1. Responsable del tratamiento",
      paragraphs: [
        "Responsable: Ainhoa Ferrandis Perea.",
        "Actividad: gestión de una plaza de garaje privada en Carrer de Jorge Juan, 13, 03140 Guardamar del Segura (Alicante), España.",
        "Contacto para privacidad y ejercicio de derechos: WhatsApp +34 636 670 103 (mismo canal usado para las solicitudes).",
      ],
    },
    {
      heading: "2. Datos que se recogen",
      paragraphs: [
        "A través del formulario de solicitud y del mensaje de WhatsApp puedes facilitar, entre otros: nombre, matrícula, modelo de vehículo, fechas de entrada y salida, comentarios (por ejemplo horario de llegada) y el número de teléfono desde el que escribes en WhatsApp.",
        "No se crean cuentas de usuario en la web. La solicitud se envía por WhatsApp para gestionar la consulta.",
      ],
    },
    {
      heading: "3. Finalidad del tratamiento",
      paragraphs: [
        "Los datos se tratan para: (a) responder a tu solicitud de disponibilidad; (b) confirmar o denegar la reserva; (c) gestionar el alquiler de la plaza, el precio y el pago; (d) comunicar contigo sobre la reserva; y (e) cumplir obligaciones legales cuando proceda.",
      ],
    },
    {
      heading: "4. Base jurídica",
      paragraphs: [
        "Tratamiento necesario para aplicar medidas precontractuales a tu solicitud y, en su caso, ejecutar el contrato de alquiler de la plaza (art. 6.1.b GDPR).",
        "Cuando proceda, cumplimiento de obligaciones legales (por ejemplo fiscales o de responsabilidad) (art. 6.1.c GDPR).",
        "El marcado de la casilla de aceptación de esta política acredita que has sido informado y aceptas el tratamiento descrito.",
      ],
    },
    {
      heading: "5. Conservación",
      paragraphs: [
        "Los datos de una consulta sin reserva se conservan el tiempo necesario para atenderla y un plazo razonable posterior por si hay seguimiento (habitualmente hasta 12 meses, salvo que pidas su borrado antes).",
        "Si hay reserva, los datos se conservan durante la vigencia del alquiler y, después, el tiempo exigido por la normativa aplicable (por ejemplo obligaciones fiscales o de responsabilidad civil), normalmente hasta 6 años desde el fin de la relación, salvo plazos distintos legalmente obligatorios.",
      ],
    },
    {
      heading: "6. Destinatarios y encargados",
      paragraphs: [
        "Tus datos no se venden. Pueden tratarse mediante herramientas necesarias para el servicio, en particular WhatsApp (Meta Platforms) para la comunicación de la solicitud, y proveedores técnicos de alojamiento web o base de datos si se usan para disponibilidad o administración.",
        "Estos proveedores actúan según sus propias condiciones y, cuando aplica, como encargados del tratamiento.",
      ],
    },
    {
      heading: "7. Transferencias internacionales",
      paragraphs: [
        "Algunos proveedores (por ejemplo WhatsApp/Meta) pueden tratar datos fuera del Espacio Económico Europeo. En ese caso se aplican las garantías previstas por la normativa aplicable (cláusulas contractuales tipo u otras medidas admitidas).",
      ],
    },
    {
      heading: "8. Derechos (ARCO y otros)",
      paragraphs: [
        "Puedes solicitar acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad de tus datos, así como retirar el consentimiento cuando el tratamiento se base en él, sin que ello afecte a la licitud del tratamiento previo.",
        "Para ejercer estos derechos, escribe por WhatsApp al +34 636 670 103 indicando tu nombre y en qué consiste la solicitud. Se te pedirá acreditar tu identidad de forma razonable.",
        "También puedes presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD): https://www.aepd.es",
      ],
    },
    {
      heading: "9. Seguridad",
      paragraphs: [
        "Se aplican medidas razonables para proteger los datos frente a acceso, pérdida o uso indebido no autorizados, sin que pueda garantizarse una seguridad absoluta en internet.",
      ],
    },
    {
      heading: "10. Menores",
      paragraphs: [
        "Esta página no está dirigida a menores de 14 años. No envíes datos de menores a través del formulario o WhatsApp.",
      ],
    },
    {
      heading: "11. Cambios",
      paragraphs: [
        "Esta política puede actualizarse. La versión vigente se publica en esta misma URL con la fecha de actualización indicada arriba.",
      ],
    },
  ],
  backToParking: "Volver a la solicitud de parking",
};

const en: ParkingPrivacyCopy = {
  metaTitle: "Privacy Policy | Parking Guardamar Centro",
  metaDescription:
    "How personal data from Guardamar garage parking enquiries is processed (GDPR / Spanish LOPDGDD).",
  title: "Privacy Policy",
  updated: "Last updated: 26 July 2026",
  intro:
    "This policy explains how personal data you submit through the Parking Guardamar Centro enquiry page is processed, in line with Regulation (EU) 2016/679 (GDPR) and Spanish Organic Law 3/2018 (LOPDGDD).",
  sections: [
    {
      heading: "1. Data controller",
      paragraphs: [
        "Controller: Ainhoa Ferrandis Perea.",
        "Activity: managing a private garage parking space at Carrer de Jorge Juan, 13, 03140 Guardamar del Segura (Alicante), Spain.",
        "Privacy and rights contact: WhatsApp +34 636 670 103 (same channel used for enquiries).",
      ],
    },
    {
      heading: "2. Data collected",
      paragraphs: [
        "Through the enquiry form and WhatsApp message you may provide, among other data: name, vehicle registration, vehicle model, arrival and departure dates, comments (for example arrival time), and the phone number you use on WhatsApp.",
        "The website does not create user accounts. The enquiry is sent via WhatsApp so the request can be handled.",
      ],
    },
    {
      heading: "3. Purpose",
      paragraphs: [
        "Data is processed to: (a) reply to your availability request; (b) confirm or decline a booking; (c) manage the parking rental, price and payment; (d) communicate with you about the booking; and (e) meet legal obligations where required.",
      ],
    },
    {
      heading: "4. Legal basis",
      paragraphs: [
        "Processing is necessary to take steps at your request before entering a contract and, where applicable, to perform the parking rental agreement (Art. 6(1)(b) GDPR).",
        "Where applicable, compliance with legal obligations (for example tax or liability) (Art. 6(1)(c) GDPR).",
        "Ticking the privacy-policy checkbox shows you have been informed and accept the processing described here.",
      ],
    },
    {
      heading: "5. Retention",
      paragraphs: [
        "Data from an enquiry without a booking is kept for as long as needed to handle it and for a reasonable follow-up period (usually up to 12 months, unless you ask for deletion sooner).",
        "If there is a booking, data is kept for the rental period and afterwards for as long as required by applicable law (for example tax or civil-liability rules), normally up to 6 years after the relationship ends, unless a different legal period applies.",
      ],
    },
    {
      heading: "6. Recipients and processors",
      paragraphs: [
        "Your data is not sold. It may be processed with tools needed to provide the service, in particular WhatsApp (Meta Platforms) for enquiry communication, and technical hosting or database providers if used for availability or administration.",
        "Those providers act under their own terms and, where applicable, as processors.",
      ],
    },
    {
      heading: "7. International transfers",
      paragraphs: [
        "Some providers (for example WhatsApp/Meta) may process data outside the European Economic Area. In that case, safeguards required by applicable law are used (such as standard contractual clauses or other permitted measures).",
      ],
    },
    {
      heading: "8. Your rights",
      paragraphs: [
        "You may request access, rectification, erasure, objection, restriction of processing and data portability, and withdraw consent where processing is based on it, without affecting the lawfulness of earlier processing.",
        "To exercise these rights, message WhatsApp +34 636 670 103 with your name and what you are requesting. Reasonable identity checks may be required.",
        "You may also lodge a complaint with the Spanish Data Protection Agency (AEPD): https://www.aepd.es",
      ],
    },
    {
      heading: "9. Security",
      paragraphs: [
        "Reasonable measures are used to protect data against unauthorised access, loss or misuse. Absolute security on the internet cannot be guaranteed.",
      ],
    },
    {
      heading: "10. Children",
      paragraphs: [
        "This page is not directed at children under 14. Do not submit children’s data through the form or WhatsApp.",
      ],
    },
    {
      heading: "11. Changes",
      paragraphs: [
        "This policy may be updated. The current version is published at this URL with the update date shown above.",
      ],
    },
  ],
  backToParking: "Back to the parking enquiry",
};

export function getParkingPrivacyCopy(locale: Locale): ParkingPrivacyCopy {
  return locale === "es" ? es : en;
}
