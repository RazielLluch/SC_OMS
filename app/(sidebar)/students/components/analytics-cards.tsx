import {Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {BookOpenIcon, Building2Icon, GraduationCapIcon, UsersRoundIcon} from "lucide-react";
import {Analytics} from "@/types/enums";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";

type ProgramCohort = {
  program: string;
  count: number;
};

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

export function AnalyticsCards({
                                 data,
                                 context = "all departments and programs",
                                 programCohorts,
                               }: {
  data: Analytics;
  context?: string;
  programCohorts?: ProgramCohort[];
}) {
  const cohorts = programCohorts ?? data.byYearLevel;
  const largestCohortCount = cohorts.reduce(
    (largest, cohort) => Math.max(largest, cohort.count),
    0,
  );
  const largestYearLevelCohorts = data.byYearLevel.filter(
    (cohort) => cohort.count === largestCohortCount,
  );
  const largestProgramCohorts = programCohorts?.filter(
    (cohort) => cohort.count === largestCohortCount,
  );
  const largestYearLevelLabels = largestYearLevelCohorts.map(
    (cohort) => `${cohort.yearLevel}${getOrdinalSuffix(cohort.yearLevel)}`,
  );
  const formattedYearLevelLabels = largestYearLevelLabels.length === 2
    ? `${largestYearLevelLabels[0]} & ${largestYearLevelLabels[1]} Year`
    : `${largestYearLevelLabels.join(", ")} Year`;
  const largestCohortLabels = programCohorts
    ? largestProgramCohorts?.map((cohort) => cohort.program).join(", ")
    : formattedYearLevelLabels;
  const largestCohortTitle = largestCohortCount > 0
    ? programCohorts
      ? `${largestCohortLabels ?? ""} ${largestProgramCohorts?.length === 1 ? "Program" : "Programs"}`
      : largestCohortLabels ?? ""
    : programCohorts
      ? "No program data"
      : "No year-level data";
  const largestCohortPreview = largestCohortTitle.length > 30
    ? `${largestCohortTitle.slice(0, 27).trimEnd()}...`
    : largestCohortTitle;
  const largestCohortTextSize = largestCohortTitle.length > 50
    ? "text-lg"
    : largestCohortTitle.length > 30
      ? "text-xl"
      : "text-2xl";
  const largestCohortShare = data.totalStudents > 0
    ? Math.round((largestCohortCount / data.totalStudents) * 100)
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
          <div className="text-muted-foreground">Across {context}</div>
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
          <div className="text-muted-foreground">Within the current view</div>
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
          <div className="text-muted-foreground">Represented in the current view</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Largest Cohort</CardDescription>
          <Tooltip>
            <TooltipTrigger
              render={
                <CardTitle
                  className={`${largestCohortTextSize} min-w-0 max-w-full cursor-help truncate font-semibold tabular-nums`}
                />
              }
            >
              {largestCohortPreview}
            </TooltipTrigger>
            <TooltipContent>{largestCohortTitle}</TooltipContent>
          </Tooltip>
          <CardAction>
            <GraduationCapIcon className="size-5 text-muted-foreground" />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">
            {largestCohortCount > 0
              ? `${largestCohortCount.toLocaleString()} students`
              : "Distribution is unavailable"}
          </div>
          {largestCohortCount > 0 && (
            <div className="text-muted-foreground">{largestCohortShare}% of current view</div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}