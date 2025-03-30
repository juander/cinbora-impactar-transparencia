import mongoose, { Document, Schema } from 'mongoose';
import { INgo } from './ngo.model';

export interface INgoGraphic extends Document {
  ngoId: number;
  totalExpenses: number;
  expensesByAction: {
    year: number;
    months: {
      month: number;
      dailyRecords: {
        day: number;
        expensesByAction: Record<string, number>;
      }[];
    }[];
  }[];
  ngo: INgo['_id'];
  createdAt: Date;
  updatedAt: Date;
}

// Define sub-schemas with _id: false to prevent MongoDB from adding _id fields
const DailyRecordSchema = new Schema({
  day: { type: Number, required: true },
  // Change from Map type to Mixed type to avoid serialization issues
  expensesByAction: {
    type: Schema.Types.Mixed,
    default: () => ({}),
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

const NgoGraphicSchema = new Schema<INgoGraphic>(
  {
    ngoId: { type: Number, required: true, unique: true },
    totalExpenses: { type: Number, required: true, default: 0 },
    expensesByAction: [YearSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'ngo_graphics',
    toJSON: {
      transform: (_, ret) => {
        // Ensure data structure integrity and remove _id fields from nested objects
        if (Array.isArray(ret.expensesByAction)) {
          ret.expensesByAction.forEach((yearEntry) => {
            delete yearEntry._id;
            if (!Array.isArray(yearEntry.months)) {
              yearEntry.months = [];
            }
            
            yearEntry.months.forEach((monthEntry) => {
              delete monthEntry._id;
              if (!Array.isArray(monthEntry.dailyRecords)) {
                monthEntry.dailyRecords = [];
              }
              
              monthEntry.dailyRecords.forEach((dailyRecord) => {
                delete dailyRecord._id;
                
                // Handle Map type conversion
                if (dailyRecord.expensesByAction instanceof Map) {
                  dailyRecord.expensesByAction = Object.fromEntries(dailyRecord.expensesByAction);
                } else if (!dailyRecord.expensesByAction) {
                  dailyRecord.expensesByAction = {};
                }
              });
            });
          });
        }
        return ret;
      },
    },
    // Add options to properly handle Map types during toObject() calls
    toObject: {
      transform: (_, ret) => {
        if (Array.isArray(ret.expensesByAction)) {
          ret.expensesByAction.forEach(yearEntry => {
            if (yearEntry.months) {
              yearEntry.months.forEach(monthEntry => {
                if (monthEntry.dailyRecords) {
                  monthEntry.dailyRecords.forEach(dailyRecord => {
                    // Convert Map to plain object if needed
                    if (dailyRecord.expensesByAction instanceof Map) {
                      dailyRecord.expensesByAction = Object.fromEntries(dailyRecord.expensesByAction);
                    }
                  });
                }
              });
            }
          });
        }
        return ret;
      },
      virtuals: true,
      getters: true
    }
  }
);

// Adicionar um hook pre-save para garantir que a estrutura esteja completa
NgoGraphicSchema.pre('save', function(next) {
  // Garantir que o array expensesByAction exista
  if (!this.expensesByAction) {
    this.expensesByAction = [];
  }
  
  // Garantir que cada ano tenha o array months
  this.expensesByAction.forEach(yearEntry => {
    if (!yearEntry.months) {
      yearEntry.months = [];
    }
    
    // Garantir que cada mês tenha o array dailyRecords
    yearEntry.months.forEach(monthEntry => {
      if (!monthEntry.dailyRecords) {
        monthEntry.dailyRecords = [];
      }
      
      // Garantir que cada dia tenha o objeto expensesByAction
      monthEntry.dailyRecords.forEach(dailyRecord => {
        if (!dailyRecord.expensesByAction) {
          dailyRecord.expensesByAction = {};
        }
      });
    });
  });
  
  next();
});

// Definir virtual para a relação com Ngo
NgoGraphicSchema.virtual('ngo', {
  ref: 'Ngo',
  localField: 'ngoId',
  foreignField: '_id',
  justOne: true,
});

export const NgoGraphic = mongoose.model<INgoGraphic>('NgoGraphic', NgoGraphicSchema);
