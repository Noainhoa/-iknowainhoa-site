import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPhotoArcSupportPage } from "@/lib/photoarc";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPhotoArcSupportPage();
  return {
    title: page?.title ?? "PhotoArc Support",
    description: page?.description,
  };
}

export default async function PhotoArcSupportPage() {
  const page = await getPhotoArcSupportPage();
  if (!page) return notFound();

  return (
    <main className="mx-auto max-w-[720px] px-8 py-10 font-sans">
      <nav className="mb-6 text-sm opacity-70">
        <Link href="/photoarc/privacy" className="underline-offset-2 hover:underline">
          Privacy Policy
        </Link>
      </nav>
      <article
        className="prose prose-neutral dark:prose-invert max-w-none leading-relaxed"
        dangerouslySetInnerHTML={{ __html: page.html }}
      />
    </main>
  );
}
