import { z } from "zod";

export const AccountType = {
  Faculty: "Faculty",
  Student: "Student",
  Organization: "Organization",
};

export const AccountTypeSchema = z.enum(
  Object.values(AccountType) as [
    string,
    ...string[]
  ]
);

export const Sex = z.enum([
  "Male",
  "Female",
]);

export const SexSchema = z.enum(
  Object.values(Sex) as [
    string,
    ...string[]
  ]
)

export const AcademicRank = z.enum([
  "Assistant Professor",
  "Associate Professor",
  "Professor",
]);

export const AcademicRankSchema = z.enum(
  Object.values(AcademicRank) as [
    string,
    ...string[]
  ]
)

export const AccountStatus = z.enum([
  "Active",
  "Inactive",
  "Suspended",
]);

export const AccountStatusSchema = z.enum(
  Object.values(AccountStatus) as [
    string,
    ...string[]
  ]
)

export const EnrollmentStatus = z.enum([
  "Active",
  "Inactive",
  "LoA",
]);

export const EnrollmentStatusSchema = z.enum(
  Object.values(EnrollmentStatus) as [
    string,
    ...string[]
  ]
)


export const Terms = z.enum([
  "FIRST",
  "SECOND",
  "SUMMER",
]);

export const TermsSchema = z.enum(
  Object.values(Terms) as [
    string,
    ...string[]
  ]
)

export const OrganizationType = z.enum([
  "Student Council",
  "Council of Organizations",
  "Other",
]);

export const OrganizationTypeSchema = z.enum(
  [
    "Student Council",
    "Council of Organizations",
    "Other",
  ]
)

export const OfficerStatus = z.enum([
  "Active",
  "Inactive",
  "LoA",
  "Resigned",
]);

export const OfficerStatusSchema = z.enum(
  Object.values(OfficerStatus) as [
    string,
    ...string[]
  ]
)

export const yearLevelAnalyticsSchema = z.object({
  yearLevel: z.number().int(),
  count: z.number().int(),
});

export const analyticsSchema = z.object({
  totalStudents: z.number(),
  totalDepartments: z.number(),
  totalPrograms: z.number(),
  byYearLevel: z.array(yearLevelAnalyticsSchema),
});

export type Analytics = z.infer<typeof analyticsSchema>;