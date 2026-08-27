"use client";

import { useState } from "react";
import { externalAnchorProps } from "@/lib/links";
import type { Locale } from "@/lib/i18n/shared";
import { getListenEasyCopy } from "@/lib/listeneasy/copy";

const TESTFLIGHT_APP_STORE =
  "https://apps.apple.com/app/testflight/id899247664";

type ListenEasyBetaActionsProps = {
  testFlightUrl: string;
  appName: string;
  locale?: Locale;
};

export default function ListenEasyBetaActions({
  testFlightUrl,
  appName,
  locale = "en",
}: ListenEasyBetaActionsProps) {
  const copy = getListenEasyCopy(locale).actions;
  const [shareLabel, setShareLabel] = useState(copy.share);

  async function handleShare() {
    const shareData: ShareData = {
      title: copy.shareTitle(appName),
      text: copy.shareText(appName),
      url: testFlightUrl,
    };

    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        const canShare =
          typeof navigator.canShare !== "function" || navigator.canShare(shareData);
        if (canShare) {
          await navigator.share(shareData);
          return;
        }
      }

      await navigator.clipboard.writeText(testFlightUrl);
      setShareLabel(copy.copied);
      window.setTimeout(() => setShareLabel(copy.share), 1600);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(testFlightUrl);
        setShareLabel(copy.copied);
        window.setTimeout(() => setShareLabel(copy.share), 1600);
      } catch {
        setShareLabel(copy.copyFail);
        window.setTimeout(() => setShareLabel(copy.share), 1600);
      }
    }
  }

  return (
    <div className="le-actions">
      <a
        className="le-cta"
        href={testFlightUrl}
        {...externalAnchorProps(testFlightUrl)}
      >
        {copy.join}
      </a>
      <button type="button" className="le-share" onClick={handleShare}>
        {shareLabel}
      </button>
      <ol className="le-steps">
        <li>
          {copy.stepInstall}{" "}
          <a
            href={TESTFLIGHT_APP_STORE}
            {...externalAnchorProps(TESTFLIGHT_APP_STORE)}
          >
            TestFlight
          </a>{" "}
          {copy.stepTestFlight}
        </li>
        <li>
          {copy.stepJoin}
        </li>
      </ol>
    </div>
  );
}
