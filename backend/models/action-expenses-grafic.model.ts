import mongoose, { Document, Schema } from 'mongoose';
import { IAction } from './action.model';

export interface IActionExpensesGrafic extends Document {
  categorysExpenses: any;
  actionId: mongoose.Types.ObjectId;
  ngoId: number;
  action: IAction['_id'];
  createdAt: Date;
  updatedAt: Date;
}

const ActionExpensesGraficSchema = new Schema<IActionExpensesGrafic>(
  {
    categorysExpenses: { type: Schema.Types.Mixed, default: () => [] },
    actionId: { type: Schema.Types.ObjectId, required: true, ref: 'Action' },
    ngoId: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    collection: 'action_expenses'
  }
);

// Define index
ActionExpensesGraficSchema.index({ actionId: 1 });

// Define virtual for relationship with Action
ActionExpensesGraficSchema.virtual('action', {
  ref: 'Action',
  localField: 'actionId',
  foreignField: '_id',
  justOne: true
});

export const ActionExpensesGrafic = mongoose.model<IActionExpensesGrafic>('ActionExpensesGrafic', ActionExpensesGraficSchema);
