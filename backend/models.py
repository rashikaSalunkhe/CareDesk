from sqlalchemy import Column, Integer, String, Date
from database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    ward = Column(String, nullable=False)
    department = Column(String, nullable=False)
    doctor = Column(String, nullable=False)
    admission_date = Column(Date, nullable=False)
    status = Column(String, default="Admitted", nullable=False)