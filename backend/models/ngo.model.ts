import mongoose, { Document, Schema } from 'mongoose';

export interface INgo extends Document {
  _id: number | null;
  name: string | null;
  description: string | null;
  is_formalized: boolean | null;
  start_year?: number | null;
  contact_phone?: string | null;
  instagram_link?: string | null;
  x_link?: string | null;
  facebook_link?: string | null;
  pix_qr_code_link?: string | null;
  site?: string | null;
  gallery_images_url?: string[] | null;
  skills?: { id: number, name: string }[] | null;
  causes?: { id: number, name: string, description: string }[] | null;
  sustainable_development_goals?: { id: number, name: string, url_ods: string, logo_url: string }[] | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

const skillSchema = new Schema({
  id: { type: Number, required: false, default: null },
  name: { type: String, required: false, default: null }
});

const causeSchema = new Schema({
  id: { type: Number, required: false, default: null },
  name: { type: String, required: false, default: null },
  description: { type: String, default: null }
});

const sustainableDevelopmentGoalSchema = new Schema({
  id: { type: Number, required: false, default: null },
  name: { type: String, required: false, default: null },
  url_ods: { type: String, required: false, default: null },
  logo_url: { type: String, required: false, default: null }
});

const NgoSchema = new Schema<INgo>(
  {
    _id: { type: Number, required: false, default: null },
    name: { type: String, required: false, default: null },
    description: { type: String, required: false, default: null },
    is_formalized: { type: Boolean, required: false, default: null },
    start_year: { type: Number, required: false, default: null },
    contact_phone: { type: String, required: false, default: null },
    instagram_link: { type: String, required: false, default: null },
    x_link: { type: String, required: false, default: null },
    facebook_link: { type: String, required: false, default: null },
    pix_qr_code_link: { type: String, required: false, default: null },
    site: { type: String, required: false, default: null },
    gallery_images_url: [{ type: String, required: false, default: null }],
    skills: { type: [skillSchema], required: false, default: null },
    causes: { type: [causeSchema], required: false, default: null },
    sustainable_development_goals: { type: [sustainableDevelopmentGoalSchema], required: false, default: null },
    createdAt: { type: Date, default: null },
    updatedAt: { type: Date, default: null }
  },
  {
    timestamps: true,
    collection: 'ngos',
    id: false
  }
);

NgoSchema.virtual('users', {
  ref: 'User',
  localField: '_id',
  foreignField: 'ngoId'
});

NgoSchema.virtual('files', {
  ref: 'OngFile',
  localField: '_id',
  foreignField: 'ngoId'
});

NgoSchema.virtual('actions', {
  ref: 'Action',
  localField: '_id',
  foreignField: 'ngoId'
});

NgoSchema.virtual('ngoGrafic', {
  ref: 'NgoGraphic',
  localField: '_id',
  foreignField: 'ngoId',
  justOne: true
});

export const Ngo = mongoose.model<INgo>('Ngo', NgoSchema);
