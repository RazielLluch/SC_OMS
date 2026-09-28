import React from "react";
import {Skeleton} from "@/components/ui/skeleton";
import {Card, CardDescription, CardFooter, CardHeader} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

export function SkeletonSectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Students</CardDescription>
          <Skeleton className="w-40 h-10"/>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <Skeleton className="w-45 h-5"/>
          <Skeleton className="w-50 h-5"/>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Departments</CardDescription>
          <Skeleton className="w-40 h-10"/>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <Skeleton className="w-45 h-5"/>
          <Skeleton className="w-50 h-5"/>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Programs</CardDescription>
          <Skeleton className="w-40 h-10"/>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <Skeleton className="w-45 h-5"/>
          <Skeleton className="w-50 h-5"/>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Largest Cohort</CardDescription>
          <Skeleton className="w-40 h-10"/>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <Skeleton className="w-45 h-5"/>
          <Skeleton className="w-50 h-5"/>
        </CardFooter>
      </Card>
    </div>
  )
}

export function SkeletonStudentsTable() {
  return (
    <div className="flex w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Skeleton className="h-8 w-24 @4xl/main:hidden" />
        <div className="hidden items-center gap-1 @4xl/main:flex">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/60">
              <TableRow>
                <TableHead className="w-10 px-2">
                  <Skeleton className="h-4 w-4 rounded-sm" />
                </TableHead>
                <TableHead className="w-10 px-2">
                  <Skeleton className="h-4 w-4 rounded-sm" />
                </TableHead>
                <TableHead className="w-45">
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead className="w-45">
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead className="w-55">
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead className="w-30">
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="px-2 py-3">
                    <Skeleton className="h-4 w-4 rounded-sm" />
                  </TableCell>
                  <TableCell className="px-2 py-3">
                    <Skeleton className="h-4 w-4 rounded-sm" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4">
          <Skeleton className="hidden h-4 w-32 lg:block" />
          <div className="ml-auto flex items-center gap-8">
            <Skeleton className="hidden h-8 w-20 lg:block" />
            <Skeleton className="h-4 w-20" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="hidden h-8 w-8 lg:block" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}