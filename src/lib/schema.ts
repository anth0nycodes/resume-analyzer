import { z } from "zod";

export const ResumeAnalysisSchema = z.object({
  results: z.object({
    strengths: z
      .array(z.string().max(240))
      .max(5)
      .describe(
        "Bullet-point strengths, one sentence each, that directly match a stated requirement in the job description. Only include a strength backed by concrete resume evidence (a project, metric, or named tool). Order strongest first. No generic praise. Empty array if none.",
      ),
    suggestions: z
      .array(z.string().max(320))
      .max(5)
      .describe(
        "Bullet-point edits, one per item, that a hiring manager would want before the next round. Prefer rewriting weak bullets into XYZ format ('Accomplished X, measured by Y, by doing Z'): quote the weak wording, then give the improved version. Focus on quantified impact and surfacing JD-relevant work. Order by impact. Empty array if none.",
      ),
    gaps: z
      .array(z.string().max(240))
      .max(5)
      .describe(
        "Bullet-point gaps, one per item, naming a requirement explicitly stated in the job description that the resume does not demonstrate. Only real JD-stated requirements — never invented ones. Order by how central the requirement is to the role. Empty array if none.",
      ),
    missingKeywords: z
      .array(z.string().max(40))
      .max(10)
      .describe(
        "Concrete, role-relevant keywords (skills, tools, technologies, certifications) — 1-3 words each — present in the job description but missing from the resume. Must be terms an ATS or recruiter would actually scan for in THIS role: no generic soft-skill filler, nothing unrelated to the JD. Order by relevance. Empty array if none.",
      ),
  }),
});
