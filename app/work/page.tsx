import type { Metadata } from "next";
import BlankPage from "@/components/BlankPage";
import WorkIndex from "@/components/work/WorkIndex";
import { getLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/shared";
import { publicPages } from "@/lib/site";
import { getListedWork } from "@/lib/work";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return {
    title: t.work.title,
    description: t.work.subtitle,
    alternates: { canonical: "/work" },
  };
}

export default async function WorkPage() {
  if (!publicPages.work) return <BlankPage />;

  const locale = await getLocale();
  const t = getDictionary(locale);
  const work = await getListedWork(locale);

  return (
    <WorkIndex
      items={work}
      title={t.work.title}
      subtitle={t.work.subtitle}
      empty={t.work.empty}
      sectionLabels={t.work.sections}
    />
  );
}
