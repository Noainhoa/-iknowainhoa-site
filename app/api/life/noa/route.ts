import { NextResponse } from "next/server";
import { askNoa, isOsAiConfigured } from "@/lib/life/os/ai";
import { getLifeAuthedContext } from "@/lib/life/os/auth";
import { fetchApprovedOsEntries, getActiveTraining } from "@/lib/life/os/db";
import { rankOsEntriesForQuestion } from "@/lib/life/os/retrieve";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await getLifeAuthedContext(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isOsAiConfigured()) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured on the server." },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as { question?: string } | null;
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (!question) {
    return NextResponse.json({ error: "question is required." }, { status: 400 });
  }

  try {
    const approved = await fetchApprovedOsEntries(auth.supabase);
    const training = getActiveTraining(approved);
    const relevant = rankOsEntriesForQuestion(question, approved, 8);
    const answer = await askNoa({
      question,
      entries: relevant,
      training,
    });

    return NextResponse.json({
      answer,
      used: relevant.map((entry) => ({
        id: entry.id,
        entryCode: entry.entryCode,
        type: entry.type,
        title: entry.title,
        summary: entry.summary,
        status: entry.status,
      })),
      training: training
        ? {
            id: training.id,
            entryCode: training.entryCode,
            title: training.title,
            summary: training.summary,
          }
        : null,
    });
  } catch {
    const message = "NOA could not answer. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
