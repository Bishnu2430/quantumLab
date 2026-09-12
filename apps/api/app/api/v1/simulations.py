from fastapi import APIRouter, HTTPException, status
from app.schemas.quantum import SimulationRequest, SimulationResult, SimulationOptions
from app.services.quantum.backends.qiskit_aer import QiskitAerBackend
from app.services.quantum.ir_validator import CircuitValidationError

router = APIRouter(prefix="/simulations", tags=["simulations"])
backend = QiskitAerBackend()

@router.post("/run", response_model=SimulationResult, status_code=status.HTTP_200_OK)
def run_simulation(request: SimulationRequest):
    """Executes a Quantum IR circuit payload on Qiskit Aer backend."""
    try:
        options = request.options or SimulationOptions()
        return backend.run(request.circuit, options)
    except CircuitValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "CIRCUIT_VALIDATION_ERROR", "message": str(e)}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "SIMULATION_EXECUTION_ERROR", "message": str(e)}
        )
