# Quantum Lab — under-5-minute demo script

For the SIH 2026 evaluation video. This is a teleprompter script: every quoted
line under **Say:** is a complete sentence, meant to be read aloud exactly as
written, at a normal pace (~145 words per minute). Total runtime target:
**4:40**, leaving a real buffer under the 5-minute hard cap. Timings are
cumulative.

Technical focus: this cut keeps the automated physics verification, the proof
that the AI assistant refuses to invent numbers, and the live Qiskit lab and
sandbox — the four things that are actually hard to build and worth being
judged on. It drops the Bloch-sphere visuals and the general engineering tour
from the long version. See "If you have time to spare" at the bottom if you
want those back.

**Before you record, read the checklist at the bottom.**

---

## 0:00 – 0:20 · Opening

**Screen:** Landing page (`http://localhost:3000`), scrolled to the top.

**Say:**

> Team Creative Cartel, team ID one five seven one one four. This is Quantum
> Lab. Quantum computing content is usually either hand-waved or buried in
> notation, so we built a platform that derives every result step by step and
> then lets you verify the derivation by running the physics yourself.

---

## 0:20 – 1:00 · What it is

**Screen:** Landing page, scroll past the three feature cards.

**Say:**

> Three things make this different from a typical quantum course. Every
> probability a lesson states is checked against a real quantum simulator
> during the build, and if the simulator disagrees, the build fails before it
> ships. You run the physics yourself, on IBM's Qiskit Aer simulator, inside
> an isolated sandbox. And every lesson derives its results instead of simply
> asserting them, with each step explaining why it is allowed. The course
> covers seventeen lessons, from what a qubit is through to Grover's search
> algorithm and the BB84 quantum key distribution protocol.

---

## 1:00 – 1:45 · A lesson: derivation, not assertion

**Screen:** Lesson **Superposition and the Hadamard Gate**, scrolled to the
**H twice: interference in its simplest form** derivation.

**Say:**

> This is lesson six, and it shows the derivation this whole course is built
> around. Apply a Hadamard gate twice, and you land back exactly where you
> started, with certainty rather than likelihood. Watch the step where that
> happens.

**Action:** Point at the step where the |1⟩ amplitude cancels.

**Say:**

> The amplitude for outcome one is plus one half, plus minus one half, and
> that sum is exactly zero: not unlikely, impossible. That is the whole of
> quantum computing in one line. Classical probabilities never go negative, so
> they can never cancel each other out, but complex amplitudes can. Every
> quantum algorithm is really an exercise in arranging that cancellation, and
> this lesson proves it happens instead of just telling you that it does.

---

## 1:45 – 2:25 · The differentiator: physics verified by machine

**Screen:** Terminal, project root.

**Say:**

> Here is the part I most want to be judged on. Content about quantum
> mechanics is easy to get subtly wrong and hard to check by hand, so we do
> not check it by hand. Every circuit in every lesson runs against the
> simulator automatically and gets compared against what the lesson claims. I
> am going to run that verification suite right now.

**Action:** Run:

```bash
cd apps/api && uv run pytest tests/test_curriculum.py -q -s
```

Let the verified probabilities scroll on screen for a few seconds before you
keep talking — each line is a real simulator readout for one lesson, not a
canned log line.

**Say:**

> That is a hundred and forty-two checks: every circuit executed through
> Qiskit, every code example actually run, and its output compared against the
> lesson's own promise, and every single one passes.

---

## 2:25 – 3:05 · The AI assistant refuses to guess

**Screen:** Same lesson (Superposition and the Hadamard Gate), open the **AI
Copilot** panel.

**Say:**

> There is also an AI assistant built into every lesson, and it is
> deliberately restricted to this curriculum alone. I am going to try to trick
> it. I will ask it something no algebra can answer: out of exactly one hundred
> and thirty-seven shots of the Bell-pair circuit, with simulator seed
> forty-two, how many come out as one-one.

**Action:** Type that question into the Copilot panel and let it respond on
screen.

*(Why this question and not something like "P(1) after two Hadamards": that
one has an exact answer derivable by algebra alone — zero — so a model can
legitimately state it without running anything, which isn't the point being
demonstrated. A specific-seed shot count from a real pseudo-random number
generator has no closed form; the only way to know it is to actually run the
simulator, so this is the question that actually tests the refusal.)*

**Say:**

> Watch what it does instead of guessing. It refuses to state a number and
> tells me to run the circuit instead, because it is explicitly instructed
> never to invent a physics result. The simulator is the authority here, and
> the assistant is only the explainer.

---

## 3:05 – 3:50 · The Lab: build, simulate, run

**Screen:** **Lab** page. Default Bell-pair circuit.

**Say:**

> This is the Lab, the workspace where you build circuits directly. It starts
> as a Bell pair, and these numbers are not canned: they came from Qiskit Aer
> the moment the page loaded. Roughly fifty percent land on zero-zero, fifty
> percent on one-one, and critically, zero percent on the mixed outcomes, so
> the two qubits always agree, and that is entanglement.

**Action:** Click the **X** gate, then **q1**. Let results update.

**Say:**

> Now I will change the circuit, and the distribution flips so the two qubits
> always disagree instead, computed live.

**Action:** Click **Run as code**, then **Run**.

**Say:**

> This is the same circuit as real Qiskit Python, generated directly from what
> is on screen, and running it executes inside an isolated container and
> returns real measurement counts.

---

## 3:50 – 4:15 · Sandboxed execution

**Screen:** Terminal, alongside the Lab if you can manage split screen.

**Say:**

> Running arbitrary user Python is genuinely dangerous, so this is the part we
> took most seriously.

**Action:** With code running, run:

```bash
docker ps --filter label=app=quantum-lab-sandbox
```

**Say:**

> Every run gets a brand new container, with no network access, a read-only
> filesystem, every capability dropped, a non-root user, and hard limits on
> memory and CPU, and it is destroyed the instant the code finishes.

**Action:** Run it again after completion — empty list.

**Say:**

> Nothing persists between one execution and the next.

---

## 4:15 – 4:40 · Close

**Screen:** Back to the landing page.

**Say:**

> To summarise what is actually working today: seventeen complete lessons, all
> verified against a real simulator automatically, sandboxed code execution,
> and an AI assistant that defers to that simulator rather than guessing. The
> National Quantum Mission needs people who can actually do this, not just
> people who have heard of it, and that is the gap Quantum Lab closes. Thank
> you.

---

## Pre-recording checklist

1. **Say the team name and ID exactly as scripted** — "Creative Cartel", ID
   "157114" — in the first ten seconds. Judges scan for this first.
2. **Start the stack and let it settle.** `./scripts/qlab.sh up`, then load
   every page you'll visit *once* before recording.
3. **Sign in first.** Running code requires an account; signed out, the Run
   button becomes "Sign in to run this" and the demo stalls.
4. **Rehearse the AI Copilot moment once beforehand.** Confirm it actually
   refuses to give a number for the question in the script — you want a clean
   take, not a surprise on camera.
5. **If the pytest run crashes with exit code 3221225477** (an access
   violation, not a real failure — qiskit-aer's native extension occasionally
   segfaults on Windows under back-to-back subprocess launches), just re-run
   the command. It's a known intermittent native issue, not a physics or
   content bug, and the test now retries once on its own — but if it happens
   live, a second take will pass.
6. Set the browser to **dark mode**, zoom to about **110%**, close other apps
   (Docker needs the memory), and pre-type the long commands.

## Honesty guardrails

- **Simulator, not real hardware.** Say "simulator" — real quantum hardware
  access is future work.
- **Don't claim the AI is always correct.** The design point is narrower and
  true: it's told to defer to the simulator for any numeric claim, and the
  demo proves exactly that, nothing more.
- **Don't say "production-ready at scale."** It's a complete, tested,
  deployable system; the sandbox uses docker-out-of-docker, which is right for
  this deployment but would want a dedicated executor for hostile multi-tenant
  use. That answer lands better than a dodge if asked.
- **The 142-check content verification is real** — it's your strongest
  evidence. Lead with it if a judge interrupts.

## If you have time to spare

Only if you're clearly under 4:40 and want to spend it: add the Bloch-sphere
phase/coherence visuals (the φ slider not moving the probability bars, the
coherence slider shrinking the vector) between the Derivation and Physics
segments — about 40 seconds. Do not add back the general engineering tour or a
second AI question; they cost more time than they earn back in a technical
review.

## Timing summary

| Time | Segment | Screen |
| --- | --- | --- |
| 0:00 | Opening (team name + ID) | Landing |
| 0:20 | What it is | Landing |
| 1:00 | Derivation: H twice | Lesson 6 |
| 1:45 | **Physics verified by machine** | Terminal |
| 2:25 | AI assistant refuses to guess | Lesson 6, AI Copilot |
| 3:05 | Build, simulate, run | Lab |
| 3:50 | Sandboxed execution | Terminal |
| 4:15 | Close | Landing |
