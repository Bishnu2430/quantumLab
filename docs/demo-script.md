# Quantum Lab — 10 minute demo script

For the SIH 2026 evaluation video. Written to be read aloud at a normal pace
(~145 words per minute). Timings are cumulative.

**Before you record, read the checklist at the bottom.** Two items in it will
save you a re-take.

---

## 0:00 – 0:40 · Opening

**Screen:** Landing page (`http://localhost:3000`), scrolled to the top.

> India's National Quantum Mission has committed to building quantum computers
> and a quantum workforce this decade. The hardware is being funded. The people
> are the harder problem — and quantum computing is famously difficult to learn,
> because almost everything written about it either hand-waves the mathematics
> or buries the reader in it.
>
> We built Quantum Lab to sit between those two failures. Seventeen lessons that
> derive every result step by step, and then let you run the physics yourself and
> check that the derivation was right.
>
> I'm going to show you the product, and then one thing under the hood that I
> think makes this different from every other quantum tutorial out there.

*(If your problem statement has an ID, name it in the first sentence instead of
the generic NQM framing. Judges look for that link explicitly.)*

---

## 0:40 – 1:20 · What it is

**Action:** Slowly scroll the landing page past the three feature cards.

> Three claims, and I'll demonstrate all of them.
>
> Nothing here is made up — every probability a lesson states is checked against
> a real quantum simulator automatically, and if the simulator disagrees with the
> text, the build fails and the lesson cannot ship.
>
> You run the physics — circuits execute on IBM's Qiskit Aer simulator, and
> Python runs in an isolated sandbox.
>
> And the lessons derive rather than assert. Every step says *why* it is allowed.

**Action:** Click **Start with lesson one**, then immediately click **Learn** in
the navbar to show the full curriculum list.

> Seventeen lessons, about seven hours, from "what is a qubit" through to
> Grover's search algorithm and BB84 quantum cryptography.

---

## 1:20 – 3:00 · A lesson, in depth

**Action:** Open **Superposition and the Hadamard Gate**. Scroll slowly.

> This is lesson six. Look at what a single lesson contains.

**Action:** Pause on the objectives box.

> It opens with what you'll be able to *do* — not "understand superposition",
> but "compute H applied to zero by matrix multiplication".

**Action:** Scroll to the **H twice: interference in its simplest form**
derivation. Let it sit on screen.

> This is the heart of it. The Hadamard gate creates a superposition. Apply it
> twice and you get back exactly where you started — with certainty.
>
> The derivation walks through why, one step at a time, and every step explains
> the justification, not just the algebra. Watch the fourth step.

**Action:** Point at / highlight the step where the |1⟩ amplitude cancels.

> The amplitude for outcome one is plus one half, plus minus one half. That is
> exactly zero. Not unlikely — impossible.
>
> And that is the whole of quantum computing in one line. Classical probabilities
> are never negative, so they can never cancel. Complex amplitudes can. Every
> quantum algorithm is an exercise in arranging that cancellation.

**Action:** Scroll to the misconception block.

> We also name the misconceptions directly. A lot of people believe a qubit in
> superposition is secretly zero or one and we just don't know which. The lesson
> gives you an experiment that rules it out, rather than just asserting it's
> wrong. Across the course there are twenty of these.

---

## 3:00 – 4:15 · The differentiator: physics verified by machine

**Screen:** Switch to a terminal in the project directory.

> Here is the part I actually want to be judged on.
>
> Educational content about quantum mechanics is very easy to get subtly wrong,
> and very hard to check. So we don't check it by hand. Every circuit in every
> lesson is executed against the simulator automatically, and compared to what
> the lesson claims.

**Action:** Run:

```bash
cd apps/api && uv run pytest tests/test_curriculum.py -q
```

> A hundred and forty-two checks. Every lesson circuit run through Qiskit, every
> code example actually executed and its output compared against what the lesson
> promised.

**Action:** Now demonstrate it catching an error. Edit the expected probability
in `apps/web/src/content/lessons/06-superposition-and-hadamard.ts` — change
`expected: { "0": 1.0, "1": 0.0 }` to `{ "0": 0.5, "1": 0.5 }` — then:

```bash
cd apps/web && npm run content:export
cd ../api && uv run pytest tests/test_curriculum.py -q -k probabilities
```

> I've just made the lesson claim something false — that two Hadamards give a
> fifty-fifty result. Watch.

**Action:** Let the failure appear on screen:

```
superposition-and-hadamard: lesson claims P(0) = 0.5, simulator gives 1.0
```

> The build refuses it. A lesson cannot ship physics the simulator does not
> reproduce. As far as we know, no other quantum learning platform enforces
> correctness this way.

**Action:** Revert the change and re-export. *(Do this before recording the next
segment, or just cut here.)*

---

## 4:15 – 5:20 · Visuals that explain themselves

**Screen:** Back to the browser. Open **The Qubit and the Bloch Sphere**, scroll
to the Bloch sphere.

> Interactive visuals are common in this space. Most of them give you a slider
> labelled "theta" and leave you to guess.

**Action:** Drag the **θ** slider slowly.

> Ours tells you what the control does before you touch it — "tips the state
> between zero and one" — and then tells you what's true *right now*: P of zero
> is sixty-eight percent, so the outcome is biased but not certain.

**Action:** Drag the **φ** slider. Point at the probability bars staying still.

> Now watch this. I'm changing the phase, and the probabilities do not move at
> all. That's the single most confusing thing about a qubit, and here you can
> see it rather than be told it.

**Action:** Click the **info** icon on the φ control to expand the detail.

> And if you want the deeper explanation, it's one click away — phase is
> invisible to this measurement, and becomes visible the moment another gate
> interferes the two components.

**Action:** Drag the **Coherence** slider down.

> This one is decoherence — real qubits leak information to their environment.
> Watch the vector shrink toward the centre. That's a qubit losing its quantum
> character and becoming an ordinary classical coin. It's the reason quantum
> computers are hard to build, and you can feel it here.

---

## 5:20 – 6:40 · The Lab: build, simulate, run

**Action:** Click **Lab** in the navbar.

> This is the workspace. It starts with a Bell pair — the standard entangled
> state.

**Action:** Point at the results panel.

> Those numbers came from Qiskit Aer, computed when the page loaded. Roughly
> fifty percent on zero-zero, fifty on one-one, and crucially *zero* on the mixed
> outcomes. The two qubits always agree. That's entanglement.

**Action:** Click the **X** gate, then click **q1**.

> Let me change the circuit. I pick a gate — and before I place it, it tells me
> what it will do.

**Action:** Let the results update.

> And the distribution flips to zero-one and one-zero. The qubits now always
> *disagree*. That's a different Bell state, computed live.

**Action:** Click the **Run as code** tab.

> The same circuit, as real Qiskit Python. Not a picture of code — this is
> generated from the circuit on screen.

**Action:** Click **Run**. Wait for output.

> And that executed in an isolated container and came back with real measurement
> counts.

---

## 6:40 – 7:40 · Security and roles

**Screen:** Terminal, side by side with the browser if you can manage it.

> Running arbitrary user-submitted Python on a server is genuinely dangerous, so
> this is the part we took most seriously.

**Action:** With code running in the Lab, run:

```bash
docker ps --filter label=app=quantum-lab-sandbox
```

> Every execution gets a brand new container: no network at all, read-only
> filesystem, all Linux capabilities dropped, runs as a non-root user, hard caps
> on memory, CPU and process count. It's destroyed the moment the code finishes.

**Action:** Run it again after the code completes, showing an empty list.

> Gone. Nothing survives from one execution to the next.

> There's a second layer in the role model. A learner never submits code at all —
> they send a lesson identifier, and the server runs its own trusted copy. So for
> the majority of users, the untrusted-code path does not exist. Only a
> researcher can submit their own Python, and only an admin can grant that role.

---

## 7:40 – 8:25 · The AI assistant

**Action:** Back in the browser, open a lesson and click **AI Copilot**.

> There's an AI assistant, and it's built with one unusual instruction.

**Action:** Ask: *"Why do amplitudes need to be complex?"* Let it stream.

> It's grounded in this specific curriculum — it can only discuss the seventeen
> lessons that exist, and it links back to them.
>
> And it's explicitly told never to invent a numerical result. If you ask it for
> a probability, it tells you to run the circuit instead. In a subject where
> language models confidently produce wrong physics, we made the simulator the
> authority and the assistant the explainer.

---

## 8:25 – 9:20 · Engineering

**Screen:** Terminal.

> Briefly, on how it's built.

**Action:** Run `docker compose ps`.

> Next.js frontend, FastAPI backend, Postgres, and a hardened sandbox image. The
> entire stack is one command.

**Action:** Run `./scripts/qlab.sh test` (or show the earlier run).

> Two hundred and seventeen automated tests. Those cover the physics, the
> authentication — including things like refresh-token rotation and detecting a
> stolen token — the sandbox limits, and every lesson's content.
>
> Authentication uses httpOnly cookies and Argon2 hashing. Database migrations
> are version-controlled. There's one script that manages the whole stack,
> including opening a psql session on the database.

---

## 9:20 – 10:00 · Close

**Screen:** Back to the landing page.

> To summarise what's actually working today: seventeen complete lessons,
> fourteen runnable circuits, sixteen executable programs, all verified against a
> real simulator automatically. Sandboxed code execution. Three user roles. A
> grounded AI assistant. One-command deployment.
>
> Where we'd take it next is the obvious gap — this teaches the foundations
> beautifully but stops at Grover and BB84. Error correction, variational
> algorithms and real hardware access through IBM Quantum are the natural
> continuation, and the content pipeline is built to take them.
>
> The National Quantum Mission needs people who can actually do this, not just
> people who have heard of it. That's the gap we're trying to close.
>
> Thank you.

---

## Pre-recording checklist

**Do these two things or you will re-take:**

1. **Start the stack and let it settle.** `./scripts/qlab.sh up`, then load every
   page you plan to visit *once* before recording. First loads are slower.
2. **Sign in first.** Running code requires an account. If you're signed out,
   the Run button becomes "Sign in to run this" and the demo stalls.

Also worth doing:

- Close other applications. Docker needs the memory, and a slow container start
  is dead air on camera.
- Set the browser to **dark mode** via the theme toggle — the visuals read better
  on video.
- Zoom the browser to about **110%** so equations are legible after compression.
- Have the terminal already `cd`'d into the project.
- Pre-type the long commands so you're not typing on camera.
- Decide in advance whether you're reverting the deliberate-failure edit on
  camera or cutting. Cutting is cleaner.

## Honesty guardrails

Judges may probe these, so don't overstate them:

- **Don't say "runs on a real quantum computer."** It's a simulator — say
  simulator. Real hardware access is future work.
- **Don't claim the AI is always correct.** The design point is that it's told
  to defer to the simulator, which is stronger and true.
- **Don't say "production-ready at scale."** Say it's a complete, tested,
  deployable system. The sandbox uses docker-out-of-docker, which is right for
  this deployment but would need a dedicated executor for hostile multi-tenant
  use — if a judge asks, that answer will impress them more than a dodge.
- **The 217 tests are real.** So is the 142-check content verification. Lean on
  those, they're your strongest evidence.

## If you need to cut to 7 minutes

Drop in this order: the engineering section (8:25), then the AI assistant
(7:40), then shorten the lesson walkthrough. **Never cut the verification demo
at 3:00** — it is the single most distinctive thing about the project.

## Timing summary

| Time | Segment | Screen |
| --- | --- | --- |
| 0:00 | Problem and hook | Landing |
| 0:40 | What it is | Landing + curriculum |
| 1:20 | A lesson in depth | Lesson 6 |
| 3:00 | **Physics verified by machine** | Terminal |
| 4:15 | Self-explaining visuals | Lesson 5, Bloch sphere |
| 5:20 | Build, simulate, run | Lab |
| 6:40 | Security and roles | Terminal + Lab |
| 7:40 | AI assistant | Copilot drawer |
| 8:25 | Engineering | Terminal |
| 9:20 | Close | Landing |
