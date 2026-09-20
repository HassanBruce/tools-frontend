---
title: Can Two UUIDs Ever Collide? The Actual Math
description: UUIDs are said to be unique enough to ignore the possibility of a collision entirely. Here is the birthday-paradox math behind that claim, worked out in full.
date: 2026-09-16
author: Toolkit
tags: uuid, security, databases
---

"UUIDs are unique" is one of those statements that is true in the way "the ocean is deep" is true — accurate, but not actually a number. UUIDs are not guaranteed unique in the mathematical sense; they are **probabilistically** unique, and it is worth knowing exactly how strong that probability is, because it is easy to either wildly overtrust it or wildly distrust it without doing the arithmetic.

## Where the risk comes from

A version 4 UUID is 128 bits total, but not all of them are random. Six bits are fixed by the specification to mark the version and variant, leaving **122 bits of actual randomness**. Every UUID you generate is one draw from a space of 2^122 possible values — a number with 37 digits.

The intuitive mistake is reasoning "there are 2^122 possibilities, so I'd need to generate about 2^122 of them before worrying." That is wrong, and it is wrong for the same reason the classic birthday paradox is surprising: the question is not "will *this specific* UUID collide with a specific other one," it is "will *any two* UUIDs out of everything I've generated collide with *each other*" — and the number of possible pairs grows much faster than the number of items.

## The birthday approximation

For `n` random draws from a space of size `N`, the probability of at least one collision is approximately:

```
p ≈ 1 − e^(−n² / 2N)
```

Rearranged to solve for how many draws `n` you need to reach a target probability `p`:

```
n ≈ √(2N · ln(1 / (1 − p)))
```

Plugging in `N = 2^122 ≈ 5.3 × 10^36` and a 50% collision probability (`p = 0.5`, so `ln(1/(1-p)) = ln(2) ≈ 0.693`):

```
n ≈ √(2 × 5.3×10^36 × 0.693) ≈ √(7.35 × 10^36) ≈ 2.7 × 10^18
```

**About 2.7 quintillion UUIDs** need to be generated before there is a coin-flip's chance that any two of them match. Generating one billion UUIDs every single second, non-stop, that would take roughly **86 years** to reach.

If a 50/50 chance still sounds too comfortable to rely on, tighten the target to a one-in-a-billion chance (`p = 10^-9`) instead:

```
n ≈ √(2 × 5.3×10^36 × 10^-9) ≈ 1.03 × 10^14
```

That is about **103 trillion** UUIDs before the odds of any collision reach one in a billion — still a number no realistic system approaches. A busy service generating a million UUIDs a second would need over three years just to produce that many total values, let alone collide.

## Putting 2^122 in perspective

Abstract exponents are hard to feel, so it helps to anchor the number against something physical. A commonly cited estimate puts the number of grains of sand on every beach and desert on Earth at somewhere around 7.5 × 10^18 — roughly 7.5 quintillion. The 2.7 × 10^18 UUIDs needed for a 50% collision chance is in the same ballpark as that entire figure. You would need to individually label something on the order of every grain of sand on the planet before the birthday paradox gives you even odds of two labels matching — and that's the 50% threshold, not a guarantee, and still assumes perfect, uniformly random generation the whole way through.

## What actually causes real-world UUID collisions

Collisions that show up in practice are almost never "the math ran out." They come from something breaking the *randomness* assumption the whole calculation depends on:

**A weak or misused random source.** The math above assumes every bit is drawn from a cryptographically secure generator. `Math.random()` is not one — it has a much smaller internal state and is not designed to resist prediction. Our own [UUID generator](/tools/uuid-generator) uses `crypto.getRandomValues()` specifically because the birthday math only holds if the underlying randomness is actually uniform and unpredictable.

**Cloned virtual machines or containers.** If a VM image is cloned after seeding its random number generator but before that state has diverged, two instances can produce identical "random" sequences — a well-documented class of bug, and one no amount of UUID bit-length protects against, because the randomness itself was never independent in the first place.

**Copy-pasted placeholder values.** A UUID hardcoded into example code, a test fixture, or a tutorial, and then copy-pasted into real data by someone who didn't realize it needed to be regenerated. This produces exact, repeated duplicates with a probability of essentially 100% — nothing to do with the birthday paradox at all, since it isn't random collision, it's the same value used on purpose by two different people who didn't know better.

**Non-cryptographic implementations.** Some older or non-standard UUID libraries have shipped with implementation bugs that reduced the effective entropy, or leaked machine identifiers (version 1 UUIDs use a MAC address and timestamp rather than randomness, and were deprecated for exactly this predictability).

## Where version 7 changes the picture slightly

UUID v7, which encodes a 48-bit timestamp in the leading bits and leaves the remainder random, has less randomness *within a single millisecond* than v4 — roughly 74 random bits per timestamp value rather than 122 across the whole identifier. For nearly every application this is still an astronomically large space per millisecond. It only becomes a real consideration if a single service is generating tens of thousands of identifiers within the same millisecond tick, in which case a monotonic v7 implementation — one that increments the random portion sequentially within a millisecond rather than redrawing it — removes the concern entirely, and most modern v7 libraries do exactly that.

## The practical conclusion

For anything a normal application does — user IDs, order numbers, session tokens, request IDs — the probability of a genuine random collision is close enough to zero that it is not worth engineering around. The number that is worth remembering is not "2^122," which is abstract, but "86 years at a billion a second for a 50/50 chance," which makes the actual scale of the guarantee tangible. If a collision does show up in a real system, the productive question is not "did the math fail" — it's "what broke the randomness," because that is almost always the actual answer.
