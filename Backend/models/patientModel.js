import mongoose from 'mongoose';

const patientSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  contactNumber: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  photoId: { type: String },
  preferredDoctor: { type: String },
  medicalConditions: [{ type: String }],
  currentMedications: [{ type: String }],
  allergies: [{ type: String }],
  pastSurgeries: [{ type: String }],
  role: { 
    type: String, 
    default: 'patient' 
},
  createdAt: { type: Date, default: Date.now },
});



  
export const Patient =mongoose.model('Patient', patientSchema);
