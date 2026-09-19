import time

import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from qiskit_aer import AerSimulator

from app.schemas.quantum import (
    ComplexAmplitude,
    QuantumIR,
    SimulationOptions,
    SimulationResult,
)
from app.services.quantum.backends.base import AbstractQuantumBackend
from app.services.quantum.ir_normalizer import normalize_circuit
from app.services.quantum.ir_validator import IRValidator


class QiskitAerBackend(AbstractQuantumBackend):
    """Qiskit Aer execution backend adapter."""

    @property
    def backend_name(self) -> str:
        return "qiskit-aer"

    def validate(self, circuit: QuantumIR) -> None:
        IRValidator.validate(normalize_circuit(circuit))

    def compile_ir(self, circuit: QuantumIR) -> tuple[QuantumCircuit, QuantumCircuit]:
        # Normalize before validating so the loop below can assume canonical
        # operand placement: controls in `controls`, aliases already resolved.
        circuit = normalize_circuit(circuit)
        IRValidator.validate(circuit)
        num_q = circuit.numQubits
        num_c = max(circuit.numClbits, 1)

        eval_qc = QuantumCircuit(num_q)
        measure_qc = QuantumCircuit(num_q, num_c)

        for op in circuit.operations:
            gate = op.gate.lower()

            if gate == "h":
                eval_qc.h(op.targets[0])
                measure_qc.h(op.targets[0])
            elif gate == "x":
                eval_qc.x(op.targets[0])
                measure_qc.x(op.targets[0])
            elif gate == "y":
                eval_qc.y(op.targets[0])
                measure_qc.y(op.targets[0])
            elif gate == "z":
                eval_qc.z(op.targets[0])
                measure_qc.z(op.targets[0])
            elif gate == "s":
                eval_qc.s(op.targets[0])
                measure_qc.s(op.targets[0])
            elif gate == "t":
                eval_qc.t(op.targets[0])
                measure_qc.t(op.targets[0])
            elif gate == "rx":
                angle = op.params[0] if op.params else 0.0
                eval_qc.rx(angle, op.targets[0])
                measure_qc.rx(angle, op.targets[0])
            elif gate == "ry":
                angle = op.params[0] if op.params else 0.0
                eval_qc.ry(angle, op.targets[0])
                measure_qc.ry(angle, op.targets[0])
            elif gate == "rz":
                angle = op.params[0] if op.params else 0.0
                eval_qc.rz(angle, op.targets[0])
                measure_qc.rz(angle, op.targets[0])
            elif gate == "cx":
                eval_qc.cx(op.controls[0], op.targets[0])
                measure_qc.cx(op.controls[0], op.targets[0])
            elif gate == "cz":
                eval_qc.cz(op.controls[0], op.targets[0])
                measure_qc.cz(op.controls[0], op.targets[0])
            elif gate == "swap":
                t1, t2 = op.targets[0], op.targets[1]
                eval_qc.swap(t1, t2)
                measure_qc.swap(t1, t2)
            elif gate == "ccx":
                c1, c2 = op.controls[0], op.controls[1]
                eval_qc.ccx(c1, c2, op.targets[0])
                measure_qc.ccx(c1, c2, op.targets[0])
            elif gate == "measure":
                # Validated 1:1 against clbits, so zip covers every target.
                for target_q, target_c in zip(op.targets, op.clbits, strict=True):
                    measure_qc.measure(target_q, target_c)
            elif gate == "reset":
                # Non-unitary: collapses the qubit to |0> in both circuits.
                for target_q in op.targets:
                    eval_qc.reset(target_q)
                    measure_qc.reset(target_q)
            elif gate == "barrier":
                eval_qc.barrier(op.targets)
                measure_qc.barrier(op.targets)

        if not any(inst.operation.name == "measure" for inst in measure_qc.data):
            for i in range(num_q):
                c_idx = i if i < num_c else num_c - 1
                measure_qc.measure(i, c_idx)

        return eval_qc, measure_qc

    def run(self, circuit: QuantumIR, options: SimulationOptions) -> SimulationResult:
        start_time = time.time()
        eval_qc, measure_qc = self.compile_ir(circuit)

        num_q = circuit.numQubits
        shots = options.shots

        # Statevector computation
        statevector_list: list[ComplexAmplitude] = []
        probabilities_dict: dict[str, float] = {}

        sv = Statevector.from_instruction(eval_qc)
        raw_probs = sv.probabilities()

        num_states = 1 << num_q
        for i in range(num_states):
            bitstring = format(i, f"0{num_q}b")
            amp = sv.data[i]
            real_val = float(np.real(amp))
            imag_val = float(np.imag(amp))
            mag = float(np.abs(amp) ** 2)
            phase_val = float(np.angle(amp))

            prob = float(raw_probs[i])
            if prob > 1e-9 or num_q <= 4:
                probabilities_dict[bitstring] = round(prob, 6)

            statevector_list.append(
                ComplexAmplitude(
                    state=bitstring,
                    real=round(real_val, 6),
                    imag=round(imag_val, 6),
                    magnitude=round(mag, 6),
                    phase=round(phase_val, 6),
                )
            )

        # Shot execution
        counts_dict: dict[str, int] = {}
        if options.mode in ["shots", "both"]:
            simulator = AerSimulator()
            job = simulator.run(measure_qc, shots=shots, seed_simulator=options.seed)
            result = job.result()
            raw_counts = result.get_counts()
            for k, v in raw_counts.items():
                counts_dict[k.replace(" ", "")] = v

        duration_ms = round((time.time() - start_time) * 1000, 2)

        return SimulationResult(
            backend=self.backend_name,
            numQubits=num_q,
            shots=shots,
            counts=counts_dict if counts_dict else None,
            probabilities=probabilities_dict,
            statevector=statevector_list if num_q <= 6 else None,
            durationMs=duration_ms,
            circuitDepth=eval_qc.depth(),
        )
