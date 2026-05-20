import mongoose, { Schema } from "mongoose";
import { ICheckin } from "../interfaces/checkin.interface";

const checkinSchema = new Schema<ICheckin>(
  {
    userId: {
      type: String,
      ref: "User",
      required: true
    },
    imageUri: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true,
      default: "Kỷ niệm Check-in"
    },
    date: {
      type: String,
      required: true
    },
    isFavorite: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model<ICheckin>("Checkin", checkinSchema);
