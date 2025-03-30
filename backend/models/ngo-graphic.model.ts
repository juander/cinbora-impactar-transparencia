import mongoose, { Document, Schema } from 'mongoose';
import { INgo } from './ngo.model';

export interface INgoGraphic extends Document {
  ngoId: number;
  totalExpenses: number;
  expensesByAction: any;
  ngo: INgo['_id'];
  createdAt: Date;
  updatedAt: Date;
}

const NgoGraphicSchema = new Schema<INgoGraphic>(
  {
    ngoId: { type: Number, required: true, unique: true },
    totalExpenses: { type: Number, required: true },
    expensesByAction: { type: Schema.Types.Mixed, default: () => [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    collection: 'ngo_graphics'
  }
);

// Definir virtual para a relação com Ngo
NgoGraphicSchema.virtual('ngo', {
  ref: 'Ngo',
  localField: 'ngoId',
  foreignField: '_id',
  justOne: true
});

export const NgoGraphic = mongoose.model<INgoGraphic>('NgoGraphic', NgoGraphicSchema);
