/**
 * Product identity, in one place.
 *
 * Every user-facing occurrence of the name resolves through this module, so
 * renaming the product is a single edit rather than a search across metadata,
 * navigation, the footer and the README.
 */

export const BRAND = {
  name: "Quantum Lab",
  shortName: "Quantum Lab",
  /** Two characters for the header mark. */
  mark: "QL",
  tagline: "Learn quantum computing by running it",
  description:
    "An interactive quantum computing course. Every derivation is worked through, every circuit runs on a real simulator, and every stated result is verified against that simulator before it ships.",
} as const;
