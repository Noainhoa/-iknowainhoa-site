import { TECH_BRAND, TECH_PATH } from "@/lib/tech/constants";
import type { TechLocale } from "@/lib/tech/locale";

export const TECH_CONDITIONS_PATH = `${TECH_PATH}/condiciones`;

export type ConditionsSection = {
  heading: string;
  paragraphs: string[];
};

export type TechConditionsCopy = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  updated: string;
  intro: string;
  sections: ConditionsSection[];
  backToBooking: string;
  langLabel: string;
};

const es: TechConditionsCopy = {
  metaTitle: `Condiciones y privacidad | ${TECH_BRAND}`,
  metaDescription:
    "Condiciones de reserva y privacidad de Guardamar Click: asistencia, cancelación, pago, datos personales y derechos.",
  title: "Condiciones y privacidad",
  updated: "Última actualización: 18 de noviembre de 2026",
  intro:
    "Al marcar la casilla en el formulario, aceptas estas condiciones y el tratamiento de tus datos para organizar tu sesión con Ainhoa Ferrandis Perea (Guardamar Click). Esta página reúne las condiciones de reserva y la información de privacidad.",
  backToBooking: "Volver a reservar",
  langLabel: "Idioma",
  sections: [
    {
      heading: "Asistencia",
      paragraphs: [
        "Confirmas que estarás en la sesión reservada (o la persona para quien reserves).",
        "El negocio es presencial en Guardamar del Segura, junto a la Escuela de Música Auditorio. También puedes reservar asistencia telefónica (incluida la ayuda en remoto al dispositivo) o una visita a domicilio dentro de Guardamar.",
        "En las visitas a domicilio reservas la hora de llegada; en la agenda se incluyen 30 minutos antes y 30 minutos después para el desplazamiento, y eso cuenta en la duración y el precio.",
      ],
    },
    {
      heading: "Cancelación",
      paragraphs: [
        "Puedes cancelar gratis hasta 24 horas antes, desde el enlace de confirmación.",
        "Si faltan menos de 24 horas, llama a Ainhoa para cambiar o cancelar. No hay ningún cargo automático ni pago online que reembolsar.",
      ],
    },
    {
      heading: "Pago",
      paragraphs: [
        "Puedes pagar con tarjeta en la sesión, o en efectivo, por transferencia o Bizum. No hace falta escribir ningún dato de la tarjeta ni del banco en esta web.",
        "Reservar el hueco y dejar un contacto es lo que importa. La web guarda tu plaza o tu solicitud; no cobra por adelantado.",
      ],
    },
    {
      heading: "Qué no se pide",
      paragraphs: [
        "No se piden contraseñas, códigos ni datos de cuentas bancarias en el formulario ni por WhatsApp para reservar. No los escribas ahí.",
        "En la sesión solo se trabaja con lo que tú quieras mostrar en tu propio dispositivo.",
      ],
    },
    {
      heading: "Aceptación",
      paragraphs: [
        "Marcar la casilla en el formulario de reserva confirma que has leído y aceptas estas condiciones y el tratamiento de datos descrito abajo.",
      ],
    },
    {
      heading: "1. Responsable del tratamiento",
      paragraphs: [
        "Responsable: Ainhoa Ferrandis Perea.",
        "Actividad: sesiones de ayuda digital (móvil, tablet y ordenador) bajo la marca Guardamar Click en Guardamar del Segura (Alicante), España.",
        "Contacto para privacidad y ejercicio de derechos: WhatsApp +34 636 670 103 (mismo canal de contacto de la web).",
      ],
    },
    {
      heading: "2. Datos que se recogen",
      paragraphs: [
        "Al reservar o pedir otra hora puedes facilitar: nombre, teléfono, email si lo dejas, nombre de quien asiste si reservas para otra persona, idioma de la sesión, nota sobre lo que quieres mirar, y datos técnicos mínimos necesarios para guardar la reserva (por ejemplo fecha, hora y tipo de sesión).",
        "Si escribes por WhatsApp, también se trata el número desde el que contactas y el contenido del mensaje.",
        "No se crean cuentas de usuario en la web. La confirmación se muestra en pantalla y, si dejas email, puede enviarse por ese medio.",
      ],
    },
    {
      heading: "3. Finalidad del tratamiento",
      paragraphs: [
        "Los datos se tratan para: (a) gestionar la reserva o la solicitud de otra hora; (b) comunicarte confirmación, cambios o cancelación; (c) organizar la sesión (lugar, idioma, tipo); (d) responder consultas por teléfono o WhatsApp; y (e) cumplir obligaciones legales cuando proceda.",
      ],
    },
    {
      heading: "4. Base jurídica",
      paragraphs: [
        "Tratamiento necesario para aplicar medidas precontractuales a tu solicitud y, en su caso, ejecutar la prestación de la sesión (art. 6.1.b GDPR).",
        "Cuando proceda, cumplimiento de obligaciones legales (art. 6.1.c GDPR).",
        "El marcado de la casilla de aceptación acredita que has sido informado y aceptas el tratamiento descrito.",
      ],
    },
    {
      heading: "5. Conservación",
      paragraphs: [
        "Los datos se conservan solo el tiempo necesario para organizar la sesión y atender incidencias posteriores razonables, y se eliminan cuando ya no son necesarios, salvo que pidas su borrado antes o la ley exija conservarlos por más tiempo.",
      ],
    },
    {
      heading: "6. Destinatarios y encargados",
      paragraphs: [
        "Tus datos no se venden. Pueden tratarse mediante herramientas necesarias para el servicio: alojamiento web, base de datos de reservas, email si lo usas para la confirmación, y WhatsApp (Meta Platforms) si escribes por ese canal.",
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
        "Esta página no está dirigida a menores de 14 años. No envíes datos de menores a través del formulario o WhatsApp sin la intervención adecuada de quien corresponda.",
      ],
    },
    {
      heading: "11. Cambios",
      paragraphs: [
        "Estas condiciones y la información de privacidad pueden actualizarse. La versión vigente se publica en esta misma URL con la fecha de actualización indicada arriba.",
      ],
    },
  ],
};

const en: TechConditionsCopy = {
  metaTitle: `Conditions & privacy | ${TECH_BRAND}`,
  metaDescription:
    "Guardamar Click booking conditions and privacy: attendance, cancellation, payment, personal data and your rights.",
  title: "Conditions & privacy",
  updated: "Last updated: 18 November 2026",
  intro:
    "By ticking the box on the form, you accept these conditions and the processing of your details so Ainhoa Ferrandis Perea (Guardamar Click) can organise your session. This page covers both booking conditions and privacy information.",
  backToBooking: "Back to booking",
  langLabel: "Language",
  sections: [
    {
      heading: "Attendance",
      paragraphs: [
        "You confirm that you will be at the booked session (or the person you are booking for).",
        "This is an in-person business in Guardamar del Segura, next to the Music School Auditorium. You can also book phone assistance (including remote help on your device) or a home visit within Guardamar.",
        "For home visits you book the arrival time; the calendar includes 30 minutes before and 30 minutes after for travel, and that counts toward duration and price.",
      ],
    },
    {
      heading: "Cancellation",
      paragraphs: [
        "You can cancel free of charge until 24 hours before, from the confirmation link.",
        "Inside 24 hours, call Ainhoa to change or cancel. There is no automatic charge and no online payment to refund.",
      ],
    },
    {
      heading: "Payment",
      paragraphs: [
        "You can pay by card at the session, or by cash, bank transfer or Bizum. You do not enter any card or bank details on this website.",
        "Booking the slot and leaving a contact is what matters. The site holds your place or request; it does not charge you in advance.",
      ],
    },
    {
      heading: "What is not collected",
      paragraphs: [
        "Passwords, codes and bank account details are not requested on the form or on WhatsApp for booking. Do not write them there.",
        "In the session we only work with what you choose to show on your own device.",
      ],
    },
    {
      heading: "Acceptance",
      paragraphs: [
        "Ticking the box on the booking form confirms that you have read and accept these conditions and the data processing described below.",
      ],
    },
    {
      heading: "1. Data controller",
      paragraphs: [
        "Controller: Ainhoa Ferrandis Perea.",
        "Activity: digital help sessions (phone, tablet and computer) under the Guardamar Click name in Guardamar del Segura (Alicante), Spain.",
        "Privacy and rights contact: WhatsApp +34 636 670 103 (same contact channel as the website).",
      ],
    },
    {
      heading: "2. Data collected",
      paragraphs: [
        "When you book or ask for another time you may provide: name, phone number, email if you leave one, name of the person attending if you book for someone else, session language, a note about what you want help with, and the minimum technical data needed to store the booking (for example date, time and session type).",
        "If you write on WhatsApp, the number you contact from and the message content are also processed.",
        "The website does not create user accounts. Confirmation stays on screen and, if you leave an email, may be sent that way.",
      ],
    },
    {
      heading: "3. Purpose",
      paragraphs: [
        "Data is processed to: (a) manage the booking or request for another time; (b) send confirmation, changes or cancellation; (c) organise the session (place, language, type); (d) answer enquiries by phone or WhatsApp; and (e) meet legal obligations where required.",
      ],
    },
    {
      heading: "4. Legal basis",
      paragraphs: [
        "Processing is necessary to take steps at your request before a session and, where applicable, to provide the session (Art. 6(1)(b) GDPR).",
        "Where applicable, compliance with legal obligations (Art. 6(1)(c) GDPR).",
        "Ticking the acceptance checkbox shows you have been informed and accept the processing described here.",
      ],
    },
    {
      heading: "5. Retention",
      paragraphs: [
        "Data is kept only for as long as needed to organise the session and handle reasonable follow-up, and is deleted when it is no longer needed, unless you ask for deletion sooner or the law requires keeping it longer.",
      ],
    },
    {
      heading: "6. Recipients and processors",
      paragraphs: [
        "Your data is not sold. It may be processed with tools needed for the service: website hosting, the bookings database, email if used for confirmation, and WhatsApp (Meta Platforms) if you write on that channel.",
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
        "This page is not directed at children under 14. Do not submit children’s data through the form or WhatsApp without the appropriate person acting for them.",
      ],
    },
    {
      heading: "11. Changes",
      paragraphs: [
        "These conditions and privacy information may be updated. The current version is published at this URL with the update date shown above.",
      ],
    },
  ],
};

const nl: TechConditionsCopy = {
  metaTitle: `Voorwaarden en privacy | ${TECH_BRAND}`,
  metaDescription:
    "Reserveringsvoorwaarden en privacy van Guardamar Click: aanwezigheid, annulering, betaling, persoonsgegevens en rechten.",
  title: "Voorwaarden en privacy",
  updated: "Laatst bijgewerkt: 18 november 2026",
  intro:
    "Door het vakje op het formulier aan te vinken, accepteer je deze voorwaarden en de verwerking van je gegevens zodat Ainhoa Ferrandis Perea (Guardamar Click) je sessie kan organiseren. Deze pagina bevat zowel de reserveringsvoorwaarden als de privacy-informatie.",
  backToBooking: "Terug naar reserveren",
  langLabel: "Taal",
  sections: [
    {
      heading: "Aanwezigheid",
      paragraphs: [
        "Je bevestigt dat je bij de gereserveerde sessie bent (of de persoon voor wie je reserveert).",
        "Dit is een fysieke dienst in Guardamar del Segura, naast de Escuela de Música Auditorio. Je kunt ook telefonische hulp (inclusief hulp op afstand op je toestel) of een huisbezoek binnen Guardamar boeken.",
        "Bij huisbezoeken boeken jij het aankomsttijdstip; in de agenda zitten 30 minuten voor en 30 minuten na voor reizen, en dat telt mee in duur en prijs.",
      ],
    },
    {
      heading: "Annulering",
      paragraphs: [
        "Je kunt gratis annuleren tot 24 uur van tevoren, via de bevestigingslink.",
        "Binnen 24 uur bel je Ainhoa om te wijzigen of te annuleren. Er wordt niets automatisch afgeschreven en er is geen online betaling om terug te storten.",
      ],
    },
    {
      heading: "Betaling",
      paragraphs: [
        "Je kunt met kaart betalen tijdens de sessie, of contant, via overschrijving of met Bizum. Je vult op deze website geen kaart- of bankgegevens in.",
        "Het tijdstip reserveren en een contact achterlaten is wat telt. De site houdt je plek of aanvraag vast; er wordt niet vooraf betaald.",
      ],
    },
    {
      heading: "Wat niet wordt gevraagd",
      paragraphs: [
        "Wachtwoorden, codes en bankgegevens worden niet gevraagd in het formulier of via WhatsApp om te reserveren. Schrijf ze daar niet.",
        "Tijdens de sessie werken we alleen met wat jij op je eigen apparaat wilt laten zien.",
      ],
    },
    {
      heading: "Aanvaarding",
      paragraphs: [
        "Het aanvinken van het vakje op het reserveringsformulier bevestigt dat je deze voorwaarden en de hieronder beschreven gegevensverwerking hebt gelezen en accepteert.",
      ],
    },
    {
      heading: "1. Verantwoordelijke voor de verwerking",
      paragraphs: [
        "Verantwoordelijke: Ainhoa Ferrandis Perea.",
        "Activiteit: digitale hulpsessies (telefoon, tablet en computer) onder de naam Guardamar Click in Guardamar del Segura (Alicante), Spanje.",
        "Contact voor privacy en uitoefening van rechten: WhatsApp +34 636 670 103 (zelfde kanaal als op de website).",
      ],
    },
    {
      heading: "2. Gegevens die worden verzameld",
      paragraphs: [
        "Bij reserveren of een andere tijd aanvragen kun je doorgeven: naam, telefoonnummer, e-mail als je die achterlaat, naam van wie komt als je voor iemand anders reserveert, taal van de sessie, een notitie over waar je hulp bij wilt, en de minimale technische gegevens om de reservering op te slaan (bijvoorbeeld datum, tijd en type sessie).",
        "Als je via WhatsApp schrijft, worden ook het nummer waarmee je contact opneemt en de inhoud van het bericht verwerkt.",
        "Er worden geen gebruikersaccounts op de website gemaakt. De bevestiging blijft op het scherm en kan, als je een e-mail achterlaat, die weg worden gestuurd.",
      ],
    },
    {
      heading: "3. Doel van de verwerking",
      paragraphs: [
        "Gegevens worden verwerkt om: (a) de reservering of aanvraag voor een andere tijd te beheren; (b) bevestiging, wijzigingen of annulering te sturen; (c) de sessie te organiseren (plek, taal, type); (d) vragen per telefoon of WhatsApp te beantwoorden; en (e) wettelijke verplichtingen na te komen waar nodig.",
      ],
    },
    {
      heading: "4. Rechtsgrond",
      paragraphs: [
        "Verwerking is nodig om op jouw verzoek stappen te zetten vóór een sessie en, waar van toepassing, de sessie te leveren (art. 6.1.b AVG).",
        "Waar van toepassing, naleving van wettelijke verplichtingen (art. 6.1.c AVG).",
        "Het aanvinken van het acceptatievakje toont dat je bent geïnformeerd en de hier beschreven verwerking accepteert.",
      ],
    },
    {
      heading: "5. Bewaartermijn",
      paragraphs: [
        "Gegevens worden alleen bewaard zolang nodig om de sessie te organiseren en redelijke nazorg te bieden, en worden verwijderd wanneer ze niet meer nodig zijn, tenzij je eerder om verwijdering vraagt of de wet een langere bewaarplicht oplegt.",
      ],
    },
    {
      heading: "6. Ontvangers en verwerkers",
      paragraphs: [
        "Je gegevens worden niet verkocht. Ze kunnen worden verwerkt met tools die nodig zijn voor de dienst: webhosting, de reserveringsdatabase, e-mail als die voor bevestiging wordt gebruikt, en WhatsApp (Meta Platforms) als je via dat kanaal schrijft.",
        "Die aanbieders handelen volgens hun eigen voorwaarden en, waar van toepassing, als verwerkers.",
      ],
    },
    {
      heading: "7. Internationale doorgiften",
      paragraphs: [
        "Sommige aanbieders (bijvoorbeeld WhatsApp/Meta) kunnen gegevens buiten de Europese Economische Ruimte verwerken. In dat geval gelden de waarborgen die de toepasselijke regels vereisen (zoals standaardcontractbepalingen of andere toegestane maatregelen).",
      ],
    },
    {
      heading: "8. Jouw rechten",
      paragraphs: [
        "Je kunt inzage, rectificatie, wissen, bezwaar, beperking van de verwerking en overdraagbaarheid van je gegevens vragen, en toestemming intrekken wanneer de verwerking daarop berust, zonder dat dit de rechtmatigheid van eerdere verwerking aantast.",
        "Om deze rechten uit te oefenen, schrijf je via WhatsApp naar +34 636 670 103 met je naam en wat je vraagt. Er kan om een redelijke identiteitscontrole worden gevraagd.",
        "Je kunt ook een klacht indienen bij het Spaanse Agentschap voor gegevensbescherming (AEPD): https://www.aepd.es",
      ],
    },
    {
      heading: "9. Beveiliging",
      paragraphs: [
        "Er worden redelijke maatregelen genomen om gegevens te beschermen tegen ongeautoriseerde toegang, verlies of misbruik. Absolute beveiliging op internet kan niet worden gegarandeerd.",
      ],
    },
    {
      heading: "10. Minderjarigen",
      paragraphs: [
        "Deze pagina is niet gericht op kinderen onder de 14. Stuur geen gegevens van minderjarigen via het formulier of WhatsApp zonder de juiste betrokkenheid van wie daarvoor verantwoordelijk is.",
      ],
    },
    {
      heading: "11. Wijzigingen",
      paragraphs: [
        "Deze voorwaarden en privacy-informatie kunnen worden bijgewerkt. De actuele versie staat op deze URL met de updatedatum hierboven.",
      ],
    },
  ],
};

const byLocale: Record<TechLocale, TechConditionsCopy> = { es, en, nl };

export function getTechConditionsCopy(locale: TechLocale): TechConditionsCopy {
  return byLocale[locale] ?? es;
}
