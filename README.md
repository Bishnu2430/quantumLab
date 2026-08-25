# PBQUANTUM LABS — MASTER INTERACTIVE QUANTUM EDUCATION ENGINE

**PBQuantum Labs** is an interactive, world-class quantum computing learning laboratory and digital textbook software built with **Next.js 14**, **FastAPI**, **TypeScript**, **Tailwind CSS**, and **IBM Qiskit Aer**.

It transforms quantum mechanics and quantum computing from abstract equations into a visual, interactive, experimental learning environment. A complete beginner, engineering student, or advanced researcher can understand:

- **WHAT** the concept is
- **WHY** it matters in quantum physics and computing
- **HOW** it works visually and mathematically
- **WHAT** the statevector and 3D Bloch sphere show
- **HOW** the circuit represents the transformation
- **HOW** IBM Qiskit Aer simulates the quantum execution
- **WHY** the observed simulation results occur

---

## 1. THE MASTER LEARNING LOOP ARCHITECTURE

Every concept in PBQuantum Labs follows the strict 9-step educational loop:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. LEARN       ➔ Plain-language concept introduction                    │
│ 2. SEE         ➔ Interactive visual model & 3D Bloch sphere             │
│ 3. TOUCH       ➔ Real-time parameter sliders (Amplitudes, Phase)       │
│ 4. CALCULATE   ➔ Step-by-step matrix multiplication breakdown           │
│ 5. BUILD       ➔ Interactive quantum circuit wire builder               │
│ 6. RUN         ➔ Real IBM Qiskit Aer simulation execution                │
│ 7. OBSERVE     ➔ Measured probabilities, statevector & shot counts       │
│ 8. EXPLAIN     ➔ Physical & mathematical reasoning of the result        │
│ 9. CHALLENGE   ➔ Interactive exercises with statevector validation      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Teacher Mode (3 Explanation Levels)
Every major lesson provides three progressive levels of explanation:
- **Level 1 — Intuitive (Beginner / School):** Simple analogies and visual models (e.g. classical switch vs quantum sphere).
- **Level 2 — Engineering (Undergraduate):** State vectors, unitary matrices, circuit gate diagrams, and Qiskit Python code.
- **Level 3 — Rigorous Mathematics (Advanced):** Hilbert space $\mathcal{H} \cong \mathbb{C}^2$, inner products $\langle\psi|\psi\rangle = 1$, projective measurement operators $P_m$, Lie group geometry $\text{SU}(2)$, and tensor products.

---

## 2. DETAILED QUANTUM CONCEPTS TAUGHT & EXPLAINED

### Module 01: Qubits & The Quantum State Vector (`/learn/qubits`)
- **Classical Bit vs Quantum Qubit:** A classical bit is deterministically strictly 0 or 1. A qubit exists in a linear combination (superposition) of computational basis states $|0\rangle$ and $|1\rangle$.
- **State Vector Equation:**  
  $$|\psi\rangle = \alpha|0\rangle + \beta|1\rangle \quad \text{where } \alpha, \beta \in \mathbb{C}$$
- **Complex Probability Amplitudes vs Probabilities:** $\alpha$ and $\beta$ are complex numbers ($a + bi$). By Born's Rule, measurement probabilities are given by squared magnitudes:
  $$P(0) = |\alpha|^2, \quad P(1) = |\beta|^2$$
- **Normalization Constraint:** Total probability must equal 100%:
  $$|\alpha|^2 + |\beta|^2 = 1 \quad \iff \quad \langle\psi|\psi\rangle = 1$$
- **3D Bloch Sphere Geometry:** Every pure single-qubit state maps to a point on the 3D unit Bloch sphere parameterized by polar angle $\theta$ and azimuthal phase angle $\phi$:
  $$|\psi\rangle = \cos\left(\frac{\theta}{2}\right)|0\rangle + e^{i\phi}\sin\left(\frac{\theta}{2}\right)|1\rangle$$
  - Poles: $|0\rangle$ (Top $+Z$), $|1\rangle$ (Bottom $-Z$), $|+\rangle$ ($+X$), $|-\rangle$ ($-X$), $|i\rangle$ ($+Y$), $|-i\rangle$ ($-Y$).

---

### Module 02: Superposition & The Hadamard Gate (`/learn/superposition`)
- **Superposition State Creation:** The Hadamard gate ($H$) transforms basis state $|0\rangle$ into equal superposition state $|+\rangle$:
  $$H|0\rangle = \frac{|0\rangle + |1\rangle}{\sqrt{2}} = |+\rangle, \quad H|1\rangle = \frac{|0\rangle - |1\rangle}{\sqrt{2}} = |-\rangle$$
- **Hadamard Matrix Representation:**
  $$H = \frac{1}{\sqrt{2}} \begin{bmatrix} 1 & 1 \\ 1 & -1 \end{bmatrix}$$
- **Matrix-Vector Multiplication Step:**
  $$H|0\rangle = \frac{1}{\sqrt{2}} \begin{bmatrix} 1 & 1 \\ 1 & -1 \end{bmatrix} \begin{bmatrix} 1 \\ 0 \end{bmatrix} = \frac{1}{\sqrt{2}} \begin{bmatrix} 1 \\ 1 \end{bmatrix} = |+\rangle$$
- **Quantum Interference ($H(H|0\rangle) = |0\rangle$):**  
  Applying Hadamard twice causes amplitude interference:
  $$H(H|0\rangle) = \frac{1}{2} \left[ (|0\rangle + |1\rangle) + (|0\rangle - |1\rangle) \right] = |0\rangle$$
  - State $|0\rangle$: $\frac{1}{2} + \frac{1}{2} = 1$ (**Constructive Interference**)
  - State $|1\rangle$: $\frac{1}{2} - \frac{1}{2} = 0$ (**Destructive Interference**)
- **Superposition vs Classical Randomness:** Superposition maintains coherent quantum phase relationships. Gates like $H$ can deterministically recombine superposition states via interference.

---

### Module 03: Wavefunction Collapse & Measurement (`/learn/measurement`)
- **Projective Measurement Transformation:**  
  Before measurement, a qubit maintains continuous complex amplitudes $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$. Projective measurement in the Z-basis ($P_0 = |0\rangle\langle 0|, P_1 = |1\rangle\langle 1|$) forces the state to collapse irreversibly into discrete classical bit outcome $0$ or $1$.
- **Shot Sampling Convergence:**  
  Running multiple simulation shots ($10, 100, 1,024, 10,000$ shots) demonstrates statistical sampling convergence.
- **Law of Large Numbers:**  
  Standard error $\sigma = \sqrt{\frac{p(1-p)}{N}}$ decreases as shot count $N$ increases. Small sample sizes ($N=10$) exhibit statistical fluctuation; large sample sizes ($N=10,000$) match Born's Rule probabilities to high accuracy.

---

### Module 04: Single-Qubit Gates & Rotations (`/learn/gates`)
- **Unitary Gate Property:** Every single-qubit quantum gate $U$ is a 2x2 complex unitary matrix satisfying $U^\dagger U = I$, preserving vector norm $|U\psi|^2 = 1$ (reversibility).
- **Pauli Operators:**
  - **Pauli-X (Bit Flip):** $X = \begin{bmatrix} 0 & 1 \\ 1 & 0 \end{bmatrix}$, flips $|0\rangle \leftrightarrow |1\rangle$, $180^\circ$ rotation around X-axis.
  - **Pauli-Y (Bit & Phase Flip):** $Y = \begin{bmatrix} 0 & -i \\ i & 0 \end{bmatrix}$, $Y|0\rangle = i|1\rangle, Y|1\rangle = -i|0\rangle$.
  - **Pauli-Z (Phase Flip):** $Z = \begin{bmatrix} 1 & 0 \\ 0 & -1 \end{bmatrix}$, leaves $|0\rangle$ unchanged and flips sign of $|1\rangle$: $Z|1\rangle = -|1\rangle$. Rotates $180^\circ$ around Z-axis without changing Z-basis measurement probabilities.
- **Phase Rotation Gates (S & T):**
  - **S Gate (Phase $\pi/2$):** $S = \begin{bmatrix} 1 & 0 \\ 0 & i \end{bmatrix}$
  - **T Gate (Phase $\pi/4$):** $T = \begin{bmatrix} 1 & 0 \\ 0 & e^{i\pi/4} \end{bmatrix}$

---

### Multi-Qubit Entanglement Preview (Module 05 Preparation)
- **Tensor Product Basis:** 2-qubit system has 4 computational basis states: $|00\rangle, |01\rangle, |10\rangle, |11\rangle$.
- **CNOT (Controlled-NOT) Operation:** Flips target qubit if and only if control qubit is in state $|1\rangle$.
- **Bell State Entanglement Preparation:**
  $$|00\rangle \xrightarrow{H(q_0)} \frac{|00\rangle + |10\rangle}{\sqrt{2}} \xrightarrow{CX(q_0, q_1)} \frac{|00\rangle + |11\rangle}{\sqrt{2}} = |\Phi^+\rangle$$
- **Non-Separability:** Bell state $|\Phi^+\rangle$ cannot be factored into independent single-qubit states $|\psi_A\rangle \otimes |\psi_B\rangle$. Measuring qubit 0 instantaneously determines the measurement outcome of qubit 1.

---

## 3. END-TO-END SYSTEM EXECUTION ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          1. VISUAL CANVAS FRONTEND                      │
│                                                                         │
│  User constructs circuit, adjusts sliders, or selects presets.          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    2. QUANTUM IR v1 JSON SERIALIZATION                   │
│                                                                         │
│  Circuit structure is serialized into framework-neutral Quantum IR:     │
│  { "numQubits": 2, "operations": [{ "gate": "h", "targets": [0] }] }    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼ HTTP POST /api/quantum/simulate
┌─────────────────────────────────────────────────────────────────────────┐
│                    3. FASTAPI BACKEND VALIDATION SERVICE                │
│                                                                         │
│  Validates IR schema, qubit index bounds, and transpiles IR into a      │
│  native IBM Qiskit QuantumCircuit instance.                             │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    4. IBM QISKIT AER SIMULATION ENGINE                  │
│                                                                         │
│  Executes AerSimulator: computes complex statevector amplitudes          │
│  (Re, Im, Mag, Phase) and shot sampling count distributions.             │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼ JSON Response
┌─────────────────────────────────────────────────────────────────────────┐
│                    5. REAL-TIME FRONTEND VISUALIZERS                    │
│                                                                         │
│  - ProbabilityChart.tsx: Percentage bars for measured basis outcomes.   │
│  - StateVectorVisualizer.tsx: Hilbert space complex amplitude array.    │
│  - BlochSphere.tsx: 3D rotatable vector projection (θ, φ).              │
│  - GateInspector.tsx: Unitary matrix, wire bindings & Qiskit code.      │
└─────────────────────────────────────────────────────────────────────────┘
```

> **Zero Fake Data Rule:** Every measurement probability bar, statevector array, and Bloch sphere vector is generated directly by the **IBM Qiskit Aer** simulation engine. No fake or hardcoded values are ever used.

---

## 4. INTERACTIVE UI COMPONENTS BUILT

| Component Name | File Path | Function & Educational Purpose |
| :--- | :--- | :--- |
| **`TeacherLevelSelector`** | [`apps/web/src/components/education/TeacherLevelSelector.tsx`](file:///c:/Users/ASUS/OneDrive/Desktop/Q_LABS/apps/web/src/components/education/TeacherLevelSelector.tsx) | Multi-level explanation switcher (Level 1 Intuitive, Level 2 Engineering, Level 3 Rigorous Math). |
| **`MatrixVectorStepVisualizer`** | [`apps/web/src/components/education/MatrixVectorStepVisualizer.tsx`](file:///c:/Users/ASUS/OneDrive/Desktop/Q_LABS/apps/web/src/components/education/MatrixVectorStepVisualizer.tsx) | Step-by-step matrix vector multiplication visualizer showing dot products row by row. |
| **`CircuitCodeMathBridge`** | [`apps/web/src/components/education/CircuitCodeMathBridge.tsx`](file:///c:/Users/ASUS/OneDrive/Desktop/Q_LABS/apps/web/src/components/education/CircuitCodeMathBridge.tsx) | Synchronous bridge linking Circuit Wire Gate $\leftrightarrow$ Matrix $\leftrightarrow$ Math Shift $\leftrightarrow$ Qiskit Code. |
| **`InterferenceAnimator`** | [`apps/web/src/components/education/InterferenceAnimator.tsx`](file:///c:/Users/ASUS/OneDrive/Desktop/Q_LABS/apps/web/src/components/education/InterferenceAnimator.tsx) | Step-by-step quantum interference animator for $H(H\|0\rangle) = \|0\rangle$ (constructive & destructive interference). |
| **`ConceptMap`** | [`apps/web/src/components/education/ConceptMap.tsx`](file:///c:/Users/ASUS/OneDrive/Desktop/Q_LABS/apps/web/src/components/education/ConceptMap.tsx) | Visual curriculum roadmap node graph highlighting student position. |
| **`Prerequisites`** | [`apps/web/src/components/education/Prerequisites.tsx`](file:///c:/Users/ASUS/OneDrive/Desktop/Q_LABS/apps/web/src/components/education/Prerequisites.tsx) | Recommended prior knowledge checklist linking back to required modules. |
| **`LearningObjectives`** | [`apps/web/src/components/education/LearningObjectives.tsx`](file:///c:/Users/ASUS/OneDrive/Desktop/Q_LABS/apps/web/src/components/education/LearningObjectives.tsx) | Explicit "By the end of this lesson..." checklist. |
| **`CommonMistakes`** | [`apps/web/src/components/education/CommonMistakes.tsx`](file:///c:/Users/ASUS/OneDrive/Desktop/Q_LABS/apps/web/src/components/education/CommonMistakes.tsx) | Common misconceptions vs. rigorous quantum mechanics comparison. |
| **`WhyExpandable`** | [`apps/web/src/components/education/WhyExpandable.tsx`](file:///c:/Users/ASUS/OneDrive/Desktop/Q_LABS/apps/web/src/components/education/WhyExpandable.tsx) | Expandable step-by-step mathematical proofs for curious students. |
| **`PipelineDiagram`** | [`apps/web/src/components/education/PipelineDiagram.tsx`](file:///c:/Users/ASUS/OneDrive/Desktop/Q_LABS/apps/web/src/components/education/PipelineDiagram.tsx) | Visual diagram showing execution pipeline flow from canvas to Qiskit Aer. |
| **`EntanglementPreview`** | [`apps/web/src/components/lessons/entanglement/EntanglementPreview.tsx`](file:///c:/Users/ASUS/OneDrive/Desktop/Q_LABS/apps/web/src/components/lessons/entanglement/EntanglementPreview.tsx) | Interactive step-by-step Bell state entanglement workflow. |
| **`QubitStateExplorer`** | [`apps/web/src/components/lessons/qubits/QubitStateExplorer.tsx`](file:///c:/Users/ASUS/OneDrive/Desktop/Q_LABS/apps/web/src/components/lessons/qubits/QubitStateExplorer.tsx) | Real-time amplitude magnitude & phase sliders with 3D Bloch sphere vector. |
| **`MeasurementShotExperiment`** | [`apps/web/src/components/lessons/measurement/MeasurementShotExperiment.tsx`](file:///c:/Users/ASUS/OneDrive/Desktop/Q_LABS/apps/web/src/components/lessons/measurement/MeasurementShotExperiment.tsx) | Empirical shot sampling experiment comparing 10 to 10,000 shots against theory. |
| **`SingleGateExplorer`** | [`apps/web/src/components/lessons/gates/SingleGateExplorer.tsx`](file:///c:/Users/ASUS/OneDrive/Desktop/Q_LABS/apps/web/src/components/lessons/gates/SingleGateExplorer.tsx) | Unified single-qubit gate explorer for $X, Y, Z, H$ gates. |
| **`PredictionPanel`** | [`apps/web/src/components/ui/PredictionPanel.tsx`](file:///c:/Users/ASUS/OneDrive/Desktop/Q_LABS/apps/web/src/components/ui/PredictionPanel.tsx) | Predict $\rightarrow$ Simulate $\rightarrow$ Observe experiment workflow. |

---

## 5. VISUAL DESIGN SYSTEM

PBQuantum Labs uses a **Clean Light Educational & Scientific Identity**:

- **Page Background:** `#F8FAFC`
- **Cards & Surfaces:** `#FFFFFF` with thin `#CBD5E1` borders, 12px corners (`rounded-xl`), and soft shadows.
- **Primary Text:** `#0F172A` (Dark slate, 100% crisp contrast).
- **Secondary Text:** `#334155` / `#64748B`.
- **Primary Accent:** `#2563EB` (Royal blue accent for buttons, active navigation tabs, links, and action CTAs).
- **Light Accent:** `#EFF6FF` / `#DBEAFE` for active tab backgrounds and category badges.
- **Accessible Focus Rings:** High-contrast `focus-visible:ring-2 focus-visible:ring-[#2563EB]` blue focus indicators on all interactive controls.

---

## 6. ALL PRODUCT ROUTES (15/15 STATIC PAGES BUILT)

| Route | Page Name | Description |
| :--- | :--- | :--- |
| **`/learn`** | Curriculum Overview | Modules 01–04 cards with difficulty, duration, and "Start lesson" actions. |
| **`/learn/qubits`** | Module 01: Qubits | State vectors, amplitudes, normalization $|\alpha|^2 + |\beta|^2 = 1$, and 3D Bloch sphere. |
| **`/learn/superposition`** | Module 02: Superposition | Hadamard matrix multiplication, quantum interference $H(H\|0\rangle) = \|0\rangle$, and challenges. |
| **`/learn/measurement`** | Module 03: Measurement | Wavefunction collapse diagram and empirical shot sampling experiment ($10$ to $10,000$ shots). |
| **`/learn/gates`** | Module 04: Gates | Single-qubit gate explorer for $X, Y, Z, H$ gates, Qiskit code generation, and Bell state preview. |
| **`/simulator`** | Quantum Workspace | High-density 3-Column Scientific Workspace (Controls \| Circuit Canvas \| Results \| Gate Inspector). |
| **`/playground`** | Circuit Sandbox | Freeform circuit builder with live Qiskit Python code exporter and copy button. |
| **`/challenges`** | Challenges Hub | Interactive tasks ($|+\rangle$ state preparation, $|\Phi^+\rangle$ Bell state, gate identity $H \cdot Z \cdot H = X$) with Qiskit validation. |
| **`/progress`** | Student Progress | Completed modules breakdown, simulation counters, and achievement badges. |
| **`/settings`** | System Preferences | Qiskit Aer default shot count ($100, 1024, 8192$), return modes, and API service status. |

---

## 7. LOCAL DEVELOPMENT & RUNNING INSTRUCTIONS

### Prerequisites
- **Node.js:** v18+ 
- **Python:** 3.10 or 3.11 with Qiskit & Qiskit Aer

### 1. Start FastAPI Backend Service
```bash
cd apps/api
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Backend API will be live at `http://localhost:8000`.

### 2. Start Next.js Frontend Development Server
```bash
cd apps/web
npm run dev
```
Frontend Web UI will be live at `http://localhost:3000`.

---

## 8. AUTOMATED TESTING & BUILD VERIFICATION

### Run Backend Pytest Suite
```bash
cd apps/api
python -m pytest tests/test_quantum_correctness.py
```
*Expected Result:* `9/9 PASSED` (Verifies X, H, Z gate correctness, phase sign checks, and Bell state entanglement).

### Run Frontend Type Check
```bash
cd apps/web
npx tsc --noEmit
```
*Expected Result:* `0 errors`

### Run Next.js Production Build
```bash
cd apps/web
npm run build
```
*Expected Result:* `15/15 static pages generated successfully`.

---

## 9. FUTURE CURRICULUM ROADMAP (MODULES 05–40)

- **Module 05:** CNOT & Multi-Qubit Basis ($|00\rangle, |01\rangle, |10\rangle, |11\rangle$)
- **Module 06:** Tensor Products ($|\psi\rangle \otimes |\phi\rangle$)
- **Module 07:** Bell States & Quantum Entanglement ($|\Phi^+\rangle, |\Phi^-\rangle, |\Psi^+\rangle, |\Psi^-\rangle$)
- **Module 08:** Quantum Teleportation Protocol & Superdense Coding
- **Module 09:** Reversible Boolean Computation & Oracles ($U_f$)
- **Module 10:** Deutsch & Deutsch-Jozsa Algorithms
- **Module 11:** Bernstein-Vazirani & Simon's Algorithms
- **Module 12:** Grover's Search Algorithm & Amplitude Amplification
- **Module 13:** Quantum Fourier Transform (QFT) & Phase Estimation
- **Module 14:** Shor's Factoring Algorithm Preview
