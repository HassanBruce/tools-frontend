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

export interface ToolContent {
  /** Paragraph rendered under the tool. */
  intro: string;
  /** "How to use" list. */
  steps: string[];
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

/** Shared boilerplate so every tool answers the two questions users actually ask. */
const privacyFaq: ToolFaq = {
  q: "Is my data uploaded anywhere?",
  a: "No. This tool runs entirely in your browser using JavaScript. Nothing you paste or upload leaves your device, and there is no server to log it.",
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
      faq: [
        {
          q: "Why does my JSON fail to validate?",
          a: "The most common causes are trailing commas, single quotes instead of double quotes, and unquoted object keys. All three are valid JavaScript but invalid JSON. The error message points at the offending line and column.",
        },
        {
          q: "Can it handle very large files?",
          a: "Yes, within your browser's memory. Documents of a few megabytes format instantly; extremely large files may take a moment since parsing happens on the main thread.",
        },
        privacyFaq,
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
      faq: [
        {
          q: "How are nested objects handled?",
          a: 'Nested keys are flattened with dots, so {"user":{"name":"Ada"}} becomes a column named user.name. Arrays of primitives are joined with a pipe character.',
        },
        {
          q: "What about commas and quotes inside values?",
          a: "Any value containing a comma, double quote or newline is wrapped in double quotes, and inner quotes are escaped by doubling them, per RFC 4180.",
        },
        privacyFaq,
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
      faq: [
        {
          q: "Which YAML version is supported?",
          a: "YAML 1.2 core schema, including anchors, aliases, multi-line block scalars and multiple documents separated by ---.",
        },
        {
          q: "Why did my YAML comments disappear?",
          a: "JSON has no comment syntax, so comments cannot survive the round trip. Converting back to YAML produces a clean document without the original comments.",
        },
        privacyFaq,
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
      faq: [
        {
          q: "Does it validate against a schema?",
          a: "No. It checks that the document is well-formed — tags balanced and properly nested — but does not validate against a DTD or XSD.",
        },
        {
          q: "Will it preserve CDATA sections and comments?",
          a: "Yes. CDATA blocks, comments and processing instructions are kept intact and re-indented along with the rest of the document.",
        },
        privacyFaq,
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
      faq: [
        {
          q: "What is URL-safe Base64?",
          a: "It replaces + with - and / with _, and usually drops the = padding, so the result can sit in a URL or filename without escaping. JWTs use this variant.",
        },
        {
          q: "Why do other tools break my emoji?",
          a: "Naive implementations call btoa() directly, which only accepts Latin-1. This tool encodes to UTF-8 bytes first, so any character round-trips correctly.",
        },
        privacyFaq,
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
      faq: [
        {
          q: "What is the difference between the two modes?",
          a: "Full URL keeps characters like : / ? & = intact so a whole address stays valid. Component escapes them too, which is what you want when embedding a value inside a query parameter.",
        },
        {
          q: "Why does a space become %20 and sometimes +?",
          a: "Percent-encoding uses %20. The + convention comes from HTML form submissions. This tool produces %20, which is valid everywhere.",
        },
        privacyFaq,
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
      faq: [
        {
          q: "Does this verify the signature?",
          a: "No, and deliberately so — verifying would mean sending your secret or public key somewhere. This tool only decodes. Never trust an unverified token in production code.",
        },
        {
          q: "Is it safe to paste a real token here?",
          a: "The decoding happens entirely in your browser and nothing is transmitted. That said, a JWT is a live credential until it expires, so treat it the way you would treat a password.",
        },
        privacyFaq,
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
      faq: [
        {
          q: "When should I use v7 instead of v4?",
          a: "Use v7 for database primary keys. Because the first bytes encode a timestamp, new rows append to the end of the index instead of scattering across it, which avoids the page-split churn random v4 keys cause.",
        },
        {
          q: "Are these actually random?",
          a: "Yes. They come from crypto.getRandomValues(), the same cryptographically secure source used for key generation — not Math.random().",
        },
        privacyFaq,
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
      faq: [
        {
          q: "Which regex flavour is this?",
          a: "JavaScript's, as implemented by your browser. Lookbehind, named capture groups and Unicode property escapes all work. Patterns from PCRE, Python or Go may need small adjustments.",
        },
        {
          q: "Why does my pattern hang the page?",
          a: "Nested quantifiers such as (a+)+ can backtrack catastrophically on non-matching input. Matching is capped to protect the tab, but the fix is to rewrite the pattern to avoid ambiguous repetition.",
        },
        privacyFaq,
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
      faq: [
        {
          q: "Which cron dialect is this?",
          a: "Standard five-field Unix cron: minute, hour, day of month, month, day of week. Ranges, steps, lists and names like MON or JAN are all supported.",
        },
        {
          q: "Why do day-of-month and day-of-week both matter?",
          a: "When both are restricted, classic cron runs the job if either matches — not both. It is a long-standing gotcha, so check the listed run times rather than assuming.",
        },
        privacyFaq,
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
      faq: [
        {
          q: "Seconds or milliseconds?",
          a: "Unix time is seconds; JavaScript's Date.now() returns milliseconds. A ten-digit number is almost certainly seconds and a thirteen-digit one milliseconds, which is how this tool guesses.",
        },
        {
          q: "What is the 2038 problem?",
          a: "Systems storing Unix time in a signed 32-bit integer overflow on 19 January 2038. Anything using 64-bit time — which includes JavaScript — is unaffected.",
        },
        privacyFaq,
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
      faq: [
        {
          q: "Will it change what my query does?",
          a: "No. Only whitespace and keyword casing change. Identifiers, string literals and the structure of the query are left exactly as written.",
        },
        {
          q: "Which dialects are supported?",
          a: "PostgreSQL, MySQL, MariaDB, SQLite, T-SQL, BigQuery, Snowflake and standard SQL, among others. Pick the closest match for the best results.",
        },
        privacyFaq,
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
      faq: [
        {
          q: "Is the content inside pre and textarea preserved?",
          a: "Yes. Whitespace is significant in those elements, so their contents are passed through untouched rather than re-indented.",
        },
        {
          q: "How aggressive is minification?",
          a: "It removes comments and collapses runs of whitespace between tags. It does not rewrite attributes or strip optional closing tags, so the output stays safe to ship.",
        },
        privacyFaq,
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
      faq: [
        {
          q: "Does this rename variables?",
          a: "No. It performs safe minification — comments and whitespace only. Identifier mangling needs full parsing and is better handled by your bundler, where it can be verified by tests.",
        },
        {
          q: "Will it break my code?",
          a: "String and template literal contents are preserved, as are regex literals. That said, always test minified output before deploying, exactly as you would with any build tool.",
        },
        privacyFaq,
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
      faq: [
        {
          q: "Which Markdown flavour?",
          a: "GitHub Flavored Markdown — tables, fenced code blocks, task lists, strikethrough and autolinking all work as they do in a README.",
        },
        {
          q: "Is the HTML output sanitised?",
          a: "The preview escapes raw HTML so pasted content cannot execute scripts in this page. If you render the output on your own site, sanitise it there too.",
        },
        privacyFaq,
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
      faq: [
        {
          q: "When do values need quotes?",
          a: "Whenever they contain spaces, the # character, or a line break. Values are quoted automatically when required, and left bare when not, which keeps the file readable.",
        },
        {
          q: "Why generate a .env.example?",
          a: "Because .env is gitignored, a new developer cloning the repo has no idea which variables exist. The example file documents the keys without leaking the values.",
        },
        privacyFaq,
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
      faq: [
        {
          q: "What contrast ratio do I need?",
          a: "WCAG AA requires 4.5:1 for body text and 3:1 for large text — 18pt, or 14pt bold. AAA raises that to 7:1 and 4.5:1 respectively.",
        },
        {
          q: "Which formats are accepted?",
          a: "Three, four, six and eight digit hex, rgb() and rgba(), and hsl() and hsla(). Alpha is preserved where the target format supports it.",
        },
        privacyFaq,
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
      faq: [
        {
          q: "Why is MD5 not offered?",
          a: "The Web Crypto API deliberately omits MD5 because it is cryptographically broken — collisions are trivial to produce. Use SHA-256 for anything security related.",
        },
        {
          q: "Can I hash large files?",
          a: "Yes. Files are read and hashed locally, so the practical ceiling is your available memory rather than any upload limit.",
        },
        privacyFaq,
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
      faq: [
        {
          q: "Which error correction level should I pick?",
          a: "Level M is a good default. Go to Q or H if the code will be printed small, placed on a curved surface, or overlaid with a logo — higher correction survives more damage at the cost of density.",
        },
        {
          q: "Do these codes expire?",
          a: "No. The data is encoded directly in the image, so there is no redirect and no tracking service in the middle. The code works forever, but the destination cannot be changed later.",
        },
        privacyFaq,
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
      faq: [
        {
          q: "How many bits of entropy are enough?",
          a: "Around 75 bits is comfortable for an online account with rate limiting. For anything protecting data at rest — a password manager's master key, a disk — aim for 100 or more.",
        },
        {
          q: "Are passphrases really as strong?",
          a: "Yes, given enough words. Four random words from a large list beats a short mangled password, and is far easier to type. Strength comes from the randomness of the selection, not from substituting 3 for e.",
        },
        privacyFaq,
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
      faq: [
        {
          q: "Is there a size limit?",
          a: "No hard limit, though comparing two very large documents takes longer since the diff is computed in your browser. A few thousand lines is comfortable.",
        },
        {
          q: "Can I diff code?",
          a: "Yes — any plain text works, including code, JSON, CSV and logs. The comparison is line-based, so structural changes show up clearly.",
        },
        privacyFaq,
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
      faq: [
        {
          q: "Why use lorem ipsum at all?",
          a: "Because readable placeholder copy distracts reviewers into editing the words instead of the design. Nonsense Latin keeps attention on layout and typography.",
        },
        {
          q: "Can I start with the classic opening?",
          a: 'Yes. Toggle the option to begin with "Lorem ipsum dolor sit amet", which is what most people expect placeholder text to look like.',
        },
        privacyFaq,
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
      faq: [
        {
          q: "How are acronyms handled?",
          a: 'Runs of capitals are treated as a single word, so "parseHTTPResponse" becomes "parse_http_response" rather than splitting on every letter.',
        },
        {
          q: "Does it work on whole sentences?",
          a: "Yes. Title case and sentence case are designed for prose, while the programming cases will collapse a sentence into a single identifier.",
        },
        privacyFaq,
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
      faq: [
        {
          q: "What density should I target?",
          a: "There is no magic number, and chasing one is a mistake. Modern search engines use semantic analysis, not term counting. Write naturally; use this to catch accidental over-repetition, not to hit a quota.",
        },
        {
          q: "What counts as keyword stuffing?",
          a: "Repetition that stops the copy reading naturally — the same phrase forced in several times per paragraph. If it sounds awkward when read aloud, it is stuffing, whatever the percentage says.",
        },
        privacyFaq,
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
      faq: [
        {
          q: "What score should I aim for?",
          a: "Flesch Reading Ease of 60 to 70 suits general web copy, roughly an eighth to ninth grade level. Technical documentation can sit lower; consumer content should aim higher.",
        },
        {
          q: "Is passive voice always wrong?",
          a: "No. It is the right choice when the actor is unknown or irrelevant. It is flagged so you can make a deliberate decision, not because every instance needs removing.",
        },
        privacyFaq,
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
      faq: [
        {
          q: "Are characters counted with or without spaces?",
          a: "Both are shown. Spaces count toward most platform limits, including meta descriptions and social posts, so that figure is usually the one that matters.",
        },
        {
          q: "How is reading time calculated?",
          a: "At 238 words per minute, the average for silent adult reading of general text. Speaking time uses 150, which is a typical presentation pace.",
        },
        privacyFaq,
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
      faq: [
        {
          q: "How many hashtags should I use?",
          a: "It varies sharply by platform: three to five on Instagram, one or two on X, three to five on LinkedIn, and three to six on TikTok. More is not better — relevance beats volume everywhere.",
        },
        {
          q: "Why camel case?",
          a: "Because screen readers announce #SocialMediaTips correctly but read #socialmediatips as one run-on string. Capitalising each word is an accessibility improvement that costs nothing.",
        },
        privacyFaq,
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
      faq: [
        {
          q: "Hyphens or underscores?",
          a: "Hyphens. Google treats a hyphen as a word separator and an underscore as a word joiner, so my_blog_post reads as one token while my-blog-post reads as three words.",
        },
        {
          q: "Should I remove stop words?",
          a: "Usually yes, for brevity — but not when they change the meaning. Dropping them from a phrase like the-who or how-to-be turns it into nonsense, so check the result rather than applying it blindly.",
        },
        privacyFaq,
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
