from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import crud
from database import engine, SessionLocal
from schemas import PatientCreate, PatientUpdate, PatientResponse


# Create database tables automatically
models.Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(
    title="CareDesk API",
    description="Patient Admission Management System",
    version="1.0.0"
)


# Allow React frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Database session dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Homepage
@app.get("/")
def home():
    return {
        "message": "Welcome to CareDesk API!",
        "status": "Running successfully"
    }


# Health check
@app.get("/health")
def health_check():
    return {"status": "healthy"}


# CREATE: Add patient
@app.post("/patients", response_model=PatientResponse)
def create_patient(
    patient: PatientCreate,
    db: Session = Depends(get_db)
):
    return crud.create_patient(db, patient)


# READ: Get all patients with filters and search
@app.get("/patients", response_model=list[PatientResponse])
def get_patients(
    ward: str = None,
    department: str = None,
    doctor: str = None,
    search: str = None,
    db: Session = Depends(get_db)
):
    return crud.get_patients(
        db,
        ward,
        department,
        doctor,
        search
    )


# READ: Get one patient
@app.get("/patients/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db)
):
    patient = crud.get_patient(db, patient_id)

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    return patient


# UPDATE: Edit patient
@app.put("/patients/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: int,
    patient: PatientUpdate,
    db: Session = Depends(get_db)
):
    db_patient = crud.get_patient(db, patient_id)

    if not db_patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    return crud.update_patient(db, db_patient, patient)


# DELETE: Remove patient
@app.delete("/patients/{patient_id}")
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db)
):
    db_patient = crud.get_patient(db, patient_id)

    if not db_patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    crud.delete_patient(db, db_patient)

    return {"message": "Patient deleted successfully"}


# UPDATE: Mark patient as discharged
@app.patch("/patients/{patient_id}/discharge",
           response_model=PatientResponse)
def discharge_patient(
    patient_id: int,
    db: Session = Depends(get_db)
):
    db_patient = crud.get_patient(db, patient_id)

    if not db_patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    return crud.discharge_patient(db, db_patient)