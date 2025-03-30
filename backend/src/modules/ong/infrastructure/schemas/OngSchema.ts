import { z } from "zod";

const SkillSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const CauseSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(), // Aceita null ou string
});

const SustainableDevelopmentGoalSchema = z.object({
  id: z.number(),
  name: z.string(),
  url_ods: z.string(),
  logo_url: z.string(),
});

const NgoSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(), // Nullable e opcional
  is_formalized: z.boolean().nullable().optional(), // Nullable e opcional
  start_year: z.number().nullable().optional(),
  contact_phone: z.string().nullable().optional(),
  instagram_link: z.string().nullable().optional(),
  x_link: z.string().nullable().optional(),
  facebook_link: z.string().nullable().optional(),
  pix_qr_code_link: z.string().nullable().optional(),
  site: z.string().nullable().optional(),
  gallery_images_url: z.array(z.string()).optional(), // Aceita array de strings ou undefined
  skills: z.array(SkillSchema).optional(), // Aceita array de skills ou undefined
  causes: z.array(CauseSchema).optional(), // Aceita array de causes ou undefined
  sustainable_development_goals: z.array(SustainableDevelopmentGoalSchema).optional(), // Aceita array de goals ou undefined
});

const createOngSchema = {
  body: NgoSchema,
  response: {
    200: NgoSchema,
  },
};

const deleteOngSchema = {
  params: z.object({
    id: z.coerce.number(), // Coerção para número
  }),
  response: {
    200: z.object({
      message: z.string(),
    }),
  },
};

const updateOngSchema = {
  body: z.object({
    name: z.string().optional(),
    description: z.string().nullable().optional(), // Nullable e opcional
    is_formalized: z.boolean().nullable().optional(),
    start_year: z.number().nullable().optional(),
    contact_phone: z.string().nullable().optional(),
    instagram_link: z.string().nullable().optional(),
    x_link: z.string().nullable().optional(),
    facebook_link: z.string().nullable().optional(),
    pix_qr_code_link: z.string().nullable().optional(),
    site: z.string().nullable().optional(),
    gallery_images_url: z.array(z.string()).optional(),
    skills: z.array(SkillSchema).optional(),
    causes: z.array(CauseSchema).optional(),
    sustainable_development_goals: z.array(SustainableDevelopmentGoalSchema).optional(),
  }),
  response: {
    200: z.object({
      message: z.string(),
      ngo: NgoSchema,
    }),
  },
};

const updateNgoGraficSchema = {
  body: z.object({
    expensesByCategory: z.record(z.number()).optional(),
  }),
  response: {
    200: z.object({
      ngoId: z.number(),
      totalExpenses: z.number(),
      expensesByCategory: z.record(z.number()),
    }),
  },
};

const ngoGraficSchema = z.object({
  id: z.string(),
  ngoId: z.number(),
  totalExpenses: z.number(),
  expensesByAction: z.array(z.any()).optional(),
  createdAt: z.union([z.string(), z.date()]).optional(), 
  updatedAt: z.union([z.string(), z.date()]).optional(), 
});

const getNgoAndGraficSchema = {
  response: {
    200: z.object({
      ngo: NgoSchema,
      ngoGrafic: ngoGraficSchema,
    }),
  },
};

const NgoResponseSchema = NgoSchema.extend({
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
});


const getNgosSchema = {
  response: {
    200: z.array(NgoResponseSchema),
  },
};

export { 
  createOngSchema, 
  deleteOngSchema, 
  updateOngSchema, 
  updateNgoGraficSchema, 
  getNgoAndGraficSchema, 
  getNgosSchema 
};
