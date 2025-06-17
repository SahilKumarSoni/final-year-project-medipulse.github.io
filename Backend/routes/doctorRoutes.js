import express from 'express';
import { activateDoctor, changeStatus, getDoctorAvailabilitymatrix, loginDoctor, profilepic, registerDoctor } from '../controllers/doctorController.js';
import { createDoctorSlots } from '../controllers/availablityController.js';
import { authorizeRole, isAuthenticated } from '../middlewares/authMiddleware.js';
import { getDoctorAppointments } from '../controllers/appointmentController.js';
import { generatePrescription } from '../controllers/prescriptionController.js';

const router = express.Router();

router.post('/register', registerDoctor);
router.post('/active-doctor', activateDoctor);
router.post('/pic', profilepic);
router.post('/login', loginDoctor);
router.post('/create-slot',isAuthenticated,createDoctorSlots)
router.post('/get-my-all-patient-appointment',getDoctorAppointments)
router.post('/get-my-matrix',isAuthenticated,authorizeRole('doctor'),getDoctorAvailabilitymatrix)
router.patch('/change-appointment-status/:id', isAuthenticated, authorizeRole('doctor'), changeStatus)
router.post('/generate-prescription', generatePrescription);




export default router;
