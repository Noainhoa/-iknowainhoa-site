import type { Metadata } from "next";
import BlankPage from "@/components/BlankPage";
import WorkIndex from "@/components/work/WorkIndex";
import { getLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/shared";
import { publicPages } from "@/lib/site";
import { getAllWork } from "@/lib/work";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected apps, websites, systems, and product design by iknowainhoa.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage() {
  if (!publicPages.work) return <BlankPage />;

  const locale = await getLocale();
  const t = getDictionary(locale);
  const work = await getAllWork();

  return (
    <WorkIndex
      items={work}
      title={t.work.title}
      subtitle={t.work.subtitle}
      empty={t.work.empty}
    />
  );
}
