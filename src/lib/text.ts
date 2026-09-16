/** Shared text analysis and transformation helpers used across several tools. */

/* ------------------------------------------------------------ JSON errors */

function lineAndColumn(source: string, index: number): { line: number; column: number } {
  const upto = source.slice(0, index);
  return { line: upto.split("\n").length, column: index - upto.lastIndexOf("\n") };
}

/**
 * Turn a JSON.parse failure into something you can act on.
 *
 * V8 produces two different shapes and neither is ideal on its own:
 *
 *   "Expected ',' or '}' after property value in JSON at position 8 (line 1 column 9)"
 *   "Unexpected token ',', ...\"1,\\n  \"b\": ,\\n}\" is not valid JSON"
 *
 * The first already carries a location, which we keep. The second carries no
 * offset at all, so we locate its context snippet in the source to at least
 * name the line.
 */
export function describeJsonError(error: unknown, source: string): string {
  const message = error instanceof Error ? error.message : String(error);

  const located = /\(line (\d+) column (\d+)\)/.exec(message);
  if (located) {
    const base = message.replace(/\s*(in JSON )?at position \d+\s*\(line \d+ column \d+\)\.?\s*$/, "");
    return `${base} (line ${located[1]}, column ${located[2]})`;
  }

  const offset = /at position (\d+)/i.exec(message);
  if (offset) {
    const { line, column } = lineAndColumn(source, Number(offset[1]));
    const base = message.replace(/\s*(in JSON )?at position \d+.*$/i, "");
    return `${base} (line ${line}, column ${column})`;
  }

  const snippet = /"([\s\S]*)" is not valid JSON\s*$/.exec(message);
  if (snippet) {
    const base = message.replace(/,?\s*(\.\.\.)?"[\s\S]*" is not valid JSON\s*$/, "").trim();
    const index = source.indexOf(snippet[1]);
    if (index >= 0) {
      const { line } = lineAndColumn(source, index);
      return `${base || "Invalid JSON"} — near line ${line}`;
    }
    return base || message;
  }

  return message;
}

/* --------------------------------------------------------- case conversion */

/** Split an identifier or sentence into its component words. */
export function splitWords(input: string): string[] {
  return (
    input
      // camelCase / PascalCase boundaries
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      // Treat a run of capitals followed by a word as one unit: HTTPResponse -> HTTP Response
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
      .replace(/[_\-.\/\\]+/g, " ")
      .split(/\s+/)
      .filter(Boolean)
  );
}

export interface CaseSet {
  lower: string;
  upper: string;
  title: string;
  sentence: string;
  camel: string;
  pascal: string;
  snake: string;
  constant: string;
  kebab: string;
  train: string;
  dot: string;
  path: string;
  alternating: string;
  inverse: string;
}

export function toCases(input: string): CaseSet {
  const words = splitWords(input);
  const lower = words.map((word) => word.toLowerCase());
  const cap = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

  return {
    lower: input.toLowerCase(),
    upper: input.toUpperCase(),
    title: lower.map(cap).join(" "),
    sentence: lower.length ? cap(lower.join(" ")) : "",
    camel: lower.map((word, index) => (index === 0 ? word : cap(word))).join(""),
    pascal: lower.map(cap).join(""),
    snake: lower.join("_"),
    constant: lower.join("_").toUpperCase(),
    kebab: lower.join("-"),
    train: lower.map(cap).join("-"),
    dot: lower.join("."),
    path: lower.join("/"),
    alternating: input
      .split("")
      .map((char, index) => (index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()))
      .join(""),
    inverse: input
      .split("")
      .map((char) => (char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()))
      .join(""),
  };
}

/* ----------------------------------------------------------------- slugify */

/** Characters that percent-encode into noise; map them to sensible ASCII first. */
const TRANSLITERATIONS: Record<string, string> = {
  à: "a", á: "a", â: "a", ã: "a", ä: "a", å: "a", æ: "ae",
  ç: "c", è: "e", é: "e", ê: "e", ë: "e",
  ì: "i", í: "i", î: "i", ï: "i",
  ñ: "n", ò: "o", ó: "o", ô: "o", õ: "o", ö: "o", ø: "o",
  ù: "u", ú: "u", û: "u", ü: "u", ý: "y", ÿ: "y",
  ß: "ss", þ: "th", ð: "d", œ: "oe",
};

export const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "from", "has", "he",
  "in", "is", "it", "its", "of", "on", "or", "that", "the", "to", "was", "were",
  "will", "with", "this", "these", "those", "they", "their", "have", "had", "been",
  "would", "could", "should", "there", "what", "when", "which", "who", "you", "your",
  "i", "we", "our", "us", "not", "do", "does", "did", "so", "if", "then", "than",
]);

export function slugify(
  input: string,
  options: { separator?: string; removeStopWords?: boolean; maxLength?: number } = {},
): string {
  const { separator = "-", removeStopWords = false, maxLength = 0 } = options;

  let text = input
    .toLowerCase()
    .split("")
    .map((char) => TRANSLITERATIONS[char] ?? char)
    .join("")
    // Strip any remaining combining marks left by decomposition (U+0300–U+036F).
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  let words = text
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (removeStopWords && words.length > 1) {
    const kept = words.filter((word) => !STOP_WORDS.has(word));
    // Never return an empty slug just because every word was a stop word.
    if (kept.length) words = kept;
  }

  text = words.join(separator);

  if (maxLength > 0 && text.length > maxLength) {
    text = text.slice(0, maxLength);
    const lastSeparator = text.lastIndexOf(separator);
    if (lastSeparator > 0) text = text.slice(0, lastSeparator);
  }

  return text;
}

/* ------------------------------------------------------------- text stats */

export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  syllables: number;
  readingMinutes: number;
  speakingMinutes: number;
}

export function getWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

export function getSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

/**
 * Vowel-group syllable estimate. Not perfect English, but consistent — which is
 * what the readability formulas actually need.
 */
export function countSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) return 0;
  if (clean.length <= 3) return 1;

  const trimmed = clean
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "");

  // A whole run of vowels is one syllable, so "beautiful" counts eau-i-u = 3
  // rather than splitting the triphthong.
  const groups = trimmed.match(/[aeiouy]+/g);
  return Math.max(1, groups ? groups.length : 1);
}

export function textStats(text: string): TextStats {
  const words = getWords(text);
  const sentences = getSentences(text);
  const paragraphs = text.split(/\n\s*\n/).filter((block) => block.trim().length > 0);
  const syllables = words.reduce((total, word) => total + countSyllables(word), 0);

  return {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, "").length,
    words: words.length,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    lines: text ? text.split("\n").length : 0,
    syllables,
    readingMinutes: words.length / 238,
    speakingMinutes: words.length / 150,
  };
}

/* ----------------------------------------------------------- readability */

export interface ReadabilityScores {
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  gunningFog: number;
  colemanLiau: number;
  automatedReadability: number;
  averageWordsPerSentence: number;
  complexWordRatio: number;
}

export function readability(text: string): ReadabilityScores | null {
  const words = getWords(text);
  const sentences = getSentences(text);
  if (words.length < 5 || sentences.length === 0) return null;

  const syllables = words.reduce((total, word) => total + countSyllables(word), 0);
  const complexWords = words.filter((word) => countSyllables(word) >= 3).length;
  const letters = text.replace(/[^a-zA-Z]/g, "").length;

  const wordsPerSentence = words.length / sentences.length;
  const syllablesPerWord = syllables / words.length;
  const lettersPer100 = (letters / words.length) * 100;
  const sentencesPer100 = (sentences.length / words.length) * 100;

  return {
    fleschReadingEase: 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord,
    fleschKincaidGrade: 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59,
    gunningFog: 0.4 * (wordsPerSentence + 100 * (complexWords / words.length)),
    colemanLiau: 0.0588 * lettersPer100 - 0.296 * sentencesPer100 - 15.8,
    automatedReadability: 4.71 * (letters / words.length) + 0.5 * wordsPerSentence - 21.43,
    averageWordsPerSentence: wordsPerSentence,
    complexWordRatio: complexWords / words.length,
  };
}

export function readingEaseLabel(score: number): { label: string; grade: string } {
  if (score >= 90) return { label: "Very easy", grade: "5th grade" };
  if (score >= 80) return { label: "Easy", grade: "6th grade" };
  if (score >= 70) return { label: "Fairly easy", grade: "7th grade" };
  if (score >= 60) return { label: "Standard", grade: "8th–9th grade" };
  if (score >= 50) return { label: "Fairly difficult", grade: "10th–12th grade" };
  if (score >= 30) return { label: "Difficult", grade: "College" };
  return { label: "Very difficult", grade: "College graduate" };
}

/** Rough passive-voice detector: a form of "to be" followed by a past participle. */
const BE_FORMS = /\b(am|is|are|was|were|be|been|being)\b/i;
const PARTICIPLE = /\b\w+(ed|en|own|ung|wn)\b/i;

export function looksPassive(sentence: string): boolean {
  const beMatch = BE_FORMS.exec(sentence);
  if (!beMatch) return false;
  const after = sentence.slice(beMatch.index + beMatch[0].length);
  // Allow an adverb between the auxiliary and the participle.
  return PARTICIPLE.test(after.split(/\s+/).slice(0, 3).join(" "));
}

/* ------------------------------------------------------ keyword frequency */

export interface KeywordCount {
  phrase: string;
  count: number;
  density: number;
}

export function keywordCounts(
  text: string,
  size: number,
  { ignoreStopWords = true, limit = 25 } = {},
): KeywordCount[] {
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length < size) return [];

  const counts = new Map<string, number>();

  for (let index = 0; index <= words.length - size; index++) {
    const phrase = words.slice(index, index + size);

    if (ignoreStopWords) {
      // For single words drop stop words entirely; for phrases only drop ones
      // made up exclusively of them, since "state of the art" is meaningful.
      if (size === 1 && STOP_WORDS.has(phrase[0])) continue;
      if (size > 1 && phrase.every((word) => STOP_WORDS.has(word))) continue;
    }

    const key = phrase.join(" ");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const totalPhrases = words.length - size + 1;

  return [...counts.entries()]
    .filter(([, count]) => count > 1 || size === 1)
    .map(([phrase, count]) => ({ phrase, count, density: (count / totalPhrases) * 100 }))
    .sort((a, b) => b.count - a.count || a.phrase.localeCompare(b.phrase))
    .slice(0, limit);
}

/* ------------------------------------------------------------ misc format */

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Approximate pixel width of a string, used for SERP truncation warnings. */
export function measureText(text: string, font: string): number {
  if (typeof document === "undefined") return 0;
  const canvas = measureText.canvas ?? (measureText.canvas = document.createElement("canvas"));
  const context = canvas.getContext("2d");
  if (!context) return 0;
  context.font = font;
  return context.measureText(text).width;
}
measureText.canvas = null as HTMLCanvasElement | null;
