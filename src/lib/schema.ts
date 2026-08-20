import { z } from "zod";

export const ResumeAnalysisSchema = z.object({
  role: z
    .string()
    .max(100)
    .describe(
      "The job title or role being applied for. Empty string if unable to be inferred.",
    ),
  company: z
    .string()
    .max(100)
    .describe(
      "The company name from the job description. Empty string if unable to be inferred.",
    ),
  inputCheck: z.object({
    resumeUsable: z
      .boolean()
      .describe(
        "false if the resume is empty, garbled, too sparse, or not actually a resume (e.g. a handbook, manual, guide, policy doc, or article rather than one person's work history) — length alone does not make it a resume. Otherwise true.",
      ),
    jobDescriptionUsable: z
      .boolean()
      .describe(
        "false if the job description is empty, too short, or not an actual job posting (e.g. a PR description, changelog, README, docs, or article rather than a role with responsibilities and requirements) — otherwise true.",
      ),
    note: z
      .string()
      .max(400)
      .describe(
        "If either input is unusable, plain-language English text naming EVERY unusable input and what to re-upload or paste for each. At most 45 words, ending as a complete sentence. Empty string when both inputs are usable.",
      ),
  }),
  results: z.object({
    score: z
      .number()
      .min(0)
      .max(100)
      .describe(
        "Overall score (0-100) for how well the resume matches the job description.",
      ),
    strengths: z
      .array(z.string().max(400))
      .max(5)
      .describe(
        "Bullet-point strengths in English, one complete sentence of at most 30 words each, that directly match a stated requirement in the job description. Only include a strength backed by concrete resume evidence (a project, metric, or named tool). Order strongest first. No generic praise. Empty array if none.",
      ),
    suggestions: z
      .array(z.string().max(700))
      .max(5)
      .describe(
        "Bullet-point edits in English, one per item, at most 60 words each and always ending as a complete sentence, that a hiring manager would want before the next round. Prefer rewriting weak bullets into XYZ format ('Accomplished X, measured by Y, by doing Z'): quote the weak wording, then give the improved version. Focus on quantified impact and surfacing JD-relevant work. Order by impact. Empty array if none.",
      ),
    gaps: z
      .array(z.string().max(400))
      .max(5)
      .describe(
        "Bullet-point gaps in English, one complete sentence of at most 30 words each, naming a requirement explicitly stated in the job description that the resume does not demonstrate. Only real JD-stated requirements — never invented ones. Order by how central the requirement is to the role. Empty array if none.",
      ),
    missingKeywords: z
      .array(z.string().max(60))
      .max(10)
      .describe(
        "Concrete, role-relevant keywords (skills, tools, technologies, certifications) — 1-3 words each — present in the job description but missing from the resume. Keep each keyword's original spelling as written in the job description; do not translate proper tool names. Must be terms an ATS or recruiter would actually scan for in THIS role: no generic soft-skill filler, nothing unrelated to the JD. Order by relevance. Empty array if none.",
      ),
  }),
});
