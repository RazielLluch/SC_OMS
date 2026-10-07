import {z} from "zod";

export const semesterTermSchema = z.object({
  term: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean(),
});

export const semesterSchema = z.object({
  schoolYear: z.string(),
  startYear: z.number(),
  endYear: z.number(),
  terms: z.array(semesterTermSchema),
});

export const semestersResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: z.array(semesterSchema),
});

export type Semester = z.infer<typeof semesterSchema>;
export type SemesterTerm = z.infer<typeof semesterTermSchema>;
