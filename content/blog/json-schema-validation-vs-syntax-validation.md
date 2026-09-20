---
title: "Your JSON Is Valid and Still Wrong: Syntax vs Schema Validation"
description: A JSON document can parse perfectly and still have the wrong shape entirely. Here is the difference between syntax validation and schema validation, and when you need both.
date: 2026-09-11
author: Toolkit
tags: json, validation, apis
---

"Valid JSON" is a phrase that quietly does two different jobs, and conflating them is why a document can pass every check you ran and still break the code that consumes it.

## Two separate questions

**Is this well-formed?** Are the braces balanced, are the keys quoted, is there a stray trailing comma. This is a purely structural question — it asks whether a parser can turn the text into a data structure at all. It has nothing to do with what that data structure should contain.

**Does this match what I expect?** Is `age` a number, is `email` present, is `role` one of the three values my code actually handles. This is a semantic question, and syntax validation has no opinion on it whatsoever.

A [JSON formatter and validator](/tools/json-formatter) answers the first question. It will tell you, correctly, that this is perfectly valid JSON:

```json
{ "age": "twenty-five", "role": "superadmin" }
```

Every brace matches, every key is quoted, every value is a legal JSON string. And it is very likely still wrong — `age` should probably be a number, and `superadmin` might not be a role your system recognizes at all. No syntax checker will ever catch that, because from a syntax standpoint there is nothing to catch. The document is exactly as well-formed as one with the values you actually wanted.

## What schema validation adds

JSON Schema is a specification for describing the *shape* a document should have — not a new file format, just a JSON document that describes constraints on other JSON documents. A minimal schema for a user record might look like:

```json
{
  "type": "object",
  "properties": {
    "email": { "type": "string", "format": "email" },
    "age": { "type": "integer", "minimum": 0 },
    "role": { "type": "string", "enum": ["viewer", "editor", "admin"] }
  },
  "required": ["email", "role"],
  "additionalProperties": false
}
```

Run the earlier example against this schema and it fails on two separate grounds: `age` is a string where an integer was required, and `"superadmin"` is not one of the three permitted values in `role`'s `enum`. Neither failure is a syntax problem — the document parses fine — they are both violations of a contract the syntax layer never knew existed.

The keywords worth knowing, because they cover the large majority of real-world schemas:

- **`type`** — string, number, integer, boolean, object, array, or null
- **`required`** — which object properties must be present
- **`properties`** — the expected shape of each key, recursively
- **`enum`** — a fixed set of allowed values
- **`pattern`** — a regular expression a string must match
- **`additionalProperties: false`** — reject any key not explicitly declared, which catches typos like `"emial"` that would otherwise pass through silently
- **`oneOf` / `anyOf` / `allOf`** — combine multiple sub-schemas, useful for "this field is either a string or an object with this shape"
- **`$ref`** — reference another schema by pointer, so a `User` schema can be reused inside an `Order` schema instead of duplicated

## Where this distinction actually matters

**API contracts.** If your API accepts JSON request bodies, syntax validation alone lets through any well-formed garbage — a request missing a required field, or sending a string where you expect a number, sails straight past `JSON.parse()` and lands in your business logic with the wrong shape. Schema validation at the boundary catches this before it reaches code that assumes the shape is correct.

**Config files.** A YAML or JSON config with a typo'd key — `"tiemout"` instead of `"timeout"` — is syntactically flawless and will be silently ignored by code that reads `config.timeout` and gets `undefined`. A schema with `additionalProperties: false` turns that into an immediate, specific error instead of a mysterious default value in production.

**OpenAPI and JSON:API.** Both specifications lean on JSON Schema directly to describe request and response bodies, which is why understanding the syntax/schema distinction is a prerequisite for working with either — an OpenAPI spec is, among other things, a large collection of schemas.

**Generated types.** Tools like `quicktype` or `openapi-typescript` read a schema and generate matching TypeScript types, which only works because the schema describes structure precisely enough to derive a type from. Syntax validation carries none of that information.

## Tools for each layer

For syntax, you want something fast and forgiving of iteration — paste, see the error, fix it, repeat. That is exactly the loop the [JSON formatter](/tools/json-formatter) is built around, with the exact line and column of any structural problem.

For schema, you want a validator library that implements the JSON Schema specification against your document: **Ajv** is the standard choice in JavaScript and is what most frameworks use under the hood; Python has `jsonschema`; most languages have an equivalent. These libraries take a schema and a document and return a list of violations, not just true/false.

## What a schema validator actually returns

A syntax parser gives you a binary answer — it parsed, or it threw at a specific line and column. A schema validator gives you something more useful for anything beyond a single mistake: a **list** of every violation found, each tied to a JSON Pointer path into the document. Running the earlier example through Ajv produces something close to:

```json
[
  { "instancePath": "/age", "message": "must be integer" },
  { "instancePath": "/role", "message": "must be equal to one of the allowed values" }
]
```

That path-plus-message structure is what lets a form show "age must be a number" next to the actual field, rather than a single generic error for the whole submission — and it's the reason schema validation is usually run once per request rather than stopping at the first failure the way a syntax parser does.

## Which JSON Schema version

JSON Schema has gone through several drafts — draft-07 is still the most widely supported across validator libraries, while 2020-12 is the current specification and adds features like `unevaluatedProperties` for more precise control over `allOf` combinations. If a library or framework mentions a `$schema` field at the top of an example, that's declaring which draft the document targets; mismatching a schema written for one draft against a validator that only understands another is a real, if uncommon, source of "why does this valid-looking schema not work" confusion.

## The order that saves the most time

Validate syntax first, always. A document with a trailing comma or an unquoted key will fail schema validation too, but the error message from a schema validator for a document that never successfully parsed is far less useful than "unexpected token at line 12, column 4." Clear the syntax errors, confirm the document actually parses, and only then look at whether the shape is right. Debugging both classes of error at once is where "valid JSON" stops meaning what people think it means.
