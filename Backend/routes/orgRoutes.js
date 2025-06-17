import express from 'express';
import { activateOrganization, getDoctorsForOrganization, loginOrganization, registerOrganization } from '../controllers/orgController.js';
import { authorizeRole, isAuthenticated } from '../middlewares/authMiddleware.js';
import { insertSpecializations } from '../controllers/specializationController.js';

const router = express.Router();

router.post('/register', registerOrganization);
router.post('/active-org', activateOrganization);
router.post('/login', loginOrganization);
router.get('/get-my-doctor',isAuthenticated,authorizeRole('organization'),getDoctorsForOrganization)
router.get('/insert-specialization',isAuthenticated,authorizeRole('organization'),insertSpecializations)





export default router;
