import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISettings extends Document {
  id: string;
  tourAvailableDays: number[];
  tourPrice: number;
}

const SettingsSchema = new Schema<ISettings>(
  {
    id: { type: String, required: true, unique: true, default: "global" },
    tourAvailableDays: { type: [Number], default: [1, 2, 3, 4, 5] },
    tourPrice: { type: Number, default: 50 },
  },
  { timestamps: true }
);

const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);
export default Settings;

