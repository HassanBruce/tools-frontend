---
title: How to Make a QR Code for Your WiFi Password
description: Scanning a QR code to join WiFi works because of a plain-text string format your phone's camera already understands. Here is exactly what's inside it.
date: 2026-09-14
author: Toolkit
tags: qr-code, networking
---

Print a small card next to your router or on a café table, someone scans it with their phone's camera, and their phone offers to join the network — no typing a password character by character on a screen keyboard. There's no app, no special hardware, and no cloud service involved. The whole thing works because of a plain-text string format that iOS and Android camera apps both recognize natively.

## The format itself

A WiFi QR code encodes a string that looks like this:

```
WIFI:T:WPA;S:MyNetworkName;P:MyPassword123;;
```

Broken down field by field:

- **`T`** — the security type: `WPA` (covers WPA, WPA2 and WPA3 — there's no separate code for WPA3 in the common convention, `WPA` is understood to mean "use whatever WPA variant this network actually runs"), `WEP` for the long-obsolete standard, or `nopass` for an open network with no password at all.
- **`S`** — the network name (SSID), exactly as it appears when you look for the network manually.
- **`P`** — the password. Omit this field entirely for `nopass` networks.
- **`H`** — optional, set to `true` if the network is hidden (not broadcasting its SSID). Defaults to false if left out.

The double semicolon at the end terminates the string. Every phone's built-in camera app since roughly iOS 11 and Android 10 recognizes this exact prefix and format, and offers a "Join Network" button the moment it decodes the QR code — no third-party app required on either platform.

## Escaping characters that appear inside the format's own syntax

If your SSID or password contains any of the characters the format itself uses as separators — `;`, `,`, `:`, or `\` — those characters need to be escaped with a backslash, or the parser on the receiving end reads them as field boundaries instead of literal characters:

```
WIFI:T:WPA;S:Cafe\;Downtown;P:Espresso\:2024;;
```

Here, the semicolon inside `Cafe;Downtown` and the colon inside `Espresso:2024` are both escaped so they're treated as part of the value, not as the start of the next field. This is the single most common cause of a WiFi QR code that scans but fails to connect, or connects with the wrong SSID: an unescaped separator character quietly truncating a field. Generators that build this string for you — including the WiFi content type on our [QR code generator](/tools/qr-code-generator) — handle the escaping automatically, which is the main reason to use one rather than typing the raw string by hand.

## What this can't do

**Enterprise WiFi (WPA2-Enterprise / 802.1X)** — the kind that asks for a username and a certificate rather than a single shared password, common on corporate and university networks — cannot be represented in this format at all. The format only has room for a single shared password; there's no field for a per-user identity or certificate, because enterprise authentication was never part of what this convention was designed to express. If you're trying to build a QR code for an office network and it isn't connecting, this is usually why — check whether the network actually uses a single pre-shared key (WPA-Personal) rather than per-user credentials.

**Captive portals.** Some public WiFi networks are technically open (no password) but require accepting terms or logging in through a browser page after connecting. A QR code can get a device onto the network itself, but it can't click through a captive portal for the user — that step still happens manually in the browser that pops up.

## Two smaller pitfalls worth checking before you print anything

**The SSID has to match exactly, including case and trailing spaces.** "MyNetwork" and "mynetwork" are different SSIDs as far as the connection attempt is concerned, and a trailing space copied accidentally from a router's admin panel becomes part of the value the phone tries to match against — invisible in most text fields, and a real reason a code silently fails to connect.

**Test on both platforms before committing to print.** iOS and Android have historically had minor differences in exactly which malformed strings they tolerate — one might recover gracefully from a small formatting slip that the other rejects outright. Scanning the code with an actual phone before it goes on a hundred printed cards costs a minute and catches this class of problem for free.

## Practical uses this is actually good for

- **Home networks** — a small card taped inside a cupboard or router cabinet saves reciting a 20-character random password to every houseguest.
- **Short-term rentals** — a welcome card with the network QR code is one of the more consistently appreciated small touches in a rental listing.
- **Small offices and cafés** — a printed card at reception or on tables, particularly useful for a guest network kept separate from internal systems.
- **Events and conferences** — a slide or printed sign with a QR code gets an entire room online faster than reading a password aloud.

## A security note worth keeping in mind

A WiFi QR code makes the password **portable and durable** in a way that a password shown once on a screen isn't — anyone who scans or even just photographs the printed code has the plaintext password indefinitely, and can share that photo as easily as forwarding a text. This is not a flaw in the format; it behaves exactly like a password written on a sign, which is what it functionally is. If a network is sensitive enough that you wouldn't want the password photographed and forwarded freely, put it on a separate guest network with its own password rather than relying on where the card happens to be posted.

Since the code is just static text — no redirect service, no expiry, nothing that depends on this site staying online — a WiFi QR code generated once keeps working for as long as the SSID and password stay the same, which for most home networks is effectively forever.
