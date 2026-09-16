/**
 * A small markup tokenizer plus XML and HTML pretty-printers.
 *
 * Deliberately string-based rather than DOM-based: re-serialising a parsed DOM
 * discards comments, collapses CDATA and rewrites attribute quoting, none of
 * which a formatter should do to someone's source.
 */

type TokenType = "open" | "close" | "self" | "text" | "meta" | "raw";

interface Token {
  type: TokenType;
  value: string;
  name?: string;
}

/** HTML elements that never have a closing tag. */
const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

/** Elements whose contents are text, not markup — never re-indent inside these. */
const RAW_TEXT_ELEMENTS = new Set(["script", "style", "pre", "textarea"]);

/** Elements that sit inside a line of text rather than owning their own block. */
const INLINE_ELEMENTS = new Set([
  "a", "abbr", "b", "bdi", "bdo", "cite", "code", "data", "dfn", "em", "i",
  "kbd", "mark", "q", "rp", "rt", "ruby", "s", "samp", "small", "span",
  "strong", "sub", "sup", "time", "u", "var",
]);

function tokenize(input: string, html: boolean): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  const pushDelimited = (start: string, end: string) => {
    const close = input.indexOf(end, index + start.length);
    const stop = close === -1 ? input.length : close + end.length;
    tokens.push({ type: "meta", value: input.slice(index, stop) });
    index = stop;
  };

  while (index < input.length) {
    if (input.startsWith("<!--", index)) {
      pushDelimited("<!--", "-->");
      continue;
    }
    if (input.startsWith("<![CDATA[", index)) {
      pushDelimited("<![CDATA[", "]]>");
      continue;
    }
    if (input.startsWith("<?", index)) {
      pushDelimited("<?", "?>");
      continue;
    }
    if (input.startsWith("<!", index)) {
      pushDelimited("<!", ">");
      continue;
    }

    if (input[index] === "<") {
      const close = input.indexOf(">", index);
      const stop = close === -1 ? input.length : close + 1;
      const raw = input.slice(index, stop);
      const name = (/^<\/?\s*([^\s/>]+)/.exec(raw)?.[1] ?? "").toLowerCase();

      const type: TokenType = raw.startsWith("</")
        ? "close"
        : raw.endsWith("/>") || (html && VOID_ELEMENTS.has(name))
          ? "self"
          : "open";

      tokens.push({ type, value: raw, name });
      index = stop;

      // Raw-text elements: capture everything up to the matching close tag
      // verbatim so script bodies and pre blocks are never reflowed.
      if (type === "open" && html && RAW_TEXT_ELEMENTS.has(name)) {
        const closeTag = `</${name}`;
        const closeAt = input.toLowerCase().indexOf(closeTag, index);
        const bodyEnd = closeAt === -1 ? input.length : closeAt;
        const body = input.slice(index, bodyEnd);
        if (body) tokens.push({ type: "raw", value: body });
        index = bodyEnd;
      }
      continue;
    }

    const next = input.indexOf("<", index);
    const stop = next === -1 ? input.length : next;
    tokens.push({ type: "text", value: input.slice(index, stop) });
    index = stop;
  }

  return tokens;
}

function build(tokens: Token[], indentUnit: string): string {
  const lines: string[] = [];
  let depth = 0;

  const indent = () => indentUnit.repeat(Math.max(0, depth));

  for (const token of tokens) {
    switch (token.type) {
      case "text": {
        const trimmed = token.value.trim();
        if (trimmed) lines.push(indent() + trimmed.replace(/\s+/g, " "));
        break;
      }
      case "raw": {
        // Preserve exactly, minus any purely blank leading/trailing lines.
        const body = token.value.replace(/^\n+|\s+$/g, "");
        if (body) lines.push(body);
        break;
      }
      case "close":
        depth--;
        lines.push(indent() + token.value);
        break;
      case "open":
        lines.push(indent() + token.value);
        depth++;
        break;
      default:
        lines.push(indent() + token.value);
    }
  }

  return lines.join("\n");
}

/**
 * Collapse an element whose entire body is a single short text node back onto
 * one line — <title>Hello</title> rather than three lines for three words.
 */
function collapseShortElements(source: string, html: boolean): string {
  const pattern = /^([ \t]*)(<([a-zA-Z0-9:_-]+)(?:\s[^>]*)?>)\n[ \t]*([^\n<]{0,80})\n[ \t]*(<\/\3>)$/gm;
  return source.replace(pattern, (match, pad, open, name, text, close) => {
    if (html && RAW_TEXT_ELEMENTS.has(String(name).toLowerCase())) return match;
    return `${pad}${open}${text.trim()}${close}`;
  });
}

export function formatXml(input: string, indentUnit = "  "): string {
  const tokens = tokenize(input.trim(), false);
  return collapseShortElements(build(tokens, indentUnit), false);
}

export function formatHtml(input: string, indentUnit = "  "): string {
  const tokens = tokenize(input.trim(), true);
  return collapseShortElements(build(tokens, indentUnit), true);
}

export function minifyMarkup(input: string, html: boolean): string {
  const tokens = tokenize(input.trim(), html);
  let out = "";

  for (const token of tokens) {
    if (token.type === "meta" && token.value.startsWith("<!--")) continue; // drop comments
    if (token.type === "raw") {
      out += token.value.trim();
      continue;
    }
    if (token.type === "text") {
      const collapsed = token.value.replace(/\s+/g, " ");
      // Keep a single space where it separates inline content from a tag.
      out += collapsed.trim() ? collapsed : "";
      continue;
    }
    out += token.value.replace(/\s+/g, " ").replace(/\s+>/, ">");
  }

  return out;
}

/** Well-formedness check via the browser's own parser. Returns null when valid. */
export function validateXml(input: string): string | null {
  if (typeof DOMParser === "undefined") return null;
  if (!input.trim()) return null;

  const doc = new DOMParser().parseFromString(input, "application/xml");
  const failure = doc.querySelector("parsererror");
  if (!failure) return null;

  return failure.textContent?.replace(/\s+/g, " ").trim() || "The document is not well-formed XML.";
}

/**
 * Strip scripting vectors from HTML before rendering it into the page.
 *
 * `marked` passes raw HTML in the source straight through, so markdown
 * containing a <script> tag would otherwise execute in the preview. Browser
 * only — returns the input untouched where DOMParser is unavailable (SSR),
 * which is safe because the preview is never rendered on the server.
 */
export function sanitizeHtml(input: string): string {
  if (typeof DOMParser === "undefined") return "";

  const doc = new DOMParser().parseFromString(input, "text/html");

  doc.querySelectorAll("script, iframe, object, embed, link, meta, style, base, form").forEach(
    (node) => node.remove(),
  );

  doc.querySelectorAll("*").forEach((element) => {
    for (const attribute of [...element.attributes]) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.replace(/\s+/g, "").toLowerCase();

      // Inline event handlers, and URLs that can execute script.
      if (name.startsWith("on")) element.removeAttribute(attribute.name);
      else if (
        (name === "href" || name === "src" || name === "xlink:href") &&
        (value.startsWith("javascript:") || value.startsWith("data:text/html"))
      ) {
        element.removeAttribute(attribute.name);
      }
    }
  });

  return doc.body.innerHTML;
}

export { INLINE_ELEMENTS, VOID_ELEMENTS };
