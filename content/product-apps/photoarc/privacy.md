---
title: "PhotoArc Privacy Policy"
description: "How PhotoArc handles photos and data on your device."
date: "2026-10-24"
---

# PhotoArc Privacy Policy

**Last updated:** 24 October 2026

This policy describes how the PhotoArc iOS app (“PhotoArc”) handles information. It reflects the behaviour of the shipping app.

## Summary

PhotoArc processes media **entirely on your device**. There is no PhotoArc account, no PhotoArc cloud storage, no analytics SDK, no advertising, and no tracking by the developer.

## What PhotoArc does

You select photos (and optionally short library video clips) with Apple’s system photo picker (**Choose**), or add an entire album with **Collections**. Side tools such as Before / After and saved projects live in **Composition Lab**. PhotoArc creates a silent progression video on device, lets you preview it, and optionally share it or save it to Photos.

## Photos and videos

- Selected photos and short clips are loaded on device to create the export.
- Temporary export files are stored in the app’s local Caches directory and cleaned automatically (including removal of stale exports older than about 24 hours, while keeping the active export).
- Editable projects you choose to save stay in the app’s local storage on this iPhone.
- The developer does not collect, upload, or store your photos or videos on a PhotoArc server.

## Photos permission

PhotoArc uses two separate Photos permissions, each only when you choose that action:

1. **Choose (default)** — Apple’s system PhotosPicker. This does not require broad photo-library access. PhotoArc only receives the items you pick.
2. **Collections** — If you use Collections to add an entire album, PhotoArc requests Photos library access so it can list albums and add those items. Photos stay on this iPhone. PhotoArc does not upload them.
3. **Save to Photos** — When you save a progression video or an issue-report screenshot, PhotoArc requests **add-only** access (`PHAccessLevel.addOnly`): permission to save the file you created, not to browse your library for that save.

You can change Photos access later in **Settings → PhotoArc → Photos**.

## Data PhotoArc stores on device

PhotoArc may store on device:

- App preferences (for example default pace/quality, selection-order preference, max file-size preference)
- Free-progression and free-clip Create counters (local only)
- How many times Demo has been shown on empty Home (local only)
- Saved projects you choose to keep
- Temporary video exports in the app container (Caches), cleaned as described above
- PhotoArc Pro unlock status cached from Apple’s StoreKit for offline relaunch

These stay on your device. They are not sent to the developer.

## What PhotoArc does not do

- No account or login
- No analytics or advertising SDKs
- No tracking for advertising
- No cloud sync of your media by PhotoArc
- No developer-operated collection of personal content from the app

System features you choose to use (for example Share Sheet destinations, opening Settings, opening App Store or mailto links, redeeming an App Store offer code) are handled by Apple or the destination you select. Those services have their own privacy practices.

## Purchases and support

- PhotoArc Pro purchases and offer-code redemptions are processed by Apple through StoreKit. The developer does not receive or store payment-card details.
- If you voluntarily contact support by email, the email address, message, and any information you choose to include are handled through your mail provider and received only for the purpose of responding to that support request.
- PhotoArc does not automatically transmit photos, videos, diagnostics, or device information to the developer.

## Contact

Questions about this policy: [hola@iknowainhoa.com](mailto:hola@iknowainhoa.com)

## Changes

If this policy changes in a future version of PhotoArc, the updated text will be published on this page with a new “Last updated” date.

## Related pages

- [PhotoArc product page](/photoarc)
- [PhotoArc Support](/photoarc/support)
