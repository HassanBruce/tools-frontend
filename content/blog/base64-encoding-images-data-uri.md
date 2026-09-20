---
title: When to Base64-Encode an Image (and When Not To)
description: Data URIs let you embed an image directly in HTML or CSS as Base64 text. It works, it's overused, and it makes some pages slower rather than faster.
date: 2026-09-17
author: Toolkit
tags: encoding, base64, performance, images
---

Somewhere in most front-end codebases is a tiny spinner icon or a logo living as a giant string of text inside a `<img src="data:image/png;base64,...">` tag or a CSS `background-image`. That is a **data URI** — an image with no separate file, no separate HTTP request, embedded directly in the document that uses it. It is a genuinely useful technique for the right image, and a quiet performance problem for the wrong one.

## What a data URI actually is

The format is defined by RFC 2397: `data:[mediatype][;base64],<data>`. A minimal example:

```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...
```

The browser reads the media type, decodes the Base64 payload back into bytes, and renders it exactly as if it had downloaded a file — because as far as the rendering engine is concerned, it has. The only thing that changed is where those bytes came from.

Getting there in code is one of two calls, depending on what you are starting from. From a `File` or `Blob` (a file input, a fetch response, a canvas):

```js
const reader = new FileReader();
reader.onload = () => console.log(reader.result); // "data:image/png;base64,..."
reader.readAsDataURL(blob);
```

From an existing `<canvas>`:

```js
const dataUri = canvas.toDataURL("image/png");
```

Both produce the same kind of string, ready to drop straight into a `src` attribute or a stylesheet — which our own [Base64 encoder](/tools/base64-encoder) does when you feed it an image, without needing either API yourself.

## The case for inlining

**Fewer requests.** Before HTTP/2 multiplexing was universal, every image was a separate round trip, and a page with fifteen small icons paid for fifteen connections' worth of latency. Inlining collapsed that to zero extra requests for those assets.

**Email.** This is where data URIs are close to mandatory rather than optional. Most email clients block external images by default and only load them after the user clicks "show images" — Base64-embedding a logo or icon guarantees it renders on open, with no dependency on a remote server or the recipient's trust settings.

**Critical above-the-fold assets.** A tiny icon that needs to appear the instant the page paints — before any other network request has had time to complete — can be worth inlining specifically to avoid the extra round trip on the critical rendering path, particularly for Largest Contentful Paint on a slow connection.

**Offline-first apps.** If an asset needs to be available with zero network access at all, embedding it directly in the HTML or a cached stylesheet sidesteps the question of whether it was fetched and cached correctly.

## The case against it, which is most images

**The 33% size tax, permanently.** Base64 inflates data by roughly a third — 4 characters for every 3 bytes. For a 500-byte icon that is nothing. For a 200KB photograph inlined into a page, that is an extra 65KB added to the HTML payload itself, which blocks parsing and rendering of everything below it.

**Total loss of caching.** This is the one people underestimate. An external image file is fetched once and cached by the browser for as long as its cache headers allow — visit ten pages that share a logo, and it downloads once. A data URI is part of the HTML or CSS document itself, so it is re-downloaded, re-parsed and re-decoded on **every single page** that contains it, with no separate cache entry of its own. An icon reused across a hundred pages of a site is fetched, in full, a hundred times.

**No lazy loading.** `loading="lazy"` and intersection-observer-based lazy loading both operate on the request for an image file. A data URI has no request to defer — it is already sitting in the document, downloaded and decoded whether or not the user ever scrolls to it.

**No image CDN, no format negotiation.** Real image hosting can serve WebP to browsers that support it and JPEG to those that don't, resize on the fly, and compress harder than a one-shot canvas export. A hand-inlined data URI gets none of that; you baked in one file, one format, one size, permanently, at build time.

## The special case of SVG: don't Base64-encode it

SVG is a common target for inlining, and it's the one format where Base64 is usually the wrong choice of encoding entirely — not because inlining SVG is bad, but because SVG is already text. Base64 exists to make arbitrary **binary** bytes safe inside a text context; running it over data that's already text adds the usual 33% overhead for no benefit. The better option for an inlined SVG is a URL-encoded data URI instead of a Base64 one:

```css
/* Base64 — larger, and the SVG source is opaque */
background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0i...");

/* URL-encoded — smaller, and still readable/diffable in source control */
background-image: url("data:image/svg+xml,%3Csvg xmlns='...");
```

The URL-encoded version is typically smaller, and unlike its Base64 equivalent it stays legible in a diff — a genuine advantage when the icon changes and someone has to review the change later. Most build tools that inline SVGs (PostCSS plugins, webpack loaders) default to URL-encoding for exactly this reason.

## A rough rule of thumb

| Situation | Recommendation |
| --- | --- |
| Icon or spinner under ~2KB, used once | Inline is fine |
| Same icon reused across many pages | Use a real file — you want the shared cache |
| Email template | Inline, close to mandatory |
| Photograph or hero image, any size | Never inline — use a real file with proper compression |
| Critical tiny asset needed at first paint | Inlining can genuinely help |

The size threshold matters more than it sounds like it should, because the moment you cross a few kilobytes, the caching loss usually outweighs the one-request saving — and on a page that gets any repeat traffic at all, it is not close.

If you are deciding whether an image is small enough to be worth it, generate the data URI and look at the actual character count rather than guessing — the [Base64 encoder](/tools/base64-encoder) shows you the exact output, and if it runs to tens of thousands of characters for what you thought was a small icon, that is the signal to reach for a real file and our [image compressor](/tools/image-compressor) instead.
