import { Prescription } from '../models/prescriptionModel.js';
import { Patient } from '../models/patientModel.js';
import { Doctor } from '../models/doctorModel.js';
import { getMedicinesByIds } from './fetchMedicineByIds.js';

// Generate a new prescription
export const generatePrescription = async (req, res) => {
  const { doctorId, patientId, appointmentId, disease, medication, remarks } = req.body;

  try {
    // Check if a prescription already exists for this appointment
    const existing = await Prescription.findOne({ appointmentId });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Prescription already exists for this appointment.',
        prescription: existing
      });
    }

    // Create new prescription
    const newPrescription = new Prescription({
      doctorId,
      patientId,
      appointmentId,
      disease,
      medication,
      remarks,
    });

    await newPrescription.save();

    return res.status(201).json({
      success: true,
      message: 'Prescription generated.',
      prescription: newPrescription
    });

  } catch (error) {
    console.error("Error generating prescription:", error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate prescription',
      error
    });
  }
};


export const getPrescriptionsForPatient = async (req, res) => {
  const { patientId } = req.body;

  try {
    const prescriptions = await Prescription.find({ patientId }).lean();

    if (!prescriptions.length) {
      return res.status(404).json({ message: 'No prescriptions found.' });
    }

    // Collect all medicine IDs from prescriptions
    const allMedIds = prescriptions.flatMap(p => p.medication || []);
    const medicines = await getMedicinesByIds(allMedIds);

    // Map medicines by ID for quick lookup
    const medMap = Object.fromEntries(medicines.map(m => [m._id.toString(), m]));

    // Attach detailed medicine info to each prescription
    const enriched = prescriptions.map(p => ({
      ...p,
      medication: (p.medication || []).map(id => medMap[id.toString()]).filter(Boolean)
    }));

    return res.status(200).json({ success: true, prescriptions: enriched });
  } catch (error) {
    console.error("Error retrieving prescriptions:", error);
    return res.status(500).json({ success: false, message: 'Internal error.' });
  }
};


// appointment id
export const getPrescriptionByAppointment = async (req, res) => {
  const { appointmentId } = req.body;

  try {
    const prescription = await Prescription.findOne({ appointmentId }).lean();

    if (!prescription) {
      return res.status(404).json({ message: 'No prescription found for this appointment.' });
    }

    const medIds = prescription.medication || [];
    const medicines = await getMedicinesByIds(medIds);

    const medMap = Object.fromEntries(medicines.map(m => [m._id.toString(), m]));

    const enrichedPrescription = {
      ...prescription,
      medication: medIds.map(id => medMap[id.toString()]).filter(Boolean)
    };

    return res.status(200).json({ success: true, prescription: enrichedPrescription });
  } catch (error) {
    console.error("Error retrieving prescription:", error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};