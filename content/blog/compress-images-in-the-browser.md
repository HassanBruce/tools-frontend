---
title: How to Compress Images Without Uploading Them Anywhere
description: Modern browsers can decode, resize and re-encode images locally using Canvas. Here is how it works, what quality setting to pick, and where the approach breaks down.
date: 2026-09-03
author: Toolkit
tags: images, performance, privacy
---

Most online image compressors upload your files to a server, process them there, and hand back a download. That is an odd amount of trust to extend for something your browser can already do.

Every current browser ships a complete image pipeline: decode, resize, re-encode, all locally. Here is how that works and where its limits are.

## The three steps

**Decode.** `createImageBitmap(file)` turns a `File` into a bitmap, using the browser's own decoders — the same battle-tested code that renders every image you see.

**Resize.** Draw the bitmap onto a canvas at the target size:

```js
const bitmap = await createImageBitmap(file);
const canvas = document.createElement("canvas");
canvas.width = 1920;
canvas.height = Math.round(bitmap.height * (1920 / bitmap.width));

const ctx = canvas.getContext("2d");
ctx.imageSmoothingQuality = "high";
ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
```

That `imageSmoothingQuality` line matters. The default produces noticeably worse downscaling.

**Encode.** `canvas.toBlob(callback, "image/webp", 0.8)` gives you a compressed blob to download or zip.

## Choosing a quality setting

Quality is a number between 0 and 1, and the useful range is narrower than people expect.

| Setting | Use for |
| --- | --- |
| 0.9–1.0 | Almost never — huge files, no visible gain over 0.85 |
| 0.75–0.85 | The sweet spot for photographs |
| 0.6–0.75 | Thumbnails, backgrounds, anything behind an overlay |
| Below 0.6 | Visible artefacts on most images |

For photographs, 0.8 typically gives a 40–80% reduction with no difference you can see at normal viewing size.

Flat graphics, screenshots and line art behave differently. Lossy formats produce ringing around hard edges, and PNG often beats JPEG outright on both size and quality. Compress photographs; leave diagrams as PNG.

## Format, briefly

**WebP** is the safe default — roughly 25–35% smaller than JPEG at matching quality, supported everywhere that matters, and it keeps transparency.

**AVIF** goes further, often 20–30% below WebP, at the cost of slower encoding and slightly narrower support. Worth it for large hero images.

**JPEG** remains the maximum-compatibility choice, and has no alpha channel — transparent areas flatten to a background colour.

One trap: `canvas.toBlob()` silently falls back to PNG for a format the browser cannot encode. You get a file with the wrong extension and a mysteriously larger size. Probe support first by encoding a 1×1 canvas and checking `blob.type` matches what you asked for.

## Where this approach breaks down

**Very large images.** Decoding a 100-megapixel file allocates a lot of memory. Browsers handle it, but a mobile device may not.

**EXIF is dropped.** Canvas gives you pixels, not metadata — orientation, camera settings and copyright tags do not survive. Usually a benefit for the web; a problem if you need provenance.

**No progressive or advanced encoding.** You get whatever the browser's encoder does. A dedicated tool like MozJPEG squeezes out a few more percent.

**It is single-threaded by default.** Compressing fifty images on the main thread will freeze the tab. Process them in sequence with yields, or move the work to a Web Worker.

For the common case — a folder of photographs that need to be smaller before going on a website — none of these matter, and nothing ever leaves your machine. That is what our [bulk image compressor](/tools/image-compressor) does.
