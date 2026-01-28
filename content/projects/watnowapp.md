---
title: "WhatNow App"
description: "Guided journaling that helps you turn hard moments into momentum."
date: "2026-01-28"
slug: "whatnow-app"
draft: false
tags: ["apps", "ios", "pwa", "resilience"]
coverImage: "/images/projects/watnow-ios-install-annotated/step-04-add-to-home-screen.png"
---

# WhatNow

A lightweight web app designed to capture the moment something hard happens, then guide you back later to extract meaning and direction.

## Install it on your iPhone Home Screen (Safari)

On iPhone, the best way to use WhatNow is to save it to your Home Screen. It then opens full-screen like a native app.

> Important: You need to do this in **Safari**. Other browsers on iOS don’t provide the same “Add to Home Screen” flow.

Step-by-Step Instructions:
Open Safari: Navigate to the website you want to install as a PWA.
Tap the Share Button: Locate the Share icon (bottom center in Safari) and tap it.
Select "Add to Home Screen": Scroll down the menu and choose "Add to Home Screen".
Confirm the Installation: You can rename the app if desired, then tap "Add" in the top right corner.
Launch the PWA: The app will now appear on your home screen just like a native app. 





### 1) Open Safari

Tap the **Safari** app on your iPhone.

![Open Safari from the Home Screen](/images/projects/watnow-ios-install-annotated/step-01-open-safari.png)

### 2) Go to the app URL

In Safari’s address bar, type the URL and tap **Go**:

`watnow.netlify.app`

![Type the URL in Safari and tap Go](/images/projects/watnow-ios-install-annotated/step-02-enter-url-and-go.png)

### 3) Tap the Share button

Once the site loads, tap the **Share** icon (square with an arrow) in the Safari toolbar.

![The WhatNow site open in Safari; tap the Share icon](/images/projects/watnow-ios-install-annotated/step-03-tap-share.png)

### 4) Choose “Add to Home Screen”

In the Share sheet, scroll (if needed) and tap **Add to Home Screen**.

![Safari Share sheet with \"Add to Home Screen\"](/images/projects/watnow-ios-install-annotated/step-04-add-to-home-screen.png)

### 5) Confirm the name, then tap “Add”

You can keep the suggested name or edit it (this is the label that will appear under the Home Screen icon).  
Tap **Add** in the top-right.

![Rename the shortcut (optional) and tap Add](/images/projects/watnow-ios-install-annotated/step-05-confirm-add.png)

### 6) Optional: open Safari faster next time

If you want a quicker path to a fresh tab, press-and-hold the **Safari** icon and choose **New Tab**.

![Safari quick actions menu (press-and-hold)](/images/projects/watnow-ios-install-annotated/step-06-optional-safari-shortcut.png)

That’s it — you’ll now have a new icon on your Home Screen that launches WhatNow like an app.

## Quick actions (iPhone-ready)

1) Open: `https://watnow.netlify.app/`  
2) In Safari tap **Share** → **Add to Home Screen**.  
3) Confirm **Add**.

## Why use it

- Process setbacks with structured prompts.
- Return to the same entry later to log what changed.
- Works on desktop and mobile; saves best as a Home Screen app on iPhone.

## Need the icon?

If you see a generic icon when adding to Home Screen, make sure your site has an Apple touch icon (often called `apple-touch-icon.png`) and/or a PWA manifest icon set.

- The screenshots above use the provided icon.  
- To wire a dedicated file, place your icon at `public/images/apps/watnow.png` and reference it in your PWA manifest / `apple-touch-icon`.

## Links

- Live app: `https://watnow.netlify.app/`
