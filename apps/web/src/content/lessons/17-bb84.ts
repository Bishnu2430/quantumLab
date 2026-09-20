import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "bb84",
  slug: "bb84",
  order: 17,
  title: "BB84 and Quantum Key Distribution",
  subtitle: "Security from physics rather than from hard problems",
  summary:
    "How two parties build a shared secret key, why eavesdropping necessarily leaves a trace, and what the 11% error threshold means in practice.",
  difficulty: "advanced",
  estimatedMinutes: 28,
  prerequisites: ["measurement-and-born-rule", "entanglement-and-bell-states"],
  objectives: [
    "Walk through the four stages of the BB84 protocol",
    "Explain why an intercept-resend attack introduces a 25% error rate",
    "State what the QBER threshold is and why one exists",
    "Distinguish what QKD protects from what it does not",
  ],
  sections: [
    {
      id: "premise",
      title: "A different basis for security",
      blocks: [
        {
          kind: "prose",
          text: "Classical key exchange rests on computational hardness: RSA is secure because factoring is slow. That is an assumption about algorithms, and Shor's algorithm shows it is an assumption that can fail.",
        },
        {
          kind: "prose",
          text: "BB84 rests on measurement instead. An eavesdropper must measure to learn anything, measurement disturbs the state, and the disturbance is detectable. Security follows from the structure of quantum mechanics rather than from anyone's inability to compute.",
        },
        {
          kind: "callout",
          tone: "history",
          title: "Bennett and Brassard, 1984",
          text: "Published at a conference in Bangalore and largely ignored at the time, BB84 predates Shor's algorithm by a decade. It is now the most deployed quantum protocol in existence, with commercial systems running over metropolitan fibre.",
        },
      ],
    },
    {
      id: "protocol",
      title: "The protocol",
      blocks: [
        {
          kind: "comparison",
          title: "Four stages",
          columns: ["Stage", "What happens"],
          rows: [
            {
              aspect: "1. Transmit",
              left: "Alice picks a random bit and a random basis (Z or X) for each qubit, prepares it accordingly, and sends it",
              right: "Four possible states: |0⟩, |1⟩, |+⟩, |−⟩",
            },
            {
              aspect: "2. Measure",
              left: "Bob measures each qubit in a randomly chosen basis",
              right: "He has no way to know Alice's choice in advance",
            },
            {
              aspect: "3. Sift",
              left: "They announce their bases publicly — never the bits — and discard every position where the bases differed",
              right: "About half survive; those bits agree perfectly if nobody interfered" ,
            },
            {
              aspect: "4. Check",
              left: "They compare a random sample of surviving bits and measure the error rate",
              right: "Too many errors means an eavesdropper; abort and restart",
            },
          ],
        },
        {
          kind: "prose",
          text: "The bases are announced openly and that costs nothing, because knowing which basis was used without knowing the bit reveals no information about the key.",
        },
      ],
    },
    {
      id: "eavesdropper",
      title: "Why eavesdropping shows up",
      blocks: [
        {
          kind: "prose",
          text: "Eve's difficulty is that she does not know the basis either. Intercepting a qubit forces her to guess, and a wrong guess destroys the information she was trying to steal while corrupting what Bob receives.",
        },
        {
          kind: "derivation",
          title: "The 25% error rate of intercept-resend",
          premise:
            "Eve measures every qubit in a randomly chosen basis, then sends Bob a fresh qubit prepared in whatever she observed. Consider only positions where Alice and Bob happened to agree on a basis — the ones that survive sifting.",
          steps: [
            {
              title: "Eve guesses the basis correctly, half the time",
              latex: "P(\\text{right basis}) = \\tfrac{1}{2} \\Rightarrow \\text{no error introduced}",
              explanation:
                "She reads the true bit and resends it faithfully. Bob's result matches Alice's, and this half of the traffic is silently compromised.",
            },
            {
              title: "She guesses wrongly, the other half",
              latex: "P(\\text{wrong basis}) = \\tfrac{1}{2}",
              explanation:
                "Measuring |+⟩ in the Z basis gives 0 or 1 at random, and destroys the original state. What she resends bears no relation to what Alice sent.",
            },
            {
              title: "Bob then errs half of that time",
              latex: "P(\\text{error}) = \\tfrac{1}{2} \\times \\tfrac{1}{2} = \\tfrac{1}{4}",
              explanation:
                "Bob measures Eve's wrongly-prepared qubit in the correct basis, so he gets a random answer — matching Alice only half the time.",
            },
          ],
          conclusion:
            "Full intercept-resend produces a 25% error rate on sifted bits, against 0% for an undisturbed channel. Alice and Bob detect it by comparing a sample, and the more bits they compare the more certain the detection.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "The 11% threshold",
          text: "Eve need not intercept everything — partial attacks yield partial information at a lower error rate. Security proofs show BB84 stays secure as long as the observed error rate stays under roughly 11%, because below that, privacy amplification can compress the key down to a portion Eve provably knows nothing about. Above it, abort.",
        },
      ],
    },
    {
      id: "limits",
      title: "What it does and does not protect",
      blocks: [
        {
          kind: "comparison",
          title: "Scope",
          columns: ["Protected", "Not protected"],
          rows: [
            { aspect: "Key secrecy", left: "Guaranteed by physics, given the stated assumptions", right: "—" },
            { aspect: "Future decryption", left: "Recorded traffic cannot be broken later by a quantum computer", right: "—" },
            { aspect: "Authentication", left: "—", right: "Needs a pre-shared secret; QKD alone is open to a man in the middle" },
            { aspect: "Implementation", left: "—", right: "Detector blinding, photon-number splitting and side channels have all broken real hardware" },
            { aspect: "Range", left: "—", right: "Fibre loss limits practical distance; repeaters remain an open problem" },
          ],
        },
        {
          kind: "misconception",
          claim: "QKD is unbreakable, so it solves cryptography.",
          correction:
            "The *protocol* is provably secure under stated assumptions. Real systems are hardware, and attacks on implementations — rather than on the mathematics — have repeatedly succeeded against commercial devices. QKD also requires an authenticated classical channel, which means it needs an existing shared secret to bootstrap. It distributes keys extremely well; it does not replace cryptography.",
        },
      ],
    },
  ],
  visual: {
    renderer: "bb84-studio",
    title: "BB84 security laboratory",
    caption:
      "Run the protocol with and without an eavesdropper. Watch the sifted key agree perfectly on a clean channel, then watch the error rate climb towards 25% once Eve starts intercepting.",
  },
  circuit: {
    title: "An eavesdropper leaving a trace",
    description:
      "Alice sends |+⟩ on q0, Eve entangles a probe (q1) to learn the value, and Bob measures in the X basis. On a clean channel Bob would read 0 every time; here all four outcomes are equally likely, so his half of the results is pure noise.",
    numQubits: 2,
    numClbits: 2,
    operations: [
      { id: "op-alice", gate: "h", targets: [0], note: "Alice prepares |+⟩ — bit 0 encoded in the X basis." },
      {
        id: "op-eve",
        gate: "cx",
        targets: [1],
        controls: [0],
        note: "Eve's probe copies the Z-basis value, which is exactly the wrong basis. This is what disturbs the state.",
      },
      { id: "op-bob", gate: "h", targets: [0], note: "Bob measures in the X basis — the same one Alice used, so he should be certain." },
    ],
    // Without Eve, Bob's qubit would read 0 with probability 1.
    expected: { "00": 0.25, "01": 0.25, "10": 0.25, "11": 0.25 },
  },
  code: {
    title: "Running BB84 with and without Eve",
    description:
      "Simulates the full protocol over many qubits, sifts the key, and reports the error rate in both cases — cleanly separating a safe channel from a compromised one.",
    language: "python",
    code: `import numpy as np

rng = np.random.default_rng(2024)
N = 4000

def run(eavesdropper: bool):
    alice_bits = rng.integers(0, 2, N)
    alice_bases = rng.integers(0, 2, N)   # 0 = Z basis, 1 = X basis
    bob_bases = rng.integers(0, 2, N)

    bob_bits = np.empty(N, dtype=int)
    for i in range(N):
        bit, basis = alice_bits[i], alice_bases[i]

        if eavesdropper:
            eve_basis = rng.integers(0, 2)
            if eve_basis == basis:
                bit = bit                      # right basis: reads it correctly
            else:
                bit = rng.integers(0, 2)       # wrong basis: random, and the
                basis = eve_basis              # state is destroyed and resent

        if bob_bases[i] == basis:
            bob_bits[i] = bit
        else:
            bob_bits[i] = rng.integers(0, 2)   # wrong basis: uniformly random

    # Sifting: keep only positions where Alice and Bob chose the same basis.
    kept = alice_bases == bob_bases
    sifted_alice = alice_bits[kept]
    sifted_bob = bob_bits[kept]
    qber = float(np.mean(sifted_alice != sifted_bob))
    return len(sifted_alice), qber

for label, eve in (("clean channel", False), ("Eve intercepting", True)):
    length, qber = run(eve)
    verdict = "ABORT" if qber > 0.11 else "accept"
    print(f"{label:18} sifted bits {length:5d}   QBER {qber:6.2%}   -> {verdict}")

print()
print("Intercept-resend costs Eve a ~25% error rate, far above the ~11%")
print("threshold, so Alice and Bob detect her by comparing a sample.")`,
    expectedOutput: ["clean channel", "Eve intercepting"],
  },
  keyTakeaways: [
    "BB84's security rests on measurement disturbance, not on any computational hardness assumption",
    "Bases are announced publicly; only positions with matching bases are kept",
    "Intercept-resend produces a 25% error rate on sifted bits, against 0% on a clean channel",
    "Security proofs tolerate an error rate up to roughly 11% before the key must be discarded",
    "The protocol is provably secure; real hardware has been broken through side channels, and QKD still needs authentication",
  ],
  references: [
    { source: "Bennett & Brassard, Quantum cryptography: Public key distribution and coin tossing", locator: "Proc. IEEE ICCSSP, Bangalore, p. 175 (1984)" },
    { source: "Shor & Preskill, Simple proof of security of the BB84 protocol", locator: "Phys. Rev. Lett. 85, 441 (2000)" },
    { source: "Lydersen et al., Hacking commercial quantum cryptography systems", locator: "Nature Photonics 4, 686 (2010)" },
  ],
};
