/**
 * Conservative CSS and JavaScript minification.
 *
 * Deliberately limited to comments and whitespace. Identifier mangling needs a
 * full parser and a test suite to be safe; a browser-side tool that silently
 * renames a variable and breaks someone's code is worse than no tool at all.
 */

/** Tokens after which a `/` begins a regex literal rather than a division. */
const REGEX_PRECEDERS = new Set([
  "return", "typeof", "instanceof", "in", "of", "new", "delete", "void",
  "case", "do", "else", "yield", "await", "throw",
]);

function precedesRegex(output: string): boolean {
  // Walk back over whitespace to the last meaningful character.
  let index = output.length - 1;
  while (index >= 0 && /\s/.test(output[index])) index--;
  if (index < 0) return true;

  const char = output[index];
  if ("(,=:[!&|?{};+-*%~^<>".includes(char)) return true;

  // A trailing keyword also means a regex follows.
  const word = /([A-Za-z$_][\w$]*)$/.exec(output.slice(0, index + 1));
  return word ? REGEX_PRECEDERS.has(word[1]) : false;
}

/**
 * Strip comments while respecting strings, template literals and regex
 * literals, then collapse whitespace. Runs containing a newline collapse to a
 * newline so automatic semicolon insertion still behaves the same way.
 */
export function minifyJs(source: string): string {
  let out = "";
  let index = 0;

  while (index < source.length) {
    const char = source[index];
    const next = source[index + 1];

    // Line comment
    if (char === "/" && next === "/") {
      const end = source.indexOf("\n", index);
      index = end === -1 ? source.length : end;
      continue;
    }

    // Block comment
    if (char === "/" && next === "*") {
      const end = source.indexOf("*/", index + 2);
      const hadNewline = source.slice(index, end === -1 ? source.length : end).includes("\n");
      index = end === -1 ? source.length : end + 2;
      // A multi-line comment separated two tokens; keep a newline in its place.
      if (hadNewline) out += "\n";
      continue;
    }

    // Strings
    if (char === '"' || char === "'") {
      const quote = char;
      let literal = char;
      index++;
      while (index < source.length) {
        const current = source[index];
        literal += current;
        if (current === "\\") {
          literal += source[index + 1] ?? "";
          index += 2;
          continue;
        }
        index++;
        if (current === quote) break;
      }
      out += literal;
      continue;
    }

    // Template literal — may contain ${} with nested code, so copy verbatim.
    if (char === "`") {
      let literal = "`";
      index++;
      let depth = 0;
      while (index < source.length) {
        const current = source[index];
        if (current === "\\") {
          literal += current + (source[index + 1] ?? "");
          index += 2;
          continue;
        }
        literal += current;
        index++;
        if (current === "$" && source[index] === "{") {
          literal += "{";
          index++;
          depth++;
        } else if (current === "}" && depth > 0) {
          depth--;
        } else if (current === "`" && depth === 0) {
          break;
        }
      }
      out += literal;
      continue;
    }

    // Regex literal
    if (char === "/" && precedesRegex(out)) {
      let literal = "/";
      index++;
      let inClass = false;
      while (index < source.length) {
        const current = source[index];
        if (current === "\\") {
          literal += current + (source[index + 1] ?? "");
          index += 2;
          continue;
        }
        literal += current;
        index++;
        if (current === "[") inClass = true;
        else if (current === "]") inClass = false;
        else if (current === "/" && !inClass) break;
      }
      // Trailing flags
      while (index < source.length && /[a-z]/i.test(source[index])) {
        literal += source[index];
        index++;
      }
      out += literal;
      continue;
    }

    // Whitespace run
    if (/\s/.test(char)) {
      let run = "";
      while (index < source.length && /\s/.test(source[index])) {
        run += source[index];
        index++;
      }
      out += run.includes("\n") ? "\n" : " ";
      continue;
    }

    out += char;
    index++;
  }

  return out
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

/** CSS is far more tractable: no ASI, and no regex-versus-division ambiguity. */
export function minifyCss(source: string): string {
  let out = "";
  let index = 0;

  while (index < source.length) {
    const char = source[index];

    if (char === "/" && source[index + 1] === "*") {
      const end = source.indexOf("*/", index + 2);
      index = end === -1 ? source.length : end + 2;
      continue;
    }

    if (char === '"' || char === "'") {
      const quote = char;
      out += char;
      index++;
      while (index < source.length) {
        const current = source[index];
        out += current;
        if (current === "\\") {
          out += source[index + 1] ?? "";
          index += 2;
          continue;
        }
        index++;
        if (current === quote) break;
      }
      continue;
    }

    out += char;
    index++;
  }

  return (
    out
      .replace(/\s+/g, " ")
      // Note: + and ~ are deliberately excluded. They are combinators in a
      // selector, but calc(100% + 2rem) *requires* the surrounding spaces —
      // stripping them there produces invalid CSS.
      .replace(/\s*([{}:;,>])\s*/g, "$1")
      // A trailing semicolon before a closing brace is redundant.
      .replace(/;}/g, "}")
      .trim()
  );
}
