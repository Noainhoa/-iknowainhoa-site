import Link from "next/link";
import BlankPage from "@/components/BlankPage";
import { publicPages } from "@/lib/site";

export default function ThankYouPage() {
  if (!publicPages.thanks) return <BlankPage />;

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col gap-6 px-4 py-16">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-wide text-gray-500">Thank you</p>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Your support means a lot</h1>
        <p className="text-lg text-gray-600">
          Your payment went through successfully. Thanks for backing the work here—it helps keep new writing and
          resources coming.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          ← Back to home
        </Link>
        <Link href="/support" className="text-sm font-semibold text-gray-700 underline underline-offset-4">
          View other ways to support
        </Link>
      </div>
    </main>
  );
}
