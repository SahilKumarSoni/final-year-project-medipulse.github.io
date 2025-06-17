import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import { sendSms } from '../utils/sendSms.js';
// import { generateOtp } from '../utils/generateOtp.js';
import sendMail from '../utils/sendMail.js';
import { generateToken, setToken } from '../middlewares/authMiddleware.js';
import { Patient } from '../models/patientModel.js';
import { Doctor } from '../models/doctorModel.js';
import { Organization } from '../models/orgModel.js';
import { Specialization } from '../models/specializationModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000); // Generates a 4-digit OTP
};

export const registerPatient = async (req, res) => {
  const {
    firstName,
    lastName,
    dob,
    gender,
    contactNumber,
    email,
    password,
    address,
    preferredDoctor,
    medicalConditions,
    currentMedications,
    allergies,
    pastSurgeries,
  } = req.body;

  try {
    // Check for existing email
    const existingEmail = await Patient.findOne({ email }) ||
                          await Doctor.findOne({ email }) ||
                          await Organization.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Check for existing phone number
    const existingPhone = await Patient.findOne({ contactNumber }) ||
                          await Doctor.findOne({ contactNumber }) ||
                          await Organization.findOne({ phone: contactNumber });
    if (existingPhone) {
      return res.status(400).json({ message: 'Phone number already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTPs
    const emailOtp = generateOtp();
    const phoneOtp = generateOtp();

    // Send OTPs via email and SMS
    const data = { user: { name: firstName }, emailOtp };
    const html = await ejs.renderFile(path.join(__dirname, "../mails/activation-mail.ejs"), data);
    try {
      await sendMail({
        email: email,
        subject: "Activate your account",
        template: "activation-mail.ejs",
        data,
      });
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }

    await sendSms(contactNumber, `Your OTP is: ${phoneOtp}`);

    // Generate token containing user details and OTPs
    const token = jwt.sign(
      {
        patientDetails: {
          firstName,
          lastName,
          dob,
          gender,
          contactNumber,
          email,
          password: hashedPassword,
          address,
          preferredDoctor,
          medicalConditions,
          currentMedications,
          allergies,
          pastSurgeries,
        },
        emailOtp,
        phoneOtp,
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

export const activatePatient = async (req, res) => {
  const { token, emailOtp, phoneOtp } = req.body;

  try {
    // Decode token and verify OTPs
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { patientDetails } = decoded;

    if (emailOtp != decoded.emailOtp || phoneOtp != decoded.phoneOtp) {
      return res.status(400).json({ message: 'Invalid OTPs' });
    }

    // Create new patient
    const newPatient = new Patient({
      ...patientDetails,
    });

    await newPatient.save();

    setToken(newPatient._id, 'patient', res, 'Patient account activated successfully', 201);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid or expired token', error: error.message });
  }
};

export const loginPatient = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the patient by email
    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(404).json({ message: 'Invalid email or password' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Use the setToken function to send the response with the token and patient's details
    setToken(
      patient._id,
      'patient',
      res,
      'Login successful',
      200
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateProfilePicture = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    // Access the uploaded file
    const image = req.files.image;

    // Upload file to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image.tempFilePath, {
      folder: 'uploaded_images',
    });

    // Return the uploaded image URL
    res.status(200).json({ url: uploadResponse.secure_url });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error.message);
    res.status(500).json({ message: 'Failed to upload image', error: error.message });
  }
};



export const suggestDoctors = async (req, res) => {
  try {
    const { medicalConditions } = req.body; // Assume medicalConditions is passed in the request body as an array.

    // Validate request
    if (!Array.isArray(medicalConditions) || medicalConditions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Medical conditions must be an array and cannot be empty.",
      });
    }
    // Find all specializations matching the provided medical conditions
    const specializations = await Specialization.find({
      disease: { $in: medicalConditions },
    });
    
console.log(specializations)
    if (specializations.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No specializations found for the given medical conditions.`,
      });
    }

    // Extract the specialist names from the found specializations
    const specialistNames = specializations.map((specialization) => specialization.specialist);

    // Find all doctors matching any of the specializations
    const doctors = await Doctor.find({
      specialization: { $in: specialistNames },
    }).populate({
      path: 'organizations',
      model: 'Organization',
    });

    if (doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No doctors found for the provided medical conditions.`,
      });
    }

    // Return the complete details of all suggested doctors
    res.status(200).json({
      success: true,
      doctors,
    });
  } catch (error) {
    console.error("Error suggesting doctors:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Unable to suggest doctors.",
    });
  }
};
