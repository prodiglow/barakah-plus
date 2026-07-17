import mongoose, { Schema, Document } from "mongoose";

export interface IScholarSpecialization extends Document {
  name: string;
}

const ScholarSpecializationSchema = new Schema<IScholarSpecialization>({
  name: { type: String, required: true, unique: true },
});

export const ScholarSpecialization = mongoose.model<IScholarSpecialization>(
  "ScholarSpecialization",
  ScholarSpecializationSchema
);
