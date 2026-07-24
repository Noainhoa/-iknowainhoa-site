import type { Metadata } from "next";
import ParkingPublicApp from "@/components/parking/ParkingPublicApp";
import { getLocale } from "@/lib/i18n";

const PATH = "https://iknowainhoa.com/parking-guardamar-centro";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const es = locale === "es";
  return {
    title: es
      ? "Parking Guardamar Centro — Disponibilidad"
      : "Parking Guardamar Centro — Availability",
    description: es
      ? "Parking Guardamar Centro: consulta las fechas disponibles de la plaza y envía una solicitud por WhatsApp."
      : "Parking Guardamar Centro: check available dates and send a WhatsApp enquiry.",
    alternates: { canonical: PATH },
    openGraph: {
      title: es
        ? "Parking Guardamar Centro — Disponibilidad"
        : "Parking Guardamar Centro — Availability",
      description: es
        ? "Consulta las fechas disponibles y envía una solicitud por WhatsApp. La selección no confirma la reserva."
        : "Check available dates and enquire on WhatsApp. Selecting dates does not confirm a booking.",
      url: PATH,
      locale: es ? "es_ES" : "en_GB",
      type: "website",
    },
  };
}

export default async function ParkingPage() {
  const locale = await getLocale();
  return (
    <main style={{ margin: 0, minHeight: "100vh", background: "#fafaf8" }}>
      <ParkingPublicApp locale={locale} />
    </main>
  );
}
