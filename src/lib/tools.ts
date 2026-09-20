/**
 * The tool registry.
 *
 * Every page, the homepage grid, the category listings, the search box and the
 * "related tools" rail are all generated from this one array — adding a tool
 * here makes it appear everywhere.
 *
 * `content` holds the marketing/SEO copy for each tool. It is intentionally
 * starter copy: edit it in place, no component changes required.
 */

export type ToolCategory = "developer" | "seo" | "bulk";

export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolSection {
  heading: string;
  /**
   * Markdown. Supports headings, lists, tables, links and fenced code — write
   * as much as the page needs. Rendered at build time, so there is no runtime
   * cost to long content.
   */
  body: string;
}

export interface ToolContent {
  /** Paragraph rendered under the tool. */
  intro: string;
  /** "How to use" list. */
  steps: string[];
  /**
   * Optional long-form sections, rendered between "How to use" and the FAQ.
   * This is where page depth comes from — add as many as you like per tool.
   */
  sections?: ToolSection[];
  /** Rendered as an FAQ section. */
  faq: ToolFaq[];
}

export interface Tool {
  slug: string;
  name: string;
  category: ToolCategory;
  /** One line, used on cards. */
  tagline: string;
  /** Meta description — aim for 140-160 characters. */
  description: string;
  keywords: string[];
  content: ToolContent;
}

export const CATEGORIES: Record<
  ToolCategory,
  { label: string; blurb: string; icon: string }
> = {
  developer: {
    label: "Developer tools",
    blurb:
      "Formatters, converters, encoders and generators. Everything runs in your browser — nothing is uploaded.",
    icon: "{ }",
  },
  seo: {
    label: "SEO & content tools",
    blurb:
      "Write better metadata, audit your copy and build tagged links, without leaving the page.",
    icon: "↗",
  },
  bulk: {
    label: "Bulk & image tools",
    blurb:
      "Batch-process files locally. Drop in twenty images and download the results as a zip.",
    icon: "▦",
  },
};

export const TOOLS: Tool[] = [
  // ---------------------------------------------------------------- developer
  {
    slug: "json-formatter",
    name: "JSON Formatter & Validator",
    category: "developer",
    tagline: "Pretty-print, minify and validate JSON with precise error positions.",
    description:
      "Format, validate and minify JSON in your browser. Get the exact line and column of any syntax error, then copy or download the cleaned-up result.",
    keywords: ["json formatter", "json validator", "json beautifier", "json pretty print"],
    content: {
      intro:
        "Paste raw JSON to reformat it with consistent indentation, or minify it down to a single line. If the document will not parse, the exact line and column of the problem is reported instead of a generic failure.",
      steps: [
        "Paste or type your JSON into the input pane.",
        "Choose an indent width, or switch to Minify to strip all whitespace.",
        "Copy the formatted output or download it as a .json file.",
      ],
      // ---------------------------------------------------------------------
      // EXAMPLE of the optional `sections` field. Markdown, rendered at build
      // time. Copy this shape onto any other tool to give it real depth.
      // ---------------------------------------------------------------------
      sections: [
        {
          heading: "The four errors that cause almost every failure",
          body: `Invalid JSON is nearly always one of a handful of mistakes. JSON is a much stricter format than the JavaScript object literals it resembles, and that gap is where people get caught.

**Trailing commas.** Perfectly legal in modern JavaScript, illegal in JSON:

\`\`\`json
{ "name": "Ada", "role": "engineer", }
\`\`\`

**Single quotes.** JSON requires double quotes on both keys and string values. \`{'name': 'Ada'}\` is a valid JavaScript object and invalid JSON.

**Unquoted keys.** \`{name: "Ada"}\` parses fine in a browser console but fails here — every key must be a quoted string.

**Comments.** JSON has no comment syntax at all. If your config file contains \`//\` or \`/* */\`, it is JSONC or JSON5, not JSON, and needs a parser that understands those.`,
        },
        {
          heading: "Why the error says line and column",
          body: `Browsers report JSON errors as a character offset — "position 1847" — which is useless when you are looking at a 400-line file.

This tool converts that offset into a line and column, and where the browser reports no offset at all it locates the surrounding snippet and names the line instead. Either way you get somewhere to look rather than a number to count to.`,
        },
      ],
      faq: [
        {
          q: "Why does my JSON fail to validate?",
          a: "The most common causes are trailing commas, single quotes instead of double quotes, and unquoted object keys. All three are valid JavaScript but invalid JSON. The error message points at the offending line and column.",
        },
        {
          q: "Can it handle very large files?",
          a: "Yes, within your browser's memory. Documents of a few megabytes format instantly; extremely large files may take a moment since parsing happens on the main thread.",
        },
        {
          q: "Is my JSON sent to a server?",
          a: "No. Parsing and formatting happen in your browser via JSON.parse, so even production payloads containing customer records or API keys stay on your machine.",
        },
      ],
    },
  },
  {
    slug: "json-csv-converter",
    name: "JSON to CSV Converter",
    category: "developer",
    tagline: "Convert JSON arrays to CSV and back, with nested keys flattened.",
    description:
      "Convert a JSON array to CSV or a CSV table back to JSON. Nested objects are flattened to dotted column names, and quoting is handled correctly.",
    keywords: ["json to csv", "csv to json", "json csv converter", "convert json spreadsheet"],
    content: {
      intro:
        "Turn an array of JSON objects into a spreadsheet-ready CSV, or parse a CSV table back into JSON. Nested objects are flattened into dotted column names so no data is silently dropped.",
      steps: [
        "Pick a direction — JSON to CSV, or CSV to JSON.",
        "Paste your data into the input pane.",
        "Copy the result or download it as a .csv or .json file.",
      ],
      sections: [
        {
          heading: "How nested data survives the trip to a flat table",
          body: `CSV has no concept of nesting. A spreadsheet is a grid; JSON is a tree. Something has to give, and most converters give up quietly by dropping anything below the top level.

This one flattens instead. Nested keys become dotted column names:

    { "user": { "name": "Ada", "role": { "title": "Engineer" } } }

becomes columns \`user.name\` and \`user.role.title\`. Arrays of simple values are joined with a pipe, so \`["a","b"]\` becomes \`a | b\` in a single cell. Arrays of objects get indexed — \`items[0].sku\`, \`items[1].sku\`.

The result is that nothing disappears silently. A deeply nested document produces a wide table rather than a lossy one, and you can see exactly what you have.`,
        },
        {
          heading: "Quoting, commas and the Excel problem",
          body: `Any value containing a comma, a double quote or a newline is wrapped in double quotes, and inner quotes are escaped by doubling them. That is RFC 4180, and it is what every spreadsheet expects:

    Smith, John  ->  "Smith, John"
    He said "hi" ->  "He said ""hi"""

**If Excel mangles your file,** the usual culprit is the delimiter rather than the quoting. Excel follows your system's regional settings, so on many European installations it expects semicolons and will dump a comma-separated file into a single column. Switch the delimiter above and it opens correctly.

**Leading zeros and long numbers** are a separate trap. Excel will helpfully turn \`007\` into \`7\` and a long order number into scientific notation. That is Excel's import behaviour, not something the CSV can prevent — use the import wizard and mark those columns as text.`,
        },
      ],
      faq: [
        {
          q: "How are nested objects handled?",
          a: 'Nested keys are flattened with dots, so {"user":{"name":"Ada"}} becomes a column named user.name. Arrays of primitives are joined with a pipe character.',
        },
        {
          q: "What about commas and quotes inside values?",
          a: "Any value containing a comma, double quote or newline is wrapped in double quotes, and inner quotes are escaped by doubling them, per RFC 4180.",
        },
        {
          q: "Is it safe to convert a customer export here?",
          a: "Yes. The conversion runs in your browser, so a CSV of email addresses or order records is never transmitted. You can disconnect from the network and it will still work.",
        },
      ],
    },
  },
  {
    slug: "yaml-json-converter",
    name: "YAML to JSON Converter",
    category: "developer",
    tagline: "Convert between YAML and JSON in either direction.",
    description:
      "Convert YAML to JSON or JSON to YAML instantly in your browser. Useful for Kubernetes manifests, CI pipelines, OpenAPI specs and config files.",
    keywords: ["yaml to json", "json to yaml", "yaml converter", "yaml parser"],
    content: {
      intro:
        "Convert configuration between YAML and JSON in either direction. Handy when a tool expects one format but your config lives in the other — Kubernetes manifests, GitHub Actions workflows and OpenAPI specs being the usual suspects.",
      steps: [
        "Choose YAML to JSON or JSON to YAML.",
        "Paste your document into the input pane.",
        "Copy the converted output or download it.",
      ],
      sections: [
        {
          heading: "The YAML features JSON cannot represent",
          body: `Converting YAML to JSON is lossy in ways that are easy to miss until something breaks.

**Comments vanish.** JSON has no comment syntax, so every \`#\` line is gone and cannot come back. If your config is documented in comments, keep the YAML as the source of truth.

**Anchors and aliases are expanded.** YAML lets you define a block once and reuse it with \`&defaults\` and \`*defaults\`. JSON has no references, so the block is duplicated at every use. The data is identical; the file is larger and the link between them is lost.

**Multiple documents become an array.** A file with \`---\` separators holds several documents. Since JSON has no equivalent, they are converted to a JSON array — one element per document.

**Dates may become strings.** YAML has a native timestamp type, JSON does not. Anything that looks like a date comes out quoted.`,
        },
        {
          heading: "Why your indentation is being rejected",
          body: `Almost every YAML parse error is whitespace, and the message rarely says so directly.

**Tabs are illegal.** YAML forbids tab characters for indentation, full stop. An editor set to insert tabs will produce files that fail with confusing errors about unexpected tokens. Set your editor to spaces for \`.yml\` and \`.yaml\`.

**Indentation must be consistent within a block.** YAML does not care whether you use two spaces or four, but it cares a great deal that you do not switch mid-block.

**A missing space after the colon breaks it.** \`key:value\` is a single scalar string. \`key: value\` is a mapping. The space is required.

**Unquoted strings can change type.** The classic case is \`no\`, \`off\` and \`yes\`, which older YAML versions read as booleans — the reason Norway's country code \`NO\` became \`false\` in enough config files to earn a nickname. Quote anything that could be misread.`,
        },
      ],
      faq: [
        {
          q: "Which YAML version is supported?",
          a: "YAML 1.2 core schema, including anchors, aliases, multi-line block scalars and multiple documents separated by ---.",
        },
        {
          q: "Why did my YAML comments disappear?",
          a: "JSON has no comment syntax, so comments cannot survive the round trip. Converting back to YAML produces a clean document without the original comments.",
        },
        {
          q: "Can I paste a config containing secrets?",
          a: "The conversion is local, so nothing is transmitted. That said, a Kubernetes manifest or CI config often holds real credentials — treat the browser tab the way you would treat the file itself.",
        },
      ],
    },
  },
  {
    slug: "xml-formatter",
    name: "XML Formatter",
    category: "developer",
    tagline: "Indent and tidy XML, or collapse it to one line.",
    description:
      "Format and validate XML in your browser. Indent nested elements for readability, or minify a document down to a single line for transport.",
    keywords: ["xml formatter", "xml beautifier", "xml validator", "format xml online"],
    content: {
      intro:
        "Re-indent XML so its structure is readable, or strip it back to a single line. Malformed markup is reported with the parser's own message rather than being silently mangled.",
      steps: [
        "Paste your XML — a document, an RSS feed or a SOAP envelope.",
        "Pick an indent width, or choose Minify.",
        "Copy or download the tidied result.",
      ],
      sections: [
        {
          heading: "Well-formed is not the same as valid",
          body: `These two words get used interchangeably and mean quite different things.

**Well-formed** means the document follows XML's syntax rules: one root element, every tag closed, tags properly nested, attributes quoted, special characters escaped. This is a purely structural question and it is what this tool checks.

**Valid** means the document also matches a schema — a DTD, XSD or RelaxNG — which defines which elements are allowed, in what order, with which attributes and data types.

A document can easily be well-formed and completely wrong for its purpose. \`<invoice><banana/></invoice>\` is perfect XML and meaningless as an invoice. Checking against a schema needs the schema, which is why validators that do it ask you to upload one.`,
        },
        {
          heading: "What gets preserved when reformatting",
          body: `A formatter that silently rewrites your document is worse than no formatter. This one is deliberately conservative.

**Preserved exactly:** CDATA sections, comments, processing instructions, the XML declaration, attribute quoting style, and entity references. Only whitespace between elements changes.

**CDATA matters most.** A \`<![CDATA[...]]>\` block exists precisely to hold content that would otherwise need escaping — embedded HTML, scripts, raw text with angle brackets. Reformatting its contents would change its meaning, so it is passed through untouched.

**Whitespace inside elements is significant in some formats.** Mixed content — text and elements in the same parent, as in XHTML — can change meaning when re-indented. If your document is document-oriented rather than data-oriented, check the result before committing it.`,
        },
      ],
      faq: [
        {
          q: "Does it validate against a schema?",
          a: "No. It checks that the document is well-formed — tags balanced and properly nested — but does not validate against a DTD or XSD.",
        },
        {
          q: "Will it preserve CDATA sections and comments?",
          a: "Yes. CDATA blocks, comments and processing instructions are kept intact and re-indented along with the rest of the document.",
        },
        {
          q: "Where is my XML processed?",
          a: "Entirely in your browser. SOAP envelopes and API responses often contain customer data, so nothing is uploaded and no copy is retained after you close the tab.",
        },
      ],
    },
  },
  {
    slug: "base64-encoder",
    name: "Base64 Encoder & Decoder",
    category: "developer",
    tagline: "Encode text to Base64 or decode it back, with full Unicode support.",
    description:
      "Encode text to Base64 and decode Base64 back to text, with correct UTF-8 handling for emoji and non-Latin scripts. Supports URL-safe Base64.",
    keywords: ["base64 encode", "base64 decode", "base64 converter", "base64 url safe"],
    content: {
      intro:
        "Convert text to Base64 and back. Unicode is handled properly, so emoji and non-Latin scripts survive the round trip instead of turning into question marks. A URL-safe variant is available for tokens and query strings.",
      steps: [
        "Choose Encode or Decode.",
        "Paste your text or Base64 string.",
        "Toggle URL-safe if you need the -/_ alphabet without padding.",
      ],
      sections: [
        {
          heading: "Why other tools break your emoji",
          body: `The browser's built-in \`btoa()\` function only accepts characters in the range 0–255. Hand it an emoji, a Cyrillic character or a German umlaut and it throws an \`InvalidCharacterError\`. Many quick online encoders wrap \`btoa()\` directly, which is why they fail or silently corrupt non-English text.

The fix is to convert to UTF-8 bytes first:

    const bytes = new TextEncoder().encode(text);

Now every character — regardless of script — is a sequence of bytes in the 0–255 range, which \`btoa()\` can handle. Decoding reverses it with \`TextDecoder\`.

This tool does that, so Grüße, привет and 👋 all survive the round trip intact.`,
        },
        {
          heading: "Standard vs URL-safe, and the padding question",
          body: `Standard Base64 uses \`+\` and \`/\` as its last two characters. Both are meaningful inside a URL — \`+\` historically means a space in query strings, and \`/\` is a path separator — so a Base64 string dropped into a URL can be mangled.

URL-safe Base64 swaps them for \`-\` and \`_\`, and usually drops the \`=\` padding. This is the variant JWTs use, which is why a token contains no plus signs or slashes.

**Padding is optional to decode.** The \`=\` characters pad the output to a multiple of four so a decoder knows where the data ends. A correct decoder can work it out from the length alone, which is why this tool restores missing padding automatically when you paste an unpadded string.

**The 33% overhead is inherent.** Base64 represents 3 bytes as 4 characters. That is the price of surviving text-only channels, and no variant avoids it.`,
        },
      ],
      faq: [
        {
          q: "What is URL-safe Base64?",
          a: "It replaces + with - and / with _, and usually drops the = padding, so the result can sit in a URL or filename without escaping. JWTs use this variant.",
        },
        {
          q: "Why do other tools break my emoji?",
          a: "Naive implementations call btoa() directly, which only accepts Latin-1. This tool encodes to UTF-8 bytes first, so any character round-trips correctly.",
        },
        {
          q: "Does my text leave the browser?",
          a: "No. Encoding uses the browser's built-in btoa and TextEncoder, with no network request at all. The page works offline once loaded.",
        },
      ],
    },
  },
  {
    slug: "url-encoder",
    name: "URL Encoder & Decoder",
    category: "developer",
    tagline: "Percent-encode and decode URLs, full strings or single components.",
    description:
      "Percent-encode or decode URLs in your browser. Switch between full-URL and single-component encoding, and inspect query parameters as a table.",
    keywords: ["url encode", "url decode", "percent encoding", "uri encoder"],
    content: {
      intro:
        "Percent-encode text for safe use in a URL, or decode an encoded URL back to readable form. Component mode escapes reserved characters like & and = so a value can be dropped into a query string safely.",
      steps: [
        "Choose Encode or Decode.",
        "Pick Component to escape reserved characters, or Full URL to leave the structure intact.",
        "Paste your input and copy the result.",
      ],
      sections: [
        {
          heading: "Component or full URL — picking the wrong one silently breaks things",
          body: `This is the distinction that causes most percent-encoding bugs.

**Full URL** mode leaves the characters that give a URL its structure alone — \`: / ? # & =\` — and escapes only genuinely unsafe ones like spaces. Use it when you have a complete address that is already correct and just needs tidying.

**Component** mode escapes those structural characters too. Use it for a single value you are about to embed in a query string.

The failure looks like this. A redirect URL passed as a parameter:

    ?next=https://example.com/a?b=c

The second \`?\` and the \`&\` that follow are read as part of the *outer* URL, so your parameter is truncated and extra parameters appear from nowhere. Encoding the value as a component first turns it into one opaque blob and the problem disappears.

The rule of thumb: encoding a whole URL, use Full. Encoding something that goes *inside* a URL, use Component.`,
        },
        {
          heading: "Plus signs, spaces, and double encoding",
          body: `**A space has two encodings.** Percent-encoding says \`%20\`. HTML form submissions use \`+\`, a convention from the \`application/x-www-form-urlencoded\` content type. Both appear in the wild; \`%20\` is valid everywhere, which is what this tool produces.

**Double encoding** is the other common bug. Encode \`%20\` again and you get \`%2520\`, because the \`%\` itself gets escaped. The symptom is literal \`%2520\` strings appearing in logs or on a page. It usually means a value is being encoded by both your code and a framework that was already handling it.

If you see \`%25\` where you expect \`%\`, decode twice and work out which layer to remove.`,
        },
      ],
      faq: [
        {
          q: "What is the difference between the two modes?",
          a: "Full URL keeps characters like : / ? & = intact so a whole address stays valid. Component escapes them too, which is what you want when embedding a value inside a query parameter.",
        },
        {
          q: "Why does a space become %20 and sometimes +?",
          a: "Percent-encoding uses %20. The + convention comes from HTML form submissions. This tool produces %20, which is valid everywhere.",
        },
        {
          q: "Are the URLs I paste logged?",
          a: "There is nothing to log them with. Encoding and decoding use the browser's own encodeURIComponent, so URLs containing session tokens or query parameters are never sent anywhere.",
        },
      ],
    },
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    category: "developer",
    tagline: "Inspect a JSON Web Token's header, payload and expiry.",
    description:
      "Decode a JSON Web Token to inspect its header and payload, with timestamp claims rendered as readable dates and expiry checked against now.",
    keywords: ["jwt decoder", "decode jwt", "json web token", "jwt parser"],
    content: {
      intro:
        "Paste a JWT to read its header and payload. Timestamp claims like iat, exp and nbf are rendered as human dates, and an expired token is flagged immediately so you are not left guessing why a request returned 401.",
      steps: [
        "Paste the full token, including both dots.",
        "Read the decoded header and payload.",
        "Check the expiry badge to see whether the token is still valid.",
      ],
      sections: [
        {
          heading: "What the three parts actually contain",
          body: `A JWT is three Base64URL segments separated by dots: \`header.payload.signature\`.

**Header** names the signing algorithm and token type — typically \`{"alg":"HS256","typ":"JWT"}\`.

**Payload** holds the claims. Registered ones have defined meanings: \`iss\` (issuer), \`sub\` (subject, usually the user id), \`aud\` (audience), \`exp\` (expiry), \`nbf\` (not before), \`iat\` (issued at), \`jti\` (unique token id). Everything else is application-specific.

**Signature** is computed over the first two parts using a secret or private key. It proves the token has not been altered.

The critical point: **the header and payload are encoded, not encrypted.** Base64URL is trivially reversible — that is why this page can read your token without any key. Never put anything in a JWT payload that the holder should not see.`,
        },
        {
          heading: "Why decoding is not verification",
          body: `This tool deliberately stops at decoding. Verifying a signature would mean sending your secret or public key somewhere, which is exactly the thing you should never do.

That distinction matters in your own code too, and getting it wrong is a well-known vulnerability class:

**The \`alg: none\` attack.** Early JWT libraries honoured a header claiming no signature was used. An attacker edits the payload, sets \`alg\` to \`none\`, strips the signature, and the token is accepted. Always pin the expected algorithm server-side rather than trusting the header.

**Algorithm confusion.** If a server accepts both HMAC and RSA, an attacker can take the public RSA key — which is public — and use it as an HMAC secret. The server verifies successfully. Again: pin the algorithm.

**Expiry is not automatic.** \`exp\` is only enforced if your library checks it and you have not disabled that check. This tool shows you the expiry so you can confirm what you are holding.`,
        },
      ],
      faq: [
        {
          q: "Does this verify the signature?",
          a: "No, and deliberately so — verifying would mean sending your secret or public key somewhere. This tool only decodes. Never trust an unverified token in production code.",
        },
        {
          q: "Is it safe to paste a real token here?",
          a: "The decoding happens entirely in your browser and nothing is transmitted. That said, a JWT is a live credential until it expires, so treat it the way you would treat a password.",
        },
        {
          q: "Is it safe to paste a production token?",
          a: "The decoding happens entirely in your browser and nothing is transmitted. But a JWT is a live credential until it expires, so treat it as you would a password and avoid pasting one into any tool you have not verified.",
        },
      ],
    },
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    category: "developer",
    tagline: "Generate cryptographically random v4 UUIDs in bulk.",
    description:
      "Generate random v4 UUIDs or timestamp-ordered v7 UUIDs in bulk, using the browser's crypto API. Copy them as a list, JSON array or SQL values.",
    keywords: ["uuid generator", "guid generator", "uuid v4", "uuid v7"],
    content: {
      intro:
        "Generate up to a thousand identifiers at once using the browser's cryptographic random source. Version 4 is purely random; version 7 embeds a timestamp so identifiers sort chronologically, which indexes far better as a database primary key.",
      steps: [
        "Choose v4 (random) or v7 (time-ordered).",
        "Set how many you need and pick a formatting option.",
        "Copy the list, or download it as a text file.",
      ],
      sections: [
        {
          heading: "Why v4 UUIDs hurt database performance",
          body: `A version 4 UUID is 122 random bits. Excellent for uniqueness, poor as a primary key on a large table.

Database indexes are B-trees: sorted structures stored in fixed-size pages. Sequential keys always append to the same end page, which stays hot in memory. Random keys land in arbitrary pages, which means:

- **Random I/O** instead of sequential writes
- **Page splits** — inserting into a full page splits it in two, leaving both half-empty
- **Index bloat** from all those half-empty pages
- **A useless cache**, because writes are spread across the whole index

At a few thousand rows this is invisible. At tens of millions it is not.`,
        },
        {
          heading: "What v7 changes, and when to still use v4",
          body: `Version 7 puts a 48-bit big-endian Unix millisecond timestamp in the first six bytes, then fills the rest with randomness. Because the timestamp leads and is big-endian, sorting the identifiers sorts them by creation time — so inserts append, exactly like an auto-increment integer, while keeping the properties that made UUIDs attractive: generate anywhere, no coordination, no sequence leaking your row count.

**Use v7** for primary keys and anything written in volume.

**Use v4** when the identifier is public and its creation time should not be. A v7 value tells anyone holding it the millisecond it was generated — usually harmless, occasionally a real leak. Password reset tokens, share links and public object ids are better as v4.

Both versions here come from \`crypto.getRandomValues()\`, the same cryptographically secure source used for key generation — not \`Math.random()\`.`,
        },
      ],
      faq: [
        {
          q: "When should I use v7 instead of v4?",
          a: "Use v7 for database primary keys. Because the first bytes encode a timestamp, new rows append to the end of the index instead of scattering across it, which avoids the page-split churn random v4 keys cause.",
        },
        {
          q: "Are these actually random?",
          a: "Yes. They come from crypto.getRandomValues(), the same cryptographically secure source used for key generation — not Math.random().",
        },
        {
          q: "Are the identifiers generated on a server?",
          a: "No. They come from crypto.getRandomValues() in your own browser, so nobody else has ever seen them and no two visitors can receive the same batch.",
        },
      ],
    },
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    category: "developer",
    tagline: "Test regular expressions with live match highlighting and groups.",
    description:
      "Test JavaScript regular expressions against sample text with live highlighting, capture group inspection and a replace preview.",
    keywords: ["regex tester", "regular expression tester", "regex online", "regex match"],
    content: {
      intro:
        "Write a pattern and see every match highlighted in your sample text as you type. Capture groups — including named ones — are broken out per match, and a replacement preview shows the result of a substitution before you commit it to code.",
      steps: [
        "Enter your pattern and pick the flags you need.",
        "Paste sample text to test against.",
        "Inspect the match table, or try a replacement string.",
      ],
      sections: [
        {
          heading: "Catastrophic backtracking, and how to spot it",
          body: `Some patterns take exponential time on input that does not match. The classic shape is a quantifier inside a quantifier:

    (a+)+$

Against \`aaaaaaaaaaaaaaaaaaaaX\` the engine tries every possible way to divide those characters between the inner and outer repeats before concluding there is no match. Add one character and the work doubles.

This is a real denial-of-service vector — "ReDoS" — because a request containing a crafted string can pin a CPU core for minutes.

**The warning signs** are nested quantifiers like \`(x+)+\`, \`(x*)*\` or \`(x|xy)+\`, especially followed by something that can fail.

**The fix** is to remove the ambiguity, usually by making the inner part unable to match the same text two ways. \`(a+)+$\` becomes simply \`a+$\`. Where you genuinely need alternation, make the branches mutually exclusive.

Matching here is capped so a bad pattern cannot lock up the tab, but the pattern still needs fixing before it reaches a server.`,
        },
        {
          heading: "This is JavaScript's flavour, not PCRE",
          body: `Regex dialects differ more than people expect. This tester uses your browser's engine, so patterns behave exactly as they will in JavaScript — which is not exactly how they behave in Python, PHP, Go or grep.

**JavaScript supports:** named groups \`(?<name>...)\`, lookahead \`(?=...)\`, lookbehind \`(?<=...)\`, and Unicode property escapes \`\\p{Letter}\` with the \`u\` flag.

**JavaScript does not have:** atomic groups \`(?>...)\`, possessive quantifiers \`a++\`, recursion, or \`\\A\` and \`\\z\` anchors. Patterns copied from a PCRE cheatsheet may need adjusting.

**Go's RE2 is different again** — it has no backreferences or lookaround at all, by design, precisely to guarantee linear time and avoid the backtracking problem above.

**The \`m\` flag** changes \`^\` and \`$\` to match at line boundaries rather than only at the start and end of the whole string. It is the flag most often forgotten when a pattern works on one line and fails on many.`,
        },
      ],
      faq: [
        {
          q: "Which regex flavour is this?",
          a: "JavaScript's, as implemented by your browser. Lookbehind, named capture groups and Unicode property escapes all work. Patterns from PCRE, Python or Go may need small adjustments.",
        },
        {
          q: "Why does my pattern hang the page?",
          a: "Nested quantifiers such as (a+)+ can backtrack catastrophically on non-matching input. Matching is capped to protect the tab, but the fix is to rewrite the pattern to avoid ambiguous repetition.",
        },
        {
          q: "Is my test data private?",
          a: "Yes. The pattern is compiled and run by your browser's own regex engine. Log samples and production strings pasted here never reach a server.",
        },
      ],
    },
  },
  {
    slug: "cron-expression-generator",
    name: "Cron Expression Generator",
    category: "developer",
    tagline: "Build a cron schedule and read it back in plain English.",
    description:
      "Build and explain cron expressions. Describes any schedule in plain English and lists the next run times so you can confirm it fires when you expect.",
    keywords: ["cron generator", "crontab", "cron expression", "cron explained"],
    content: {
      intro:
        "Type a cron expression and read it back in plain English, with the next several run times listed so you can confirm it fires when you think it does. Common schedules are one click away if you would rather not hand-write the fields.",
      steps: [
        "Enter an expression, or pick one of the presets.",
        "Read the plain-English description to confirm the intent.",
        "Check the upcoming run times before shipping it.",
      ],
      sections: [
        {
          heading: "The day-of-month and day-of-week trap",
          body: `This catches experienced people, because it is the one place cron uses OR where you would expect AND.

The five fields are minute, hour, day-of-month, month, day-of-week. When **both** day fields are restricted, classic cron runs the job if **either** matches — not both.

So this:

    0 0 13 * 5

does not mean "midnight on Friday the 13th". It means "midnight on the 13th of every month, **and also** midnight every Friday". That is roughly nine times more often than intended.

If either day field is \`*\`, the behaviour is the intuitive one and there is no problem. The ambiguity only appears when both are constrained — which is why this tool lists the actual next run times. Read those rather than trusting your reading of the expression.`,
        },
        {
          heading: "Steps, ranges and the things cron cannot do",
          body: `**Step values** repeat at an interval. \`*/15\` in the minute field means every fifteen minutes. \`0-30/5\` means every five minutes during the first half hour only.

**A common mistake** is thinking \`*/90\` gives you every ninety minutes. Each field is independent, so the largest minute step is 59 — there is no way to express an interval longer than the field. Every ninety minutes needs two entries, or a different scheduler.

**Ranges and lists** combine: \`1-5\` is Monday to Friday, \`1,3,5\` is Monday, Wednesday, Friday, and \`MON-FRI\` works too.

**Cron has no memory.** If the machine is asleep or down when a job was due, standard cron does not run it late — the moment simply passed. \`anacron\` and systemd timers with \`Persistent=true\` do catch up; plain cron does not.

**Timezones are the other surprise.** Most cron daemons use the system timezone, so a job scheduled for 02:30 may run twice or not at all on daylight-saving changeover nights. Schedule anything critical outside the 01:00–03:00 window, or run the machine on UTC.`,
        },
      ],
      faq: [
        {
          q: "Which cron dialect is this?",
          a: "Standard five-field Unix cron: minute, hour, day of month, month, day of week. Ranges, steps, lists and names like MON or JAN are all supported.",
        },
        {
          q: "Why do day-of-month and day-of-week both matter?",
          a: "When both are restricted, classic cron runs the job if either matches — not both. It is a long-standing gotcha, so check the listed run times rather than assuming.",
        },
        {
          q: "Does this need an internet connection?",
          a: "Only to load the page. Parsing the expression and calculating run times happen locally, so it keeps working if you go offline afterwards.",
        },
      ],
    },
  },
  {
    slug: "unix-timestamp-converter",
    name: "Unix Timestamp Converter",
    category: "developer",
    tagline: "Convert epoch timestamps to dates and back, in any timezone.",
    description:
      "Convert Unix timestamps to human-readable dates and back. Handles seconds and milliseconds, shows UTC alongside your local time, and outputs ISO 8601.",
    keywords: ["unix timestamp", "epoch converter", "timestamp to date", "epoch time"],
    content: {
      intro:
        "Convert an epoch timestamp into a readable date, or go the other way. Seconds and milliseconds are detected automatically, and results are shown in both UTC and your local timezone so off-by-one-day bugs are obvious.",
      steps: [
        "Paste a timestamp, or pick a date and time.",
        "Read the conversion in UTC, local time and ISO 8601.",
        "Copy whichever format your code needs.",
      ],
      sections: [
        {
          heading: "Seconds, milliseconds, and how to tell them apart",
          body: `Unix time counts **seconds** since 1 January 1970 UTC. JavaScript's \`Date.now()\` returns **milliseconds**. Mixing them is the single most common bug in date handling, and the symptom is memorable: a timestamp interpreted as seconds instead of milliseconds lands in 1970, and one interpreted the other way lands around the year 55,000.

Telling them apart is easy by length, at least for current dates:

- **10 digits** — seconds (until November 2286)
- **13 digits** — milliseconds

This tool uses that heuristic and tells you which it detected. Some systems also use microseconds (16 digits) or nanoseconds (19 digits); Go and some tracing tools emit those.

If you see a date in 1970 in production, you are almost certainly dividing or multiplying by 1000 in the wrong place.`,
        },
        {
          heading: "The 2038 problem and why leap seconds do not exist here",
          body: `**2038.** Systems storing Unix time in a signed 32-bit integer overflow at 03:14:07 UTC on 19 January 2038, wrapping to 1901. This is a real concern for embedded systems and old C code, and irrelevant for anything using 64-bit time — which includes JavaScript, modern Linux, and every current database.

**Leap seconds are ignored.** Unix time pretends every day is exactly 86,400 seconds. Real UTC occasionally inserts a leap second, so Unix time is not a true count of elapsed seconds since 1970 — it is off by the number of leap seconds since then. Systems handle this by repeating or smearing a second rather than incrementing the counter.

In practice this means you should never compute precise durations across a leap second from Unix timestamps, and you should never be surprised that two systems disagree by a second during one.

**Negative timestamps** are valid and represent dates before 1970. Some libraries handle them badly, which is why birthdates before 1970 occasionally break registration forms.`,
        },
      ],
      faq: [
        {
          q: "Seconds or milliseconds?",
          a: "Unix time is seconds; JavaScript's Date.now() returns milliseconds. A ten-digit number is almost certainly seconds and a thirteen-digit one milliseconds, which is how this tool guesses.",
        },
        {
          q: "What is the 2038 problem?",
          a: "Systems storing Unix time in a signed 32-bit integer overflow on 19 January 2038. Anything using 64-bit time — which includes JavaScript — is unaffected.",
        },
        {
          q: "Is anything sent anywhere?",
          a: "No. The conversion uses your browser's own Date object, and your timezone is read from your system rather than looked up over the network.",
        },
      ],
    },
  },
  {
    slug: "sql-formatter",
    name: "SQL Formatter",
    category: "developer",
    tagline: "Format SQL queries for readability across several dialects.",
    description:
      "Format and indent SQL queries in your browser. Supports PostgreSQL, MySQL, SQLite, T-SQL and more, with configurable keyword casing.",
    keywords: ["sql formatter", "sql beautifier", "format sql", "sql pretty print"],
    content: {
      intro:
        "Turn a single-line query — or one mangled by an ORM log — into something readable, with clauses broken onto their own lines and joins aligned. Several dialects are supported so vendor-specific syntax is not mangled.",
      steps: [
        "Paste your query.",
        "Pick the dialect that matches your database.",
        "Choose keyword casing, then copy the formatted result.",
      ],
      sections: [
        {
          heading: "Formatting never changes what a query does",
          body: `Only whitespace and keyword casing change. Identifiers, string literals, comments and the structure of the query are left exactly as written — so a formatted query returns identical results to the original.

That guarantee has one boundary worth knowing: **string literals are never touched**. If a literal contains newlines or significant spacing, it is preserved byte for byte. The formatter only reflows the SQL around it.

**Keyword casing is cosmetic** but conventional. Uppercase keywords against lowercase identifiers makes the shape of a query scannable at a glance — you can see the clauses without reading the words. It has no effect on execution; SQL keywords are case-insensitive.

**Identifier casing is not cosmetic** and is deliberately left alone. In PostgreSQL an unquoted identifier folds to lowercase while a quoted one is case-sensitive, so \`"User"\` and \`user\` are different tables. Changing that casing would change the query.`,
        },
        {
          heading: "Choosing the right dialect",
          body: `Pick the dialect matching your database and vendor-specific syntax formats correctly instead of confusing the parser.

The differences that actually matter:

- **Quoting.** PostgreSQL and standard SQL use \`"double quotes"\` for identifiers; MySQL and MariaDB use backtick quoting; SQL Server uses \`[brackets]\`.
- **Parameters.** \`$1\` in PostgreSQL, \`?\` in MySQL and SQLite, \`@name\` in T-SQL.
- **Limits.** \`LIMIT 10\` almost everywhere, \`TOP 10\` in T-SQL, \`FETCH FIRST 10 ROWS ONLY\` in Db2 and standard SQL.
- **String concatenation.** \`||\` in standard SQL, \`CONCAT()\` in MySQL, \`+\` in T-SQL.

If you are unsure, Standard SQL is a reasonable default — it will format common syntax well and simply not recognise vendor extensions, which shows up as slightly odd line breaks rather than anything broken.`,
        },
      ],
      faq: [
        {
          q: "Will it change what my query does?",
          a: "No. Only whitespace and keyword casing change. Identifiers, string literals and the structure of the query are left exactly as written.",
        },
        {
          q: "Which dialects are supported?",
          a: "PostgreSQL, MySQL, MariaDB, SQLite, T-SQL, BigQuery, Snowflake and standard SQL, among others. Pick the closest match for the best results.",
        },
        {
          q: "Is it safe to paste a production query?",
          a: "Yes. Formatting is done locally, so queries containing table names, schema details or literal values in a WHERE clause never leave your machine.",
        },
      ],
    },
  },
  {
    slug: "html-formatter",
    name: "HTML Formatter",
    category: "developer",
    tagline: "Indent messy HTML, or minify it for production.",
    description:
      "Format and indent HTML in your browser, or minify it by stripping comments and collapsing whitespace. Void elements and inline tags handled correctly.",
    keywords: ["html formatter", "html beautifier", "format html", "html minifier"],
    content: {
      intro:
        "Re-indent HTML that has lost its shape, or strip it down for production. Void elements like img and br are handled correctly, and pre blocks keep their whitespace instead of being reflowed.",
      steps: [
        "Paste your markup.",
        "Choose Format with an indent width, or Minify.",
        "Copy or download the result.",
      ],
      sections: [
        {
          heading: "Where whitespace actually matters in HTML",
          body: `HTML collapses runs of whitespace to a single space when rendering, which is why you can indent markup freely. There are exceptions, and a formatter that ignores them will change how your page looks.

**\`<pre>\` and \`<textarea>\`** preserve whitespace exactly. Re-indenting their contents changes what the user sees. Both are passed through untouched here.

**\`<script>\` and \`<style>\`** contain code, not markup. Their contents are copied verbatim rather than parsed as HTML.

**Inline elements are whitespace-sensitive at their boundaries.** This:

    <p>Read the <a href="/docs">docs</a> first.</p>

renders differently if a newline is inserted before \`</a>\`, because that whitespace becomes a rendered space. This is why aggressive minifiers can push punctuation onto the wrong side of a link.`,
        },
        {
          heading: "What minification here does and does not do",
          body: `Minification removes comments and collapses whitespace between tags. That is all — deliberately.

**What it will not do:**

- Remove optional closing tags such as \`</li>\` and \`</p>\`. Legal HTML, but it makes the source much harder to reason about and breaks some downstream parsers.
- Strip quotes from attribute values. Legal for simple values, a silent bug for anything containing a space.
- Reorder or deduplicate attributes.
- Inline or minify CSS and JavaScript inside the document. Use the CSS & JS minifier for those.

For a production build you want a full pipeline that also inlines critical CSS and defers scripts. This is for the case where you have a snippet, an email template, or a page you want to shrink quickly without setting any of that up.`,
        },
      ],
      faq: [
        {
          q: "Is the content inside pre and textarea preserved?",
          a: "Yes. Whitespace is significant in those elements, so their contents are passed through untouched rather than re-indented.",
        },
        {
          q: "How aggressive is minification?",
          a: "It removes comments and collapses runs of whitespace between tags. It does not rewrite attributes or strip optional closing tags, so the output stays safe to ship.",
        },
        {
          q: "Is my markup uploaded?",
          a: "No. The formatter is plain JavaScript running in your browser, so unreleased page templates and markup stay private.",
        },
      ],
    },
  },
  {
    slug: "css-js-minifier",
    name: "CSS & JS Minifier",
    category: "developer",
    tagline: "Strip comments and whitespace from CSS and JavaScript.",
    description:
      "Minify CSS and JavaScript in your browser. Removes comments and redundant whitespace, and reports exactly how many bytes you saved.",
    keywords: ["css minifier", "js minifier", "javascript minifier", "minify css"],
    content: {
      intro:
        "Shrink a stylesheet or script by removing comments and unnecessary whitespace, with a live byte count showing the saving. Useful for a quick inline snippet where wiring up a full build step would be overkill.",
      steps: [
        "Pick CSS or JavaScript.",
        "Paste your source.",
        "Copy the minified output and check the size saving.",
      ],
      sections: [
        {
          heading: "Why calc() keeps its spaces",
          body: `Most CSS minifiers strip whitespace around operators. Inside \`calc()\` that produces invalid CSS, and the declaration is dropped entirely by the browser:

    width: calc(100% + 2rem);   /* valid   */
    width: calc(100%+2rem);     /* invalid */

The CSS specification requires whitespace around \`+\` and \`-\` in \`calc()\` because \`+2rem\` is ambiguous — it could be a signed number rather than an addition. \`*\` and \`/\` do not have this problem, but the safe move is to leave all of them alone.

This minifier collapses whitespace around \`{\`, \`}\`, \`:\`, \`;\`, \`,\` and \`>\` only, which is where the savings are anyway. The \`+\` and \`~\` sibling combinators keep their spaces as a side effect — slightly larger output, no broken stylesheets.`,
        },
        {
          heading: "Safe minification versus mangling",
          body: `There are two levels of JavaScript minification and only one of them is safe to do without a test suite.

**Safe:** removing comments and collapsing whitespace. The code is identical to the parser; only the bytes shrink. That is what happens here.

**Mangling:** renaming local variables to single letters, inlining functions, dropping unreachable branches. This gives much larger savings and requires full parsing plus a set of assumptions about your code. When those assumptions are wrong — code relying on \`Function.prototype.name\`, on a class name string, or on \`with\` — it breaks in ways that only appear in production.

Line breaks are preserved here, which matters because JavaScript inserts semicolons automatically at line ends. Joining everything onto one line can change behaviour around \`return\` statements.

For production, mangle in your bundler where tests run against the output. Use this for a snippet or an inline block where setting up a build step is not worth it.`,
        },
      ],
      faq: [
        {
          q: "Does this rename variables?",
          a: "No. It performs safe minification — comments and whitespace only. Identifier mangling needs full parsing and is better handled by your bundler, where it can be verified by tests.",
        },
        {
          q: "Will it break my code?",
          a: "String and template literal contents are preserved, as are regex literals. That said, always test minified output before deploying, exactly as you would with any build tool.",
        },
        {
          q: "Could my source code be retained?",
          a: "There is nowhere for it to be retained. Minification runs in the browser tab, so proprietary scripts and stylesheets are never transmitted or stored.",
        },
      ],
    },
  },
  {
    slug: "markdown-html-converter",
    name: "Markdown to HTML Converter",
    category: "developer",
    tagline: "Convert Markdown to HTML and back, with a live preview.",
    description:
      "Convert Markdown to HTML or HTML back to Markdown, with a rendered live preview. Supports tables, task lists, fenced code and strikethrough.",
    keywords: ["markdown to html", "html to markdown", "markdown converter", "markdown preview"],
    content: {
      intro:
        "Write Markdown and get clean HTML out, or paste existing HTML and convert it back to Markdown. A rendered preview sits alongside the source so you can see the result as you type.",
      steps: [
        "Choose Markdown to HTML, or HTML to Markdown.",
        "Paste or write your content.",
        "Switch between the code output and the rendered preview.",
      ],
      sections: [
        {
          heading: "Which Markdown this is",
          body: `Markdown has no single specification. The original 2004 implementation left many cases undefined, and different parsers resolved them differently — which is why the same document can render three ways.

This uses **GitHub Flavored Markdown**, built on CommonMark. That gives you:

- **Tables** with pipe syntax
- **Fenced code blocks** with language hints
- **Task lists** — \`- [ ]\` and \`- [x]\`
- **Strikethrough** with \`~~text~~\`
- **Autolinking** of bare URLs

CommonMark settled the ambiguous cases, so nested lists, emphasis inside words and mixed indentation behave predictably.

**Not included**, because they are extensions specific to other tools: footnotes, definition lists, math blocks, admonition callouts, and front matter. If your document uses those, they will appear as literal text.`,
        },
        {
          heading: "Round-tripping loses formatting, not meaning",
          body: `Converting Markdown to HTML and back does not return the original file. The meaning survives; the styling choices do not.

Markdown offers several ways to write the same thing — \`*emphasis*\` or \`_emphasis_\`, \`#\` headings or underlined Setext headings, \`-\` or \`*\` for bullets. HTML has one representation for each, so converting back produces the converter's preferred style rather than yours.

Other things that change:

- **Hard line breaks** within a paragraph may be reflowed
- **Reference-style links** become inline links
- **HTML blocks embedded in Markdown** come back as raw HTML

If you are converting a document you intend to keep editing, treat the output as a new file rather than an update to the original.

One safety note: the **preview** is sanitised before rendering, but the **HTML output** is raw. If you publish it somewhere, sanitise it there too.`,
        },
      ],
      faq: [
        {
          q: "Which Markdown flavour?",
          a: "GitHub Flavored Markdown — tables, fenced code blocks, task lists, strikethrough and autolinking all work as they do in a README.",
        },
        {
          q: "Is the HTML output sanitised?",
          a: "The preview escapes raw HTML so pasted content cannot execute scripts in this page. If you render the output on your own site, sanitise it there too.",
        },
        {
          q: "Is my draft content private?",
          a: "Yes. Conversion and preview both happen in your browser, so unpublished drafts and internal documentation stay on your device.",
        },
      ],
    },
  },
  {
    slug: "env-file-generator",
    name: ".env File Generator",
    category: "developer",
    tagline: "Build a .env file and generate a safe .env.example alongside it.",
    description:
      "Build a .env file from key-value pairs, with automatic quoting for values that need it, plus a matching .env.example with secrets stripped out.",
    keywords: ["env file generator", "dotenv", "env example", "environment variables"],
    content: {
      intro:
        "Assemble environment variables into a valid .env file, with quoting applied automatically to values containing spaces or special characters. It also produces the matching .env.example with values blanked — the file you actually commit.",
      steps: [
        "Add your keys and values, grouped into sections if you like.",
        "Mark any secrets so they are emptied in the example file.",
        "Copy the .env, then copy the .env.example for version control.",
      ],
      sections: [
        {
          heading: "When a value needs quotes",
          body: `\`.env\` files look simple and have a surprising number of edge cases, because there is no standard — each library parses slightly differently.

**Quotes are required** when a value contains spaces, a \`#\` (which otherwise starts a comment), or a line break. This tool adds them automatically only when needed, so the file stays readable.

**Single and double quotes differ** in most parsers. Double quotes allow escape sequences like \`\\n\` to be interpreted; single quotes keep everything literal. If your value contains a literal backslash — a Windows path, a regex — single quotes are safer.

**Trailing spaces are invisible and load-bearing.** \`KEY=value \` includes the space in many parsers. This is a genuinely nasty bug to find, which is why values here are trimmed and quoted if the spacing is intentional.

**Multi-line values** need quoting and are not universally supported. For a private key or certificate, Base64-encode it into a single line instead.`,
        },
        {
          heading: "Why you commit .env.example",
          body: `\`.env\` belongs in \`.gitignore\` — it holds credentials. But that creates a problem: someone cloning the repository has no idea which variables the application needs. They run it, get a blank error, and have to read the source to find out.

\`.env.example\` solves that. Same keys, same comments, values removed for anything secret. It is documentation that cannot drift far from reality, because a missing key shows up the first time someone sets the project up.

**Conventions worth following:**

- Keep the key order identical between the two files
- Leave non-secret defaults in place — \`APP_ENV=local\`, \`PORT=3000\` — so fewer things need filling in
- Group related keys with a comment header
- Never leave a real credential in the example file, including "test" keys from a payment provider

This tool produces both at once and blanks anything you mark as a secret.`,
        },
      ],
      faq: [
        {
          q: "When do values need quotes?",
          a: "Whenever they contain spaces, the # character, or a line break. Values are quoted automatically when required, and left bare when not, which keeps the file readable.",
        },
        {
          q: "Why generate a .env.example?",
          a: "Because .env is gitignored, a new developer cloning the repo has no idea which variables exist. The example file documents the keys without leaking the values.",
        },
        {
          q: "Is it safe to put real secrets in here?",
          a: "The file is assembled in your browser and nothing is transmitted, so no value reaches a server. Nothing is written to storage either, so closing the tab discards everything.",
        },
      ],
    },
  },
  {
    slug: "color-converter",
    name: "Color Converter",
    category: "developer",
    tagline: "Convert between HEX, RGB, HSL and check contrast ratios.",
    description:
      "Convert colours between HEX, RGB and HSL, preview them live, and check WCAG contrast ratios against white and black backgrounds.",
    keywords: ["color converter", "hex to rgb", "rgb to hsl", "color picker"],
    content: {
      intro:
        "Convert a colour between HEX, RGB and HSL and see it rendered as you go. Contrast ratios against white and black are calculated to WCAG 2.1, with pass and fail marks for AA and AAA so accessibility is not an afterthought.",
      steps: [
        "Enter a colour in any supported format, or use the picker.",
        "Read the equivalent values in the other formats.",
        "Check the contrast ratios before using it for text.",
      ],
      sections: [
        {
          heading: "Reading a contrast ratio",
          body: `Contrast is expressed as a ratio between two relative luminances, from 1:1 (identical) to 21:1 (black on white).

**WCAG 2.1 thresholds:**

| Level | Normal text | Large text |
| --- | --- | --- |
| AA | 4.5:1 | 3:1 |
| AAA | 7:1 | 4.5:1 |

"Large" means 18pt, or 14pt bold — roughly 24px and 18.66px.

**The maths is not linear,** which is why intuition fails. Relative luminance weights green far more heavily than blue: green contributes 0.72, red 0.21, blue 0.07. A saturated blue on black has far less contrast than it appears, and pure yellow on white has almost none despite looking vivid.

**AA is the practical target.** It is what most accessibility regulations reference, and it is achievable without flattening your palette. AAA for body text is demanding enough that it constrains design significantly.`,
        },
        {
          heading: "HEX, RGB and HSL are the same colour",
          body: `All three describe identical sRGB colours — they differ only in how the numbers are arranged, and which edits are easy.

**HEX** is compact and the web default. \`#4f46e5\` is three bytes. Shorthand \`#abc\` expands to \`#aabbcc\`, and an optional fourth pair adds alpha.

**RGB** exposes the channels directly, which is useful when computing a colour in code.

**HSL** separates hue, saturation and lightness, which is the one that matches how people think about colour. Want the same colour but lighter? Change one number. Want a complementary colour? Add 180 to the hue. Building a palette in HSL takes minutes; doing it in HEX takes guesswork.

The usual workflow is to design in HSL and ship HEX, which is why converting between them is worth a tool.

**Alpha is preserved** where the target format supports it — eight-digit HEX, \`rgba()\` and \`hsla()\` all carry it.`,
        },
      ],
      faq: [
        {
          q: "What contrast ratio do I need?",
          a: "WCAG AA requires 4.5:1 for body text and 3:1 for large text — 18pt, or 14pt bold. AAA raises that to 7:1 and 4.5:1 respectively.",
        },
        {
          q: "Which formats are accepted?",
          a: "Three, four, six and eight digit hex, rgb() and rgba(), and hsl() and hsla(). Alpha is preserved where the target format supports it.",
        },
        {
          q: "Does this call a colour API?",
          a: "No. All conversion and contrast maths is arithmetic done in the page itself, which is why results update instantly as you type.",
        },
      ],
    },
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    category: "developer",
    tagline: "Generate SHA-1, SHA-256, SHA-384 and SHA-512 hashes.",
    description:
      "Generate cryptographic hashes from text or files using the Web Crypto API. Supports SHA-1, SHA-256, SHA-384 and SHA-512, with checksum comparison.",
    keywords: ["hash generator", "sha256 generator", "checksum", "sha512 hash"],
    content: {
      intro:
        "Hash text or a file using the browser's native Web Crypto implementation. Paste a published checksum to compare against and the result is checked for you, rather than leaving you to eyeball sixty-four hex characters.",
      steps: [
        "Enter text, or drop in a file.",
        "Pick the algorithms you want.",
        "Optionally paste an expected checksum to verify a match.",
      ],
      sections: [
        {
          heading: "Why there is no MD5 option",
          body: `The Web Crypto API deliberately omits MD5, and this tool is not going to work around that.

MD5 has been cryptographically broken since 2004. Collisions — two different inputs producing the same hash — can be generated in seconds on a laptop. Researchers have demonstrated colliding executables, colliding PDFs, and a forged certificate authority.

SHA-1 is also broken; the SHAttered attack produced two colliding PDFs in 2017. It is included here because verifying legacy checksums and Git object ids still requires it, but it should never be used for anything new.

**For integrity checking, use SHA-256.** It is fast, universally supported, and has no known practical attacks.

**For passwords, use none of these.** Cryptographic hashes are designed to be fast, which is exactly what an attacker wants when testing billions of guesses. Use Argon2id, scrypt or bcrypt — algorithms deliberately made slow and memory-hungry.`,
        },
        {
          heading: "Verifying a download",
          body: `A published checksum lets you confirm a file arrived intact and unmodified. The process is simple, and its limitation is important.

Drop the file in, pick SHA-256, paste the published value, and the comparison is done for you — which beats eyeballing sixty-four hex characters and missing a transposed pair.

**What a matching hash proves:** the file is byte-for-byte what the publisher hashed. No corruption in transit, no truncated download.

**What it does not prove:** that the file is safe. If an attacker controls the download page, they control the checksum printed on it too, and can serve a malicious file with a matching hash. Checksums protect against accidents and mirrors, not against a compromised source.

**Signatures do prove authenticity.** A GPG signature is verified against a key you already trust, so an attacker would need the private key rather than just write access to a web page. Where a project publishes signatures, prefer them.

Files here are hashed locally by your browser, so size is limited only by memory — nothing is uploaded.`,
        },
      ],
      faq: [
        {
          q: "Why is MD5 not offered?",
          a: "The Web Crypto API deliberately omits MD5 because it is cryptographically broken — collisions are trivial to produce. Use SHA-256 for anything security related.",
        },
        {
          q: "Can I hash large files?",
          a: "Yes. Files are read and hashed locally, so the practical ceiling is your available memory rather than any upload limit.",
        },
        {
          q: "Are my files uploaded to be hashed?",
          a: "No. Files are read with the FileReader API and hashed by the browser's own Web Crypto implementation, so even multi-gigabyte files never leave your disk.",
        },
      ],
    },
  },
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    category: "developer",
    tagline: "Create a customisable QR code and download it as PNG or SVG.",
    description:
      "Generate QR codes for URLs, text, WiFi networks and contact details. Customise size, colours and error correction, then download as PNG or SVG.",
    keywords: ["qr code generator", "qr code maker", "free qr code", "qr code svg"],
    content: {
      intro:
        "Generate a QR code for a link, plain text, a WiFi network or a vCard. Size, colours and error-correction level are all adjustable, and the SVG export stays sharp at any print size.",
      steps: [
        "Pick a content type and fill in the fields.",
        "Adjust size, colours and error correction.",
        "Download as PNG for screens, or SVG for print.",
      ],
      sections: [
        {
          heading: "Choosing an error correction level",
          body: `QR codes use Reed–Solomon error correction, the same family used on CDs. Some of the code's capacity is spent on redundancy so a damaged code still scans.

| Level | Recovers | Use for |
| --- | --- | --- |
| L | 7% | Clean digital display, maximum data |
| M | 15% | General purpose — the default |
| Q | 25% | Printed small, or on a curved surface |
| H | 30% | Logo overlay, harsh environments |

Higher correction means more modules for the same data, so the code is denser and needs to be printed larger to stay scannable. It is a trade, not a free upgrade.

**The logo case** is the one people get wrong. Placing a logo over the centre destroys part of the code, and only works because the error correction can reconstruct it. Use H, keep the logo under about 25% of the area, and always test with a real phone before printing a thousand of them.`,
        },
        {
          heading: "Why these codes never expire",
          body: `There are two kinds of QR code and the difference matters commercially.

**Static** codes — what this tool makes — encode the data directly in the image. The URL is literally in the pattern. Nothing is stored anywhere, nothing can be tracked, and the code works forever regardless of what happens to this site.

**Dynamic** codes encode a short redirect URL pointing at a tracking service. That lets the owner change the destination later and collect scan analytics. It also means the code stops working the moment that service goes away or the subscription lapses — which is how a lot of printed material has quietly died.

If you need to change the destination later, do it without a third party: point the code at a URL you control and manage the redirect yourself. You keep the flexibility, the analytics and the guarantee that it keeps working.

**Quiet zone.** The blank margin around the code is part of the specification — four modules wide. Scanners use it to find the edges, and cropping it is the most common reason a printed code fails.`,
        },
      ],
      faq: [
        {
          q: "Which error correction level should I pick?",
          a: "Level M is a good default. Go to Q or H if the code will be printed small, placed on a curved surface, or overlaid with a logo — higher correction survives more damage at the cost of density.",
        },
        {
          q: "Do these codes expire?",
          a: "No. The data is encoded directly in the image, so there is no redirect and no tracking service in the middle. The code works forever, but the destination cannot be changed later.",
        },
        {
          q: "Does the QR code depend on this site staying online?",
          a: "No. The data is encoded directly into the image rather than pointing at a redirect service, so your codes keep working even if this site disappears. Generation is local too.",
        },
      ],
    },
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    category: "developer",
    tagline: "Generate strong random passwords and passphrases.",
    description:
      "Generate strong random passwords or memorable passphrases using the browser's crypto API, with a live entropy estimate in bits.",
    keywords: ["password generator", "strong password", "random password", "passphrase generator"],
    content: {
      intro:
        "Generate random passwords from a character set you control, or word-based passphrases that are far easier to type on a phone. Entropy is shown in bits so you can judge strength by arithmetic rather than by a colour bar.",
      steps: [
        "Choose a password or a passphrase.",
        "Set the length and which character sets to include.",
        "Generate, then copy — nothing is stored or logged.",
      ],
      sections: [
        {
          heading: "What entropy actually measures",
          body: `Entropy is how many guesses an attacker needs, expressed as a power of two. A password with 60 bits of entropy needs up to 2^60 guesses — about a quintillion.

It is a property of **how the password was generated**, not how it looks. This is the part that trips people up:

| Password | Looks | Actual entropy |
| --- | --- | --- |
| \`P@ssw0rd!\` | Strong | ~20 bits — it is a dictionary word with predictable substitutions |
| \`correct-horse-battery-staple\` | Weak | ~44 bits if the words were chosen randomly |
| \`x7#mK9$pL2@qR4\` | Strong | ~85 bits |

Substituting 3 for e and adding a trailing exclamation mark adds almost nothing. Cracking tools apply those same substitutions automatically — they were the first thing anyone thought to automate.

## How much do you need?

- **Below 50 bits** — crackable by a motivated attacker with commodity hardware
- **75 bits** — comfortable for an online account that has rate limiting
- **100+ bits** — appropriate for anything protecting data at rest: a password manager's master key, a disk, a backup archive

The gap matters because online and offline attacks are not comparable. An online login might allow ten attempts a minute. An attacker holding a stolen password hash runs billions per second on a GPU.`,
        },
        {
          heading: "Why passphrases work",
          body: `Four random words from a 256-word list gives 32 bits. That sounds low next to a 20-character random string — but a passphrase you can actually type on a phone keyboard and remember beats a strong password you write on a sticky note.

The strength comes entirely from the **randomness of the selection**, not from the words themselves. Picking four words yourself produces something far weaker than it looks, because human choices cluster hard around common, related, memorable words.

Let the generator choose. That is the whole point.`,
        },
      ],
      faq: [
        {
          q: "How many bits of entropy are enough?",
          a: "Around 75 bits is comfortable for an online account with rate limiting. For anything protecting data at rest — a password manager's master key, a disk — aim for 100 or more.",
        },
        {
          q: "Are passphrases really as strong?",
          a: "Yes, given enough words. Four random words from a large list beats a short mangled password, and is far easier to type. Strength comes from the randomness of the selection, not from substituting 3 for e.",
        },
        {
          q: "Could someone else see the passwords I generate?",
          a: "No. They are produced by crypto.getRandomValues() inside your browser and never transmitted, logged or stored. Reloading the page discards them permanently.",
        },
      ],
    },
  },
  {
    slug: "diff-checker",
    name: "Diff Checker",
    category: "developer",
    tagline: "Compare two texts side by side with line-level highlighting.",
    description:
      "Compare two blocks of text or code side by side. Additions, removals and changes are highlighted line by line, with an option to ignore whitespace.",
    keywords: ["diff checker", "text compare", "compare two files", "diff tool online"],
    content: {
      intro:
        "Put two versions side by side and see exactly what changed, line by line, with additions and removals colour-coded. Far quicker than reading a prose description of the differences, and whitespace-only changes can be ignored when they are just noise.",
      steps: [
        "Paste the original on the left and the new version on the right.",
        "Toggle whitespace and case sensitivity if needed.",
        "Read the highlighted result, or switch to a unified view.",
      ],
      sections: [
        {
          heading: "How line diffing works",
          body: `The algorithm underneath is a longest common subsequence search — it finds the largest set of lines appearing in both versions in the same order, and everything else is an addition or a removal.

That framing explains some behaviour that otherwise looks wrong:

**A moved block shows as a deletion plus an addition.** Line diffing has no concept of "moved". A function relocated from the top of a file to the bottom appears twice, once in each colour.

**Changing one character marks the whole line changed.** Line-level granularity is the unit. A line is either the same or not.

**Reformatting looks like a total rewrite.** Re-indenting a file changes every line. Switch on "Ignore whitespace" to compare content rather than layout — that is exactly what it is for.

Removals and additions that sit adjacent are paired onto the same row here, so a modified line shows old and new side by side rather than as two unrelated entries.`,
        },
        {
          heading: "Comparing code, config and data",
          body: `Anything plain text works, but a little preparation makes the result far more readable.

**JSON.** Two documents can be semantically identical and textually different — key order and indentation vary by serialiser. Format both with the JSON formatter and sort keys first; the diff then shows only real changes.

**CSV.** Sort both files by the same key column before comparing, or a single inserted row will offset everything after it and mark the whole file changed.

**Minified code.** A minified file is one long line, so a line diff tells you nothing. Format it first.

**Log files.** Timestamps differ on every line, which drowns the signal. Strip them first with a regex, then compare.

Everything runs in your browser, so contracts, credentials and unreleased code are safe to paste.`,
        },
      ],
      faq: [
        {
          q: "Is there a size limit?",
          a: "No hard limit, though comparing two very large documents takes longer since the diff is computed in your browser. A few thousand lines is comfortable.",
        },
        {
          q: "Can I diff code?",
          a: "Yes — any plain text works, including code, JSON, CSV and logs. The comparison is line-based, so structural changes show up clearly.",
        },
        {
          q: "Is it safe to compare confidential documents?",
          a: "Yes. Both versions are compared in your browser, so contracts, source code and internal documents are never uploaded.",
        },
      ],
    },
  },
  {
    slug: "lorem-ipsum-generator",
    name: "Lorem Ipsum Generator",
    category: "developer",
    tagline: "Generate placeholder paragraphs, sentences or words.",
    description:
      "Generate lorem ipsum placeholder text by paragraph, sentence or word count, as plain text or wrapped in HTML paragraph tags.",
    keywords: ["lorem ipsum", "placeholder text", "dummy text generator", "filler text"],
    content: {
      intro:
        "Generate filler text for mockups by paragraph, sentence or word count. Output as plain text or wrapped in HTML tags, ready to paste straight into a template.",
      steps: [
        "Choose paragraphs, sentences or words, and how many.",
        "Pick plain text or HTML output.",
        "Generate and copy.",
      ],
      sections: [
        {
          heading: "Why nonsense Latin instead of real copy",
          body: `Placeholder text exists to keep attention on the design. Readable English in a mockup pulls reviewers into editing the words — you present a layout and get feedback on a sentence you wrote as a placeholder.

Lorem ipsum has been used by typesetters since the 1500s, and the text itself is a scrambled passage from Cicero's *de Finibus Bonorum et Malorum*, written in 45 BC. It is not truly random; it approximates the letter distribution and word lengths of Latin, which sits close enough to English to look right without being readable.

**When to use something else:**

- **Testing a real interface.** Use realistic content. Lorem ipsum has no long words, no numbers, no URLs, no names — so it hides every layout bug that real data would expose.
- **Anything a client might see unsupervised.** Placeholder text has shipped to production more than once.
- **Non-Latin scripts.** Latin tells you nothing about how the layout handles Arabic, Thai or Chinese.

Use it for typography and layout studies. Use real content for anything you intend to trust.`,
        },
        {
          heading: "Picking a realistic length",
          body: `Generating the right *amount* matters more than most people bother with, because layouts break at the extremes rather than in the middle.

Useful reference points:

- **Meta description** — 25 words
- **Blog intro paragraph** — 40 to 60 words
- **Standard article paragraph** — 50 to 80 words
- **Product description** — 100 to 150 words
- **Full blog post** — 800 to 1,500 words

**Test the extremes deliberately.** Fill a card with three words and with three hundred. That is where you find the layout that collapses when a title is short, or the one that overflows when a description runs long.

The HTML output wraps each paragraph in \`<p>\` tags, ready to paste straight into a template.`,
        },
      ],
      faq: [
        {
          q: "Why use lorem ipsum at all?",
          a: "Because readable placeholder copy distracts reviewers into editing the words instead of the design. Nonsense Latin keeps attention on layout and typography.",
        },
        {
          q: "Can I start with the classic opening?",
          a: 'Yes. Toggle the option to begin with "Lorem ipsum dolor sit amet", which is what most people expect placeholder text to look like.',
        },
        {
          q: "Does this fetch text from an API?",
          a: "No. The word pool ships with the page and sentences are assembled locally, so it works offline and never waits on a network round trip.",
        },
      ],
    },
  },
  {
    slug: "text-case-converter",
    name: "Text Case Converter",
    category: "developer",
    tagline: "Convert text between camelCase, snake_case, kebab-case and more.",
    description:
      "Convert text between camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, Title Case and sentence case, all at once.",
    keywords: ["case converter", "camelcase converter", "snake case", "kebab case"],
    content: {
      intro:
        "Paste any identifier or sentence and see it in every common casing convention at once, so you can grab the one you need without hand-editing. Handles multi-word input, existing delimiters and acronyms sensibly.",
      steps: [
        "Paste your text or identifier.",
        "Read every conversion at once.",
        "Copy the one you need.",
      ],
      sections: [
        {
          heading: "Which convention goes where",
          body: `Casing conventions are arbitrary but strongly held, and using the wrong one marks code as foreign immediately.

| Case | Used for |
| --- | --- |
| \`camelCase\` | JavaScript and Java variables, JSON keys |
| \`PascalCase\` | Classes, React components, TypeScript types |
| \`snake_case\` | Python, Ruby, SQL columns and tables |
| \`CONSTANT_CASE\` | Environment variables, constants |
| \`kebab-case\` | URLs, CSS classes, HTML attributes, npm packages |
| \`Train-Case\` | HTTP headers — \`Content-Type\` |

**The one that actually matters technically** is kebab-case for URLs. Google treats a hyphen as a word separator and an underscore as a word joiner, so \`my_blog_post\` is read as one token while \`my-blog-post\` is read as three words.

Everything else is convention — but conventions are what make a codebase readable, and mixing them within one file is worse than picking the "wrong" one consistently.`,
        },
        {
          heading: "How acronyms are handled",
          body: `Acronyms are where naive case converters produce nonsense, because the boundary rules that work for normal words break on a run of capitals.

Splitting \`parseHTTPResponse\` naively on every capital gives \`parse H T T P Response\`, and the snake_case output becomes \`parse_h_t_t_p_response\`.

This converter treats a run of capitals followed by a capital-plus-lowercase as one unit, so:

    parseHTTPResponse  ->  parse_http_response
    XMLHttpRequest     ->  xml_http_request
    getUserID          ->  get_user_id

**The style question underneath** is whether acronyms should be capitalised in camelCase at all. Google's style guides say no — \`parseHttpResponse\`, \`XmlHttpRequest\` — precisely because it makes boundaries unambiguous both for humans and for tools like this one. Microsoft's convention capitalises two-letter acronyms only.

Either is fine. Consistency is what matters, and the PascalCase output here follows the unambiguous form.`,
        },
      ],
      faq: [
        {
          q: "How are acronyms handled?",
          a: 'Runs of capitals are treated as a single word, so "parseHTTPResponse" becomes "parse_http_response" rather than splitting on every letter.',
        },
        {
          q: "Does it work on whole sentences?",
          a: "Yes. Title case and sentence case are designed for prose, while the programming cases will collapse a sentence into a single identifier.",
        },
        {
          q: "Is my text transmitted?",
          a: "No. Every conversion is a string operation performed in the page, which is why all the variants update the instant you type.",
        },
      ],
    },
  },

  // --------------------------------------------------------------------- seo
  {
    slug: "meta-tag-generator",
    name: "Meta Tag Generator & SERP Preview",
    category: "seo",
    tagline: "Write titles and descriptions with a live Google preview.",
    description:
      "Write meta titles and descriptions with a live Google SERP preview and pixel-width truncation warnings, then copy the finished HTML tags.",
    keywords: ["meta tag generator", "serp preview", "meta description", "title tag checker"],
    content: {
      intro:
        "See your title and description rendered exactly as Google would show them, on desktop and mobile, while you type. Truncation is measured in pixels rather than characters — which is how Google actually decides — so you know before publishing whether your title will be cut off.",
      steps: [
        "Enter your page title, description and URL.",
        "Watch the preview and the pixel-width meters as you type.",
        "Copy the generated meta tags into your page head.",
      ],
      sections: [
        {
          heading: "Google truncates on pixels, not characters",
          body: `Every "keep your title under 60 characters" rule is an approximation of the real constraint, which is rendered width.

Google allocates roughly **580 pixels** for a desktop title and about **920** for the description. How many characters fit depends entirely on which characters they are:

- \`IIIIIIIIIIIIIIIIIIIIIIIIIIIIII\` — 30 narrow characters, plenty of room
- \`WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW\` — 30 wide characters, already cut off

A title in title case with several capitals and wide letters gets truncated well before 60 characters. One in lowercase with narrow letters can run to 70 and be fine.

This tool measures the actual rendered width using the same font metrics Google uses, and shows you where the cut falls rather than guessing from a character count. Mobile uses different widths again, which is why the preview switches between them.`,
        },
        {
          heading: "Writing a title that earns the click",
          body: `The title tag is both a ranking signal and the thing a person decides on. Those two jobs pull in slightly different directions, and the second matters more than people optimise for.

**Front-load the distinctive words.** Truncation removes the end, and eyes scan the start. "JSON Formatter — Free Online Tool | Toolkit" survives a cut; "Toolkit | Free Online Tools | JSON Formatter" does not.

**One brand mention, at the end.** A separator plus brand costs about 80 pixels. Worth it for recognition on a branded search, not worth repeating.

**Do not duplicate the H1 exactly.** They serve different audiences — the title works in a result list without context, the H1 works on a page that already has context. Overlap is fine; identical is a missed opportunity.

**Every page needs a distinct title.** Duplicate titles across a site are one of the most common issues in Search Console, and they force Google to guess which page answers a query.

**Description length is a trade.** Longer gives more room to persuade; shorter guarantees no ellipsis. Around 150 characters is the usual compromise.`,
        },
      ],
      faq: [
        {
          q: "Why measure pixels instead of characters?",
          a: "Google truncates on rendered width, not character count. A title full of capitals and wide letters gets cut well before 60 characters, while a narrow one can run longer. Counting characters gives false confidence.",
        },
        {
          q: "What are the actual limits?",
          a: "Roughly 580 pixels for the desktop title and about 920 for the description. Both differ on mobile, which is why the preview shows each separately.",
        },
        {
          q: "Will Google use my description?",
          a: "Not always. Google rewrites descriptions for a majority of queries when it thinks page content matches intent better. A good description still matters — it is what shows for brand and exact-match searches.",
        },
      ],
    },
  },
  {
    slug: "open-graph-generator",
    name: "Open Graph Tag Generator",
    category: "seo",
    tagline: "Build OG and Twitter Card tags with a social preview.",
    description:
      "Generate Open Graph and Twitter Card meta tags with a live preview of how your link will appear when shared on social platforms.",
    keywords: ["open graph generator", "og tags", "twitter card", "social meta tags"],
    content: {
      intro:
        "Build the Open Graph and Twitter Card tags that control how your link looks when someone shares it, with a preview of the resulting card. Getting these right is the difference between a rich image card and a bare blue link.",
      steps: [
        "Fill in the title, description, image URL and canonical URL.",
        "Check the preview for each platform.",
        "Copy the complete tag block into your head.",
      ],
      sections: [
        {
          heading: "Image requirements, and the ratio everyone gets wrong",
          body: `**1200 × 630 pixels** is the standard — a 1.91:1 ratio, which is what Facebook, LinkedIn and X all render as a large card.

Where it goes wrong:

- **Under 600 × 315** and most platforms fall back to a small square thumbnail, which is a dramatically weaker result.
- **Over 5 MB** and some crawlers skip the image entirely.
- **Relative URLs do not work.** A crawler fetching your page from outside has no base to resolve \`/og.png\` against. It must be absolute and publicly reachable.
- **Behind auth or a firewall** means the crawler gets a 403 and shows nothing. This is why staging sites never preview correctly.

**Safe area matters** because different platforms crop differently. Keep text away from the outer 10% — a title centred in the frame survives every crop; one near an edge does not.`,
        },
        {
          heading: "Why your preview will not update",
          body: `You fix the tags, reshare the link, and the old card still appears. This is almost always caching, not a mistake in your markup.

Every platform caches aggressively — for days in some cases — and none of them re-fetch just because you shared again.

**Force a refresh with the platform's own tool:**

- **Facebook** — Sharing Debugger, "Scrape Again"
- **LinkedIn** — Post Inspector
- **X** — historically the Card Validator; now generally refreshes on its own within a day
- **WhatsApp** uses Facebook's cache, so the Sharing Debugger clears it too

**Slack and Discord** cache per-workspace and are hard to flush. The reliable trick is to append a harmless query parameter — \`?v=2\` — which they treat as a new URL.

**Test before you publish widely.** A campaign link shared to thousands with a broken card cannot be fixed retroactively for anyone who already saw it.`,
        },
      ],
      faq: [
        {
          q: "What image size should I use?",
          a: "1200 by 630 pixels is the safe standard, giving a 1.91:1 ratio that works across platforms. Keep it under 5MB and use an absolute URL — relative paths do not resolve for crawlers.",
        },
        {
          q: "Do I need Twitter tags if I have Open Graph?",
          a: "Not strictly — X falls back to Open Graph when Twitter tags are missing. Add twitter:card if you want a large image card specifically, since the fallback often renders small.",
        },
        {
          q: "My preview is not updating when I share.",
          a: "Platforms cache aggressively. Use the relevant debugger — Facebook's Sharing Debugger or LinkedIn's Post Inspector — to force a re-scrape after changing tags.",
        },
      ],
    },
  },
  {
    slug: "schema-markup-generator",
    name: "Schema Markup Generator",
    category: "seo",
    tagline: "Generate JSON-LD structured data for common page types.",
    description:
      "Generate valid JSON-LD structured data for articles, products, FAQs, local businesses, events and breadcrumbs, ready to paste into your page.",
    keywords: ["schema markup generator", "json-ld generator", "structured data", "rich snippets"],
    content: {
      intro:
        "Fill in a form and get valid JSON-LD structured data for the page types that actually earn rich results — articles, products, FAQs, local businesses, events and breadcrumbs. Required fields are marked so you do not ship markup Google will reject.",
      steps: [
        "Pick the schema type that matches your page.",
        "Complete the fields, paying attention to the required ones.",
        "Copy the script tag into your page head.",
      ],
      sections: [
        {
          heading: "What structured data actually does",
          body: `Structured data does not improve your rankings. It makes a page *eligible* for rich results — star ratings, FAQ accordions, breadcrumb trails, recipe cards, event listings.

The effect is on click-through rate rather than position. A result occupying more space with more information tends to get clicked more, and that is the entire mechanism. Anyone promising rankings from schema markup is selling something.

**Eligible is not guaranteed.** Google decides per query whether to show a rich result, and it has repeatedly reduced which types qualify — FAQ rich results were significantly cut back in 2023 and now appear mainly for authoritative health and government sites.

**JSON-LD is the recommended format.** It sits in a \`<script>\` tag, separate from your markup, so it does not tangle with your HTML the way Microdata does. Google has stated a preference for it.

**Place it anywhere.** Head or body, Google reads both. The head is conventional.`,
        },
        {
          heading: "The rules that get markup rejected",
          body: `Structured data that contradicts the page is worse than none — it is a manual-action risk, not just a wasted effort.

**It must match visible content.** Marking up a 4.8-star rating that appears nowhere on the page is exactly what the spam policies prohibit. If a person cannot see it, do not mark it up.

**Required properties are genuinely required.** A Product without \`name\`, \`image\` and an \`offers\` block with price and currency is simply ignored. This tool marks required fields so you can see what is missing.

**Do not mark up other people's content.** Review markup is for reviews of *your* item on *your* page, not aggregated ratings you pulled from elsewhere.

**One primary type per page.** A page can carry Breadcrumbs plus its main type, but declaring it simultaneously an Article, a Product and a FAQPage confuses the parser and tends to yield nothing.

Always confirm with Google's Rich Results Test. Well-formed JSON-LD — which this produces — is necessary but not sufficient.`,
        },
      ],
      faq: [
        {
          q: "Where should the script go?",
          a: "Anywhere in the head or body — Google reads it from either. The head is conventional. Use a script tag with type set to application/ld+json, which this tool generates for you.",
        },
        {
          q: "Does structured data improve rankings?",
          a: "Not directly. It makes a page eligible for rich results — star ratings, FAQ accordions, breadcrumbs — which typically lift click-through rate. The ranking effect is indirect.",
        },
        {
          q: "How do I check it is valid?",
          a: "Run the output through Google's Rich Results Test and the Schema.org validator. This tool produces well-formed JSON-LD, but only Google can confirm eligibility for a given rich result.",
        },
      ],
    },
  },
  {
    slug: "robots-txt-generator",
    name: "Robots.txt Generator",
    category: "seo",
    tagline: "Build a robots.txt with per-crawler rules and sitemap entries.",
    description:
      "Build a valid robots.txt file with per-crawler allow and disallow rules, crawl delay and sitemap references, using presets for common platforms.",
    keywords: ["robots.txt generator", "robots txt", "crawler rules", "disallow"],
    content: {
      intro:
        "Assemble a robots.txt with rules per crawler, sitemap references and optional crawl delay. Presets cover the usual patterns — block nothing, block everything, or block the common CMS admin paths.",
      steps: [
        "Start from a preset or an empty file.",
        "Add allow and disallow rules, per user-agent if needed.",
        "Add your sitemap URL, then copy the file to your site root.",
      ],
      sections: [
        {
          heading: "Disallow does not mean noindex",
          body: `This is the single most misunderstood thing in technical SEO, and it causes real damage.

\`Disallow\` prevents **crawling**. It does not prevent **indexing**.

If another site links to a URL you have disallowed, Google can still index it — it just cannot see the content. You get a result in the search listing with your URL, no title worth reading, and the description "No information is available for this page."

Worse, because Google cannot crawl the page, it **cannot see a \`noindex\` tag on it either**. Blocking a page you want removed actively prevents the mechanism that would remove it.

**To keep a page out of the index:** allow crawling, and add \`<meta name="robots" content="noindex">\`. Once it has dropped out, you may then block crawling if you want to save crawl budget.

**Use robots.txt for:** crawl budget on large sites, keeping crawlers out of faceted-search URL explosions, and blocking infinite calendar pages.`,
        },
        {
          heading: "Syntax rules and the AI crawler question",
          body: `**The file must live at the domain root** — \`example.com/robots.txt\`. Nowhere else is read, and it applies per subdomain and per protocol, so \`blog.example.com\` needs its own.

**Only one group applies per crawler.** Googlebot finds the most specific \`User-agent\` block matching it and ignores every other group, including \`*\`. If you write a \`Googlebot\` block, it must repeat every rule you wanted to apply — they are not inherited.

**Order does not matter; specificity does.** For conflicting rules, the longest matching path wins, and \`Allow\` beats \`Disallow\` when equally specific.

**Wildcards are supported** by the major engines: \`*\` for any sequence, \`$\` to anchor the end. \`Disallow: /*.pdf$\` blocks PDFs.

**On AI crawlers** — \`GPTBot\`, \`CCBot\`, \`ClaudeBot\`, \`Google-Extended\` and others honour robots.txt, and blocking them is a genuine choice with a trade-off: less training use of your content, but also less visibility in AI answers that increasingly sit above search results. Decide deliberately rather than copying someone's block list.

**It is advisory.** Scrapers ignore it entirely, and the file publicly lists the paths you would rather people not visit. Never use it as a security control.`,
        },
      ],
      faq: [
        {
          q: "Does disallow remove a page from Google?",
          a: "No — and this is the most common robots.txt mistake. Disallow prevents crawling, but a blocked URL can still be indexed from external links, showing with no description. To remove a page, allow crawling and use a noindex meta tag.",
        },
        {
          q: "Where does the file go?",
          a: "The root of the domain, exactly at /robots.txt. Crawlers do not look anywhere else, and it applies per subdomain — a separate file is needed for each.",
        },
        {
          q: "Do all crawlers obey it?",
          a: "The major search engines do. It is a voluntary convention, so scrapers and malicious bots routinely ignore it. Never use it to protect sensitive paths — it advertises them.",
        },
      ],
    },
  },
  {
    slug: "utm-link-builder",
    name: "UTM Link Builder",
    category: "seo",
    tagline: "Build tagged campaign URLs with consistent parameters.",
    description:
      "Build campaign URLs with UTM parameters for analytics tracking, with presets for common channels and lowercase normalisation to avoid split reporting.",
    keywords: ["utm builder", "utm link generator", "campaign url builder", "utm parameters"],
    content: {
      intro:
        "Assemble a tracking URL with the five UTM parameters, using channel presets so your naming stays consistent. Values are normalised to lowercase by default, which prevents the split reporting that happens when Facebook and facebook become separate sources.",
      steps: [
        "Paste your destination URL.",
        "Fill in source, medium and campaign — the three that matter most.",
        "Copy the tagged URL, or build several at once for different channels.",
      ],
      sections: [
        {
          heading: "What each parameter is for",
          body: `Five parameters, three of which actually matter.

- **\`utm_source\`** — the specific origin. \`newsletter\`, \`google\`, \`partner-name\`.
- **\`utm_medium\`** — the channel type. \`email\`, \`cpc\`, \`social\`, \`affiliate\`.
- **\`utm_campaign\`** — the initiative. \`spring-launch-2026\`.
- **\`utm_term\`** — the paid keyword. Rarely used outside search ads.
- **\`utm_content\`** — distinguishes variants within a campaign: which button, which A/B arm.

**Medium is the one people get wrong.** Analytics platforms group channels by medium, and unrecognised values fall into "Other" where they are effectively invisible. Stick to the standard set — \`email\`, \`cpc\`, \`social\`, \`referral\`, \`affiliate\`, \`display\` — rather than inventing \`newsletter-email\` or \`facebook-post\`.

Source answers "where exactly", medium answers "what kind of channel". Getting that split right is what makes reports readable six months later.`,
        },
        {
          heading: "Two mistakes that corrupt your reporting",
          body: `**Never tag internal links.** This is the big one. UTM parameters start a *new* session in most analytics platforms, overwriting the original attribution. Tag a link on your own homepage and a visitor who arrived from Google is suddenly attributed to your internal campaign — the real acquisition source is erased. Use internal link tracking or event parameters instead.

**Casing is significant.** \`Email\`, \`email\` and \`EMAIL\` are three separate mediums in most platforms, and your traffic silently splits across all of them. Lowercase everything, always — this tool does it by default. The same goes for spaces, which encode as \`%20\` and make an ugly mess of reports; use hyphens.

**Two related habits worth adopting:**

- **Keep a spreadsheet** of every tagged URL. Without one, naming drifts within weeks and nobody can reconstruct what a campaign was called.
- **Remember UTMs are public.** They appear in the address bar, get copied into forums and shared in messages. Never encode anything you would not want a customer to read, and expect some "email" traffic to actually be someone pasting your newsletter link to a friend.`,
        },
      ],
      faq: [
        {
          q: "Which parameters are required?",
          a: "Source, medium and campaign are the meaningful three. Term and content are optional, used for paid keywords and A/B variants respectively.",
        },
        {
          q: "Why does casing matter?",
          a: "UTM values are case sensitive in most analytics platforms, so Email and email report as two separate mediums and split your numbers. Sticking to lowercase avoids the problem entirely.",
        },
        {
          q: "Should I tag internal links?",
          a: "No. UTM parameters on internal links restart the session attribution, overwriting the original source and corrupting your reporting. Use them only on inbound links from outside your site.",
        },
      ],
    },
  },
  {
    slug: "keyword-density-checker",
    name: "Keyword Density Checker",
    category: "seo",
    tagline: "Analyse term frequency and spot over-optimisation.",
    description:
      "Analyse keyword frequency and density in your copy, including two and three word phrases, with stop words filtered out and stuffing flagged.",
    keywords: ["keyword density", "keyword frequency", "seo content analysis", "keyword checker"],
    content: {
      intro:
        "Paste your copy to see which terms actually dominate it, including two and three word phrases. Common stop words are filtered so the list reflects real subject matter, and anything repeated to an unnatural degree is flagged.",
      steps: [
        "Paste the page copy you want to analyse.",
        "Review single words alongside two and three word phrases.",
        "Check nothing is repeated so often that it reads as stuffing.",
      ],
      sections: [
        {
          heading: "There is no correct density",
          body: `Keyword density was a real ranking factor around 2005, when search engines largely counted term frequency. It has not been one for a long time, and chasing a target percentage now produces worse copy and no benefit.

Modern ranking uses semantic analysis. Engines recognise that "running shoes", "trainers", "footwear for runners" and "sneakers" are related concepts, and they evaluate whether a page comprehensively covers a topic — not whether it repeats a phrase a set number of times.

**So what is this tool for?** Diagnosis, not optimisation.

It is genuinely useful for:

- **Catching accidental repetition.** Writers fall into phrases without noticing. Seeing a term at 6% is a prompt to reread.
- **Checking you are on topic at all.** If the top terms are not what the page is about, that is worth knowing.
- **Spotting AI-generated repetition.** Generated copy often loops the same phrase far more than a human would.
- **Auditing inherited content.** Pages written to a 2012 SEO brief are often visibly stuffed.

Read the list, then read the copy aloud. Your ear is the better instrument.`,
        },
        {
          heading: "What phrases tell you that single words do not",
          body: `Single-word counts are noisy. "Running" appearing 15 times could be a page about running shoes, running a business, or running a marathon.

Two- and three-word phrases carry the actual topic, which is why they are shown separately. They also map better to how people search — the majority of queries are multi-word, and long-tail phrases convert far better than head terms.

**Stop words are filtered by default** so the list reflects subject matter rather than grammar. The filter is applied differently by phrase length: single stop words are dropped entirely, but a phrase is only dropped if *every* word in it is a stop word — otherwise "state of the art" and "out of stock" would disappear, and those are exactly the phrases worth seeing.

**What to do with the output.** If your target phrase appears once in 800 words, the page probably is not about what you think it is. If it appears thirty times, it reads like spam. Somewhere in between, stop measuring and go improve the substance.`,
        },
      ],
      faq: [
        {
          q: "What density should I target?",
          a: "There is no magic number, and chasing one is a mistake. Modern search engines use semantic analysis, not term counting. Write naturally; use this to catch accidental over-repetition, not to hit a quota.",
        },
        {
          q: "What counts as keyword stuffing?",
          a: "Repetition that stops the copy reading naturally — the same phrase forced in several times per paragraph. If it sounds awkward when read aloud, it is stuffing, whatever the percentage says.",
        },
        {
          q: "Is my unpublished copy safe here?",
          a: "Yes. The analysis runs in your browser, so draft articles and client copy are never uploaded or added to any index.",
        },
      ],
    },
  },
  {
    slug: "readability-checker",
    name: "Readability Checker",
    category: "seo",
    tagline: "Score your writing and highlight hard sentences inline.",
    description:
      "Score your text with Flesch-Kincaid and other readability formulas, with long sentences, passive voice and complex words highlighted directly in the copy.",
    keywords: ["readability checker", "flesch kincaid", "readability score", "reading level"],
    content: {
      intro:
        "Get a reading-ease score alongside the thing that actually helps: your text with the problems marked in place. Long sentences, passive constructions and needlessly complex words are highlighted where they occur, so you can see what to fix rather than reading a summary of it.",
      steps: [
        "Paste your article or page copy.",
        "Read the scores, then look at the highlighted text itself.",
        "Rewrite the flagged sentences and watch the score move.",
      ],
      sections: [
        {
          heading: "What the scores mean",
          body: `Several formulas are shown because each weights different things, and agreement between them is more informative than any single number.

**Flesch Reading Ease** runs 0–100, higher being easier. It weights sentence length and syllables per word:

| Score | Level | Suits |
| --- | --- | --- |
| 90–100 | 5th grade | Very easy |
| 60–70 | 8th–9th grade | **General web copy** |
| 30–50 | College | Technical documentation |
| 0–30 | Graduate | Academic, legal |

**Flesch–Kincaid Grade** converts the same inputs to a US school grade level.

**Gunning Fog** counts words of three or more syllables specifically, so it is harsher on jargon.

**Coleman–Liau** uses characters rather than syllables, which makes it more reliable on text where syllable estimation is shaky — technical terms, product names.

Aim for 60–70 for most web content. Below 30, you are writing for specialists whether you meant to or not.`,
        },
        {
          heading: "Why the highlighting matters more than the score",
          body: `A score tells you there is a problem. The highlighting tells you where it is, which is the part you can act on.

**Long sentences** are marked above 25 words and flagged harder above 35. Long is not automatically bad — variation in sentence length is what makes prose readable — but three consecutive 40-word sentences will lose people regardless of how good the content is.

**Passive voice** is marked, not condemned. "The server was restarted" is the right choice when who restarted it is irrelevant or unknown. It becomes a problem when it is the default, because it removes the actor from every sentence and makes writing feel evasive.

**Complex words** — three or more syllables — are underlined. Many are unavoidable and correct. The question is whether a shorter word would do: "use" for "utilise", "help" for "facilitate", "about" for "approximately".

**The formulas are blunt instruments.** They count syllables and sentence lengths; they cannot tell whether an idea is clearly explained. A page of short sentences full of unexplained jargon scores well and reads terribly. Use the score to find suspects, then use judgement.`,
        },
      ],
      faq: [
        {
          q: "What score should I aim for?",
          a: "Flesch Reading Ease of 60 to 70 suits general web copy, roughly an eighth to ninth grade level. Technical documentation can sit lower; consumer content should aim higher.",
        },
        {
          q: "Is passive voice always wrong?",
          a: "No. It is the right choice when the actor is unknown or irrelevant. It is flagged so you can make a deliberate decision, not because every instance needs removing.",
        },
        {
          q: "Is my writing stored or analysed remotely?",
          a: "Neither. Scoring and highlighting happen in your browser as you type, so unpublished drafts stay on your device and nothing is sent for processing.",
        },
      ],
    },
  },
  {
    slug: "word-counter",
    name: "Word & Character Counter",
    category: "seo",
    tagline: "Count words, characters, sentences and reading time live.",
    description:
      "Count words, characters, sentences and paragraphs as you type, with reading time and per-platform character limits for social posts and meta tags.",
    keywords: ["word counter", "character counter", "word count tool", "reading time"],
    content: {
      intro:
        "Live counts for words, characters, sentences and paragraphs, with estimated reading and speaking time. Character limits for the platforms people actually write against — meta descriptions, X posts, SMS — are tracked alongside.",
      steps: [
        "Paste or type your text.",
        "Watch the counts update as you write.",
        "Check the platform limits if you are writing to a specific one.",
      ],
      sections: [
        {
          heading: "The limits that actually bite",
          body: `Different platforms count differently, and the surprises are worth knowing before you hit publish.

**Meta title** — around 60 characters, but really 580 pixels. Wide characters are cut earlier.

**Meta description** — around 155 characters, and Google rewrites it most of the time anyway.

**X / Twitter** — 280 characters, but URLs always count as 23 regardless of actual length, and emoji frequently count as two.

**SMS** — 160 characters for a single message. One non-GSM character — a curly quote, an emoji, an em dash — switches the whole message to UCS-2 encoding and drops the limit to **70**. This is why a message that looks fine costs triple to send.

**Instagram** — 2,200 characters, truncated in the feed after roughly 125.

**LinkedIn** — 3,000 characters, with a "see more" cut at about 210.

The counter shows characters with and without spaces. Nearly every platform counts spaces, so that is the figure to watch.`,
        },
        {
          heading: "How long should it actually be?",
          body: `Word count is not a ranking factor. Longer articles correlate with better rankings because thorough content tends to be longer — not because length itself helps. Padding a 600-word answer to 2,000 words makes it worse.

That said, useful reference points:

- **Meta description** — 20–25 words
- **Product description** — 100–200 words
- **Blog post** — 800–1,500 words for most topics
- **Comprehensive guide** — 2,000–4,000, but only if there is genuinely that much to say
- **Landing page** — whatever it takes; the rule is that every paragraph earns its place

**Reading time** here uses 238 words per minute, the measured average for silent adult reading of general text. Technical content is read more slowly; fiction more quickly. Speaking time uses 150 wpm, a typical presentation pace — useful for scripting a video or a talk.

The honest test is whether a reader could skip any paragraph without losing something. If they could, cut it.`,
        },
      ],
      faq: [
        {
          q: "Are characters counted with or without spaces?",
          a: "Both are shown. Spaces count toward most platform limits, including meta descriptions and social posts, so that figure is usually the one that matters.",
        },
        {
          q: "How is reading time calculated?",
          a: "At 238 words per minute, the average for silent adult reading of general text. Speaking time uses 150, which is a typical presentation pace.",
        },
        {
          q: "Is my text saved between visits?",
          a: "No. Counting happens live in the page and nothing is written to storage or sent anywhere, so closing the tab discards the text entirely.",
        },
      ],
    },
  },
  {
    slug: "hashtag-generator",
    name: "Hashtag Generator",
    category: "seo",
    tagline: "Turn keywords into formatted hashtags for each platform.",
    description:
      "Turn keywords or a block of text into properly formatted hashtags, with per-platform count guidance and camel-case for accessibility.",
    keywords: ["hashtag generator", "hashtags", "instagram hashtags", "social media tags"],
    content: {
      intro:
        "Convert keywords — or a whole caption — into correctly formatted hashtags. Multi-word tags are camel-cased so screen readers announce them properly, and per-platform guidance keeps you from posting thirty tags where three belong.",
      steps: [
        "Enter keywords, or paste a caption to extract terms from.",
        "Pick the platform you are posting to.",
        "Copy the formatted set.",
      ],
      sections: [
        {
          heading: "How many hashtags per platform",
          body: `Recommended counts differ far more than people assume, and using Instagram habits on LinkedIn looks like spam.

| Platform | Use | Maximum |
| --- | --- | --- |
| Instagram | 3–5 | 30 |
| X / Twitter | 1–2 | — |
| LinkedIn | 3–5 | — |
| TikTok | 3–6 | — |
| Facebook | 1–2 | — |

**Instagram's own guidance changed.** For years the advice was to use all thirty. Instagram has since stated that a small number of highly relevant tags performs better, and that stuffing tags does not help distribution.

**On X, hashtags reduce reach** past one or two. They read as promotional and the algorithm treats them accordingly.

**Facebook barely uses them at all.** They are functional but almost nobody browses by tag.

**Specific beats popular.** A tag with 500 million posts buries you instantly. One with 10,000–500,000 posts is where a small account is actually discoverable.`,
        },
        {
          heading: "Why camel case is an accessibility issue",
          body: `Screen readers pronounce hashtags by attempting to parse the run of characters. Given \`#socialmediamarketing\` they produce an unintelligible string. Given \`#SocialMediaMarketing\` they read three clear words.

This is not a minor nicety. It is the difference between a caption that a blind user can follow and one that reads as noise, and capitalising costs nothing — hashtags are case-insensitive for matching, so \`#SocialMedia\` and \`#socialmedia\` reach exactly the same feed.

Both Instagram and X have recommended camel case for this reason.

**It also prevents the classic misreadings** that come from running words together. \`#therapist\`, \`#expertsexchange\` and \`#nowthatcherisdead\` are all real examples of tags that parsed very differently than intended.

**Other formatting rules:** no spaces or punctuation, cannot be only numbers, and emoji technically work but break search for most people. This tool camel-cases multi-word tags by default and strips anything invalid.`,
        },
      ],
      faq: [
        {
          q: "How many hashtags should I use?",
          a: "It varies sharply by platform: three to five on Instagram, one or two on X, three to five on LinkedIn, and three to six on TikTok. More is not better — relevance beats volume everywhere.",
        },
        {
          q: "Why camel case?",
          a: "Because screen readers announce #SocialMediaTips correctly but read #socialmediatips as one run-on string. Capitalising each word is an accessibility improvement that costs nothing.",
        },
        {
          q: "Is my caption sent anywhere?",
          a: "No. Keywords are formatted locally in your browser, so unpublished campaign copy is never transmitted.",
        },
      ],
    },
  },
  {
    slug: "slug-generator",
    name: "URL Slug Generator",
    category: "seo",
    tagline: "Turn titles into clean, URL-safe slugs.",
    description:
      "Convert titles into clean URL slugs, with accented characters transliterated, stop words optionally removed and separators configurable.",
    keywords: ["slug generator", "url slug", "permalink generator", "seo friendly url"],
    content: {
      intro:
        "Turn a headline into a clean, lowercase, URL-safe slug. Accented characters are transliterated to ASCII rather than percent-encoded into noise, and stop words can be stripped to keep the result short.",
      steps: [
        "Paste your page title or headline.",
        "Choose a separator and whether to drop stop words.",
        "Copy the slug.",
      ],
      sections: [
        {
          heading: "Hyphens, not underscores",
          body: `This one has a definitive answer rather than a stylistic one. Google treats a hyphen as a word separator and an underscore as a word joiner.

    /my_blog_post   ->  read as "myblogpost"
    /my-blog-post   ->  read as "my blog post"

Matt Cutts confirmed this years ago and it has not changed. Underscores in URLs mean the individual words are not recognised as separate terms.

**Other rules worth following:**

- **Lowercase always.** URLs are case-sensitive on most servers, so \`/About\` and \`/about\` are two pages — duplicate content, split signals.
- **No spaces.** They become \`%20\`, which is ugly and breaks when copied into plain text.
- **ASCII only.** Accented characters percent-encode into unreadable noise, which is why this tool transliterates \`café\` to \`cafe\` rather than encoding it.
- **Short.** Three to five meaningful words. Long slugs get truncated in search results and are miserable to share.`,
        },
        {
          heading: "Stop words and the cost of changing a slug",
          body: `**Removing stop words** — the, a, of, and — usually makes a slug tighter without losing meaning: \`/the-best-guide-to-running\` becomes \`/best-guide-running\`.

But not always. Dropping them can produce nonsense or change the meaning entirely: \`/the-who\` becomes \`/who\`, \`/how-to-be-happy\` becomes \`/happy\`. The option is off by default here for that reason — check the output rather than applying it blindly.

**Changing an existing slug is expensive.** A URL that has been live accumulates links, bookmarks, shares and accrued ranking signals. Changing it throws that away unless you handle it properly:

1. Set up a **301 redirect** from old to new — permanent, so signals transfer
2. Update internal links to point at the new URL directly, rather than relying on the redirect
3. Keep the redirect **indefinitely**; external links will keep arriving for years
4. Resubmit the sitemap

A 302 is a temporary redirect and does not pass the same signals — using one by mistake is a common and costly error.

Given all that, get the slug right at publication and then leave it alone. Fixing a typo in a slug is rarely worth the churn.`,
        },
      ],
      faq: [
        {
          q: "Hyphens or underscores?",
          a: "Hyphens. Google treats a hyphen as a word separator and an underscore as a word joiner, so my_blog_post reads as one token while my-blog-post reads as three words.",
        },
        {
          q: "Should I remove stop words?",
          a: "Usually yes, for brevity — but not when they change the meaning. Dropping them from a phrase like the-who or how-to-be turns it into nonsense, so check the result rather than applying it blindly.",
        },
        {
          q: "Are the titles I paste recorded?",
          a: "No. Slug generation is a local string transformation, so unpublished headlines and planned URLs stay private.",
        },
      ],
    },
  },

  // -------------------------------------------------------------------- bulk
  {
    slug: "image-compressor",
    name: "Bulk Image Compressor",
    category: "bulk",
    tagline: "Compress and resize many images at once, entirely offline.",
    description:
      "Compress and resize up to 50 images at once in your browser. Adjust quality, cap dimensions, and download everything as a zip. No uploads.",
    keywords: ["image compressor", "bulk image resize", "compress images", "reduce image size"],
    content: {
      intro:
        "Drop in a batch of images, set a quality level and a maximum width, and get them all back compressed — as a zip if there are several. Every image is processed by your own browser, so nothing is uploaded and there is no file-count limit imposed by a server.",
      steps: [
        "Drag in your images, or click to browse.",
        "Set the quality and an optional maximum width or height.",
        "Download them individually, or all at once as a zip.",
      ],
      sections: [
        {
          heading: "Choosing a quality setting",
          body: `Quality is a 0–100 scale, and the useful range is narrower than it looks.

| Setting | Result |
| --- | --- |
| 90–100 | Much larger files, no visible gain over 85 |
| **75–85** | **The sweet spot for photographs** |
| 60–75 | Fine for thumbnails and backgrounds |
| Below 60 | Visible artefacts on most images |

At 80, photographs typically shrink 40–80% with no difference you can see at normal viewing size.

**Flat graphics behave differently.** Screenshots, logos, diagrams and line art have hard edges, and lossy compression produces visible ringing around them. These often compress *better* as PNG, and look far worse as JPEG at any setting. Compress photographs; leave interface screenshots as PNG.

**Resizing saves more than quality does.** A 4000px-wide photo displayed in a 800px column is carrying 25 times more pixels than it needs. Capping the width is almost always the bigger win — drop the max width first, then tune quality.`,
        },
        {
          heading: "What happens to your originals and metadata",
          body: `**Compression is permanent.** JPEG and WebP discard information to save space, and re-encoding an already-compressed image compounds the loss. Always keep your originals somewhere — the tool never modifies the files you drop in, but once you have replaced them on disk there is no undo.

**Re-compressing repeatedly degrades images.** Each pass throws away more detail. If you need a different size later, go back to the original rather than resizing the compressed copy.

**EXIF metadata is dropped.** Canvas gives back pixels, not metadata, so camera settings, copyright tags, and GPS coordinates do not survive. For web use this is usually a feature — publishing a photo with home coordinates embedded is a real privacy problem. For an archive or anything needing provenance, it is a loss, so keep originals.

**Orientation is applied, not lost.** Phone photos often store a rotation flag rather than rotating the pixels. The browser applies it during decoding, so the output is correctly oriented with the flag no longer needed.`,
        },
      ],
      faq: [
        {
          q: "How much smaller will my images get?",
          a: "Typically 40 to 80 percent for photographs at quality 80, often with no visible difference. Screenshots and flat graphics compress less well as JPEG or WebP — for those, consider keeping PNG.",
        },
        {
          q: "Is quality loss reversible?",
          a: "No. JPEG and WebP compression discards data permanently, so always keep your originals. The preview lets you compare before committing.",
        },
        {
          q: "How many images can I process?",
          a: "As many as your device's memory allows — 50 at a time is comfortable on most machines. Since processing is local, there is no upload limit or queue.",
        },
      ],
    },
  },
  {
    slug: "image-converter",
    name: "Bulk Image Converter",
    category: "bulk",
    tagline: "Convert images between PNG, JPEG, WebP and AVIF in batches.",
    description:
      "Convert batches of images between PNG, JPEG, WebP and AVIF in your browser. Set quality per format and download the whole set as a zip.",
    keywords: ["image converter", "png to webp", "convert to avif", "bulk image format"],
    content: {
      intro:
        "Convert a whole folder of images to a different format at once. WebP and AVIF typically cut file size substantially against JPEG at matching quality, which is usually the quickest page-speed win available on an image-heavy site.",
      steps: [
        "Drop in the images you want to convert.",
        "Pick the output format and quality.",
        "Download the converted set as a zip.",
      ],
      sections: [
        {
          heading: "WebP, AVIF or JPEG",
          body: `**WebP** is the default worth picking. Roughly 25–35% smaller than JPEG at matching visual quality, supported by every current browser, and it keeps transparency and animation.

**AVIF** compresses harder still — often 20–30% below WebP — and handles gradients and flat colour particularly well, avoiding the banding JPEG produces in skies. The costs are real: encoding is markedly slower, and support, while now broad, is younger.

**JPEG** remains the maximum-compatibility option. No transparency, no animation, but it opens everywhere including old software and print workflows.

**PNG** is lossless. Larger for photographs, but the right answer for screenshots, logos, line art and anything needing a hard alpha edge.

**A practical approach** is to serve modern formats with a fallback, letting the browser choose:

    <picture>
      <source srcset="hero.avif" type="image/avif">
      <source srcset="hero.webp" type="image/webp">
      <img src="hero.jpg" alt="...">
    </picture>`,
        },
        {
          heading: "The silent PNG fallback",
          body: `\`canvas.toBlob()\` has a trap worth knowing about if you ever build something like this yourself.

Ask for a format the browser cannot encode and it does not throw an error. It silently produces a **PNG** instead. You get a file named \`photo.avif\` that is actually a PNG, is larger than the JPEG you started with, and fails to display anywhere expecting AVIF.

This tool probes support on load by encoding a 1×1 canvas and checking the returned MIME type matches what was requested. Unsupported formats are disabled in the dropdown rather than producing mislabelled files.

**Converting to JPEG flattens transparency.** JPEG has no alpha channel, so transparent areas are composited onto white. If you need transparency, the target must be PNG, WebP or AVIF.

**Converting between lossy formats compounds loss.** JPEG to WebP decodes the JPEG — artefacts included — and re-encodes them. Always convert from the highest-quality original you have, not from an already-compressed copy.`,
        },
      ],
      faq: [
        {
          q: "WebP or AVIF?",
          a: "AVIF compresses better — often 20 to 30 percent smaller than WebP — but encodes more slowly and has slightly narrower support. WebP is the safer default; AVIF is worth it for large hero images.",
        },
        {
          q: "Will transparency be preserved?",
          a: "Converting to PNG, WebP or AVIF keeps the alpha channel. Converting to JPEG does not — JPEG has no transparency, so transparent areas are flattened onto a white background.",
        },
        {
          q: "Does my browser support AVIF encoding?",
          a: "Most current browsers do. If yours cannot encode AVIF, the option is disabled automatically rather than producing a broken file.",
        },
      ],
    },
  },
  {
    slug: "favicon-generator",
    name: "Favicon Generator",
    category: "bulk",
    tagline: "Turn one image into every favicon size, plus the HTML.",
    description:
      "Generate a complete favicon set from a single image — every PNG size, apple-touch-icon and web manifest — downloadable as a zip with the HTML to paste.",
    keywords: ["favicon generator", "favicon maker", "apple touch icon", "site icons"],
    content: {
      intro:
        "Upload one square image and get the full set of icons a modern site needs — every PNG size, the Apple touch icon and a web app manifest — bundled into a zip, along with the exact HTML to paste into your head.",
      steps: [
        "Upload a square image, ideally 512 by 512 or larger.",
        "Preview the generated sizes and set a background colour if you want one.",
        "Download the zip and copy the HTML snippet.",
      ],
      sections: [
        {
          heading: "Designing for 16 pixels",
          body: `A favicon is often rendered at 16×16. That is 256 pixels total, and almost nothing survives at that size.

**What does not work:**

- Text of any kind, including a single letter in a detailed typeface
- Fine lines — they disappear or alias into grey mush
- Gradients and shadows — they become noise
- A detailed logo scaled down

**What does work:** one bold shape, two or three high-contrast colours, and generous internal spacing. Many strong favicons are a single letter in a heavy weight, or one simplified element lifted from a larger logo.

**Design at 16px first, then scale up.** Almost everyone does the reverse — shrinking a full logo — and discovers at the end that it is unreadable. Working the other way forces the right decisions.

**Test against both themes.** Browser tab bars are light or dark depending on the user's settings. A dark logo on a transparent background vanishes in dark mode; the "fill transparency" option here is how you avoid that.`,
        },
        {
          heading: "What each file is for",
          body: `The set generated here covers what a modern site actually needs.

- **favicon-16x16.png / 32x32** — browser tabs, standard and retina
- **favicon-48x48** — Windows desktop shortcuts
- **favicon-96x96** — Google TV and some Android surfaces
- **apple-touch-icon.png (180×180)** — iOS home screen. iOS ignores transparency and composites onto black, so give this one a background
- **android-chrome-192x192 / 512x512** — Android home screen and PWA splash
- **site.webmanifest** — tells Android which icons to use, plus theme colours

**Do you still need a .ico file?** Almost certainly not. Every browser released in the last decade reads PNG favicons. The \`.ico\` format persists only for very old Internet Explorer, which is why this tool produces PNGs and a manifest instead.

**Put everything in your site root** and paste the generated link tags into your \`<head>\`. The manifest path in the snippet assumes the root — adjust it if you put the files in a subfolder.`,
        },
      ],
      faq: [
        {
          q: "What source image should I use?",
          a: "Square, at least 512 by 512, with simple bold shapes. Fine detail and small text disappear entirely at 16 pixels, so design for the smallest size rather than shrinking a detailed logo.",
        },
        {
          q: "Do I still need an .ico file?",
          a: "Rarely. Every current browser reads PNG favicons. An .ico is only needed for very old Internet Explorer versions, which is why this tool produces PNGs and a manifest instead.",
        },
        {
          q: "Where do the files go?",
          a: "The root of your site, alongside index.html, then paste the generated link tags into your head. The manifest path in the snippet assumes the root — adjust it if you put them in a subfolder.",
        },
      ],
    },
  },
  {
    slug: "bulk-qr-generator",
    name: "Bulk QR Code Generator",
    category: "bulk",
    tagline: "Generate hundreds of QR codes from a list and download as a zip.",
    description:
      "Paste a list of URLs or text and generate a QR code for each, named from your input and downloadable as a single zip archive.",
    keywords: ["bulk qr code", "batch qr generator", "multiple qr codes", "qr code zip"],
    content: {
      intro:
        "Paste a list — one entry per line, or a CSV with names — and get a QR code for every row, downloadable as a single zip with sensible filenames. Built for the cases where generating codes one at a time stops being reasonable.",
      steps: [
        "Paste your list, one URL or text value per line.",
        "Optionally add a comma and a filename for each row.",
        "Generate, preview the grid, then download the zip.",
      ],
      sections: [
        {
          heading: "Input format and filenames",
          body: `One value per line. Optionally add a comma and a filename:

    https://example.com/product/1, blue-widget
    https://example.com/product/2, red-widget
    https://example.com/menu
    Table 12 — scan to order

**Filenames come from the second column** where you supply one. Without it, the name is derived from the content itself, sanitised for the filesystem, falling back to a numbered sequence.

**The comma is only treated as a separator** when what follows looks like a filename — no spaces, not a URL. That means a line like \`Table 12, scan to order\` is kept whole as content rather than being split, which is usually what you want.

**Duplicates are numbered automatically** — two entries producing \`menu.png\` become \`menu.png\` and \`menu-2.png\`, so nothing is silently overwritten inside the zip.

Content is not limited to URLs. Plain text, phone numbers and WiFi strings all encode fine; a URL is just the common case.`,
        },
        {
          heading: "Printing a batch",
          body: `Codes generated for print have different requirements from ones displayed on screen.

**Use SVG for anything printed.** It is vector, so it stays razor-sharp at any physical size. A PNG sized for screen will look soft or blocky on a poster or a table card.

**Minimum physical size** is about 2 × 2 cm for a code scanned at normal phone distance. Longer content means a denser grid, which raises that minimum — a long URL on a small sticker will not scan. Shorten URLs before generating rather than after.

**Keep the quiet zone.** The blank margin around the code is part of the specification, four modules wide. Designers crop it constantly to save space, and it is the single most common reason a printed code fails to scan.

**Contrast and colour.** Dark on light, always. Inverting it — light code on a dark background — fails on many scanners. If you must use brand colours, keep the code itself dark and the background pale, and test on both iOS and Android before committing to a print run.

**Test the actual printed article,** not the screen preview. Paper stock, ink bleed and lamination all affect scanning, and a thousand unusable flyers is an expensive way to learn that.`,
        },
      ],
      faq: [
        {
          q: "How many codes can I generate at once?",
          a: "Several hundred comfortably. Everything is rendered locally, so the limit is your device's memory and patience rather than a server quota.",
        },
        {
          q: "How are the files named?",
          a: "From the second column if you supply one, otherwise from a sanitised version of the content itself, falling back to a numbered sequence. Names are deduplicated automatically.",
        },
        {
          q: "Can I customise the appearance?",
          a: "Size, colours and error correction apply to the whole batch, keeping the set visually consistent. For a one-off custom code, use the single QR code generator instead.",
        },
      ],
    },
  },
];

/* --------------------------------------------------------------- accessors */

export const TOOL_COUNT = TOOLS.length;

export function getTool(slug: string): Tool | undefined {
  return TOOLS.find((tool) => tool.slug === slug);
}

export function toolsByCategory(category: ToolCategory): Tool[] {
  return TOOLS.filter((tool) => tool.category === category);
}

/** Other tools in the same category, for the "related tools" rail. */
export function relatedTools(slug: string, limit = 4): Tool[] {
  const tool = getTool(slug);
  if (!tool) return [];
  return TOOLS.filter((t) => t.category === tool.category && t.slug !== slug).slice(0, limit);
}

export const CATEGORY_ORDER: ToolCategory[] = ["developer", "seo", "bulk"];
