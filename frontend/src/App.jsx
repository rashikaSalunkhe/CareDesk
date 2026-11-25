import { useEffect, useState } from "react";
import "./App.css";
import api from "./services/api";
import PatientForm from "./components/PatientForm";

function App() {
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [ward, setWard] = useState("");
  const [department, setDepartment] = useState("");
  const [doctor, setDoctor] = useState("");
  const [editingPatient, setEditingPatient] = useState(null);

  const fetchPatients = async () => {
    try {
      const response = await api.get("/patients", {
        params: {
          search: search || undefined,
          ward: ward || undefined,
          department: department || undefined,
          doctor: doctor || undefined,
        },
      });

      setPatients(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Unable to fetch patient records.");
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search, ward, department, doctor]);

  const handlePatientAdded = () => {
    fetchPatients();
  };

  const handleDischarge = async (patientId) => {
  if (!window.confirm("Mark this patient as discharged?")) return;

  try {
    await api.patch(`/patients/${patientId}/discharge`);
    fetchPatients();
  } catch (err) {
    alert("Unable to discharge patient.");
  }
};

const handleDelete = async (patientId) => {
  if (!window.confirm("Are you sure you want to delete this patient?")) return;

  try {
    await api.delete(`/patients/${patientId}`);
    fetchPatients();
  } catch (err) {
    alert("Unable to delete patient.");
  }
};

const handleEdit = async (event) => {
  event.preventDefault();

  try {
    await api.put(
      `/patients/${editingPatient.id}`,
      {
        name: editingPatient.name,
        age: Number(editingPatient.age),
        gender: editingPatient.gender,
        ward: editingPatient.ward,
        department: editingPatient.department,
        doctor: editingPatient.doctor,
        admission_date: editingPatient.admission_date,
      }
    );

    setEditingPatient(null);
    fetchPatients();
    alert("Patient updated successfully!");
  } catch (err) {
    alert(
      err.response?.data?.detail || "Unable to update patient."
    );
  }
};

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>CareDesk</h1>
          <p>Patient Admission Management System</p>
        </div>
      </header>

      <main className="container">
        <section className="welcome">
          <h2>Patient Management</h2>
          <p>Manage patient admissions, records, and discharge details.</p>
        </section>

        <section className="stats">
          <div className="stat-card">
            <span>Total Patients</span>
            <h2>{patients.length}</h2>
          </div>
          <div className="stat-card">
            <span>Admitted</span>
            <h2>{patients.filter((p) => p.status === "Admitted").length}</h2>
          </div>
          <div className="stat-card">
            <span>Discharged</span>
            <h2>{patients.filter((p) => p.status === "Discharged").length}</h2>
          </div>
        </section>
        
{editingPatient && (
  <section className="form-section">
    <h2>Edit Patient #{editingPatient.id}</h2>

    <form onSubmit={handleEdit}>
      <div className="form-grid">
        <div className="form-group">
          <label>Patient Name</label>
          <input
            value={editingPatient.name}
            onChange={(e) =>
              setEditingPatient({ ...editingPatient, name: e.target.value })
            }
            required
            pattern="[A-Za-z ]+"
          />
        </div>

        <div className="form-group">
          <label>Age</label>
          <input
            type="number"
            min="0"
            max="120"
            value={editingPatient.age}
            onChange={(e) =>
              setEditingPatient({ ...editingPatient, age: e.target.value })
            }
            required
          />
        </div>

        {[
          ["gender", ["Male", "Female", "Other"]],
          ["ward", ["General Ward", "ICU", "Private Ward"]],
          ["department", ["Cardiology", "Neurology", "Orthopedics", "General Medicine", "Pediatrics"]],
          ["doctor", ["Dr. Ananya Rao", "Dr. Rahul Sharma", "Dr. Priya Nair", "Dr. Arjun Mehta"]],
        ].map(([field, options]) => (
          <div className="form-group" key={field}>
            <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
            <select
              value={editingPatient[field]}
              onChange={(e) =>
                setEditingPatient({ ...editingPatient, [field]: e.target.value })
              }
              required
            >
              {options.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        ))}

        <div className="form-group">
          <label>Admission Date</label>
          <input
            type="date"
            value={editingPatient.admission_date}
            max={new Date().toLocaleDateString("en-CA")}
            onChange={(e) =>
              setEditingPatient({
                ...editingPatient,
                admission_date: e.target.value,
              })
            }
            required
          />
        </div>
      </div>

      <button type="submit">Save Changes</button>
      <button
        type="button"
        onClick={() => setEditingPatient(null)}
        style={{ marginLeft: "10px", background: "#64748b" }}
      >
        Cancel
      </button>
    </form>
  </section>
)}

        <PatientForm onPatientAdded={handlePatientAdded} />

        <section className="patients-section">
          <h2>Patient Records</h2>

          <div className="filter-container">
            <input
              type="text"
              placeholder="Search by patient name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select value={ward} onChange={(e) => setWard(e.target.value)}>
              <option value="">All Wards</option>
              <option>General Ward</option>
              <option>ICU</option>
              <option>Private Ward</option>
            </select>

            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              <option>Cardiology</option>
              <option>Neurology</option>
              <option>Orthopedics</option>
              <option>General Medicine</option>
              <option>Pediatrics</option>
            </select>

            <select value={doctor} onChange={(e) => setDoctor(e.target.value)}>
              <option value="">All Doctors</option>
              <option>Dr. Ananya Rao</option>
              <option>Dr. Rahul Sharma</option>
              <option>Dr. Priya Nair</option>
              <option>Dr. Arjun Mehta</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setWard("");
                setDepartment("");
                setDoctor("");
              }}
            >
              Clear Filters
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}

          {patients.length === 0 && !error ? (
            <p>No patient records found.</p>
          ) : (
            <div className="table-container">
              <table className="patient-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Ward</th>
                    <th>Department</th>
                    <th>Doctor</th>
                    <th>Admission Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id}>
                      <td>{patient.id}</td>
                      <td>{patient.name}</td>
                      <td>{patient.age}</td>
                      <td>{patient.gender}</td>
                      <td>{patient.ward}</td>
                      <td>{patient.department}</td>
                      <td>{patient.doctor}</td>
                      <td>{patient.admission_date}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            patient.status === "Admitted"
                              ? "admitted"
                              : "discharged"
                          }`}
                        >
                          {patient.status}
                        </span>
                      </td>
                      <td>
                        <button
                        className="action-btn edit-btn"
                        onClick={() => setEditingPatient({ ...patient })}
      >
        Edit
        </button>

  {patient.status === "Admitted" && (
    <button
      className="action-btn discharge-btn"
      onClick={() => handleDischarge(patient.id)}
    >
      Discharge
    </button>
  )}

  <button
    className="action-btn delete-btn"
    onClick={() => handleDelete(patient.id)}
  >
    Delete
  </button>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;