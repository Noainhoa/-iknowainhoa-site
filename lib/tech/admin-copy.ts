/** Admin workspace copy. UI defaults to Spanish; English is available for lang=en. */
export type AdminLocale = "es" | "en";

export function adminLocaleFromSearch(search: string): AdminLocale {
  try {
    const lang = new URLSearchParams(search).get("lang");
    return lang === "en" ? "en" : "es";
  } catch {
    return "es";
  }
}

export const adminCopy = {
  es: {
    pendingBanner: (n: number) =>
      n === 1
        ? "1 solicitud espera tu respuesta. Todavía no reserva plaza."
        : `${n} solicitudes esperan tu respuesta. Todavía no reservan plaza.`,
    freshBanner: (n: number) =>
      n === 1 ? "1 reserva nueva en los últimos 3 días." : `${n} reservas nuevas en los últimos 3 días.`,
    confirmPublish: "¿Publicar esta sesión? Quedará visible para reservar.",
    confirmCancelSession: "¿Cancelar esta sesión? También se cancelarán las reservas confirmadas.",
    confirmDiscardDraft: "¿Descartar este borrador?",
    confirmDecline: "¿Rechazar esta solicitud? No se reservará ninguna plaza.",
    confirmDeletePerson: "¿Borrar los datos personales de esta reserva? Esta acción no se puede deshacer.",
    deletedPerson: "Datos personales borrados.",
    deleteFailed: "No se han podido borrar los datos.",
    newSession: "Nueva sesión",
  },
  en: {
    pendingBanner: (n: number) =>
      n === 1
        ? "1 request is waiting for your reply. It does not hold a seat yet."
        : `${n} requests are waiting for your reply. They do not hold seats yet.`,
    freshBanner: (n: number) =>
      n === 1 ? "1 new booking in the last 3 days." : `${n} new bookings in the last 3 days.`,
    confirmPublish: "Publish this session? It will become bookable.",
    confirmCancelSession: "Cancel this session? Confirmed bookings will also be cancelled.",
    confirmDiscardDraft: "Discard this draft?",
    confirmDecline: "Decline this request? No seat will be reserved.",
    confirmDeletePerson: "Delete this person’s personal data? This cannot be undone.",
    deletedPerson: "Personal data deleted.",
    deleteFailed: "Could not delete the data.",
    newSession: "New session",
  },
} as const;
