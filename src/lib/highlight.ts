/**
 * A very small syntax highlighter.
 *
 * Deliberately hand-rolled rather than pulling in Prism, Shiki or CodeMirror.
 * Those weigh 100–300 KB and would land on every tool page — undoing the page
 * weight work — to colour what is usually a few hundred characters. This is
 * about 5 KB and covers the formats the tools actually handle.
 *
 * It is a lexer, not a parser: it never validates, and on anything it cannot
 * recognise it falls back to plain text rather than mangling the input.
 */

export type Language =
  | "json"
  | "xml"
  | "html"
  | "sql"
  | "css"
  | "javascript"
  | "yaml"
  | "markdown"
  | "plain";

interface Rule {
  type: string;
  re: RegExp;
}

/** Sticky flag so each rule can be tested at an exact offset. */
const rule = (type: string, source: string, flags = ""): Rule => ({
  type,
  re: new RegExp(source, `y${flags}`),
});

const STRING_DQ = String.raw`"(?:[^"\\\n]|\\.)*"?`;
const STRING_SQ = String.raw`'(?:[^'\\\n]|\\.)*'?`;

const RULES: Record<Exclude<Language, "plain">, Rule[]> = {
  json: [
    rule("comment", String.raw`//[^\n]*`),
    // A string immediately followed by a colon is a key, not a value.
    rule("key", `${STRING_DQ}(?=\\s*:)`),
    rule("string", STRING_DQ),
    rule("number", String.raw`-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?`),
    rule("keyword", String.raw`\b(?:true|false|null)\b`),
    rule("punct", String.raw`[{}\[\],:]`),
  ],

  xml: [
    rule("comment", String.raw`<!--[\s\S]*?(?:-->|$)`),
    rule("meta", String.raw`<!\[CDATA\[[\s\S]*?(?:\]\]>|$)`),
    rule("meta", String.raw`<\?[\s\S]*?(?:\?>|$)`),
    rule("meta", String.raw`<!DOCTYPE[^>]*>?`, "i"),
    rule("tag", String.raw`</?[A-Za-z_][\w.:-]*`),
    rule("attr", String.raw`[A-Za-z_:][\w.:-]*(?=\s*=)`),
    rule("string", STRING_DQ),
    rule("string", STRING_SQ),
    rule("punct", String.raw`/?>`),
  ],

  html: [],

  sql: [
    rule("comment", String.raw`--[^\n]*`),
    rule("comment", String.raw`/\*[\s\S]*?(?:\*/|$)`),
    rule("string", STRING_SQ),
    rule("key", STRING_DQ),
    rule(
      "keyword",
      String.raw`\b(?:SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|ALTER|DROP|TABLE|INDEX|VIEW|JOIN|LEFT|RIGHT|INNER|OUTER|FULL|CROSS|ON|AS|AND|OR|NOT|NULL|IS|IN|BETWEEN|LIKE|ILIKE|GROUP|BY|ORDER|HAVING|LIMIT|OFFSET|FETCH|FIRST|NEXT|ROWS|ONLY|UNION|ALL|DISTINCT|CASE|WHEN|THEN|ELSE|END|WITH|RETURNING|PRIMARY|FOREIGN|KEY|REFERENCES|DEFAULT|CONSTRAINT|UNIQUE|CHECK|CASCADE|ASC|DESC|COUNT|SUM|AVG|MIN|MAX|COALESCE|CAST|EXISTS)\b`,
      "i",
    ),
    rule("number", String.raw`\b\d+(?:\.\d+)?\b`),
    rule("punct", String.raw`[(),;.*=<>!+\-/|]`),
  ],

  css: [
    rule("comment", String.raw`/\*[\s\S]*?(?:\*/|$)`),
    rule("keyword", String.raw`@[\w-]+`),
    rule("string", STRING_DQ),
    rule("string", STRING_SQ),
    rule("attr", String.raw`--[\w-]+`),
    rule("key", String.raw`[a-zA-Z-]+(?=\s*:)`),
    rule("number", String.raw`-?\d*\.?\d+(?:px|rem|em|%|vh|vw|s|ms|deg|fr|ch)?\b`),
    rule("meta", String.raw`#[0-9a-fA-F]{3,8}\b`),
    rule("punct", String.raw`[{}:;,>~+()]`),
  ],

  javascript: [
    rule("comment", String.raw`//[^\n]*`),
    rule("comment", String.raw`/\*[\s\S]*?(?:\*/|$)`),
    rule("string", String.raw`\`(?:[^\`\\]|\\.)*\`?`),
    rule("string", STRING_DQ),
    rule("string", STRING_SQ),
    rule(
      "keyword",
      String.raw`\b(?:const|let|var|function|return|if|else|for|while|do|break|continue|new|class|extends|super|this|import|export|from|default|async|await|try|catch|finally|throw|typeof|instanceof|in|of|delete|void|yield|switch|case|null|undefined|true|false)\b`,
    ),
    rule("number", String.raw`\b0[xX][0-9a-fA-F]+\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b`),
    rule("punct", String.raw`[{}()\[\];,.:?=<>!+\-*/%&|^~]`),
  ],

  yaml: [
    rule("comment", String.raw`#[^\n]*`),
    rule("key", String.raw`^[ \t]*-?[ \t]*[\w.-]+(?=\s*:)`, "m"),
    rule("string", STRING_DQ),
    rule("string", STRING_SQ),
    rule("keyword", String.raw`\b(?:true|false|null|yes|no|on|off|~)\b`, "i"),
    rule("number", String.raw`-?\b\d+(?:\.\d+)?\b`),
    rule("punct", String.raw`^---$|^\.\.\.$|[:\-|>]`, "m"),
  ],

  markdown: [
    rule("keyword", String.raw`^#{1,6} [^\n]*`, "m"),
    rule("string", String.raw`\`\`\`[\s\S]*?(?:\`\`\`|$)`),
    rule("string", String.raw`\`[^\`\n]*\``),
    rule("key", String.raw`\*\*[^*\n]+\*\*|__[^_\n]+__`),
    rule("meta", String.raw`\[[^\]\n]*\]\([^)\n]*\)`),
    rule("punct", String.raw`^[ \t]*(?:[-*+]|\d+\.)\s`, "m"),
    rule("comment", String.raw`^>[^\n]*`, "m"),
  ],
};

// HTML shares XML's lexical rules.
RULES.html = RULES.xml;

/** Highlighting above this size is not worth the main-thread time. */
const MAX_LENGTH = 100_000;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Returns HTML with `<span class="tok-*">` wrappers.
 *
 * The output is escaped, and only ever contains spans this module emits — it
 * never reflects raw user markup back into the page.
 */
export function highlight(code: string, language: Language): string {
  if (language === "plain" || !code) return escapeHtml(code);
  if (code.length > MAX_LENGTH) return escapeHtml(code);

  const rules = RULES[language];
  if (!rules || rules.length === 0) return escapeHtml(code);

  let out = "";
  let index = 0;
  let plain = "";

  const flushPlain = () => {
    if (plain) {
      out += escapeHtml(plain);
      plain = "";
    }
  };

  outer: while (index < code.length) {
    for (const { type, re } of rules) {
      re.lastIndex = index;
      const match = re.exec(code);
      if (match && match.index === index && match[0].length > 0) {
        flushPlain();
        out += `<span class="tok-${type}">${escapeHtml(match[0])}</span>`;
        index += match[0].length;
        continue outer;
      }
    }
    // No rule matched here; accumulate as plain text and move on one character.
    plain += code[index];
    index++;
  }

  flushPlain();
  return out;
}

/** Best-effort language for a filename, used when a file is opened. */
export function languageForFilename(name: string): Language {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  const map: Record<string, Language> = {
    json: "json",
    jsonc: "json",
    xml: "xml",
    svg: "xml",
    rss: "xml",
    html: "html",
    htm: "html",
    sql: "sql",
    css: "css",
    js: "javascript",
    mjs: "javascript",
    ts: "javascript",
    yaml: "yaml",
    yml: "yaml",
    md: "markdown",
    markdown: "markdown",
  };
  return map[ext] ?? "plain";
}
