import express from 'express';
import { getAllDiseases, getAllDoctors, getAllDoctorsbyNameandId, getAllOrganizations, getAllPatients, getAllSpecialists, getDoctorsBySpecialization, getmyRole, getUserDetails, logout } from '../controllers/commonController.js';
import {  isAuthenticated } from '../middlewares/authMiddleware.js';
import { applyBooking, checkAvailability } from '../controllers/appointmentController.js';

const router = express.Router();


router.get('/getuserdetails', isAuthenticated,getUserDetails);
router.get('/logout', isAuthenticated,logout);
router.get('/my-role',isAuthenticated,getmyRole);
router.post('/check-available',isAuthenticated,checkAvailability);
router.post('/apply-booking',isAuthenticated,applyBooking);
router.get('/get-all-doctor',getAllDoctors)
router.get('/get-all-patient',getAllPatients)
router.get('/get-all-org',getAllOrganizations)
router.get('/get-all-disease',getAllDiseases)
router.get('/get-all-specialist-role' ,getAllSpecialists)
router.get('/get-all-doctor-name',getAllDoctorsbyNameandId)
router.get('/get-all-doctor-by-specialization',getDoctorsBySpecialization)


















export default router;