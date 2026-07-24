import type { Metadata } from "next";
import ParkingPublicApp from "@/components/parking/ParkingPublicApp";

export const metadata: Metadata = {
  title: "Parking Guardamar Centro — Disponibilidad",
  description:
    "Parking Guardamar Centro: consulta las fechas disponibles de la plaza y envía una solicitud por WhatsApp.",
  alternates: {
    canonical: "https://iknowainhoa.com/parking/",
  },
  openGraph: {
    title: "Parking Guardamar Centro — Disponibilidad",
    description:
      "Consulta las fechas disponibles y envía una solicitud por WhatsApp. La selección no confirma la reserva.",
    url: "https://iknowainhoa.com/parking/",
    locale: "es_ES",
    type: "website",
  },
};

export default function ParkingPage() {
  return (
    <main style={{ margin: 0, minHeight: "100vh", background: "#fafaf8" }}>
      <ParkingPublicApp />
    </main>
  );
}
