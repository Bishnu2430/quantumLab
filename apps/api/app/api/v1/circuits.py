from fastapi import APIRouter, HTTPException, status
from app.schemas.quantum import QuantumIR
from app.services.quantum.simulator import QiskitQuantumBackend, CircuitValidationError

router = APIRouter(prefix="/circuits", tags=["circuits"])
backend = QiskitQuantumBackend()

@router.post("/validate", status_code=status.HTTP_200_OK)
def validate_circuit(circuit: QuantumIR):
    """Validates Quantum IR structure and qubit bounds."""
    try:
        backend.validate(circuit)
        return {
            "valid": True,
            "message": "Quantum circuit structure is valid.",
            "numQubits": circuit.numQubits,
            "numClbits": circuit.numClbits,
            "operationCount": len(circuit.operations),
        }
    except CircuitValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "CIRCUIT_VALIDATION_ERROR", "message": str(e)}
        )
