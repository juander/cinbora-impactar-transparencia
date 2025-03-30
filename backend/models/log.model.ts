import mongoose, { Document, Schema } from 'mongoose';

export interface ILog extends Document {
  ngoId: number;
  userId: mongoose.Types.ObjectId;
  userName: string;
  action: string;
  modelName: string; 
  modelId: string;
  changes: any;
  description: string;
  timestamp: Date;
}

const LogSchema = new Schema<ILog>(
  {
    ngoId: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, required: true },
    userName: { type: String, required: true },
    action: { type: String, required: true },
    modelName: { type: String, required: true }, 
    modelId: { type: String, required: true },
    changes: { type: Schema.Types.Mixed, required: true },
    description: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  },
  {
    collection: 'logs'
  }
);

// Define index - update field name in index
LogSchema.index({ modelName: 1, modelId: 1, timestamp: 1 });

export const Log = mongoose.model<ILog>('Log', LogSchema);
