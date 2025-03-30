import mongoose, { Document, Schema } from 'mongoose';
import { INgo } from './ngo.model';

export interface IOngFile extends Document {
  aws_name: string;
  name: string;
  category: string;
  aws_url: string;
  ngoId: number;
  mime_type: string;
  size: number;
  ngo: INgo['_id'];
  createdAt: Date;
  updatedAt: Date;
}

const OngFileSchema = new Schema<IOngFile>(
  {
    aws_name: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    aws_url: { type: String, required: true },
    ngoId: { type: Number, required: true },
    mime_type: { type: String, required: true },
    size: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    collection: 'ngo_files'
  }
);

// Definir índices
OngFileSchema.index({ ngoId: 1, category: 1 });

// Definir virtual para a relação com Ngo
OngFileSchema.virtual('ngo', {
  ref: 'Ngo',
  localField: 'ngoId',
  foreignField: '_id',
  justOne: true
});

export const OngFile = mongoose.model<IOngFile>('OngFile', OngFileSchema);