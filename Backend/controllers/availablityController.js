// import { AvailabilityMatrix } from "../models/availabilityModel.js";

// // Utility to calculate next 30 available dates for given weekdays
// export const getFutureDatesForWeekdays = (weekdays, startDate = new Date()) => {
//   const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//   const weekdayIndices = weekdays.map(day => daysOfWeek.indexOf(day));
//   const futureDates = [];

//   for (let i = 0; i < 30; i++) {
//     startDate.setDate(startDate.getDate() + 1);
//     if (weekdayIndices.includes(startDate.getDay())) {
//       futureDates.push(new Date(startDate)); // Add future date matching weekday
//     }
//   }
//   return futureDates;
// };

// // Utility to generate time slots for a given day
// export const generateTimeSlots = (availableTimeRanges) => {
//   const slots = [];
//   availableTimeRanges.forEach(([startTime, endTime]) => {
//     let start = new Date(`1970-01-01T${startTime}`);
//     let end = new Date(`1970-01-01T${endTime}`);

//     while (start < end) {
//       const nextSlot = new Date(start.getTime() + 30 * 60 * 1000); // Add 30 minutes
//       slots.push({
//         slot: `${start.toTimeString().slice(0, 5)} - ${nextSlot.toTimeString().slice(0, 5)}`,
//         status: 0,
//       });
//       start = nextSlot;
//     }
//   });
//   return slots;
// };

// // Controller: Create Slots
// export const createDoctorSlots = async (req, res) => {
//   const { doctorId, weekdays, timeRanges } = req.body; // timeRanges: e.g., [["09:00", "11:00"], ["14:00", "17:00"]]
//   const startDate = new Date();

//   try {
//     const futureDates = getFutureDatesForWeekdays(weekdays, startDate);

//     const newSlots = [];
//     futureDates.forEach(date => {
//       const timeSlots = generateTimeSlots(timeRanges);
//       newSlots.push({
//         doctorId,
//         date,
//         timeSlots,
//       });
//     });

//     // Insert all slots into the database
//     await AvailabilityMatrix.insertMany(newSlots);
//     res.status(201).json({ message: "Slots created successfully", newSlots });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Error creating slots" });
//   }
// };


import { AvailabilityMatrix } from "../models/availabilityModel.js";

// Utility to calculate next 30 available dates for given weekdays
export const getFutureDatesForWeekdays = (weekdays, startDate = new Date()) => {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weekdayIndices = weekdays.map(day => daysOfWeek.indexOf(day));
  const futureDates = [];

  for (let i = 0; i < 30; i++) {
    startDate.setDate(startDate.getDate() + 1);
    if (weekdayIndices.includes(startDate.getDay())) {
      // Normalize the date to ignore the time portion
      const normalizedDate = new Date(startDate);
      normalizedDate.setHours(0, 0, 0, 0); // Set time to 00:00:00
      futureDates.push(normalizedDate); // Add future date matching weekday
    }
  }
  return futureDates;
};

// Utility to generate time slots for a given day
export const generateTimeSlots = (availableTimeRanges) => {
  const slots = [];
  availableTimeRanges.forEach(([startTime, endTime]) => {
    let start = new Date(`1970-01-01T${startTime}`);
    let end = new Date(`1970-01-01T${endTime}`);

    while (start < end) {
      const nextSlot = new Date(start.getTime() + 30 * 60 * 1000); // Add 30 minutes
      slots.push({
        slot: `${start.toTimeString().slice(0, 5)} - ${nextSlot.toTimeString().slice(0, 5)}`,
        status: 0,
      });
      start = nextSlot;
    }
  });
  return slots;
};

// Controller: Create Slots
export const createDoctorSlots = async (req, res) => {
  const { doctorId, weekdays, timeRanges } = req.body; // timeRanges: e.g., [["09:00", "11:00"], ["14:00", "17:00"]]
  const startDate = new Date();

  try {
    const futureDates = getFutureDatesForWeekdays(weekdays, startDate);

    const newSlots = [];
    futureDates.forEach(date => {
      const timeSlots = generateTimeSlots(timeRanges);
      newSlots.push({
        doctorId,
        date: date.toISOString().split('T')[0], // Get only the date part (YYYY-MM-DD)
        timeSlots,
      });
    });

    // Insert all slots into the database (ensure only the date is stored)
    await AvailabilityMatrix.insertMany(newSlots);
    res.status(201).json({ message: "Slots created successfully", newSlots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating slots" });
  }
};



