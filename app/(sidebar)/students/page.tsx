import {StudentsTable} from "@/app/(sidebar)/students/components/students-table";
import React from "react";
import {SectionCards} from "@/app/(sidebar)/students/components/section-cards";
import {getStudents, getAnalytics} from "@/lib/students-api";
import {analyticsSchema} from "@/types/enums";

export const dynamic = "force-dynamic";

export default async function Page(){

  const [studentsRes, analyticsRes] = await Promise.allSettled([
    getStudents(),
    getAnalytics()
  ]);

  if (studentsRes.status === "rejected") {

    throw new Error(`Failed to load students: ${studentsRes.reason}`);
  }
  if (analyticsRes.status === "rejected") {

    throw new Error(`Failed to load analytics: ${analyticsRes.reason}`);
  }

  const analytics = analyticsSchema.parse(analyticsRes.value.data);

  console.log("Students result:", studentsRes.value.data);
  console.log("Analytics result:", analytics);

  console.log("totalStudents:", analytics.totalStudents);

  return (
    <div>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards data={analytics}/>
            <StudentsTable data={studentsRes.value.data} />
          </div>
        </div>
      </div>
    </div>
  )
}