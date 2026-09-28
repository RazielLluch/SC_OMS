import {Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {BookOpenIcon, Building2Icon, GraduationCapIcon, UsersRoundIcon} from "lucide-react";
import {Analytics} from "@/types/enums";

function getOrdinalSuffix(value: number) {
  const lastTwoDigits = value % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return "th";
  }

  switch (value % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export function AnalyticsCards({data}: { data: Analytics }) {
  const largestCohort = data.byYearLevel.reduce(
    (largest, cohort) => cohort.count > largest.count ? cohort : largest,
    {yearLevel: 0, count: 0},
  );
  const largestCohortShare = data.totalStudents > 0
    ? Math.round((largestCohort.count / data.totalStudents) * 100)
    : 0;

  return (
    <div
      className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Students</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.totalStudents.toLocaleString()}
          </CardTitle>
          <CardAction>
            <UsersRoundIcon className="size-5 text-muted-foreground" />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">Current student population</div>
          <div className="text-muted-foreground">Across all departments and programs</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Departments</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.totalDepartments.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Building2Icon className="size-5 text-muted-foreground" />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">Departments with students</div>
          <div className="text-muted-foreground">Available in the student directory</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Programs</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.totalPrograms.toLocaleString()}
          </CardTitle>
          <CardAction>
            <BookOpenIcon className="size-5 text-muted-foreground" />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">Programs represented</div>
          <div className="text-muted-foreground">Academic programs in the directory</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Largest Cohort</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {largestCohort.count > 0
              ? `${largestCohort.yearLevel}${getOrdinalSuffix(largestCohort.yearLevel)} Year`
              : "No year-level data"}
          </CardTitle>
          <CardAction>
            <GraduationCapIcon className="size-5 text-muted-foreground" />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">
            {largestCohort.count > 0
              ? `${largestCohort.count.toLocaleString()} students`
              : "Distribution is unavailable"}
          </div>
          {largestCohort.count > 0 && (
            <div className="text-muted-foreground">{largestCohortShare}% of all students</div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}