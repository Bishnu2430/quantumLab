/**
 * Product identity, in one place.
 *
 * Every user-facing occurrence of the name resolves through this module, so
 * renaming the product is a single edit rather than a search across metadata,
 * navigation, the footer and the README.
 */

export const BRAND = {
  /** "Amplitude" is the idea the whole curriculum turns on: amplitudes are
   *  complex and can cancel, which is what separates quantum from classical
   *  probability. "Lab" keeps it distinct from the analytics product. */
  name: "Amplitude Lab",
  shortName: "Amplitude",
  /** Two characters for the header mark. */
  mark: "Aψ",
  tagline: "Learn quantum computing by running it",
  description:
    "An interactive quantum computing course. Every derivation is worked through, every circuit runs on IBM Qiskit Aer, and every stated result is verified against that simulator before it ships.",
} as const;
