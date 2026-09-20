---
title: About
description: What this site is, why every tool runs in your browser instead of on a server, and who builds it.
updated: 17 September 2026
---

<!--
  Replace [PLACEHOLDER] values and rewrite the "Who builds this" section in
  your own voice — reviewers and readers can both tell when it is boilerplate.
-->

[SITE_NAME] is a collection of free developer and SEO tools that run entirely in your browser.

## The idea

Most online tools work the same way: you paste your data into a form, it gets uploaded to someone's server, something happens there, and a result comes back.

That is a strange amount of trust to extend for something as ordinary as formatting a JSON file. You are handing a stranger's server your configuration, your API responses, your customer export — and taking it on faith that it is not logged, retained or examined.

Modern browsers can do this work themselves. They ship a complete JavaScript engine, a cryptography API, an image pipeline and a capable rendering engine. For the overwhelming majority of everyday tools, a server is not a technical requirement — it is just how things have always been built.

So these tools do the work locally. Your data stays on your device.

## What that means in practice

- **Nothing is uploaded.** Open your Network tab and watch — no request carries your content.
- **No accounts, no sign-up.** There is nothing to create an account for.
- **No rate limits.** There is no server capacity to protect, so use it as much as you like.
- **It works offline.** Once a page has loaded, most tools keep working with the network disconnected.
- **It stays fast.** No upload, no queue, no round trip. Results are instant because the work happens where you are.

## Where the limits are

Some things genuinely need a server, and we would rather say so than pretend otherwise.

Anything that must fetch a third-party URL — a broken-link checker, an SSL inspector, a WHOIS lookup — cannot work in a browser, because browsers deliberately block cross-origin requests. Converting between Office and PDF formats needs LibreOffice, which is not something that can run in a tab.

Those tools are being built separately, and where a tool does send data somewhere, the page will say so plainly.

## Who builds this

<!-- Rewrite this in your own words. -->

[SITE_NAME] is built and maintained by [ENTITY_NAME].

It exists because these were tools we wanted and could not find a version of that we trusted with real data.

## Get in touch

Found a bug, or want a tool that is not here yet? [Contact us](/contact) — suggestions genuinely do shape what gets built next.
