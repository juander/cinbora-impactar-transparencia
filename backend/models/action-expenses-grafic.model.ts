import mongoose, { Document, Schema } from 'mongoose';
import { IAction } from './action.model';

export interface IActionExpensesGrafic extends Document {
  categorysExpenses: Array<{
    year: number;
    months: Array<{
      month: number;
      dailyRecords: Array<{
        day: number;
        categorysExpenses: Record<string, number>;
      }>;
    }>;
  }>;
  actionId: mongoose.Types.ObjectId;
  ngoId: number;
  action: IAction['_id'];
  createdAt: Date;
  updatedAt: Date;
}

// Define sub-schemas with _id: false to prevent MongoDB from adding _id fields
const DailyRecordSchema = new Schema({
  day: { type: Number, required: true },
  categorysExpenses: { 
    type: Schema.Types.Mixed,
    default: () => ({})
  }
}, { _id: false });

const MonthSchema = new Schema({
  month: { type: Number, required: true },
  dailyRecords: [DailyRecordSchema]
}, { _id: false });

const YearSchema = new Schema({
  year: { type: Number, required: true },
  months: [MonthSchema]
}, { _id: false });

const ActionExpensesGraficSchema = new Schema<IActionExpensesGrafic>(
  {
    categorysExpenses: [YearSchema],
    actionId: { 
      type: Schema.Types.ObjectId, 
      required: true, 
      ref: 'Action' 
    },
    ngoId: { 
      type: Number, 
      required: true 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    updatedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  {
    timestamps: true,
    collection: 'action_expenses',
    toJSON: {
      transform: (_, ret) => {
        // Garantir que cada dailyRecord tenha categorysExpenses inicializado
        // e remover campos _id de objetos aninhados
        if (Array.isArray(ret.categorysExpenses)) {
          ret.categorysExpenses.forEach((yearEntry) => {
            delete yearEntry._id;
            if (!yearEntry.months) {
              yearEntry.months = [];
            }
            
            yearEntry.months.forEach((monthEntry) => {
              delete monthEntry._id;
              if (!monthEntry.dailyRecords) {
                monthEntry.dailyRecords = [];
              }
              
              monthEntry.dailyRecords.forEach((dailyRecord) => {
                delete dailyRecord._id;
                if (!dailyRecord.categorysExpenses) {
                  dailyRecord.categorysExpenses = {};
                }
              });
            });
          });
        }
        return ret;
      },
    },
  }
);

// Add pre-save hook to ensure data structure integrity
ActionExpensesGraficSchema.pre('save', function(next) {
  if (!this.categorysExpenses) {
    this.categorysExpenses = [];
  }
  
  // Ensure year-month-day structure is properly initialized
  this.categorysExpenses.forEach(yearEntry => {
    if (!yearEntry.months) {
      yearEntry.months = [];
    }
    
    yearEntry.months.forEach(monthEntry => {
      if (!monthEntry.dailyRecords) {
        monthEntry.dailyRecords = [];
      }
      
      monthEntry.dailyRecords.forEach(dailyRecord => {
        if (!dailyRecord.categorysExpenses) {
          dailyRecord.categorysExpenses = {};
        }
      });
    });
  });
  
  next();
});

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
