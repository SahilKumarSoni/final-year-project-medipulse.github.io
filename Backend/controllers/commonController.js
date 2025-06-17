import jwt from 'jsonwebtoken';
import { Doctor } from '../models/doctorModel.js';
import { Organization } from '../models/orgModel.js';
import { Patient } from '../models/patientModel.js';
import { AvailabilityMatrix } from '../models/availabilityModel.js';
import { Specialization } from '../models/specializationModel.js';




export const getUserDetails = async (req, res) => {
   
    const {token}= req.cookies;
    if(!token) return res.status(404).json({
     success:false,
     message:"login first",
     });

  const decoded = jwt.verify(token,process.env.JWT_SECRET);
 console.log(decoded)
 let user
 if(decoded.role=="doctor"){

    user = await Doctor.findById(decoded.id);
 }
 else if(decoded.role=="organization"){
    user = await Organization.findById(decoded.id);
 }
 else{
    user = await Patient.findById(decoded.id);

 }
  res.status(200).json({
    message:"successful .........",
    user
  })
}

export const logout = async(req, res, next) => {
    try {
        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
        })
        res.status(200).json({
            success: true,
            message: " Logged out ",
        })

    } catch (error) {
        return next(new ErrorHandler(error.message, 404));

    }
}

export const getmyRole = async(req, res, next) => {
    try {
        const {token}= req.cookies;
           const decoded = jwt.verify(token,process.env.JWT_SECRET);
           res.status(201).json({
            message:"role ...",
            role:decoded.role,
           })

    } catch (error) {
        return next(new ErrorHandler(error.message, 404));

    }
}



// Controller to get all doctors
export const getAllDoctors = async (req, res) => {
    try {
      const doctors = await Doctor.find({});
      res.status(200).json({
        success: true,
        data: doctors,
      });
    } catch (error) {
      console.error('Error fetching doctors:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching doctors: ' + error.message,
      });
    }
  };

// Controller to get all patients
export const getAllPatients = async (req, res) => {
    try {
      const patients = await Patient.find({});
      res.status(200).json({
        success: true,
        data: patients,
      });
    } catch (error) {
      console.error('Error fetching patients:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching patients: ' + error.message,
      });
    }
  };

 export const getAllOrganizations = async (req, res) => {
    try {
      const organizations = await Organization.find({});
      res.status(200).json({
        success: true,
        data: organizations,
      });
    } catch (error) {
      console.error('Error fetching organizations:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching organizations: ' + error.message,
      });
    }
  };


// Controller function to get all diseases
export const getAllDiseases = async (req, res) => {
  try {
    const diseases = await Specialization.distinct("disease"); // Get unique diseases

    if (diseases.length > 0) {
      res.status(200).json({
        success: true,
        diseases: diseases
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No diseases found"
      });
    }
  } catch (error) {
    console.error("Error fetching diseases:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Controller function to get all specialists
export const getAllSpecialists = async (req, res) => {
    try {
      const specialists = await Specialization.distinct("specialist"); // Get unique specialist names
  
      if (specialists.length > 0) {
        res.status(200).json({
          success: true,
          specialists: specialists
        });
      } else {
        res.status(404).json({
          success: false,
          message: "No specialists found"
        });
      }
    } catch (error) {
      console.error("Error fetching specialists:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  };


// Controller function to get all doctors (name and ID only)
export const getAllDoctorsbyNameandId = async (req, res) => {
  try {
    // Fetch only the firstName, lastName, and _id fields of all doctors
    const doctors = await Doctor.find({}, 'firstName lastName _id');

    if (doctors.length > 0) {
      res.status(200).json({
        success: true,
        doctors: doctors
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No doctors found"
      });
    }
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};




// get doc by specialization 
export const getDoctorsBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.body; // Extract specialization from route parameters

    // Validate request
    if (!specialization) {
      return res.status(400).json({
        success: false,
        message: "Specialization is required.",
      });
    }

    // Find doctors by specialization
    const doctors = await Doctor.find({
      specialization: specialization, // Match the specialization
    }).populate({
      path: 'organizations',
      model: 'Organization',
    });

    // Check if any doctors found
    if (doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No doctors found with specialization: ${specialization}.`,
      });
    }

    // Return the list of doctors
    res.status(200).json({
      success: true,
      doctors,
    });
  } catch (error) {
    console.error("Error finding doctors by specialization:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Unable to find doctors by specialization.",
    });
  }
};
