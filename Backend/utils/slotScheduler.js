import cron from "node-cron";
import { AvailabilityMatrix } from "../models/availabilityModel.js";
import { generateTimeSlots, getFutureDatesForWeekdays } from "../controllers/availablityController.js";
import { Doctor } from "../models/doctorModel.js";


// Scheduled Task: Maintain a 30-day range of slots
// Cron job to generate time slots for the next 30 days
// cron.schedule("0 0 * * *", async () => {
  cron.schedule("*/30 * * * * *", async () => {
   // Cron job to generate time slots for the next 30 days
// cron.schedule("0 0 * * *", async () => {
  console.log("Running scheduled task to maintain 30-day slot range");

  try {
    const currentDate = new Date().toISOString().split("T")[0]; // Get the current date in "YYYY-MM-DD" format
    const doctors = await Doctor.find({}); // Fetch all doctors from the database

    for (const doctor of doctors) {
      const { _id: doctorId, availableDays, timeSlots } = doctor;

      // Skip doctors without available days or time slots
      if (!availableDays || availableDays.length === 0 || !timeSlots || timeSlots.length === 0) {
        console.warn(`Doctor ${doctorId} has no availability defined.`);
        continue;
      }

      // Fetch existing availability matrix for the doctor
      const existingSlots = await AvailabilityMatrix.find({ doctorId });
      const existingDates = existingSlots.map(slot => slot.date);

      // Delete expired slots (before the current date)
      const deletedSlots = await AvailabilityMatrix.deleteMany({ doctorId, date: { $lt: currentDate } });
      console.log(`Deleted ${deletedSlots.deletedCount} expired slots for doctor ${doctorId}`);

      // Get the future dates for the doctor based on their available days
      const futureDates = getFutureDatesForWeekdays(availableDays);

      // Filter out the dates that already exist in the database
      const missingDates = futureDates
        .map(date => date.toISOString().split("T")[0])
        .filter(date => !existingDates.includes(date));

      const newSlots = [];
      
      // Structure the time ranges based on the existing time slots for the doctor
   const timeRanges = timeSlots.map(timeSlot => {
  const [startTime, endTime] = timeSlot.split(' - ');
  const cleanTime = (time) => time.replace(/AM|PM/gi, '').trim();
  return [cleanTime(startTime), cleanTime(endTime)];
});


      // Generate time slots for the missing dates
      missingDates.forEach(date => {
        console.log(timeRanges)
        const slots = generateTimeSlots(timeRanges);
        newSlots.push({ doctorId, date, timeSlots: slots });
      });

      // Insert new slots into the database if there are any missing
      if (newSlots.length > 0) {
        const insertedSlots = await AvailabilityMatrix.insertMany(newSlots);
        console.log(`Inserted ${insertedSlots.length} new slots for doctor ${doctorId}`);
      } else {
        console.log(`No new slots to insert for doctor ${doctorId}`);
      }
    }

    console.log("Scheduled task completed successfully");
  } catch (error) {
    console.error("Error in scheduled task", error);
  }
});