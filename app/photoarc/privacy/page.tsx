import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPhotoArcPrivacyPage } from "@/lib/photoarc";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPhotoArcPrivacyPage();
  return {
    title: page?.title ?? "PhotoArc Privacy Policy",
    description: page?.description,
  };
}

export default async function PhotoArcPrivacyPage() {
  const page = await getPhotoArcPrivacyPage();
  if (!page) return notFound();

  return (
    <main className="mx-auto max-w-[720px] px-8 py-10 font-sans">
      <nav className="mb-6 text-sm opacity-70">
        <Link href="/photoarc" className="underline-offset-2 hover:underline">
          PhotoArc Support
        </Link>
      </nav>
      <article
        className="prose prose-neutral dark:prose-invert max-w-none leading-relaxed"
        dangerouslySetInnerHTML={{ __html: page.html }}
      />
    </main>
  );
}
