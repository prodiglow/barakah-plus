import mongoose, { Schema, Document } from 'mongoose';

export interface IIslamicProduct extends Document {
  name: string;
  category: string;
  actualPrice: number;
  salePrice: number;
  description: string;
  imageUrl: string;
  stock: number;
}

const IslamicProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  actualPrice: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  stock: { type: Number, required: true, default: 100 }
}, {
  timestamps: true
});

export const IslamicProduct = mongoose.model<IIslamicProduct>('IslamicProduct', IslamicProductSchema);

