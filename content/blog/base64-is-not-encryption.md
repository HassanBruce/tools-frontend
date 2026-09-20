---
title: Base64 Is Not Encryption
description: Base64 is an encoding, not a cipher. It has no key, protects nothing, and is trivially reversible — here is what it is actually for.
date: 2026-09-16
author: Toolkit
tags: security, encoding
---

Roughly once a year a breach writeup includes the phrase "passwords were stored Base64 encoded". This is the security equivalent of locking your front door by writing the word LOCKED on it.

## Encoding is not encryption

The distinction is simple:

- **Encoding** transforms data into another format so it can survive transport. It is public, reversible by anyone, and has no key.
- **Encryption** transforms data so that only a holder of the key can reverse it.

Base64 has no key. It cannot have one — that is not what it is for. Every Base64 decoder in the world, including the one on this site, will reverse it instantly:

```
cGFzc3dvcmQxMjM=   ->   password123
```

If you can read it, so can anyone who gets your database.

## What Base64 is actually for

Base64 exists because a lot of systems are byte-hostile. Email headers, URLs, JSON strings, XML attributes and HTTP headers all have characters that mean something structural, and raw binary dropped into any of them will break something.

Base64 maps arbitrary bytes onto 64 characters that survive all of those channels unharmed. That is the entire purpose. Legitimate uses include:

- **Embedding binary in text** — images as `data:` URIs, attachments in email
- **Binary in JSON** — JSON has no byte type, so bytes are Base64 strings
- **HTTP Basic Auth** — which is why Basic Auth requires HTTPS to be safe at all
- **JWT parts** — the header and payload are Base64URL, which is exactly why our [JWT decoder](/tools/jwt-decoder) can read them without a key

## The cost

Base64 makes data about 33% larger — every 3 bytes become 4 characters. For an inline icon that is a fine trade. For a multi-megabyte upload it is pure waste, and you should be sending raw bytes.

## What to use instead

**For passwords:** a slow hash designed for the purpose — Argon2id, scrypt, or bcrypt. Not SHA-256 either; general-purpose hashes are too fast, which is precisely what an attacker wants.

**For data you need to read back:** real encryption with a real key — AES-GCM, with the key in a secrets manager rather than next to the data.

**For proving something has not changed:** a hash. Our [hash generator](/tools/hash-generator) does SHA-256 through the browser's Web Crypto API.

Base64 remains genuinely useful — just never as a security measure. If a tool can decode it with no key, so can everybody else.
