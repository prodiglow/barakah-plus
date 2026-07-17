import mongoose, { Schema, Document } from "mongoose";

export interface IScholarEducation extends Document {
  name: string;
}

const ScholarEducationSchema = new Schema<IScholarEducation>({
  name: { type: String, required: true },
});

export const ScholarEducation = mongoose.model<IScholarEducation>(
 "ScholarEducation",
  ScholarEducationSchema
);
