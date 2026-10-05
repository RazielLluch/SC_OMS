"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type HeaderContext,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { GripVerticalIcon, EllipsisVerticalIcon, Columns3Icon, ChevronDownIcon, ChevronsLeftIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsRightIcon, TrendingUpIcon, ArrowDownIcon, ArrowUpIcon, ArrowUpDownIcon } from "lucide-react"
import { StudentImport } from "@/app/(sidebar)/students/components/student-import"
import { AnalyticsCards } from "@/app/(sidebar)/students/components/analytics-cards"
import {
  StudentPageActivityContext,
  useStudentPageActivity,
} from "@/app/(sidebar)/students/components/student-page-activity"
import { deleteStudent } from "@/lib/students-actions"
import type { Analytics } from "@/types/enums"

// TODO: Implement Per Department (WIP) View for students table

export const schema = z.object({
  studentId: z.uuid(),
  studentNumber: z.string(),
  fullName: z.string(),
  email: z.string(),
  program: z.string().optional(),
  programCode: z.string().optional(),
  program_code: z.string().optional(),
  department: z.string().nullable().optional(),
  yearLevel: z.number()
})

type Student = z.infer<typeof schema>

function getStudentProgram(student: Partial<Student>) {
  return student.program ?? student.programCode ?? student.program_code ?? ""
}

function StudentActions({ student }: { student: Student }) {
  const router = useRouter()
  const { setTransactionActive } = useStudentPageActivity()
  const [open, setOpen] = React.useState(false)
  const [deletedOpen, setDeletedOpen] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    setTransactionActive(open || deleting || deletedOpen)
  }, [deletedOpen, deleting, open, setTransactionActive])

  async function handleDelete() {
    setDeleting(true)
    setError("")

    try {
      const result = await deleteStudent(student.studentNumber)

      if (!result.success) {
        throw new Error(result.message || "Unable to delete this student.")
      }

      setOpen(false)
      setDeletedOpen(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to delete this student.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              className="flex size-8 text-muted-foreground data-open:bg-muted"
              size="icon"
            />
          }
        >
          <EllipsisVerticalIcon />
          <span className="sr-only">Open menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Make a copy</DropdownMenuItem>
          <DropdownMenuItem>Favorite</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              setError("")
              setOpen(true)
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={(nextOpen) => !deleting && setOpen(nextOpen)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete student?</DialogTitle>
            <DialogDescription>
              This action permanently deletes the following student record:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 px-6 text-sm">
            <p><span className="font-medium">Name:</span> {student.fullName}</p>
            <p><span className="font-medium">Student number:</span> {student.studentNumber}</p>
            <p><span className="font-medium">Email:</span> {student.email}</p>
            <p><span className="font-medium">Program:</span> {getStudentProgram(student) || "—"}</p>
            <p><span className="font-medium">Year level:</span> {student.yearLevel}</p>
            {error && <p className="text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={deleting} />}>
              Cancel
            </DialogClose>
            <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deletedOpen}
        onOpenChange={(nextOpen) => {
          setDeletedOpen(nextOpen)
          if (!nextOpen) {
            router.refresh()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Student deleted</DialogTitle>
            <DialogDescription>
              {student.fullName} ({student.studentNumber}) has been deleted successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 text-sm text-muted-foreground">
            You can recover this student using the{" "}
            <span className="font-medium text-foreground">Add student</span>{" "}
            button. Their historical data will be added back.
          </div>
          <DialogFooter>
            <DialogClose render={<Button />}>Done</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function SortableColumnHeader<TData>({
  column,
  title,
}: HeaderContext<TData, unknown> & { title: string }) {
  const sorted = column.getIsSorted()

  return (
    <Button
      variant="ghost"
      className="-ml-3 h-8 px-3"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {title}
      {sorted === "asc" ? (
        <ArrowUpIcon className="ml-2 size-4" />
      ) : sorted === "desc" ? (
        <ArrowDownIcon className="ml-2 size-4" />
      ) : (
        <ArrowUpDownIcon className="ml-2 size-4 text-muted-foreground" />
      )}
    </Button>
  )
}

// Create a separate component for the drag handle
export function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  })
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}
const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.studentId} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={
            table.getIsSomePageRowsSelected() &&
            !table.getIsAllPageRowsSelected()
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "studentNumber",
    header: (context) => (
      <SortableColumnHeader {...context} title="Student Number" />
    ),
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />
    },
    enableHiding: false,
  },
  {
    accessorKey: "fullName",
    header: (context) => (
      <SortableColumnHeader {...context} title="Full Name" />
    ),
    cell: ({ row }) => (
      <div className="w-32">
        {row.original.fullName}
      </div>
    ),
  },
  {
    id: "program",
    accessorFn: (row) => getStudentProgram(row),
    header: (context) => (
      <SortableColumnHeader {...context} title="Program" />
    ),
    cell: ({ row }) => (
      <div className="w-24">
        {getStudentProgram(row.original) || "—"}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: (context) => (
      <SortableColumnHeader {...context} title="Email" />
    ),
    cell: ({ row }) => (
      <div className="w-32">
        {(row.original.email)}
      </div>
    ),
  },
  {
    accessorKey: "yearLevel",
    header: (context) => (
      <SortableColumnHeader {...context} title="Year Level" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center w-10">
        {row.original.yearLevel}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <StudentActions student={row.original} />,
  },
]

export function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.studentId,
  })
  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}
export function StudentsTable({
                            data: initialData,
                            analytics: initialAnalytics,
                          }: {
  data: z.infer<typeof schema>[]
  analytics: Analytics
}) {
  const router = useRouter()
  const [data, setData] = React.useState(() => initialData)
  const [transactionActive, setTransactionActive] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("outline")
  const [programFilter, setProgramFilter] = React.useState(() => {
    const firstProgram = initialData.find((student) => getStudentProgram(student).trim())
    return firstProgram ? getStudentProgram(firstProgram).trim() : ""
  })
  const [departmentFilter, setDepartmentFilter] = React.useState(() =>
    initialData.find((student) => student.department?.trim())?.department?.trim() ?? "",
  )
  const [yearLevelFilter, setYearLevelFilter] = React.useState("1")
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "studentNumber", desc: false },
  ])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  const programOptions = React.useMemo(
    () => [...new Set(data.map(getStudentProgram).map((program) => program.trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b)),
    [data],
  )

  React.useEffect(() => {
    if (transactionActive) return

    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") {
        router.refresh()
      }
    }
    const intervalId = window.setInterval(refreshIfVisible, 30_000)
    return () => window.clearInterval(intervalId)
  }, [router, transactionActive])

  const filteredData = React.useMemo(() => {
    if (activeTab === "per-program") {
      const value = programFilter.trim().toLowerCase()
      return value
        ? data.filter((student) => getStudentProgram(student).toLowerCase().includes(value))
        : data
    }

    if (activeTab === "per-department") {
      const value = departmentFilter.trim().toLowerCase()
      return value
        ? data.filter((student) => student.department?.toLowerCase().includes(value))
        : data
    }

    if (activeTab === "per-year") {
      const value = Number(yearLevelFilter)
      return yearLevelFilter && Number.isInteger(value)
        ? data.filter((student) => student.yearLevel === value)
        : data
    }

    return data
  }, [activeTab, data, departmentFilter, programFilter, yearLevelFilter])

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => filteredData.map(({ studentId }) => studentId),
    [filteredData]
  )
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.studentId.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })
  const viewAnalytics = React.useMemo<Analytics>(() => {
    if (activeTab === "outline") {
      return initialAnalytics
    }

    const byYearLevel = [...new Set(filteredData.map((student) => student.yearLevel))]
      .sort((a, b) => a - b)
      .map((yearLevel) => ({
        yearLevel,
        count: filteredData.filter((student) => student.yearLevel === yearLevel).length,
      }))

    return {
      totalStudents: filteredData.length,
      totalDepartments: new Set(
        filteredData.map((student) => student.department).filter(Boolean),
      ).size,
      totalPrograms: new Set(filteredData.map(getStudentProgram).filter(Boolean)).size,
      byYearLevel,
    }
  }, [activeTab, filteredData, initialAnalytics])

  const viewContext = activeTab === "per-program"
    ? programFilter.trim() || "the selected program"
    : activeTab === "per-department"
      ? departmentFilter.trim() || "the selected department"
      : activeTab === "per-year"
        ? yearLevelFilter.trim()
          ? `year ${yearLevelFilter.trim()}`
          : "the selected year level"
        : "all departments and programs"

  const programCohorts = React.useMemo(() => {
    if (activeTab !== "per-year") {
      return undefined
    }

    const counts = new Map<string, number>()
    filteredData.forEach((student) => {
      const program = getStudentProgram(student).trim()
      if (program) {
        counts.set(program, (counts.get(program) ?? 0) + 1)
      }
    })

    return Array.from(counts, ([program, count]) => ({ program, count }))
  }, [activeTab, filteredData])

  React.useEffect(() => {
    setPagination((current) => ({ ...current, pageIndex: 0 }))
  }, [activeTab, programFilter, departmentFilter, yearLevelFilter])

  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  const renderTable = () => (
    <div className="overflow-hidden rounded-lg border">
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
        id={sortableId}
      >
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="**:data-[slot=table-cell]:first:w-8">
            {table.getRowModel().rows?.length ? (
              <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                {table.getRowModel().rows.map((row) => (
                  <DraggableRow key={row.id} row={row} />
                ))}
              </SortableContext>
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No students match this filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DndContext>
    </div>
  )

  const renderPagination = () => (
    <div className="flex items-center justify-between px-4">
      <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex w-full items-center gap-8 lg:w-fit">
        <div className="hidden items-center gap-2 lg:flex">
          <Label htmlFor="rows-per-page" className="text-sm font-medium">Rows per page</Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
            items={[10, 20, 30, 40, 50].map((pageSize) => ({
              label: `${pageSize}`,
              value: `${pageSize}`,
            }))}
          >
            <SelectTrigger size="sm" className="w-20" id="rows-per-page">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectGroup>
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>{pageSize}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-fit items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
            <span className="sr-only">Go to first page</span><ChevronsLeftIcon />
          </Button>
          <Button variant="outline" className="size-8" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <span className="sr-only">Go to previous page</span><ChevronLeftIcon />
          </Button>
          <Button variant="outline" className="size-8" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <span className="sr-only">Go to next page</span><ChevronRightIcon />
          </Button>
          <Button variant="outline" className="hidden size-8 lg:flex" size="icon" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
            <span className="sr-only">Go to last page</span><ChevronsRightIcon />
          </Button>
        </div>
      </div>
    </div>
  )

  const renderFilteredContent = (tab: string, filter: React.ReactNode) => (
    <TabsContent value={tab} className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
      {filter}
      {renderTable()}
      {renderPagination()}
    </TabsContent>
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = data.findIndex(({ studentId }) => studentId === active.id)
        const newIndex = data.findIndex(({ studentId }) => studentId === over.id)
        if (oldIndex === -1 || newIndex === -1) {
          return data
        }
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }
  return (
    <StudentPageActivityContext.Provider value={{ setTransactionActive }}>
      <AnalyticsCards
        data={viewAnalytics}
        context={viewContext}
        programCohorts={programCohorts}
      />
      <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value)}
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select
          value={activeTab}
          onValueChange={(value) => value && setActiveTab(value)}
          items={[
            { label: "Outline", value: "outline" },
            { label: "Per Program", value: "per-program" },
            { label: "Per Department (WIP)", value: "per-department" },
            { label: "Per Year", value: "per-year" },
          ]}
        >
          <SelectTrigger
            className="flex w-full sm:w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="per-program">Per Program</SelectItem>
              <SelectItem value="per-department">Per Department (WIP)</SelectItem>
              <SelectItem value="per-year">Per Year</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <TabsList className="hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="outline">Outline</TabsTrigger>
          <TabsTrigger value="per-program">
            Per Program
          </TabsTrigger>
          <TabsTrigger value="per-department">
            Per Department (WIP)
          </TabsTrigger>
          <TabsTrigger value="per-year">Per Year</TabsTrigger>
        </TabsList>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="sm" className="w-full sm:w-auto" />}
            >
              <Columns3Icon data-icon="inline-start" />
              Columns
              <ChevronDownIcon data-icon="inline-end" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <StudentImport />
        </div>
      </div>
      <TabsContent value="outline" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        {renderTable()}
        {renderPagination()}
      </TabsContent>
      {renderFilteredContent("per-program",
        <div className="flex items-center gap-3">
          <Label htmlFor="program-filter">Program</Label>
          <Select
            value={programFilter}
            onValueChange={(value) => value && setProgramFilter(value)}
            items={programOptions.map((program) => ({ label: program, value: program }))}
          >
            <SelectTrigger id="program-filter" className="w-40">
              <SelectValue placeholder="Select program" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {programOptions.map((program) => (
                  <SelectItem key={program} value={program}>{program}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>,
      )}
      {renderFilteredContent("per-department",
        <div className="flex items-center gap-3">
          <Label htmlFor="department-filter">Department</Label>
          <Input id="department-filter" value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)} placeholder="Enter a department" className="max-w-sm" />
        </div>,
      )}
      {renderFilteredContent("per-year",
        <div className="flex items-center gap-3">
          <Label htmlFor="year-level-filter">Year level</Label>
          <Select
            value={yearLevelFilter}
            onValueChange={(value) => value && setYearLevelFilter(value)}
            items={[
              { label: "1", value: "1" },
              { label: "2", value: "2" },
              { label: "3", value: "3" },
              { label: "4", value: "4" },
              { label: "5+", value: "5" },
            ]}
          >
            <SelectTrigger id="year-level-filter" className="w-32">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5+</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>,
      )}
    </Tabs>
    </StudentPageActivityContext.Provider>
  )
}
const chartData = [
  {
    month: "January",
    desktop: 186,
    mobile: 80,
  },
  {
    month: "February",
    desktop: 305,
    mobile: 200,
  },
  {
    month: "March",
    desktop: 237,
    mobile: 120,
  },
  {
    month: "April",
    desktop: 73,
    mobile: 190,
  },
  {
    month: "May",
    desktop: 209,
    mobile: 130,
  },
  {
    month: "June",
    desktop: 214,
    mobile: 140,
  },
]
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig
export function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile()
  return (
    <Drawer swipeDirection={isMobile ? "down" : "right"}>
      <DrawerTrigger
        render={
          <Button
            variant="link"
            className="w-fit px-0 text-left text-foreground"
          />
        }

        className="tabular-nums"
      >
        {item.studentNumber}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.studentNumber}</DrawerTitle>
          <DrawerDescription>
            Showing total visitors for the last 6 months
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 0,
                    right: 10,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="var(--color-mobile)"
                    fillOpacity={0.6}
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator />
              <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-medium">
                  Trending up by 5.2% this month{" "}
                  <TrendingUpIcon className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Showing total visitors for the last 6 months. This is just
                  some random text to test the layout. It spans multiple lines
                  and should wrap around.
                </div>
              </div>
              <Separator />
            </>
          )}
          <form className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="header">Student Number</Label>
                <Input id="header" defaultValue={item.studentNumber} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="yearLevel">Year Level</Label>
                <Select
                  id="yearLevel"
                  defaultValue={item.yearLevel}
                  items={[
                    { label: "1", value: 1 },
                    { label: "2", value: 2 },
                    { label: "3", value: 3 },
                    { label: "4", value: 4 },
                    { label: "5+", value: 5 },
                  ]}
                >
                  <SelectTrigger id="yearLevel" className="w-full">
                    <SelectValue placeholder="Select a year level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5+">5+</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" defaultValue={item.fullName} />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="email">Type</Label>
              <Input id="email" defaultValue={item.email} />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="program">Program</Label>
              <Select
                id="program"
                defaultValue={item.program}
                items={[
                  { label: "BSCS", value: "BSCS" },
                  { label: "BSIT", value: "BSIT" },
                  { label: "BSIS", value: "BSIS" },
                  { label: "BSCA", value: "BSCA" },
                ]}
              >
                <SelectTrigger id="program" className="w-full">
                  <SelectValue placeholder="Select a program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="BSCS">BSCS</SelectItem>
                    <SelectItem value="BSIT">BSIT</SelectItem>
                    <SelectItem value="BSIS">BSIS</SelectItem>
                    <SelectItem value="BSCA">BSCA</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose render={<Button variant="outline" />}>Done</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
