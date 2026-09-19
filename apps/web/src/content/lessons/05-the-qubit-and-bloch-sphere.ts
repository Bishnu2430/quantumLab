import type { Lesson } from "../types";

export const lesson: Lesson = {
  id: "the-qubit",
  slug: "the-qubit",
  order: 5,
  title: "The Qubit and the Bloch Sphere",
  subtitle: "From two complex amplitudes to a point on a sphere",
  summary:
    "The state of a single qubit, why normalisation is forced on us, why global phase is unobservable, and how the two remaining degrees of freedom become a point on a sphere.",
  difficulty: "beginner",
  estimatedMinutes: 25,
  prerequisites: ["complex-amplitudes", "dirac-notation"],
  objectives: [
    "Write an arbitrary single-qubit state in terms of two complex amplitudes",
    "Apply the Born rule to predict measurement probabilities from those amplitudes",
    "Explain why global phase carries no physical information but relative phase does",
    "Convert between the amplitude form and the Bloch angles (θ, φ)",
    "Locate |0⟩, |1⟩, |+⟩, |−⟩, |i⟩ and |−i⟩ on the Bloch sphere",
  ],
  sections: [
    {
      id: "state",
      title: "The state of a qubit",
      blocks: [
        {
          kind: "prose",
          text: "A classical bit is one of two values. A qubit's state is a unit vector in a two-dimensional complex vector space, with the two classical values appearing as a chosen orthonormal basis — the **computational basis**.",
        },
        {
          kind: "equation",
          latex: "|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle, \\qquad \\alpha, \\beta \\in \\mathbb{C}",
          caption:
            "Any single-qubit state is a complex linear combination of the two basis states.",
          where: [
            { symbol: "|0\\rangle, |1\\rangle", meaning: "the computational basis, as column vectors (1,0)ᵀ and (0,1)ᵀ" },
            { symbol: "\\alpha, \\beta", meaning: "probability amplitudes — complex numbers, not probabilities" },
          ],
        },
        {
          kind: "prose",
          text: "The word *amplitude* is doing real work here. $\\alpha$ and $\\beta$ are not probabilities: they are complex, they can be negative, and they can cancel. Probabilities only appear when you measure.",
        },
        {
          kind: "equation",
          latex: "P(0) = |\\alpha|^2, \\qquad P(1) = |\\beta|^2",
          caption:
            "The Born rule: the probability of an outcome is the squared magnitude of its amplitude.",
        },
        {
          kind: "prose",
          text: "Because those two outcomes are the only possibilities, their probabilities must sum to one. That is not an extra assumption — it is the requirement that $|\\psi\\rangle$ be a unit vector.",
        },
        {
          kind: "equation",
          latex: "|\\alpha|^2 + |\\beta|^2 = 1 \\quad \\Longleftrightarrow \\quad \\langle\\psi|\\psi\\rangle = 1",
          caption: "Normalisation. Every physical state satisfies it, and every gate preserves it.",
        },
      ],
    },
    {
      id: "phase",
      title: "Global phase is invisible; relative phase is not",
      blocks: [
        {
          kind: "prose",
          text: "A complex amplitude has a magnitude and a phase. Since the Born rule only ever sees squared magnitudes, you might expect phase to be irrelevant. It is subtler than that: *global* phase is unobservable, but *relative* phase is the whole reason interference exists.",
        },
        {
          kind: "derivation",
          title: "Why a global phase cannot be detected",
          premise:
            "Take any state |ψ⟩ and multiply the whole thing by a unit-modulus complex number e^{iγ}. Call the result |ψ′⟩.",
          steps: [
            {
              title: "Write out the rotated state",
              latex: "|\\psi'\\rangle = e^{i\\gamma}|\\psi\\rangle = e^{i\\gamma}\\alpha|0\\rangle + e^{i\\gamma}\\beta|1\\rangle",
              explanation: "Scalar multiplication distributes over both components equally.",
            },
            {
              title: "Compute the measurement probabilities",
              latex: "|e^{i\\gamma}\\alpha|^2 = e^{i\\gamma}\\alpha \\overline{(e^{i\\gamma}\\alpha)} = e^{i\\gamma}e^{-i\\gamma}|\\alpha|^2 = |\\alpha|^2",
              explanation:
                "The conjugate carries e^{-iγ}, which cancels the e^{iγ} exactly because |e^{iγ}| = 1. The same holds for β.",
            },
            {
              title: "Extend to any measurement whatsoever",
              latex: "\\langle\\psi'|M|\\psi'\\rangle = e^{-i\\gamma}e^{i\\gamma}\\langle\\psi|M|\\psi\\rangle = \\langle\\psi|M|\\psi\\rangle",
              explanation:
                "The argument does not depend on measuring in the computational basis: for any observable M the phases cancel between the bra and the ket. No experiment can distinguish the two states.",
            },
          ],
          conclusion:
            "|ψ⟩ and e^{iγ}|ψ⟩ are the same physical state. This is why a qubit has two real degrees of freedom rather than four: normalisation removes one, and global phase removes another.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Relative phase is a different matter entirely",
          text: "The states (|0⟩+|1⟩)/√2 and (|0⟩−|1⟩)/√2 both give 50/50 in the computational basis, so a Z-basis measurement cannot tell them apart. But they are orthogonal — perfectly distinguishable in the X basis, and they behave completely differently under further gates. The minus sign is a relative phase between components, not a global one.",
        },
      ],
    },
    {
      id: "bloch",
      title: "The Bloch sphere",
      blocks: [
        {
          kind: "prose",
          text: "Four real parameters, minus one for normalisation, minus one for global phase, leaves two. Two real parameters are exactly what it takes to name a point on the surface of a sphere — and that correspondence is the Bloch sphere.",
        },
        {
          kind: "derivation",
          title: "From amplitudes to angles",
          premise: "Start from |ψ⟩ = α|0⟩ + β|1⟩ with |α|² + |β|² = 1.",
          steps: [
            {
              title: "Write both amplitudes in polar form",
              latex: "\\alpha = r_0 e^{i\\varphi_0}, \\qquad \\beta = r_1 e^{i\\varphi_1}",
              explanation: "Any complex number decomposes into a non-negative magnitude and a phase.",
            },
            {
              title: "Discard the global phase",
              latex: "|\\psi\\rangle \\simeq r_0|0\\rangle + r_1 e^{i(\\varphi_1 - \\varphi_0)}|1\\rangle",
              explanation:
                "Factoring out e^{iφ₀} changes nothing physical, by the previous derivation. Only the difference φ = φ₁ − φ₀ survives — the relative phase.",
            },
            {
              title: "Use normalisation to trade two magnitudes for one angle",
              latex: "r_0 = \\cos\\tfrac{\\theta}{2}, \\qquad r_1 = \\sin\\tfrac{\\theta}{2}, \\qquad \\theta \\in [0, \\pi]",
              explanation:
                "r₀² + r₁² = 1 with both non-negative is precisely the constraint satisfied by cos and sin of a single angle. Restricting θ to [0, π] keeps both non-negative and makes the parameterisation unique.",
            },
          ],
          conclusion:
            "Every single-qubit pure state is written with exactly two angles, and every choice of those two angles is a valid state.",
        },
        {
          kind: "equation",
          latex: "|\\psi\\rangle = \\cos\\frac{\\theta}{2}|0\\rangle + e^{i\\varphi}\\sin\\frac{\\theta}{2}|1\\rangle",
          caption: "The Bloch parameterisation of a single-qubit pure state.",
          where: [
            { symbol: "\\theta \\in [0,\\pi]", meaning: "polar angle from the +z axis; sets the measurement probabilities" },
            { symbol: "\\varphi \\in [0,2\\pi)", meaning: "azimuthal angle; the relative phase, invisible to a Z measurement" },
          ],
        },
        {
          kind: "callout",
          tone: "insight",
          title: "Why θ/2 and not θ",
          text: "Orthogonal states must sit at opposite poles: |0⟩ at the north pole and |1⟩ at the south, separated by θ = π. But |0⟩ and |1⟩ are orthogonal, at 90° in the state space. The half-angle is what reconciles a 180° rotation on the sphere with a 90° separation in Hilbert space — the sphere is a 2-to-1 image of the state space, the same SU(2) → SO(3) relationship that makes a spin-½ particle need a 720° rotation to return to itself.",
        },
        {
          kind: "comparison",
          title: "The six cardinal states",
          columns: ["State", "Position and angles"],
          rows: [
            { aspect: "|0⟩", left: "θ = 0", right: "+z, the north pole" },
            { aspect: "|1⟩", left: "θ = π", right: "−z, the south pole (φ undefined at the poles)" },
            { aspect: "|+⟩ = (|0⟩+|1⟩)/√2", left: "θ = π/2, φ = 0", right: "+x" },
            { aspect: "|−⟩ = (|0⟩−|1⟩)/√2", left: "θ = π/2, φ = π", right: "−x" },
            { aspect: "|i⟩ = (|0⟩+i|1⟩)/√2", left: "θ = π/2, φ = π/2", right: "+y" },
            { aspect: "|−i⟩ = (|0⟩−i|1⟩)/√2", left: "θ = π/2, φ = 3π/2", right: "−y" },
          ],
        },
        {
          kind: "misconception",
          claim: "The Bloch sphere shows where the qubit 'really is', like a spinning arrow.",
          correction:
            "It is a bookkeeping device for two real parameters, not a location in space. The arrow does coincide with the spin direction for a spin-½ particle, which is where the picture comes from, but for a superconducting or photonic qubit nothing is pointing anywhere. The picture also does not survive contact with more qubits: two qubits need six real parameters, and no product of two spheres captures an entangled state.",
        },
      ],
    },
  ],
  visual: {
    renderer: "bloch-sphere",
    title: "Bloch sphere explorer",
    caption:
      "Drag θ and watch P(0) and P(1) respond. Then drag φ — the vector moves around the equator while both probabilities stay fixed, because relative phase is invisible to a Z-basis measurement.",
    props: {
      controls: ["theta", "phi"],
      initial: { theta: 0, phi: 0 },
      markers: ["|0>", "|1>", "|+>", "|->", "|i>", "|-i>"],
      readouts: ["amplitudes", "probabilities", "expectation"],
    },
  },
  circuit: {
    title: "Preparing an arbitrary state",
    description:
      "Ry(θ) tilts the state off the north pole, setting the measurement probabilities; Rz(φ) then rotates it around the equator, setting the relative phase without touching those probabilities.",
    numQubits: 1,
    numClbits: 1,
    operations: [
      {
        id: "op-ry",
        gate: "ry",
        targets: [0],
        params: [Math.PI / 3],
        note: "Ry(π/3) rotates by θ = π/3 about the y-axis, giving cos(π/6)|0⟩ + sin(π/6)|1⟩.",
      },
      {
        id: "op-rz",
        gate: "rz",
        targets: [0],
        params: [Math.PI / 2],
        note: "Rz(π/2) adds a relative phase of π/2. The probabilities below are unchanged by it.",
      },
    ],
    // cos²(π/6) = 3/4 and sin²(π/6) = 1/4 exactly.
    expected: { "0": 0.75, "1": 0.25 },
  },
  code: {
    title: "Recovering the Bloch vector from the state",
    description:
      "Computes the expectation values ⟨X⟩, ⟨Y⟩, ⟨Z⟩ — which are the Cartesian coordinates of the Bloch vector — and confirms they match the angles you put in.",
    language: "python",
    code: `import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

theta, phi = np.pi / 3, np.pi / 2

qc = QuantumCircuit(1)
qc.ry(theta, 0)
qc.rz(phi, 0)

state = Statevector.from_instruction(qc)
alpha, beta = state.data

print(f"alpha = {alpha:.4f}")
print(f"beta  = {beta:.4f}")
print(f"P(0)  = {abs(alpha)**2:.4f}   (expected {np.cos(theta/2)**2:.4f})")
print(f"P(1)  = {abs(beta)**2:.4f}   (expected {np.sin(theta/2)**2:.4f})")

# The Bloch vector is the triple of Pauli expectation values.
X = np.array([[0, 1], [1, 0]])
Y = np.array([[0, -1j], [1j, 0]])
Z = np.array([[1, 0], [0, -1]])
v = state.data.conj()

x, y, z = (np.real(v @ P @ state.data) for P in (X, Y, Z))
print(f"Bloch vector = ({x:.4f}, {y:.4f}, {z:.4f})")
print(f"length       = {np.sqrt(x**2 + y**2 + z**2):.4f}  (1.0 for any pure state)")

# Read the angles back out of the vector.
print(f"theta recovered = {np.arccos(z):.4f}  (input {theta:.4f})")`,
    expectedOutput: ["P(0)  = 0.7500", "length       = 1.0000"],
  },
  keyTakeaways: [
    "A qubit state is two complex amplitudes constrained by |α|² + |β|² = 1",
    "Amplitudes are not probabilities: the Born rule squares their magnitudes to get probabilities",
    "Global phase is physically undetectable; relative phase determines interference and is not",
    "Those two constraints leave two real parameters, which are the Bloch angles θ and φ",
    "θ fixes the measurement probabilities, φ moves the state around the equator without changing them",
    "The Bloch picture applies to one qubit only — it cannot represent entanglement",
  ],
  references: [
    { source: "Nielsen & Chuang, Quantum Computation and Quantum Information", locator: "§1.2, §4.2" },
    { source: "Griffiths & Schroeter, Introduction to Quantum Mechanics", locator: "Chapter 4 (spin)" },
    { source: "IBM Quantum Learning, Basics of Quantum Information", url: "https://learning.quantum.ibm.com/" },
  ],
};
