import mongoose, { Schema, Document } from "mongoose";

export interface IScholarServices extends Document {
  name: string;
}

const ScholarServicesSchema = new Schema<IScholarServices>({
  name: { type: String, required: true },
});

export const ScholarServices = mongoose.model<IScholarServices>(
 "ScholarServices",
  ScholarServicesSchema
);
