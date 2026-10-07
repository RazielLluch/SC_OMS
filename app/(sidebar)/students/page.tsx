import {StudentsTable} from "@/app/(sidebar)/students/components/students-table";
import React from "react";
import {getStudents, getAnalytics, getSemesters} from "@/lib/students-api";
import {analyticsSchema} from "@/types/enums";
import {semestersResponseSchema, type Semester} from "@/types/semesters";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  schoolYear?: string | string[];
  term?: string | string[];
}>;

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function findSelectedSemester(
  semesters: Semester[],
  schoolYear: string | undefined,
  term: string | undefined,
) {
  const schoolYearSemester = semesters.find((semester) => semester.schoolYear === schoolYear);
  const selectedTerm = schoolYearSemester?.terms.find((semesterTerm) => semesterTerm.term === term);

  if (schoolYearSemester && selectedTerm) {
    return { schoolYear: schoolYearSemester.schoolYear, term: selectedTerm.term };
  }

  const activeSemester = semesters.find((semester) =>
    semester.terms.some((semesterTerm) => semesterTerm.isActive),
  );
  const activeTerm = activeSemester?.terms.find((semesterTerm) => semesterTerm.isActive);

  return activeSemester && activeTerm
    ? { schoolYear: activeSemester.schoolYear, term: activeTerm.term }
    : undefined;
}

export default async function Page({searchParams}: {searchParams: SearchParams}){
  const params = await searchParams;
  const requestedSchoolYear = getSearchParam(params.schoolYear);
  const requestedTerm = getSearchParam(params.term);

  const [semestersRes, analyticsRes] = await Promise.allSettled([
    getSemesters(),
    getAnalytics()
  ]);

  if (semestersRes.status === "rejected") {
    throw new Error(`Failed to load semesters: ${semestersRes.reason}`);
  }
  if (analyticsRes.status === "rejected") {
    throw new Error(`Failed to load analytics: ${analyticsRes.reason}`);
  }

  const semesters = semestersResponseSchema.parse(semestersRes.value).data;
  const selectedSemester = findSelectedSemester(semesters, requestedSchoolYear, requestedTerm);
  const studentsRes = await getStudents(selectedSemester);

  const analytics = analyticsSchema.parse(analyticsRes.value.data);

  return (
    <div>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <StudentsTable
              data={studentsRes.data}
              analytics={analytics}
              semesters={semesters}
              selectedSemester={selectedSemester}
            />
          </div>
        </div>
      </div>
    </div>
  )
}