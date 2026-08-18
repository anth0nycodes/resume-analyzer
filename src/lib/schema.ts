import { z } from "zod";

export const resumeAnalysisSchema = z.object({
  results: z.object({
    strengths: z
      .array(z.string())
      .describe(
        "Specific, evidence-based strengths in the resume relative to the job description.",
      ),
    suggestions: z
      .array(z.string())
      .describe(
        "Concrete, actionable edits to improve alignment with the job description.",
      ),
    gaps: z
      .array(z.string())
      .describe(
        "Requirements from the job description not demonstrated in the resume.",
      ),
    missingKeywords: z
      .array(z.string())
      .describe(
        "Important keywords/skills from the job description absent from the resume.",
      ),
  }),
});
