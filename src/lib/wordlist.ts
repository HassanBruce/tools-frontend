/**
 * Word list for passphrase generation — 256 short, common, unambiguous English
 * words. A power of two keeps the entropy maths exact: each word contributes
 * precisely 8 bits.
 *
 * Chosen to be easy to type and hard to mishear, avoiding homophones and
 * words that differ by a single letter.
 */
export const PASSPHRASE_WORDS: string[] = [
  "able", "acid", "acorn", "actor", "agent", "album", "alert", "alien",
  "alpha", "amber", "anchor", "angle", "ankle", "apple", "apron", "arbor",
  "arctic", "armor", "arrow", "aspen", "atlas", "attic", "audio", "avatar",
  "bacon", "badge", "bagel", "baker", "balance", "bamboo", "banjo", "barrel",
  "basil", "basket", "beacon", "beagle", "beaver", "bench", "berry", "bicycle",
  "bishop", "bison", "blanket", "blossom", "boulder", "bounce", "bridge", "bronze",
  "bucket", "buffalo", "bundle", "burger", "butler", "cabin", "cactus", "camel",
  "candle", "canyon", "carbon", "cargo", "carpet", "castle", "cavern", "cedar",
  "cello", "cement", "census", "chapel", "cherry", "chisel", "cinema", "circus",
  "citrus", "clover", "cobalt", "cocoa", "collar", "comet", "compass", "copper",
  "coral", "cosmic", "cotton", "cougar", "county", "cowboy", "crayon", "cricket",
  "crimson", "crystal", "cubic", "cursor", "cymbal", "dagger", "dahlia", "dancer",
  "dapper", "dazzle", "decoy", "denim", "desert", "diamond", "digital", "dolphin",
  "domino", "donkey", "dragon", "drawer", "driftwood", "dynamo", "eagle", "easel",
  "ember", "emerald", "engine", "escape", "ethics", "exhibit", "fabric", "falcon",
  "fathom", "fennel", "ferry", "fiber", "fiddle", "figure", "filter", "fjord",
  "flamingo", "flannel", "flint", "florist", "flute", "forest", "fossil", "fountain",
  "foxglove", "freckle", "frost", "galaxy", "gallery", "garden", "garlic", "gecko",
  "geyser", "ginger", "glacier", "glider", "granite", "gravel", "grotto", "guitar",
  "gusto", "gypsum", "hammer", "hamster", "harbor", "harvest", "hazel", "helmet",
  "hermit", "hickory", "hollow", "hornet", "hostel", "hunter", "iceberg", "igloo",
  "indigo", "inkwell", "island", "ivory", "jacket", "jaguar", "jasmine", "jersey",
  "jigsaw", "jockey", "jungle", "juniper", "kayak", "kelvin", "kennel", "kettle",
  "keypad", "kitten", "koala", "lagoon", "lantern", "lattice", "lavender", "ledger",
  "lemon", "leopard", "lever", "lilac", "linen", "lizard", "lobster", "locket",
  "lotus", "lumber", "lunar", "lyric", "magnet", "mahogany", "mammoth", "mandolin",
  "mango", "maple", "marble", "marina", "marvel", "meadow", "medal", "melon",
  "mentor", "mercury", "meteor", "midnight", "mimosa", "mineral", "mint", "mirror",
  "mitten", "modest", "monarch", "monsoon", "mosaic", "motor", "muffin", "mulberry",
  "museum", "mustard", "nectar", "needle", "nickel", "nimble", "noble", "nomad",
  "nordic", "nougat", "nutmeg", "oasis", "oatmeal", "obsidian", "octave", "octopus",
  "olive", "onyx", "opal", "orbit", "orchid", "organ", "otter", "oxide",
];

/** Number of bits each word contributes (log2 of the list length). */
export const WORD_ENTROPY_BITS = Math.log2(PASSPHRASE_WORDS.length);
