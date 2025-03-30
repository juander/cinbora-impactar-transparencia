import mongoose, { Document, Schema } from 'mongoose';
import { INgo } from './ngo.model';
import { IAction } from './action.model';

export interface IActionFile extends Document {
  aws_name: string;
  name: string;
  category: string;
  aws_url: string;
  mime_type: string;
  size: number;
  actionId: mongoose.Types.ObjectId;
  ngoId: number;
  action: IAction['_id'];
  ngo: INgo['_id'];
  createdAt: Date;
  updatedAt: Date;
}

const ActionFileSchema = new Schema<IActionFile>(
  {
    aws_name: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    aws_url: { type: String, required: true },
    mime_type: { type: String, required: true },
    size: { type: Number, required: true },
    actionId: { type: Schema.Types.ObjectId, required: true, ref: 'Action' },
    ngoId: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    collection: 'action_files'
  }
);

// Define index
ActionFileSchema.index({ actionId: 1, category: 1 });

// Define virtual for relationship with Action
ActionFileSchema.virtual('action', {
  ref: 'Action',
  localField: 'actionId',
  foreignField: '_id',
  justOne: true
});

// Define virtual for relationship with Ngo
ActionFileSchema.virtual('ngo', {
  ref: 'Ngo',
  localField: 'ngoId',
  foreignField: '_id',
  justOne: true
});

export const ActionFile = mongoose.model<IActionFile>('ActionFile', ActionFileSchema);
