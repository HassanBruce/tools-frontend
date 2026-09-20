---
title: 'Are QR Codes Safe? What "Quishing" Actually Looks Like'
description: A QR code is just a wrapper around a URL, with no way to preview the destination before you scan. That single gap is the entire attack, and it has a name now.
date: 2026-09-17
author: Toolkit
tags: qr-code, security, phishing
---

Security vendors have watched QR-code-based phishing rise sharply enough over the past few years to give it its own name — **quishing**, phishing delivered through a QR code instead of a link. The technique isn't new, but the reason it works is worth understanding precisely, because it isn't a flaw in QR codes as a technology. It's a gap in how humans verify a destination before committing to it, and a QR code removes the one habit — hovering over a link to preview the URL — that normally closes that gap.

## Why this attack works as well as it does

With a text link, most people have absorbed at least a partial defense: hover before you click, glance at the domain in the status bar, notice that `paypaI.com` has a capital I where an L should be. None of that is available with a QR code. The pattern is opaque by design — there is no way to look at a QR code and know where it leads. You find out only after your phone's camera has already decoded it and is showing you a preview, which is the first and only checkpoint in the entire interaction.

That single missing step is why the same phishing techniques that email filters have gotten reasonably good at catching — suspicious links, known-bad domains — get a second chance when delivered as an image instead of text. Many automated email security scanners are built to parse and check URLs in the body of a message; a URL that's been converted into a QR code image and pasted into a PDF or a picture often sails past exactly those checks, because there's no plain-text link for the scanner to inspect at all.

## Where this shows up in practice

**Physical tampering.** A sticker with a malicious QR code placed directly over a legitimate one — on a parking meter, a restaurant table tent, a public transit poster — is now a documented and reported tactic in several cities, precisely because there's no visible sign of tampering to a passerby glancing at a printed code. A sticker looks exactly as official as what it's covering.

**Fake delivery and payment notices.** Letters or emails claiming a missed delivery, an unpaid toll, or a parking fine, with a QR code presented as the fastest way to resolve it — leading to a credential-harvesting or card-skimming page rather than the real service.

**Unsolicited email and text attachments.** A QR code embedded in an email or PDF, sometimes explicitly framed as a workaround ("having trouble with the link? scan this instead") — a framing that specifically discourages the recipient from doing the one thing that might catch a suspicious domain, which is reading the actual URL.

## It isn't always a URL

The threat model is usually described purely in terms of phishing links, but the QR standard itself can encode several other payload types, and phones act on all of them the same way — automatically presenting an action, not just a webpage. A code can dial a phone number (`tel:`), pre-fill a text message, add a contact card (vCard), or, as covered in [our guide to WiFi QR codes](/blog/wifi-qr-code-format-explained), join a wireless network directly. A malicious `tel:` code that quietly calls a premium-rate number, or a fake "guest WiFi" code that actually joins a phone to an attacker-controlled network positioned for a man-in-the-middle attack, are both real variants of the same underlying trust gap — the payload type changes, but the missing preview-before-you-commit step is identical.

## What actually reduces the risk

**Read the preview before tapping through.** Every modern phone camera app shows the decoded URL before opening it — this is the direct equivalent of hovering over a link, and it's the single most effective habit here. If the domain doesn't match who the code claims to be from, or looks subtly off, stop there.

**Be more suspicious of QR codes than of typed links, not less.** The physical/professional appearance of a printed sign carries no security signal at all — printing a sticker is trivial, and looking official is the entire point of the attack.

**Check for tampering on public codes.** A sticker with a slightly different texture, a code that looks stuck over another surface, or a QR code somewhere it wouldn't normally appear (a poster that didn't have one last week) are all worth a second look before scanning.

**Never enter credentials or payment details immediately after a scan without independently verifying the destination.** If a QR code leads to something claiming to be your bank, your parking provider, or a delivery service, and it's asking for a login or card number, navigate there directly through a known URL or app instead of trusting the page the code opened.

**Keep your phone's OS current.** Camera apps have gotten measurably better at surfacing the full destination URL prominently, rather than a truncated or easy-to-miss preview, and that improvement only reaches you through updates.

## What this means for a QR code you generate yourself

None of the above is a reason to avoid QR codes for legitimate use — a QR code is a completely neutral container. It's exactly as safe as the URL inside it, nothing more and nothing less. As covered in the [error correction and static-vs-dynamic guide](/tools/qr-code-generator) for this tool, a **static** code — the kind generated here — has the destination baked directly into the pattern, with no third-party redirect service sitting in the middle that could be compromised, sold, or repurposed after the fact. When you generate one, you can see and verify the exact text or URL being encoded before you ever download the image, which is precisely the transparency step that a malicious code, by design, denies the person scanning it.

The risk was never in the technology. It's in scanning a code without knowing, or being able to know in advance, what it actually points to — and a printed QR code from an unverified physical source deserves exactly the scrutiny you'd already give a suspicious link, even though it doesn't look like one.
