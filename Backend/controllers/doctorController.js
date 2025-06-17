import jwt from 'jsonwebtoken';
import { sendSms } from '../utils/sendSms.js';
// import { generateOtp } from '../utils/generateOtp.js';
import { Doctor } from '../models/doctorModel.js';
import { Patient } from '../models/patientModel.js';
import { Organization } from '../models/orgModel.js';
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary';
import fileUpload from "express-fileupload";
import ejs from 'ejs'                      
import path from 'path'
import { fileURLToPath } from 'url';
import sendMail from '../utils/sendMail.js';
import { generateToken, setToken } from '../middlewares/authMiddleware.js';
import { AvailabilityMatrix } from '../models/availabilityModel.js';
import { Appointment } from '../models/appointmentModel.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000); // Generates a 4-digit OTP
};

export const registerDoctor = async (req, res, next) => {
  const {
    firstName, lastName, dob, gender, contactNumber, email, password,
     medicalRegNumber, specialization, qualifications,
    experience, affiliations, consultationFee, department, availableDays,
    timeSlots, mode, chamberNumber, organizations
  } = req.body;

  try {
    const existingEmail = await Doctor.findOne({ email }) ||
                          await Patient.findOne({ email }) ||
                          await Organization.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    console.log("hii")

    console.log(organizations)
    const existingPhone = await Doctor.findOne({ contactNumber }) ||
                          await Patient.findOne({ contactNumber }) ||
                          await Organization.findOne({ phone: contactNumber });
    if (existingPhone) {
      return res.status(400).json({ message: 'Phone number already exists' });
    }

    
    const validOrganizations = await Organization.find({ _id: { $in: organizations } });


    if (validOrganizations.length !== organizations.length) {
      return res.status(404).json({ message: 'One or more organizations not found' });
    }

  //   if (!req.files || !req.files.profilePicture) {
  //   return res.status(400).json({ message: 'No image file uploaded' });
  //   }
  //   const image = req.files.profilePicture;
  //     const uploadResponse = await cloudinary.uploader.upload(image.tempFilePath, {
  //   folder: 'uploaded_images', 
  // });
  
  //   const  profilePictureUrl = uploadResponse.secure_url;
      const  profilePictureUrl = 'https://res.cloudinary.com/duxx6cf5c/image/upload/v1734071340/uploaded_images/aywt5puevaf4tnl9wy8c.jpg';



    // Hash the password before saving to the database
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
        doctorDetails: {
          firstName, lastName, dob, gender, contactNumber, email,
          password: hashedPassword, organizations, profilePicture: profilePictureUrl,
          medicalRegNumber, specialization, qualifications, experience,
          affiliations, consultationFee, department, availableDays, timeSlots,
          mode, chamberNumber
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

export const activateDoctor = async (req, res) => {
  const { token, emailOtp, phoneOtp } = req.body;

  try {
    // Decode token and verify OTPs
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { doctorDetails } = decoded;

    if (emailOtp != decoded.emailOtp || phoneOtp != decoded.phoneOtp) {
      return res.status(400).json({ message: 'Invalid OTPs' });
    }

    // Create new doctor
    const newDoctor = new Doctor({
      ...doctorDetails,
    });

    await newDoctor.save();

    

    setToken(newDoctor._id, 'doctor',res,'Doctor account activated successfully', 201);

  } catch (error) {
    return res.status(400).json({ message: 'Invalid or expired token', error: error.message });
  }
};




export const profilepic = async(req,res)=>{

  try {
  if (!req.files || !req.files.image) {
    return res.status(400).json({ message: 'No image file uploaded' });
  }

  // Access the uploaded file
  const image = req.files.image;

  // Upload file to Cloudinary
  const uploadResponse = await cloudinary.uploader.upload(image.tempFilePath, {
    folder: 'uploaded_images', // Optional: specify folder in Cloudinary
  });

  // Return the uploaded image URL
  res.status(200).json({ url: uploadResponse.secure_url });
} catch (error) {
  console.error('Error uploading to Cloudinary:', error.message);
  res.status(500).json({ message: 'Failed to upload image', error: error.message });
}

}



export const loginDoctor = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the doctor by email
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(404).json({ message: 'invalid email or password' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

  

    // Use the setToken function to send the response with the token and doctor's details
    setToken(
      doctor._id,
      'doctor', 
      res,
      'Login successful',
      200 
    );  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// get my own matrix
export const getDoctorAvailabilitymatrix = async (req, res) => {
  const { doctorId } = req.body; // Extract doctorId from request params

  try {
    // Check if the doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found." });
    }

    // Fetch the availability matrix for the doctor (availability matrix includes available dates and time slots)
    const availabilityMatrix = await AvailabilityMatrix.find({ doctorId })
      .populate('doctorId', 'firstName lastName email') // Populate doctor details
      .exec();

    if (!availabilityMatrix || availabilityMatrix.length === 0) {
      return res.status(404).json({ message: "No availability found for this doctor." });
    }

    // Send back the doctor's availability matrix
    res.status(200).json({
      success: true,
      doctor: {
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
      },
      availabilityMatrix: availabilityMatrix.map((entry) => ({
        date: entry.date, // Date of the available slot
        timeSlots: entry.timeSlots, // Available time slots
      })),
    });
  } catch (err) {
    console.error("Error fetching availability matrix", err);
    res.status(500).json({ message: "Error fetching availability matrix." });
  }
};

export const changeStatus = async (req, res) => {
  const appointmentId = req.params.id;
  const { status } = req.body;

  // Allowed statuses
  const allowedStatuses = ['Confirmed', 'Cancelled', 'Completed'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status. Must be Confirmed, Cancelled, or Completed." });
  }

  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true } // Return the updated document
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    return res.status(200).json({
      message: `Appointment status updated to ${status}`,
      appointment: updatedAppointment
    });

  } catch (error) {
    console.error("Error updating appointment status:", error.message);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
