import express from 'express';
import { activatePatient, loginPatient, registerPatient, suggestDoctors } from '../controllers/patientController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import { getAllBookingsForPatient, getParticularBooking } from '../controllers/appointmentController.js';
import { getPrescriptionByAppointment, getPrescriptionsForPatient } from '../controllers/prescriptionController.js';

const router = express.Router();

router.post('/register', registerPatient);
router.post('/active-patient', activatePatient);
router.post('/login', loginPatient);
router.post("/get-all-appointments",isAuthenticated,getAllBookingsForPatient)
router.get("/particular-bookings/:id",isAuthenticated,getParticularBooking)
router.get("/get-suggested-doctor",isAuthenticated,suggestDoctors)
router.post('/get-patient-prescriptions',isAuthenticated, getPrescriptionsForPatient);
router.post('/get-patient-prescriptions-by-appointment',isAuthenticated,getPrescriptionByAppointment);







export default router;
