from sqlalchemy.orm import Session
from models import Patient
from schemas import PatientCreate, PatientUpdate


# CREATE: Add a new patient
def create_patient(db: Session, patient: PatientCreate):
    new_patient = Patient(**patient.model_dump())
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient


# READ: Get all patients with optional filters
def get_patients(
    db: Session,
    ward=None,
    department=None,
    doctor=None,
    search=None
):
    query = db.query(Patient)

    if ward:
        query = query.filter(Patient.ward == ward)

    if department:
        query = query.filter(Patient.department == department)

    if doctor:
        query = query.filter(Patient.doctor == doctor)

    if search:
        query = query.filter(Patient.name.ilike(f"%{search}%"))

    return query.order_by(Patient.id.desc()).all()


# READ: Get one patient by ID
def get_patient(db: Session, patient_id: int):
    return db.query(Patient).filter(
        Patient.id == patient_id
    ).first()


# UPDATE: Edit patient information
def update_patient(
    db: Session,
    db_patient: Patient,
    patient: PatientUpdate
):
    for key, value in patient.model_dump().items():
        setattr(db_patient, key, value)

    db.commit()
    db.refresh(db_patient)
    return db_patient


# DELETE: Remove a patient
def delete_patient(db: Session, db_patient: Patient):
    db.delete(db_patient)
    db.commit()


# UPDATE: Mark patient as discharged
def discharge_patient(db: Session, db_patient: Patient):
    db_patient.status = "Discharged"
    db.commit()
    db.refresh(db_patient)
    return db_patient