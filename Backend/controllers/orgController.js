import jwt from 'jsonwebtoken';
import { sendSms } from '../utils/sendSms.js';
// import { generateOtp } from '../utils/generateOtp.js';
import { Organization } from '../models/orgModel.js';
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import sendMail from '../utils/sendMail.js';
import { setToken } from '../middlewares/authMiddleware.js';
import { Doctor } from '../models/doctorModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000); // Generates a 4-digit OTP
};

// Register organization
export const registerOrganization = async (req, res, next) => {
  const {
    name, location, email, password, accessCode, phone, uniqueId, type, beds, departments, pharmacy,
    visitingHours, helpline
  } = req.body;

  try {
    // Check if email or phone already exists
    const existingEmail = await Organization.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const existingPhone = await Organization.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: 'Phone number already exists' });
    }

    // Optional: Upload profile image to Cloudinary
    let imageUrl = '';
    if (req.files && req.files.image) {
      const uploadResponse = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        folder: 'organization_images',
      });
      imageUrl = uploadResponse.secure_url;
    } else {
      imageUrl = 'https://defaultimage.url/placeholder.jpg'; // Default image
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTPs
    const emailOtp = generateOtp();
    const phoneOtp = generateOtp();

    // Send OTPs via email and SMS
    const data = { user: { name }, emailOtp };
    const html = await ejs.renderFile(path.join(__dirname, '../mails/activation-mail.ejs'), data);

    try {
      await sendMail({
        email,
        subject: 'Activate your account',
        template: 'activation-mail.ejs',
        data,
      });
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }

    await sendSms(phone, `Your OTP is: ${phoneOtp}`);

    // Generate token containing user details and OTPs
    const token = jwt.sign(
      {
        orgDetails: {
          name, location, email, password: hashedPassword, accessCode,
          phone, image: imageUrl, uniqueId, type, beds,
          departments, pharmacy, visitingHours, helpline
        },
        emailOtp,
        phoneOtp
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    return res.status(200).json({ message: 'Registration successful, verify OTP', token });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Activate organization
export const activateOrganization = async (req, res) => {
  const { token, emailOtp, phoneOtp } = req.body;

  try {
    // Decode token and verify OTPs
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { orgDetails } = decoded;

    if (emailOtp != decoded.emailOtp || phoneOtp != decoded.phoneOtp) {
      return res.status(400).json({ message: 'Invalid OTPs' });
    }

    // Create new organization
    const newOrganization = new Organization({
      ...orgDetails,
    });

    await newOrganization.save();

    setToken(newOrganization._id, 'organization', res, 'Organization account activated successfully', 201);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid or expired token', error: error.message });
  }
};



// Login organization
export const loginOrganization = async (req, res) => {
  const { email, password, uniqueId } = req.body;

  try {
    const organization = await Organization.findOne({ email, uniqueId });
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, organization.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    setToken(
      organization._id,
      'organization', 
      res,
      'Login successful',
      200 
    );
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// get all doctor for a organization 
export const getDoctorsForOrganization = async (req, res) => {
  const { organizationId } = req.body; // Extract organizationId from request params

  try {
    // Find all doctors associated with the given organizationId
    const doctors = await Doctor.find({ organizations: organizationId })
      .populate('organizations', 'name location')  // Populate organization details (name, location)
      .exec();

    if (!doctors || doctors.length === 0) {
      return res.status(404).json({ message: "No doctors found for this organization." });
    }

    res.status(200).json({
      success: true,
      doctors: doctors.map(doctor => ({
        doctorId: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        dob: doctor.dob,
        gender: doctor.gender,
        contactNumber: doctor.contactNumber,
        email: doctor.email,
        profilePicture: doctor.profilePicture,
        medicalRegNumber: doctor.medicalRegNumber,
        specialization: doctor.specialization,
        qualifications: doctor.qualifications,
        experience: doctor.experience,
        affiliations: doctor.affiliations,
        consultationFee: doctor.consultationFee,
        department: doctor.department,
        availableDays: doctor.availableDays,
        timeSlots: doctor.timeSlots,
        mode: doctor.mode,
        chamberNumber: doctor.chamberNumber,
        organizations: doctor.organizations, // Organization details
      })),
    });
  } catch (err) {
    console.error("Error fetching doctors for organization", err);
    res.status(500).json({ message: "Error fetching doctors for organization." });
  }
};