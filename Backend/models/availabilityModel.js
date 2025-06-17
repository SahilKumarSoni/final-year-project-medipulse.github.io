import mongoose from "mongoose";

const availabilityMatrixSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  date: { type: String, required: true },
  timeSlots: [
    {
      slot: { type: String, required: true }, // e.g., "09:00 AM - 09:30 AM"
      status: { type: Number, default: 0 }, // 0: Available, 1: Booked
    },
  ],
});

export const AvailabilityMatrix = mongoose.model("AvailabilityMatrix", availabilityMatrixSchema);
