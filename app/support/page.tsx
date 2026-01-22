import { SupportCard } from "@/components/SupportCard";
import { getAllProducts } from "@/lib/content";
import Link from "next/link";

export default async function SupportPage() {
  const products = await getAllProducts();

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12">
      <section className="flex flex-col gap-4">
        <p className="text-sm uppercase tracking-wide text-gray-500">Support</p>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Send a thank you</h1>
        <p className="max-w-2xl text-lg text-gray-600">
          If you’ve enjoyed the writing, guides, or resources here, you can send a pay-what-you-want thank you.
        </p>
        <div className="mt-2">
          <SupportCard buttonText="Send a thank you" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-gray-900">Downloads & resources</h2>
        {products.length === 0 ? (
          <p className="text-gray-600">More items coming soon.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {products.map((p) => (
              <Link
                key={p.slug}
                href={`/products/${p.slug}`}
                className="block rounded-xl border border-gray-200 bg-white/80 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-2">
                    <p className="text-sm uppercase tracking-wide text-gray-500">
                      {p.type || "Resource"}
                    </p>
                    <h3 className="text-xl font-semibold text-gray-900">{p.title}</h3>
                    {p.description && (
                      <p className="text-sm text-gray-600 line-clamp-3">{p.description}</p>
                    )}
                  </div>
                  {p.price && (
                    <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                      {p.price}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
