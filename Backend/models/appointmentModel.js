import mongoose from "mongoose";

// Appointment schema
const appointmentSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  appointmentDate: { type: String, required: true },
  timeSlot: { type: String, required: true },
  status: { type: String, default: "Pending" }, // Pending, Confirmed, Canceled
});

export const Appointment = mongoose.model("Appointment", appointmentSchema);
