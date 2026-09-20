---
title: JSON vs JavaScript Objects: Where the Differences Actually Bite
description: JSON looks like a JavaScript object literal, so people assume they behave identically. Undefined, dates, key order and duplicate keys all say otherwise.
date: 2026-09-18
author: Toolkit
tags: json, javascript, developer-tools
---

JSON was lifted almost directly from JavaScript's object literal syntax, which is exactly why it feels like the two should be interchangeable. Type `JSON.stringify(obj)` and you get something that looks identical to the object you wrote in your source file. The trouble starts the moment your object contains anything JSON was never designed to represent, because `JSON.stringify` does not error in those cases — it silently changes your data.

## JSON is stricter syntax, and that part is well known

The surface-level differences are the ones every JSON error message is about: JSON requires double-quoted keys and string values, forbids trailing commas, and has no comment syntax at all. A JS object literal tolerates all three. That gap is exactly what a [JSON formatter and validator](/tools/json-formatter) is built to catch, and it is the part most people already know to look out for.

The differences that actually cause production bugs live one level deeper — in what happens when you convert a real, live JavaScript object into JSON and back.

## What `JSON.stringify` throws away

`JSON.stringify` does not fail loudly on unsupported values. It just omits them, or replaces them with something else:

```js
JSON.stringify({ a: undefined, b: function () {}, c: Symbol("x"), d: 1 });
// '{"d":1}'
```

`undefined`, functions and Symbols vanish from object properties entirely — the key disappears, not just the value. Inside an **array**, the same values behave differently and become `null` instead of disappearing, because an array's length is meaningful and JSON has no gap in a list:

```js
JSON.stringify([undefined, function () {}, 1]);
// '[null,null,1]'
```

That asymmetry is the bug people actually hit: a function accidentally left on an object silently drops a field, but the same function inside an array silently corrupts a value into `null`. Neither raises an error, so the bug surfaces downstream — usually as a confusing `null` in a database or an API consumer wondering where a field went.

**`NaN` and `Infinity`** follow the array rule everywhere: JSON has no numeric type for either, so both become `null`.

**Circular references** are the one case that does throw, and with a message that is at least unambiguous:

```
TypeError: Converting circular structure to JSON
```

If you are building an object graph with back-references — a child pointing at its parent, for instance — you will hit this the first time you try to serialize it, not before.

## Dates are not a JSON type either

There is no date literal in JSON — dates are just strings, and it is easy to forget that `JSON.stringify` is doing you a favor:

```js
JSON.stringify({ createdAt: new Date() });
// '{"createdAt":"2026-09-18T09:00:00.000Z"}'
```

This works because `Date.prototype` defines a `toJSON()` method that returns an ISO 8601 string, and `JSON.stringify` calls it automatically for any object that has one. The reverse direction has no such convenience: `JSON.parse` has no idea that a particular string was once a `Date`, so it comes back as a plain string every time.

```js
const parsed = JSON.parse(json);
parsed.createdAt instanceof Date; // false — it's a string
```

Getting a real `Date` back requires a **reviver function**, the optional second argument to `JSON.parse` that runs on every key-value pair as the tree is built:

```js
JSON.parse(json, (key, value) => {
  if (key === "createdAt") return new Date(value);
  return value;
});
```

Most projects reach for a library instead of hand-rolling this for every date-shaped key, but it is worth knowing the mechanism exists, because the alternative — assuming your dates "just work" through a round trip — is how a `string` ends up where a `Date` was expected three layers deeper in your code.

## Key order is not always the order you wrote

JavaScript objects preserve insertion order — with one long-standing exception that trips people up constantly. Keys that look like non-negative integers are always enumerated first, in **ascending numeric order**, regardless of where they appeared in the source:

```js
JSON.stringify({ b: 1, 2: "two", a: 3, 1: "one" });
// '{"1":"one","2":"two","b":1,"a":3}'
```

The integer-like keys `1` and `2` jump to the front and get sorted numerically, while `b` and `a` keep their original relative order after them. This is standard JavaScript object behavior, not a JSON quirk, but because `JSON.stringify` walks the object in that same enumeration order, it shows up as JSON output whose key order does not match what you typed. If code somewhere is relying on key order — it should not be, but plenty of hand-rolled diffing or hashing code does — this is where it quietly breaks on any object with numeric-looking keys.

## Duplicate keys: last one wins, but that is convention, not spec

Both a JS object literal and every mainstream JSON parser resolve a duplicate key by keeping the last occurrence:

```json
{ "role": "admin", "role": "viewer" }
```

parses to `{ "role": "viewer" }` everywhere you are likely to test it. What is easy to miss is that the JSON specification (RFC 8259) explicitly says behavior here is **unspecified** — object names "should" be unique, but the spec places no requirement on what a parser does when they are not. In practice "last wins" is universal because it matches how `JSON.parse` builds a JS object, but a config-merging tool, a strict validator, or a parser in another language is not contractually obligated to agree with you. If duplicate keys can occur in your data — hand-edited config, or JSON assembled by string concatenation rather than a serializer — treat it as a bug to fix at the source, not a behavior to depend on.

## The practical takeaway

None of this shows up as a parse error, which is exactly why it is worth knowing about separately from syntax mistakes. A document can be perfectly valid JSON and still have lost information on the way in, or come back out as a shape your code was not written to expect.

The syntax layer is still worth checking first — run anything suspicious through the [JSON formatter](/tools/json-formatter) to rule out a stray trailing comma before chasing a semantic issue that turns out not to exist. But once a document parses cleanly, the questions above — did an `undefined` silently vanish, did a `Date` come back as a string, are the keys in the order you expect — are where the real bugs tend to hide.
