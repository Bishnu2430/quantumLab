import time
import numpy as np
from typing import Dict, List, Tuple
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from qiskit_aer import AerSimulator

from app.schemas.quantum import (
    QuantumIR,
    SimulationOptions,
    SimulationResult,
    ComplexAmplitude,
)
from app.services.quantum.backends.base import AbstractQuantumBackend
from app.services.quantum.ir_validator import IRValidator

class QiskitAerBackend(AbstractQuantumBackend):
    """Qiskit Aer execution backend adapter."""

    @property
    def backend_name(self) -> str:
        return "qiskit-aer"

    def validate(self, circuit: QuantumIR) -> None:
        IRValidator.validate(circuit)

    def compile_ir(self, circuit: QuantumIR) -> Tuple[QuantumCircuit, QuantumCircuit]:
        self.validate(circuit)
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
                control = op.controls[0] if op.controls else op.targets[0]
                target = op.targets[0] if op.controls else op.targets[1]
                eval_qc.cx(control, target)
                measure_qc.cx(control, target)
            elif gate == "cz":
                control = op.controls[0] if op.controls else op.targets[0]
                target = op.targets[0] if op.controls else op.targets[1]
                eval_qc.cz(control, target)
                measure_qc.cz(control, target)
            elif gate == "swap":
                t1, t2 = op.targets[0], op.targets[1]
                eval_qc.swap(t1, t2)
                measure_qc.swap(t1, t2)
            elif gate in ["toffoli", "ccx"]:
                c1, c2 = op.controls[0], op.controls[1]
                target = op.targets[0]
                eval_qc.ccx(c1, c2, target)
                measure_qc.ccx(c1, c2, target)
            elif gate == "measure":
                target_q = op.targets[0]
                target_c = op.clbits[0] if op.clbits else 0
                measure_qc.measure(target_q, target_c)
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
        statevector_list: List[ComplexAmplitude] = []
        probabilities_dict: Dict[str, float] = {}

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
        counts_dict: Dict[str, int] = {}
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
