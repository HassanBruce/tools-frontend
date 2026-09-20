---
title: How Long It Actually Takes to Crack a Password
description: The answer depends far more on which hashing algorithm protects the password than on how many symbols it contains. Here is the actual math, worked through for both.
date: 2026-09-18
author: Toolkit
tags: passwords, security, hashing
---

"How long would it take to crack my password" is really two different questions wearing one sentence, and mixing them up is why password-strength charts that circulate online can be simultaneously correct and misleading. The two questions are: how many attempts would exhaust every possibility, and how fast can an attacker actually make attempts. The second number varies by *many orders of magnitude* depending on one decision the service holding your password made — which hashing algorithm they used — and that decision affects the answer far more than adding one more character to your password does.

## Two completely different attack speeds

**Online attacks** guess against a live login form, one attempt at a time over the network, and are almost always rate-limited — a handful of attempts per minute before a lockout or a CAPTCHA kicks in. Under real rate limiting, even a fairly weak password can hold out for an impractically long time, because the bottleneck is the network round trip and the lockout policy, not the password's complexity.

**Offline attacks** happen after a database breach, when an attacker has the actual password hashes and can test guesses locally, limited only by their own hardware. This is the regime where hashing algorithm choice dominates everything else, because different algorithms are designed with deliberately different speeds.

## The number that matters most: hashes per second

**Fast, general-purpose hashes** — MD5, SHA-1, unsalted SHA-256 — were designed for speed, which is exactly the wrong property for protecting a password. They were built for integrity checks and general computation, not for resisting brute force, and modern GPUs are extraordinarily good at computing them in parallel. A single high-end consumer GPU can compute on the order of **tens of billions of MD5 hashes per second**; a dedicated multi-GPU cracking rig pushes that into the hundreds of billions.

**Adaptive, purpose-built hashes** — bcrypt, scrypt, Argon2 — are deliberately slow, and configurable to get slower as hardware improves. bcrypt at a reasonable cost factor computes on the order of **hundreds to a few thousand hashes per second on the same hardware** — often five to seven orders of magnitude slower than MD5, entirely by design, because that design goal is the whole point of the algorithm.

The figures below are illustrative round numbers, not a benchmark of any specific device — real throughput shifts with every hardware generation. The point is the *ratio* between the two rows, which stays roughly consistent: a fast hash and a slow hash are not "somewhat different," they are a hundred-thousand-fold apart.

## Time to exhaust every combination

Assuming a brute-force search of the full keyspace (a real attack usually does better than brute force via dictionaries and mangling rules, so treat this as a worst-case upper bound for the attacker, not a guarantee):

**Lowercase letters + digits (36 characters), fast hash at ~10 billion/sec:**

| Length | Keyspace | Time |
| --- | --- | --- |
| 6 | 36^6 ≈ 2.2 billion | under 1 second |
| 8 | 36^8 ≈ 2.8 trillion | ~5 minutes |
| 10 | 36^10 ≈ 3.7 quadrillion | ~4.3 days |
| 12 | 36^12 ≈ 4.7 quintillion | ~15 years |

**Full mixed set — upper, lower, digits, symbols (95 characters), fast hash at ~10 billion/sec:**

| Length | Keyspace | Time |
| --- | --- | --- |
| 6 | 95^6 ≈ 735 billion | ~73 seconds |
| 8 | 95^8 ≈ 6.6 quadrillion | ~7.7 days |
| 10 | 95^10 ≈ 6 × 10^19 | ~190 years |
| 12 | 95^12 ≈ 5.4 × 10^23 | ~1.7 million years |

**The same full mixed set, bcrypt at ~1,000/sec:**

| Length | Keyspace | Time |
| --- | --- | --- |
| 6 | 735 billion | ~23 years |
| 8 | 6.6 quadrillion | ~210,000 years |
| 10 | 6 × 10^19 | ~1.9 billion years |

Look at the 8-character row across all three tables. The identical password, protected by bcrypt instead of a fast hash, goes from **under eight days** to **two hundred thousand years**. Nothing about the password changed — only the algorithm guarding it did. That single fact is why, from a defender's side, choosing bcrypt/scrypt/Argon2 over MD5/SHA-1/SHA-256 for password storage matters more than almost any policy you could put in front of your users.

## Why this doesn't mean "8 characters is fine"

Two important caveats sit underneath these tables.

**You don't control the hash.** As a person choosing a password, you generally have no idea which algorithm the service behind the login form uses, and no way to find out short of a breach disclosure. The only variable you actually control is your own password's length and randomness — so treating every password as if it might end up facing the fast-hash row is the safer assumption, not the paranoid one.

**Real attacks aren't pure brute force.** The tables above assume an attacker checks every possible string with equal priority. In practice, dictionary attacks with mangling rules (covered in [why forced password complexity rules make passwords weaker](/blog/why-password-complexity-rules-fail)) find human-chosen passwords far faster than brute force would, because people don't choose uniformly at random from the full keyspace — they choose words, names, and predictable substitutions. A 12-character password that's actually `Summer2026!!` is nowhere near as safe as the 95^12 row implies, regardless of hash speed.

## What this means practically

For a password you generate randomly rather than compose yourself — which is what [our password generator](/tools/password-generator) is for — length is the lever that matters most, and it should be set generously precisely because you cannot know which row of the table you're actually in. Twelve to sixteen random characters, or a five-or-six-word random passphrase, keeps you comfortably ahead even under the fast-hash, worst-case assumption. And if you're building the login system rather than using one, the entire conversation above about password length becomes far less urgent the moment you're hashing with bcrypt, scrypt, or Argon2 instead of anything faster — which is the one decision that moves the needle by orders of magnitude rather than by a few extra characters.
