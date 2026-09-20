---
title: UUID v7 vs v4 as a Database Primary Key
description: Random v4 UUIDs scatter writes across your index and cause page splits. Version 7 sorts by time and fixes it, without giving up global uniqueness.
date: 2026-09-08
author: Toolkit
tags: databases, uuid, performance
---

If you use random UUIDs as primary keys on a large table, your index is doing significantly more work than it needs to. Version 7 fixes this with a small change to how the bytes are laid out.

## The problem with v4

A version 4 UUID is 122 bits of randomness. That is excellent for uniqueness — you can generate them on any machine with no coordination and never collide in practice.

It is also the worst possible ordering for a B-tree index.

Database indexes store rows in sorted order across fixed-size pages. Insert sequential keys and every new row lands at the end: one page stays hot in memory, it fills, a new one is allocated. Cheap.

Insert random keys and every write lands in a different, arbitrary page. That means:

- **Random I/O instead of sequential.** The page you need is rarely the one already in memory.
- **Page splits.** Inserting into a page that is already full splits it in two, leaving both half-empty.
- **Index bloat.** Half-empty pages mean the index consumes far more space than the data warrants.
- **A cache that cannot help you.** With writes spread across the whole index, no working set fits in the buffer pool.

On a small table none of this matters. At tens of millions of rows it is very noticeable.

## What v7 changes

Version 7 puts a 48-bit big-endian Unix millisecond timestamp in the first six bytes, then fills the rest with randomness.

```
0192f8a4-3d2e-7c91-b4a5-6f8e2d1c9b3a
└──────┬──────┘ │
   timestamp    └ version
```

Because the timestamp is first and big-endian, sorting the identifiers sorts them by creation time. New rows append to the end of the index, exactly like an auto-increment integer — but you keep the properties that made UUIDs attractive:

- Generate them anywhere, with no round trip to the database
- No coordination between services
- No sequence to leak your row count to users

You can generate both versions with our [UUID generator](/tools/uuid-generator) and compare the shapes directly.

## The trade-offs

**A v7 UUID leaks its creation time.** Anyone holding one can read the millisecond it was generated. Usually harmless, occasionally not — if the identifier is exposed publicly and creation time is sensitive, that matters.

**Ordering is only as good as the clock.** Identifiers generated on different machines interleave according to those machines' clocks. Fine for index locality, not a substitute for a real ordering column.

**Not every database has native support.** Postgres added `uuidv7()` in version 18; before that you generate it in the application or with a small SQL function. Either works — the format is just bytes.

## Practical guidance

Use **v7** for anything that becomes a primary key or is written in volume.

Use **v4** when the value is a public token, a session identifier, or anything where an embedded timestamp would tell someone something you would rather they did not know.

And if you are on an existing table with billions of v4 keys, migrating is rarely worth it on its own. Apply v7 to new tables and move on.
