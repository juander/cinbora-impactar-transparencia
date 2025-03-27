import { z } from "zod";

const getLogsSchema = {
  response: {
    200: z.array(
      z.object({
        ngoId: z.number(),
        userId: z.string(),
        userName: z.string(),
        action: z.string(),
        model: z.string(),
        modelId: z.string(),
        changes: z.any(),
        description: z.string(),
        timestamp: z.union([z.string(), z.date()])
      })
    ),
  },
};

const getLastLogsSchema = {
  response: {
    200: z.object({
        ngoId: z.number(),
        userId: z.string(),
        userName: z.string(),
        action: z.string(),
        model: z.string(),
        modelId: z.string(),
        changes: z.any(),
        description: z.string(),
        timestamp: z.union([z.string(), z.date()])
      })
  },
};


export { getLogsSchema, getLastLogsSchema };