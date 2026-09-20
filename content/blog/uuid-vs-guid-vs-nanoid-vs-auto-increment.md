---
title: "UUID vs GUID vs Nanoid vs Auto-Increment: Picking an ID Strategy"
description: Four common ways to identify a row, and the trade-offs that actually distinguish them — size, coordination, what they leak, and whether anyone else uses the same format.
date: 2026-09-13
author: Toolkit
tags: uuid, databases, security
---

Every new table needs an identifier, and there are more reasonable-sounding options than there used to be. Here is what actually distinguishes them, because the terminology alone accounts for a surprising amount of the confusion.

## UUID and GUID are the same thing

This is the fastest question to settle: **GUID** (Globally Unique Identifier) is Microsoft's name for the same 128-bit identifier format standardized elsewhere as **UUID** (Universally Unique Identifier, RFC 9562, formerly RFC 4122). As text — the familiar `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` form — they are identical. The historical distinction was at the binary level: early Microsoft COM implementations stored some of the fields in a different byte order than the RFC's big-endian layout, which occasionally causes the same 16 bytes to render as different-looking strings between a .NET binary `Guid` and a byte array processed elsewhere. If you're generating and comparing them as strings — which is what almost everyone does — there is no practical difference, and "UUID" and "GUID" can be used interchangeably in conversation without anyone being wrong.

## The four options, compared

| | Auto-increment integer | UUID / GUID | Nanoid | ULID |
| --- | --- | --- | --- | --- |
| **Typical size** | 4–8 bytes | 16 bytes (36-char text) | ~12.6 bytes (21-char default) | 16 bytes (26-char text) |
| **Sortable by creation** | Yes, always | Only v7 | No | Yes |
| **Needs coordination** | Yes — a central sequence | No | No | No |
| **Leaks row count** | Yes | No (v4); partially (v7, via timestamp) | No | Partially, via timestamp |
| **Standardized format** | N/A | Yes (RFC 9562) | No — library convention | Community spec, not an RFC |
| **Collision risk in practice** | None (sequence-guaranteed) | Negligible | Negligible at reasonable volumes | Negligible |

*(ULID is included because it comes up in the same conversation — it is essentially "UUID v7, standardized slightly earlier and independently," with a Base32 text encoding instead of hex.)*

## Auto-increment: smallest, simplest, and it tells on you

A plain integer primary key is compact, indexes efficiently, and is trivial to reason about. Its problems are all about what it reveals and what it requires:

**It leaks business information.** An order at `/orders/1042` tells any observer, including competitors, roughly how many orders the system has processed. This has been a real, repeated disclosure problem for e-commerce and SaaS products.

**It enables enumeration.** If access control has any gap at all, `/api/users/1`, `/api/users/2`, `/api/users/3` is a trivial script for an attacker to run. A random identifier doesn't fix broken authorization, but it does remove the free, guessable index.

**It requires a single source of truth.** A classic auto-increment sequence lives in one place. That is fine for a single database, and a real problem the moment you need multiple services or database shards generating IDs independently without talking to each other first.

Use it for internal tables you fully control, with no public-facing IDs and no distributed write path — a lot of tables genuinely meet that description, and there is no need to reach for anything fancier there.

## UUID: no coordination, at the cost of size and (for v4) sort order

A UUID can be generated anywhere — a browser tab, a mobile app, an offline worker — with a cryptographically random source and no risk of colliding with an ID generated somewhere else, no round trip to a central server required. That is the entire value proposition, worked out in the actual numbers in [our piece on UUID collision odds](/blog/can-uuids-collide).

The trade-off is size — 16 bytes versus 4 or 8 — and, for the classic **v4** variant, index locality: random values inserted as a primary key scatter across a B-tree instead of appending to the end, which shows up as real overhead at large table sizes. **Version 7** fixes exactly this by putting a timestamp in the leading bits so identifiers sort by creation time, covered in full in [UUID v7 vs v4 as a database primary key](/blog/uuid-v7-vs-v4-database-keys). If you're choosing UUID today with no legacy constraint, v7 is very likely the right default over v4.

Generate either version with [our UUID generator](/tools/uuid-generator) to see the difference in the actual output.

## Nanoid: shorter, URL-friendly, not a standard

Nanoid generates a random string from a configurable alphabet (URL-safe by default) at a configurable length — 21 characters by default, which packs comparable collision resistance to a UUID into notably fewer characters, because it isn't constrained by UUID's fixed 128-bit, hyphenated layout.

The trade-off is exactly that lack of structure: there is no RFC, no fixed byte layout, no cross-language standard — it's a well-regarded library convention rather than a specification. That is a non-issue inside a single JavaScript-heavy stack, and a real consideration if the identifier needs to be generated or parsed consistently across many languages and systems that might not all have an equivalent, well-maintained Nanoid port.

It shines specifically where identifiers are public-facing and length matters visibly — short links, public share URLs, anything that ends up in a URL bar or gets read aloud.

## A decision that mostly comes down to three questions

1. **Does this ID need to be generated in more than one place without coordination?** If no, and you fully control writes, auto-increment is simpler and smaller — don't reach for a UUID out of habit.
2. **Will this ID become a primary key on a large, high-write table?** If yes and you need distributed generation, UUID v7 gets you both the coordination-free property and index-friendly ordering.
3. **Is this ID going to appear in a URL a human will look at or type?** If yes and brevity matters, Nanoid is worth the trade-off of leaving the UUID standard behind.

None of these are wrong choices in isolation — they solve different problems, and a single application commonly uses more than one of them for different tables.
