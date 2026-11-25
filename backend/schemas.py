import re 
from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class PatientCreate(BaseModel):
    name: str = Field(min_length=1)
    age: int = Field(ge=0, le=120)
    gender: Literal["Male", "Female", "Other"]
    ward: Literal["General Ward", "ICU", "Private Ward"]
    department: Literal[
        "Cardiology",
        "Neurology",
        "Orthopedics",
        "General Medicine",
        "Pediatrics"
    ]
    doctor: str = Field(min_length=1)
    admission_date: date

    @field_validator("name")
    @classmethod
    def validate_name(cls, value):
        value = value.strip()

        if not re.fullmatch(r"[A-Za-z ]+", value):
            raise ValueError("Name must contain letters only")
        return value

    @field_validator("doctor")
    @classmethod
    def validate_doctor(cls, value):
        if not value.strip():
            raise ValueError("Doctor name is required")
        return value.strip()

    @field_validator("admission_date")
    @classmethod
    def validate_admission_date(cls, value):
        if value > date.today():
            raise ValueError("Admission date cannot be in the future")
        return value


class PatientUpdate(PatientCreate):
    pass


class PatientResponse(PatientCreate):
    id: int
    status: str

    class Config:
        from_attributes = True