import mongoose, { Document, Schema } from 'mongoose';
import { INgo } from './ngo.model';

export interface IUser extends Document {
  name: string;
  email: string;
  ngoId: number;
  profileUrl?: string;
  ngo: INgo['_id'];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    ngoId: { type: Number, required: true },
    profileUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

UserSchema.virtual('ngo', {
  ref: 'Ngo',
  localField: 'ngoId',
  foreignField: '_id',
  justOne: true
});

export const User = mongoose.model<IUser>('User', UserSchema);