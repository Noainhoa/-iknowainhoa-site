import type { Locale } from "@/lib/i18n/shared";
import { parkingAccessHeightLabel } from "@/lib/parking/constants";

export const PARKING_CONDITIONS_PATH =
  "/parking-guardamar-centro/condiciones";

/** Bump when published terms text changes (invalidates saved acceptances). */
export const PARKING_TERMS_VERSION = "2026-07-27";

export type ConditionsSection = {
  heading: string;
  paragraphs: string[];
};

export type ParkingConditionsCopy = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  intro: string;
  sections: ConditionsSection[];
  backToParking: string;
};

const es: ParkingConditionsCopy = {
  metaTitle: "Condiciones de reserva | Parking Guardamar Centro",
  metaDescription:
    "Condiciones de reserva de la plaza de garaje privada en Guardamar del Segura: confirmación, cancelación, vehículo permitido, mando y horarios.",
  title: "Condiciones de reserva",
  intro:
    "Estas condiciones se muestran antes del pago y forman parte de la reserva de la plaza.",
  backToParking: "Volver al parking",
  sections: [
    {
      heading: "Confirmación de la reserva",
      paragraphs: [
        "La solicitud enviada mediante la página web o WhatsApp no bloquea las fechas. La reserva queda confirmada únicamente cuando se han aceptado las condiciones y se ha recibido el pago completo.",
      ],
    },
    {
      heading: "Cancelación",
      paragraphs: [
        "Las cancelaciones comunicadas con al menos 7 días naturales de antelación respecto a la fecha de entrada recibirán el reembolso completo del importe abonado.",
        "Las cancelaciones realizadas con menos de 7 días de antelación no serán reembolsables, salvo que ambas partes acuerden expresamente otra solución.",
      ],
    },
    {
      heading: "Vehículo permitido",
      paragraphs: [
        `La plaza está destinada a turismos de dimensiones convencionales. La altura máxima de acceso es de ${parkingAccessHeightLabel("es")}, incluyendo baca, cofre, antenas, portabicicletas y otros accesorios.`,
        "Los vehículos especialmente altos, largos o anchos, así como aquellos con accesorios exteriores, deberán comunicarse antes del pago.",
        "Si el vehículo no puede acceder debido a dimensiones o accesorios no comunicados, no procederá el reembolso. Cualquier otro caso se valorará según sus circunstancias.",
      ],
    },
    {
      heading: "Entrega del mando",
      paragraphs: [
        "La entrega del mando se realizará presencialmente. La persona arrendataria deberá llamar o escribir por WhatsApp antes de llegar para confirmar la hora de entrega.",
      ],
    },
    {
      heading: "Pérdida o daño del mando",
      paragraphs: [
        "La pérdida, rotura o falta de devolución del mando de acceso tendrá un coste de sustitución de 35 €.",
      ],
    },
    {
      heading: "Entrada y salida",
      paragraphs: [
        "La fecha y la hora exactas de entrada y salida aparecerán en la confirmación individual de cada reserva.",
        "La plaza deberá quedar libre y el mando deberá devolverse antes de la hora acordada.",
      ],
    },
    {
      heading: "Retraso en la salida",
      paragraphs: [
        "Si el vehículo permanece en la plaza después de la hora acordada sin autorización previa, se cobrará un día adicional conforme a la tarifa diaria aplicable al periodo reservado.",
        "No se aplicará este cargo cuando el cambio de hora haya sido acordado previamente por escrito.",
      ],
    },
    {
      heading: "Cambio de vehículo o matrícula",
      paragraphs: [
        "Se permite cambiar el vehículo o la matrícula antes de la entrada siempre que se comunique previamente y se reciba confirmación.",
        "En circunstancias excepcionales, el cambio deberá comunicarse tan pronto como sea razonablemente posible. El nuevo vehículo deberá cumplir las condiciones de acceso y dimensiones.",
      ],
    },
    {
      heading: "Uso de la plaza",
      paragraphs: [
        "La plaza se utilizará exclusivamente para estacionar el vehículo autorizado. No podrá utilizarse como almacén, cederse a terceros ni destinarse a otra actividad.",
      ],
    },
    {
      heading: "Aceptación",
      paragraphs: [
        "El pago de la reserva y la aceptación expresa de estas condiciones confirman que la persona arrendataria las ha leído y aceptado.",
      ],
    },
  ],
};

const en: ParkingConditionsCopy = {
  metaTitle: "Booking conditions | Parking Guardamar Centro",
  metaDescription:
    "Booking conditions for the private garage space in Guardamar del Segura: confirmation, cancellation, permitted vehicles, access fob and timings.",
  title: "Booking conditions",
  intro:
    "These conditions are shown before payment and form part of the booking for the parking space.",
  backToParking: "Back to parking",
  sections: [
    {
      heading: "Booking confirmation",
      paragraphs: [
        "An enquiry sent through the website or WhatsApp does not hold the dates. The booking is confirmed only once the conditions have been accepted and full payment has been received.",
      ],
    },
    {
      heading: "Cancellation",
      paragraphs: [
        "Cancellations notified at least 7 calendar days before the arrival date will receive a full refund of the amount paid.",
        "Cancellations made with fewer than 7 days’ notice are non-refundable, unless both parties expressly agree another solution.",
      ],
    },
    {
      heading: "Permitted vehicle",
      paragraphs: [
        `The space is intended for conventional passenger cars. The maximum access height is ${parkingAccessHeightLabel("en")}, including roof boxes, antennas, bike racks and other accessories.`,
        "Especially tall, long or wide vehicles, and those with external accessories, must be disclosed before payment.",
        "If the vehicle cannot access because of undeclared dimensions or accessories, no refund is due. Any other case will be assessed on its circumstances.",
      ],
    },
    {
      heading: "Handover of the access fob",
      paragraphs: [
        "The access fob is handed over in person. The tenant must call or write on WhatsApp before arrival to confirm the handover time.",
      ],
    },
    {
      heading: "Loss or damage of the fob",
      paragraphs: [
        "Loss, breakage or failure to return the access fob incurs a replacement cost of €35.",
      ],
    },
    {
      heading: "Arrival and departure",
      paragraphs: [
        "The exact arrival and departure date and time appear on each booking’s individual confirmation.",
        "The space must be vacated and the fob returned before the agreed time.",
      ],
    },
    {
      heading: "Late departure",
      paragraphs: [
        "If the vehicle remains in the space after the agreed time without prior authorisation, an extra day will be charged at the daily rate applicable to the booked period.",
        "This charge does not apply when a time change was agreed in writing beforehand.",
      ],
    },
    {
      heading: "Change of vehicle or registration",
      paragraphs: [
        "The vehicle or registration may be changed before arrival if this is communicated in advance and confirmation is received.",
        "In exceptional circumstances, the change should be communicated as soon as reasonably possible. The new vehicle must meet the access and size conditions.",
      ],
    },
    {
      heading: "Use of the space",
      paragraphs: [
        "The space may be used only to park the authorised vehicle. It may not be used as storage, transferred to third parties or put to any other use.",
      ],
    },
    {
      heading: "Acceptance",
      paragraphs: [
        "Payment of the booking and express acceptance of these conditions confirm that the tenant has read and accepted them.",
      ],
    },
  ],
};

const fr: ParkingConditionsCopy = {
  metaTitle: "Conditions de réservation | Parking Guardamar Centro",
  metaDescription:
    "Conditions de réservation de la place de garage privée à Guardamar del Segura : confirmation, annulation, véhicule autorisé, télécommande et horaires.",
  title: "Conditions de réservation",
  intro:
    "Ces conditions sont présentées avant le paiement et font partie de la réservation de la place.",
  backToParking: "Retour au parking",
  sections: [
    {
      heading: "Confirmation de la réservation",
      paragraphs: [
        "Une demande envoyée via le site web ou WhatsApp ne bloque pas les dates. La réservation n’est confirmée que lorsque les conditions ont été acceptées et que le paiement intégral a été reçu.",
      ],
    },
    {
      heading: "Annulation",
      paragraphs: [
        "Les annulations communiquées au moins 7 jours calendaires avant la date d’arrivée donnent lieu au remboursement intégral du montant payé.",
        "Les annulations effectuées avec moins de 7 jours de préavis ne sont pas remboursables, sauf accord express des deux parties sur une autre solution.",
      ],
    },
    {
      heading: "Véhicule autorisé",
      paragraphs: [
        `La place est destinée aux voitures particulières de dimensions conventionnelles. La hauteur maximale d’accès est de ${parkingAccessHeightLabel("fr")}, y compris coffre de toit, antennes, porte-vélos et autres accessoires.`,
        "Les véhicules particulièrement hauts, longs ou larges, ainsi que ceux munis d’accessoires extérieurs, doivent être signalés avant le paiement.",
        "Si le véhicule ne peut pas accéder en raison de dimensions ou d’accessoires non communiqués, aucun remboursement n’est dû. Tout autre cas sera évalué selon ses circonstances.",
      ],
    },
    {
      heading: "Remise de la télécommande",
      paragraphs: [
        "La télécommande est remise en personne. Le locataire doit appeler ou écrire sur WhatsApp avant l’arrivée pour confirmer l’heure de remise.",
      ],
    },
    {
      heading: "Perte ou dommage de la télécommande",
      paragraphs: [
        "La perte, la casse ou le non-retour de la télécommande d’accès entraîne un coût de remplacement de 35 €.",
      ],
    },
    {
      heading: "Arrivée et départ",
      paragraphs: [
        "La date et l’heure exactes d’arrivée et de départ figurent sur la confirmation individuelle de chaque réservation.",
        "La place doit être libérée et la télécommande rendue avant l’heure convenue.",
      ],
    },
    {
      heading: "Retard au départ",
      paragraphs: [
        "Si le véhicule reste sur la place après l’heure convenue sans autorisation préalable, un jour supplémentaire sera facturé selon le tarif journalier applicable à la période réservée.",
        "Ce frais ne s’applique pas lorsque le changement d’horaire a été convenu par écrit au préalable.",
      ],
    },
    {
      heading: "Changement de véhicule ou d’immatriculation",
      paragraphs: [
        "Le véhicule ou l’immatriculation peut être modifié avant l’arrivée, à condition que cela soit communiqué à l’avance et qu’une confirmation soit reçue.",
        "Dans des circonstances exceptionnelles, le changement doit être communiqué dès que raisonnablement possible. Le nouveau véhicule doit respecter les conditions d’accès et de dimensions.",
      ],
    },
    {
      heading: "Utilisation de la place",
      paragraphs: [
        "La place est utilisée exclusivement pour stationner le véhicule autorisé. Elle ne peut servir d’entrepôt, être cédée à des tiers ni destinée à une autre activité.",
      ],
    },
    {
      heading: "Acceptation",
      paragraphs: [
        "Le paiement de la réservation et l’acceptation expresse de ces conditions confirment que le locataire les a lues et acceptées.",
      ],
    },
  ],
};

const byLocale: Record<Locale, ParkingConditionsCopy> = { es, en, fr };

export function getParkingConditionsCopy(locale: Locale): ParkingConditionsCopy {
  return byLocale[locale];
}
