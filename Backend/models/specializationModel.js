import mongoose from 'mongoose';

// Define the schema for Specialization
const specializationSchema = new mongoose.Schema({
  specialist: {
    type: String,
    required: true,
    unique: true, // Ensure unique specialist names
  },
  disease: {
    type: String,
    required: true,
  }
});

// Create the model based on the schema
export const Specialization = mongoose.model('Specialization', specializationSchema);

