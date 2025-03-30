import mongoose, { Document, Schema } from 'mongoose';
import { INgo } from './ngo.model';

export interface IAction extends Document {
  name: string;
  type: string;
  ngoId: number;
  spent: number;
  goal: number;
  colected: number;
  aws_url?: string; // Tornar opcional
  ngo: INgo['_id'];
  createdAt: Date;
  updatedAt: Date;
}

const ActionSchema = new Schema<IAction>(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    ngoId: { type: Number, required: true },
    spent: { type: Number, required: true },
    goal: { type: Number, required: true },
    colected: { type: Number, required: true },
    aws_url: { type: String, required: false, default: null }, 
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    collection: 'actions'
  }
);

// Define index
ActionSchema.index({ ngoId: 1 });

// Define virtual for relationship with Ngo
ActionSchema.virtual('ngo', {
  ref: 'Ngo',
  localField: 'ngoId',
  foreignField: '_id',
  justOne: true
});

// Define virtual for files
ActionSchema.virtual('files', {
  ref: 'ActionFile',
  localField: '_id',
  foreignField: 'actionId'
});

// Define virtual for expenses
ActionSchema.virtual('expenses', {
  ref: 'ActionExpensesGrafic',
  localField: '_id',
  foreignField: 'actionId'
});

export const Action = mongoose.model<IAction>('Action', ActionSchema);
