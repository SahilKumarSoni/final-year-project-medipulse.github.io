import { Appointment } from "../models/appointmentModel.js";
import { AvailabilityMatrix } from "../models/availabilityModel.js";
import { Doctor } from "../models/doctorModel.js";
import { Organization } from "../models/orgModel.js";
import { Patient } from "../models/patientModel.js";
import { sendSms } from "../utils/sendSms.js";


// Controller to apply for a booking
export const applyBooking = async (req, res) => {
  const { doctorId, patientId, date, timeSlot } = req.body;

  try {
    // Step 1: Check if the slot is available
    const availability = await AvailabilityMatrix.findOne({ doctorId, date });

    if (!availability) {
      return res.status(404).json({ message: "Doctor does not have availability for this date." });
    }

    // Step 2: Find the corresponding slot
    const slot = availability.timeSlots.find(slot => slot.slot === timeSlot);

    if (!slot) {
      return res.status(404).json({ message: "The requested time slot is not available." });
    }

    if (slot.status === 1) {
      return res.status(400).json({ message: "The time slot is already booked." });
    }

    // Step 3: Update the status of the slot to booked (1)
    slot.status = 1;
    

    // Step 4: Create an appointment
    const newAppointment = new Appointment({
      doctorId,
      patientId,
      appointmentDate: date,
      timeSlot,
      status: "Confirmed", 
    });


   // Step 5: Fetch doctor and organization details
   const doctor = await Doctor.findById(doctorId).populate('organizations');  // Populate the organization data
   const patient = await Patient.findById(patientId);  // Assuming you have a Patient model

   if (!doctor) {
     return res.status(404).json({ message: "Doctor not found." });
   }

   // Fetching organization location from populated data
   const organization = doctor.organizations[0];  // Assuming a doctor belongs to only one organization
   const organizationLocation = organization ? organization.location : "Location not available";  // Assuming the location field exists

   // Prepare the response object
   const appointmentDetails = {
     appointmentId: newAppointment._id,
     doctorName: `${doctor.firstName} ${doctor.lastName}`,
     doctorSpecialization: doctor.specialization,
     doctorQualifications: doctor.qualifications,
     doctorExperience: doctor.experience,
     consultationFee: doctor.consultationFee,
     patientName: `${patient.firstName} ${patient.lastName}`,  // Assuming you have a Patient model
     appointmentDate: newAppointment.appointmentDate,
     timeSlot: newAppointment.timeSlot,
     organizationName: organization ? organization.name : "Organization not available",
     organizationLocation: organizationLocation,
   };

   const contactNumber = patient.contactNumber
    await sendSms(contactNumber, `Congratulation ${appointmentDetails.patientName} your appointment booked successfully to Dr. ${appointmentDetails.doctorName} on ${appointmentDetails.appointmentDate}  and your time slot will be ${appointmentDetails.timeSlot} at ${appointmentDetails.organizationName} follow the location : ${appointmentDetails.organizationLocation} !`);
   
    
    await availability.save();
    await newAppointment.save();

   res.status(201).json({ 
     message: "Appointment booked successfully.",
     appointmentDetails
   });
  } catch (err) {
    console.error("Error booking appointment", err);
    res.status(500).json({ message: "Error booking appointment." });
  }
};

// Check if a given slot is available
export const checkAvailability = async (req,res,next) => {

    const {doctorId, date, timeSlot} = req.body;
 try {
   // Find the availability matrix for the doctor and the given date
   const availability = await AvailabilityMatrix.findOne({ doctorId, date });

   if (!availability) {
     return res.status(404).json({ success: false, message: "No availability found for the given date." });
   }

   // Check if the given time slot is available
   const slot = availability.timeSlots.find(slot => slot.slot === timeSlot);
   if (!slot) {
     return res.status(404).json({ success: false, message: "Slot not found. you can try another slot " });
   }

   // If the slot status is 0 (Available), return true
   if (slot.status === 0) {
     return res.status(201).json({ success: true, message: "Slot is available." });
   } else {
     return res.status(404).json({ success: false, message: "Slot is already booked." });
   }
 } catch (err) {
   console.error("Error checking availability", err);
   return res.status(404).json({ success: false, message: "Error checking availability." });
 }
};

// get all bookings

export const getAllBookingsForPatient = async (req, res) => {
  const { patientId } = req.body;  // Patient's ID passed in the request body

  try {
    // Find all appointments for the given patient and populate the doctor and organizations
    const bookings = await Appointment.find({ patientId })
      .populate({
        path: 'doctorId',
        select: 'firstName lastName email contactNumber organizations', // Populate doctor details along with organizations
        populate: {
          path: 'organizations', // Populate organizations referenced in the doctor model
          select: 'name location' // Select only the organization name and location
        }
      })
      .exec();

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found for this patient." });
    }

    res.status(200).json({ success: true, bookings });
  } catch (err) {
    console.error("Error fetching bookings for patient", err);
    res.status(500).json({ message: "Error fetching bookings for patient." });
  }
};

// get particular bookings 
export const getParticularBooking = async (req, res) => {
  const { id } = req.params; // Extract the bookingId from the request parameters

  try {
    // Find the appointment based on the provided bookingId
    const booking = await Appointment.findById(id)
      .populate('doctorId', 'firstName lastName email contactNumber organizations') // Populate doctor details
      .exec();

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const doctor = booking.doctorId;
    const organization = doctor.organizations && doctor.organizations[0]
      ? await Organization.findById(doctor.organizations[0])
      : null;  // Fetch the organization only if it exists

    // Respond with booking details along with doctor and organization details
    res.status(200).json({
      success: true,
      booking: {
        appointmentId: booking._id,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        doctorContact: doctor.contactNumber,
        doctorEmail: doctor.email,
        organizationName: organization ? organization.name : "N/A",
        organizationLocation: organization ? organization.location : "N/A",
        appointmentDate: booking.appointmentDate,
        timeSlot: booking.timeSlot,
        status: booking.status,
      },
    });
  } catch (err) {
    console.error("Error fetching particular booking details", err);
    res.status(500).json({ message: "Error fetching particular booking details." });
  }
};

// doctor can get its patient appointments
export const getDoctorAppointments = async (req, res) => {
  const { doctorId } = req.body; // Extract doctorId from request params

  try {
    // Find all appointments for the given doctor
    const appointments = await Appointment.find({ doctorId })
      .populate('patientId', 'firstName lastName contactNumber email') // Populate patient details
      .populate('doctorId', 'firstName lastName specialization') // Populate doctor details
      .exec();

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: "No appointments found for this doctor." });
    }
    console.log(appointments)
    // Prepare the response with patient details for each appointment
    const appointmentsData = appointments.map(appointment => {
      return {
        appointmentId: appointment._id,
        patientId:appointment.patientId._id,
        patientName: `${appointment.patientId.firstName} ${appointment.patientId.lastName}`,
        patientContact: appointment.patientId.contactNumber,
        patientEmail: appointment.patientId.email,
        appointmentDate: appointment.appointmentDate,
        timeSlot: appointment.timeSlot,
        status: appointment.status,
      };
    });

    res.status(200).json({
      success: true,
      appointments: appointmentsData,
    });
  } catch (err) {
    console.error("Error fetching appointments for doctor", err);
    res.status(500).json({ message: "Error fetching appointments for doctor." });
  }
};