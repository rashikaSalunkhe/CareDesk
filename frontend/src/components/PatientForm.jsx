import { useState } from "react";
import api from "../services/api";

function PatientForm({ onPatientAdded }) {
  const today = new Date().toLocaleDateString("en-CA");

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    ward: "",
    department: "",
    doctor: "",
    admission_date: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!/^[A-Za-z ]+$/.test(formData.name.trim())) {
      setError("Name must contain letters only.");
      return;
    }

    if (Number(formData.age) < 0 || Number(formData.age) > 120) {
      setError("Age must be between 0 and 120.");
      return;
    }

    if (formData.admission_date > today) {
      setError("Admission date cannot be in the future.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/patients", {
        ...formData,
        name: formData.name.trim(),
        age: Number(formData.age),
      });

      setSuccess("Patient added successfully!");

      setFormData({
        name: "",
        age: "",
        gender: "",
        ward: "",
        department: "",
        doctor: "",
        admission_date: "",
      });

      onPatientAdded(response.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Unable to add patient. Please check the details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-section">
      <h2>Add New Patient</h2>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Patient Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter patient name"
              required
              pattern="[A-Za-z ]+"
              title="Letters and spaces only"
            />
          </div>

          <div className="form-group">
            <label>Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="0"
              max="120"
              placeholder="Enter age"
              required
            />
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Ward</label>
            <select name="ward" value={formData.ward} onChange={handleChange} required>
              <option value="">Select Ward</option>
              <option>General Ward</option>
              <option>ICU</option>
              <option>Private Ward</option>
            </select>
          </div>

          <div className="form-group">
            <label>Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              <option>Cardiology</option>
              <option>Neurology</option>
              <option>Orthopedics</option>
              <option>General Medicine</option>
              <option>Pediatrics</option>
            </select>
          </div>

          <div className="form-group">
            <label>Doctor</label>
            <select name="doctor" value={formData.doctor} onChange={handleChange} required>
              <option value="">Select Doctor</option>
              <option>Dr. Ananya Rao</option>
              <option>Dr. Rahul Sharma</option>
              <option>Dr. Priya Nair</option>
              <option>Dr. Arjun Mehta</option>
            </select>
          </div>

          <div className="form-group">
            <label>Admission Date</label>
            <input
              type="date"
              name="admission_date"
              value={formData.admission_date}
              onChange={handleChange}
              max={today}
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Adding Patient..." : "Add Patient"}
        </button>
      </form>
    </section>
  );
}

export default PatientForm;