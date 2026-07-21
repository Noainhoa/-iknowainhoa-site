---
title: "PhotoArc Privacy Policy (archived source)"
description: "Archived copy. Canonical privacy policy now lives at content/product-apps/photoarc/privacy.md"
date: "2026-07-20"
---

# PhotoArc Privacy Policy

**Last updated:** 20 July 2026

This policy describes how the PhotoArc iOS app (“PhotoArc”) handles information. It reflects the behaviour of the shipping app.

## Summary

PhotoArc processes media **entirely on your device**. There is no PhotoArc account, no PhotoArc cloud storage, no analytics SDK, no advertising, and no tracking by the developer.

## What PhotoArc does

You select photos with Apple’s system photo picker, create a silent progression video on device, preview it, and optionally share it or save it to Photos.

## Photos and videos

- Selected photos are loaded on device to create the export.
- Temporary export files are stored in the app’s local Caches directory and cleaned automatically (including removal of stale exports older than about 24 hours, while keeping the active export).
- The developer does not collect, upload, or store your photos or videos on a PhotoArc server.

## Photos permission

PhotoArc requests Photos access only when you tap **Save to Photos**. The request is **add-only** (`PHAccessLevel.addOnly`): permission to save the video you created, not to read your full library for browsing.

Selecting photos uses the system PhotosPicker and does not require broad photo-library read access.

## Data PhotoArc stores on device

PhotoArc may store on device:

- App preferences (for example default speed/quality, selection-order preference, max file-size preference)
- First-run welcome completion state
- Temporary video exports in the app container (Caches), cleaned as described above

These stay on your device. They are not sent to the developer.

## What PhotoArc does not do

- No account or login
- No analytics or advertising SDKs
- No tracking for advertising
- No cloud sync of your media by PhotoArc
- No developer-operated collection of personal content from the app

System features you choose to use (for example Share Sheet destinations, opening Settings, opening App Store or mailto links) are handled by Apple or the destination you select. Those services have their own privacy practices.

## Contact

Questions about this policy: [hola@iknowainhoa.com](mailto:hola@iknowainhoa.com)

## Changes

If this policy changes in a future version of PhotoArc, the updated text will be published on this page with a new “Last updated” date.

> Archived note: this file is no longer loaded by the site. Live source: `content/product-apps/photoarc/privacy.md`.
