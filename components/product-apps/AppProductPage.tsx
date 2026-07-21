import Image from "next/image";
import Link from "next/link";
import type { ProductApp } from "@/lib/productApps";
import { productAppPaths } from "@/lib/productApps";
import AppPageNav from "@/components/product-apps/AppPageNav";

export default function AppProductPage({ app }: { app: ProductApp }) {
  const paths = productAppPaths(app.slug);
  const isInDevelopment = app.status === "in-development";

  return (
    <main className="mx-auto max-w-[720px] px-8 py-10 font-sans">
      <AppPageNav app={app} current="product" />

      <header className="mb-10">
        <p className="mb-3 text-sm uppercase tracking-[0.08em] opacity-60">{app.name}</p>
        <h1 className="mb-4 text-4xl font-semibold leading-tight tracking-tight">{app.name}</h1>
        <p
          className="mb-4 inline-block text-sm font-medium"
          style={{
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "6px 10px",
            background: "var(--muted)",
          }}
        >
          <span className="sr-only">Status: </span>
          {app.statusLabel}
        </p>
        <p className="mt-4 text-xl leading-relaxed opacity-90">{app.tagline}</p>
        <p className="mt-4 text-base leading-relaxed opacity-80">{app.summary}</p>
        {app.platform ? (
          <p className="mt-4 text-sm opacity-70">
            <strong className="font-semibold">Compatibility:</strong> {app.platform}
          </p>
        ) : null}
      </header>

      <section className="mb-12" aria-labelledby="features-heading">
        <h2 id="features-heading" className="mb-4 text-2xl font-semibold">
          Features
        </h2>
        <ul className="grid gap-4">
          {app.features.map((feature) => (
            <li
              key={feature.title}
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: 16,
              }}
            >
              <h3 className="mb-1 text-lg font-semibold">{feature.title}</h3>
              <p className="leading-relaxed opacity-80">{feature.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12" aria-labelledby="how-heading">
        <h2 id="how-heading" className="mb-4 text-2xl font-semibold">
          How it works
        </h2>
        <ol className="grid gap-3 pl-5 list-decimal">
          {app.howItWorks.map((step) => (
            <li key={step} className="leading-relaxed opacity-85">
              {step}
            </li>
          ))}
        </ol>
      </section>

      {app.pricing ? (
        <section className="mb-12" aria-labelledby="pricing-heading">
          <h2 id="pricing-heading" className="mb-4 text-2xl font-semibold">
            Pricing
          </h2>
          <ul className="grid gap-3">
            <li className="leading-relaxed opacity-85">
              <strong className="font-semibold">Free:</strong> {app.pricing.free}
            </li>
            {app.pricing.pro ? (
              <li className="leading-relaxed opacity-85">
                <strong className="font-semibold">Pro:</strong> {app.pricing.pro}
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}

      <section className="mb-12" aria-labelledby="screenshots-heading">
        <h2 id="screenshots-heading" className="mb-4 text-2xl font-semibold">
          Screenshots
        </h2>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}
        >
          {app.screenshots.map((shot, index) => (
            <figure
              key={`${shot.alt}-${index}`}
              style={{
                border: shot.src ? "1px solid var(--border)" : "1px dashed var(--border)",
                borderRadius: 12,
                background: "var(--muted)",
                minHeight: 220,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                textAlign: "center",
                gap: 10,
              }}
            >
              {shot.src ? (
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={320}
                  height={640}
                  style={{ width: "100%", height: "auto", borderRadius: 8 }}
                />
              ) : null}
              <figcaption className="text-sm opacity-60">
                {shot.label ?? (shot.src ? shot.alt : "Screenshot coming soon")}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mb-12" aria-labelledby="get-heading">
        <h2 id="get-heading" className="mb-4 text-2xl font-semibold">
          {isInDevelopment ? "Availability" : "Get the app"}
        </h2>
        {app.appStoreUrl ? (
          <a
            href={app.appStoreUrl}
            className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold"
            style={{
              background: "var(--primary)",
              color: "var(--primary-contrast)",
              textDecoration: "none",
            }}
          >
            Download on the App Store
          </a>
        ) : (
          <p
            className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium"
            style={{
              border: "1px solid var(--border)",
              background: "var(--muted)",
            }}
          >
            {isInDevelopment
              ? "App Store link coming soon"
              : "App Store badge coming soon"}
          </p>
        )}
      </section>

      {app.notes && app.notes.length > 0 ? (
        <section className="mb-12" aria-labelledby="notes-heading">
          <h2 id="notes-heading" className="mb-4 text-2xl font-semibold">
            Good to know
          </h2>
          <ul className="grid gap-2 pl-5 list-disc">
            {app.notes.map((note) => (
              <li key={note} className="leading-relaxed opacity-85">
                {note}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <footer className="border-t border-[var(--border)] pt-6 text-sm opacity-80">
        <p className="mb-3">
          Need help? Visit{" "}
          <Link href={paths.support} className="underline-offset-2 hover:underline">
            {app.name} Support
          </Link>
          .
        </p>
        <p>
          Read the{" "}
          <Link href={paths.privacy} className="underline-offset-2 hover:underline">
            {app.name} Privacy Policy
          </Link>
          .
        </p>
      </footer>
    </main>
  );
}
