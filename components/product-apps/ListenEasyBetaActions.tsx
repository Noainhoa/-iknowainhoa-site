"use client";

import { useState } from "react";
import { externalAnchorProps } from "@/lib/links";

type ListenEasyBetaActionsProps = {
  testFlightUrl: string;
  appName: string;
};

export default function ListenEasyBetaActions({
  testFlightUrl,
  appName,
}: ListenEasyBetaActionsProps) {
  const [shareLabel, setShareLabel] = useState("Share invite");

  async function handleShare() {
    const shareData: ShareData = {
      title: `${appName} beta`,
      text: `Join the ${appName} beta on TestFlight:`,
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
      setShareLabel("Link copied");
      window.setTimeout(() => setShareLabel("Share invite"), 1600);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(testFlightUrl);
        setShareLabel("Link copied");
        window.setTimeout(() => setShareLabel("Share invite"), 1600);
      } catch {
        setShareLabel("Couldn’t copy");
        window.setTimeout(() => setShareLabel("Share invite"), 1600);
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
        Join the beta
      </a>
      <button type="button" className="le-share" onClick={handleShare}>
        {shareLabel}
      </button>
      <p className="le-hint">
        Best on iPhone: install TestFlight, then open the invite. On a computer, share
        the link to your phone (Messages, Mail, or copy).
      </p>
    </div>
  );
}
