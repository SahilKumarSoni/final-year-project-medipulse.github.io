import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  disease: { type: String, required: true },
  medication: [{ type: String }], 
  remarks: String,
  dateIssued: { type: Date, default: Date.now },
  status:{type:Boolean,default:true}
});

export const Prescription = mongoose.model('Prescription', prescriptionSchema);