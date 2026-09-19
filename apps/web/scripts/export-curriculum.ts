/**
 * Exports the authored curriculum to JSON for consumers outside the web app.
 *
 * The Python test suite reads the emitted file and runs every lesson circuit
 * through Qiskit Aer, failing the build when a lesson's stated probabilities
 * disagree with what the simulator actually produces. The Copilot's retrieval
 * index will read the same artifact.
 *
 *   npm run content:export
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { LESSONS } from "../src/content/index";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");
const outputPath = resolve(repoRoot, "packages/curriculum/curriculum.json");

const payload = {
  schemaVersion: "3.0.0",
  generatedOn: new Date().toISOString().slice(0, 10),
  lessonCount: LESSONS.length,
  lessons: LESSONS,
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

const withCircuit = LESSONS.filter((l) => l.circuit).length;
const withCode = LESSONS.filter((l) => l.code).length;
const withVisual = LESSONS.filter((l) => l.visual).length;

console.log(`Exported ${LESSONS.length} lesson(s) to ${outputPath}`);
console.log(`  circuits ${withCircuit}   code ${withCode}   visuals ${withVisual}`);
