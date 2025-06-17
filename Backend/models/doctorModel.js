import mongoose from 'mongoose';

const doctorSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  profilePicture: { type: String },
  medicalRegNumber: { type: String, unique: true, required: true },
  specialization: [{ type: String }],
  qualifications: { type: String, required: true },
  experience: { type: Number, required: true },
  affiliations: { type: String },
  consultationFee: { type: Number, required: true },
  department: { type: String, required: true },
  availableDays: [{ type: String }],
  timeSlots: [{ type: String, required: true }],
  mode: { type: String, enum: ['In-person', 'Teleconsultation', 'Both'], required: true },
  chamberNumber: { type: String },
  organizations: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true }
  ],
  role: { 
    type: String, 
    default: 'doctor' 
},
  createdAt: { type: Date, default: Date.now },

});




export const Doctor = mongoose.model('Doctor', doctorSchema);
