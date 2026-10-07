"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { FileUp, PlusIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { checkStudentImport, commitStudentImport, type StudentImportRow } from "@/lib/students-actions";
import { useStudentPageActivity } from "@/app/(sidebar)/students/components/student-page-activity";

type ImportResultRow = {
  rowNumber: number;
  studentNumber: string;
  status: string;
  reasons: string[];
  changedFields: string[];
  existingFullName: string | null;
  existingProgramCode: string | null;
  existingYearLevel: number | null;
};

type ImportResult = {
  totalRows: number;
  newCount: number;
  existingNoChangesCount: number;
  existingWithChangesCount: number;
  failedCount: number;
  rows: ImportResultRow[];
};

type DraftImportRow = {
  row: StudentImportRow;
  original: StudentImportRow | null;
  isAdded: boolean;
};

const reasonLabels: Record<string, string> = {
  missing_student_number: "Student number is required",
  invalid_student_number: "Invalid student number",
  missing_full_name: "Full name is required",
  missing_program_code: "Program is required",
  unknown_program_code: "Unknown program",
  missing_year_level: "Year level is required",
  invalid_year_level: "Invalid year level",
  duplicate_student_number: "Duplicate student number in this file",
  unsupported_file_format: "Unsupported file format",
  missing_required_columns: "Required columns are missing",
  already_up_to_date: "Already up to date",
  update_not_confirmed: "Update was not confirmed",
  save_conflict: "Could not save because the record changed",
};

const yearLevelOptions = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5+" },
];

function normalizeHeader(value: unknown) {
  return String(value ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
}

async function parseRows(file: File): Promise<StudentImportRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, {type: "array", cellDates: false});
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error("The file has no worksheet.");
  const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });
  return records.map((record, index) => {
    const values = Object.fromEntries(
      Object.entries(record).map(([key, value_1]) => [normalizeHeader(key), value_1]));
    return {
      row_number: index + 1,
      student_number: String(values.student_number ?? "").trim(),
      full_name: String(values.full_name ?? "").trim(),
      program_code: String(values.program_code ?? "").trim().toUpperCase(),
      year_level: Number(values.year_level),
    };
  });
}

function sameRow(left: StudentImportRow, right: StudentImportRow) {
  return left.student_number === right.student_number
    && left.full_name === right.full_name
    && left.program_code === right.program_code
    && (left.year_level === right.year_level
      || (Number.isNaN(left.year_level) && Number.isNaN(right.year_level)));
}

function resultPayload(value: unknown): ImportResult {
  const payload = (value as { data?: ImportResult })?.data ?? value;
  return payload as ImportResult;
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function resultRowClass(result: ImportResultRow | undefined) {
  if (!result) return "";
  if (result.status === "failed" || result.reasons.some((reason) => reason.startsWith("missing_") || reason.startsWith("invalid_") || reason === "unknown_program_code" || reason === "duplicate_student_number")) {
    return "bg-destructive/10 hover:bg-destructive/15";
  }
  if (result.status === "existing_with_changes") {
    return "bg-amber-500/10 hover:bg-amber-500/15";
  }
  if (result.status === "existing_no_changes" || result.reasons.includes("already_up_to_date")) {
    return "bg-emerald-500/10 hover:bg-emerald-500/15";
  }
  return "";
}

function resultBadgeVariant(result: ImportResultRow) {
  if (result.status === "failed") return "destructive" as const;
  if (result.status === "existing_with_changes") return "default" as const;
  if (result.status === "existing_no_changes" || result.reasons.includes("already_up_to_date")) return "outline" as const;
  return "secondary" as const;
}

export function StudentImport() {
  const router = useRouter();
  const { setTransactionActive } = useStudentPageActivity();
  const [rows, setRows] = React.useState<DraftImportRow[]>([]);
  const [result, setResult] = React.useState<ImportResult | null>(null);
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [updateExisting, setUpdateExisting] = React.useState(false);
  const [manualOpen, setManualOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);

  React.useEffect(() => {
    setTransactionActive(importOpen || manualOpen || loading);
  }, [importOpen, loading, manualOpen, setTransactionActive]);

  async function handleFile(file: File) {
    setMessage("");
    try {
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (!extension || !["csv", "xlsx", "xls"].includes(extension)) {
        setMessage(reasonLabels.unsupported_file_format);
        return;
      }
      const parsed = await parseRows(file);
      setRows(parsed.map((row) => ({ row, original: { ...row }, isAdded: false })));
      setResult(null);
      setMessage(`${parsed.length} row(s) ready for review.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to read this file.");
    }
  }

  async function reviewRows() {
    setLoading(true);
    setMessage("");
    try {
      setResult(resultPayload(await checkStudentImport(rows.map(({ row }) => row))));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to validate the import.");
    } finally {
      setLoading(false);
    }
  }

  async function commitRows() {
    if (!result) return;
    setLoading(true);
    setMessage("");
    try {
      await commitStudentImport(rows.map(({ row }) => row), updateExisting);
      setMessage("Students imported successfully.");
      setRows([]);
      setResult(null);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to import students.");
    } finally {
      setLoading(false);
    }
  }

  function updateRow(index: number, field: keyof StudentImportRow, value: string) {
    setRows((current) => current.map((draft, rowIndex) => {
      if (rowIndex !== index) return draft;
      const row = {
        ...draft.row,
        [field]: field === "year_level" ? Number(value) : value,
      };
      return { ...draft, row };
    }));
    setResult(null);
  }

  function addImportRow() {
    setRows((current) => [
      ...current,
      {
        row: {
          row_number: current.length + 1,
          student_number: "",
          full_name: "",
          program_code: "",
          year_level: Number.NaN,
        },
        original: null,
        isAdded: true,
      },
    ]);
    setResult(null);
  }

  function removeImportRow(index: number) {
    setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
    setResult(null);
  }

  return (
    <div className="col-span-2 grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2">
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogTrigger render={<Button variant="outline" size="sm" className="w-full sm:w-auto" />}>
          <FileUp data-icon="inline-start" />
          Import students
        </DialogTrigger>
        <DialogContent className="max-w-6xl">
          <DialogHeader className="p-4 sm:p-6">
            <DialogTitle>Import students</DialogTitle>
            <DialogDescription>
              Upload a CSV or Excel file with student_number, full_name, program_code, and year_level columns.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 overflow-y-auto px-4 py-4 sm:px-6">
            <Input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
            {message && <p className="mt-3 text-sm text-muted-foreground">{message}</p>}
            <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium">Review rows before checking or committing</p>
              <Button type="button" variant="outline" size="sm" className="self-start" onClick={addImportRow}>
                <PlusIcon data-icon="inline-start" /> Add row
              </Button>
            </div>
            {rows.length > 0 && (
              <div className="mt-4 overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-left"><th className="p-2">Row</th><th className="p-2">Student number</th><th className="p-2">Full name</th><th className="p-2">Program</th><th className="p-2">Year</th><th className="p-2">Feedback</th><th className="p-2" /></tr></thead>
                  <tbody>
                    {rows.map((draft, index) => {
                      const row = draft.row;
                      const checked = result?.rows[index];
                      const wasEdited = draft.original !== null && !sameRow(row, draft.original);
                      return (
                        <tr key={`${row.row_number}-${index}`} className={`border-b last:border-0 align-top ${resultRowClass(checked)}`}>
                          <td className="p-2">{row.row_number}</td>
                          <td className="p-2"><Input value={row.student_number} onChange={(event) => updateRow(index, "student_number", event.target.value)} aria-label={`Student number for row ${row.row_number}`} /></td>
                          <td className="p-2"><Input value={row.full_name} onChange={(event) => updateRow(index, "full_name", event.target.value)} aria-label={`Full name for row ${row.row_number}`} /></td>
                          <td className="p-2"><Input value={row.program_code} onChange={(event) => updateRow(index, "program_code", event.target.value.toUpperCase())} aria-label={`Program for row ${row.row_number}`} /></td>
                          <td className="p-2">
                            <Select
                              value={Number.isNaN(row.year_level) ? "" : String(row.year_level)}
                              onValueChange={(value) => updateRow(index, "year_level", value ?? "")}
                            >
                              <SelectTrigger aria-label={`Year level for row ${row.row_number}`}>
                                <SelectValue placeholder="Year" />
                              </SelectTrigger>
                              <SelectContent>
                                {yearLevelOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2">
                            <div className="flex flex-wrap gap-1">
                            {draft.isAdded && <Badge variant="outline">Added after upload</Badge>}
                            {wasEdited && <Badge variant="outline">Edited after upload</Badge>}
                            {checked ? (
                              <div className="flex flex-wrap gap-1">
                                <Badge variant={resultBadgeVariant(checked)}>{statusLabel(checked.status)}</Badge>
                                {checked.status === "existing_with_changes" && <span className="text-xs font-medium text-amber-700">Existing student will be updated</span>}
                                {(checked.status === "existing_no_changes" || checked.reasons.includes("already_up_to_date")) && <span className="text-xs font-medium dark:text-emerald-300">No database changes needed</span>}
                                {checked.reasons.map((reason) => <span key={reason} className="text-xs text-destructive">{reasonLabels[reason] ?? reason}</span>)}
                                {checked.changedFields.length > 0 && <span className="text-xs text-muted-foreground">Changes: {checked.changedFields.join(", ")}</span>}
                              </div>
                            ) : "N/A"}
                            </div>
                          </td>
                          <td className="p-2"><Button type="button" variant="ghost" size="sm" onClick={() => removeImportRow(index)}>Remove</Button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {(rows.some((draft) => draft.isAdded || (draft.original !== null && !sameRow(draft.row, draft.original))) || (result === null && rows.length > 0)) && (
              <p className="mt-3 text-xs text-muted-foreground">
                Rows marked “Edited after upload” or “Added after upload” were changed at the app level and will be sent to the backend exactly as shown after the next check.
              </p>
            )}
            {result && result.existingWithChangesCount > 0 && (
              <label className="mt-4 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={updateExisting} onChange={(event) => setUpdateExisting(event.target.checked)} />
                Apply changes to existing students
              </label>
            )}
          </div>
          <DialogFooter className="p-4 sm:p-6">
            <Button onClick={() => void reviewRows()} disabled={loading || rows.length === 0}>{loading ? "Checking..." : "Check import"}</Button>
            <Button
              onClick={() => void commitRows()}
              disabled={loading || !result || result.failedCount > 0 || (result.existingWithChangesCount > 0 && !updateExisting)}
            >
              {loading ? "Importing..." : "Commit students"}
            </Button>
            <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ManualStudent open={manualOpen} onOpenChange={setManualOpen} />
    </div>
  );
}

function ManualStudent({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const { setTransactionActive } = useStudentPageActivity();
  const [committing, setCommitting] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [row, setRow] = React.useState<Omit<StudentImportRow, "row_number">>({
    student_number: "",
    full_name: "",
    program_code: "",
    year_level: Number.NaN,
  });
  const [check, setCheck] = React.useState<ImportResultRow | null>(null);
  const requestId = React.useRef(0);
  const complete = row.student_number.length > 0 && row.full_name.length > 0
    && row.program_code.length > 0 && Number.isInteger(row.year_level) && row.year_level > 0;
  const checking = complete && check === null;
  const existingStudent = check?.status === "existing_no_changes" || check?.status === "existing_with_changes";

  React.useEffect(() => {
    setTransactionActive(open || committing);
  }, [committing, open, setTransactionActive]);

  React.useEffect(() => {
    if (!open || !complete) {
      return;
    }

    const currentRequest = ++requestId.current;
    const timeoutId = window.setTimeout(() => {
      void checkStudentImport([{ row_number: 1, ...row }])
        .then((value) => {
          if (currentRequest === requestId.current) setCheck(resultPayload(value).rows[0] ?? null);
        })
        .catch((error: unknown) => {
          if (currentRequest !== requestId.current) return;
          setCheck(null);
          setMessage(error instanceof Error ? error.message : "Unable to validate the student.");
        });
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
      requestId.current += 1;
    };
  }, [open, complete, row]);

  function updateField(field: keyof Omit<StudentImportRow, "row_number">, value: string) {
    setRow((current) => ({ ...current, [field]: field === "year_level" ? Number(value) : value }));
    setCheck(null);
    setMessage("");
  }

  async function commit() {
    if (!check || check.status === "failed" || checking) return;
    setCommitting(true);
    setMessage("");
    try {
      await commitStudentImport([{ row_number: 1, ...row }], false);
      setMessage("Student added successfully.");
      setRow({ student_number: "", full_name: "", program_code: "", year_level: Number.NaN });
      setCheck(null);
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to add student.");
    } finally {
      setCommitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => onOpenChange(true)}><PlusIcon data-icon="inline-start" /> Add student</Button>
      <DialogContent>
        <DialogHeader className="p-4 sm:p-6"><DialogTitle>Add student</DialogTitle><DialogDescription>Enter one student&apos;s information.</DialogDescription></DialogHeader>
        <div className="grid gap-4 overflow-y-auto px-4 py-4 sm:px-6">
          <div className="grid min-w-0 gap-2"><Label htmlFor="manual_student_number">Student number</Label><Input className="w-full" id="manual_student_number" value={row.student_number} onChange={(event) => updateField("student_number", event.target.value.trim())} placeholder="2021-0001" /></div>
          <div className="grid min-w-0 gap-2"><Label htmlFor="manual_full_name">Full name</Label><Input className="w-full" id="manual_full_name" value={row.full_name} onChange={(event) => updateField("full_name", event.target.value)} /></div>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <div className="grid min-w-0 gap-2"><Label htmlFor="manual_program_code">Program</Label><Select value={row.program_code} onValueChange={(value) => updateField("program_code", value ?? "")}><SelectTrigger className="w-full" id="manual_program_code"><SelectValue placeholder="Select program" /></SelectTrigger><SelectContent><SelectItem value="BSCS">BSCS</SelectItem><SelectItem value="BSIT">BSIT</SelectItem><SelectItem value="BSIS">BSIS</SelectItem><SelectItem value="BSCA">BSCA</SelectItem></SelectContent></Select></div>
            <div className="grid gap-2">
              <Label htmlFor="manual_year_level">Year level</Label>
              <Select
                value={Number.isNaN(row.year_level) ? "" : String(row.year_level)}
                onValueChange={(value) => updateField("year_level", value ?? "")}
              >
                <SelectTrigger className="w-full" id="manual_year_level">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearLevelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {checking && <p className="text-sm text-muted-foreground">Checking student...</p>}
          {check && <div className={`flex flex-wrap items-center gap-2 rounded-md border p-3 text-sm ${check.status === "failed" ? "border-destructive/30 bg-destructive/10" : existingStudent ? "border-amber-500/30 bg-amber-500/10" : "border-emerald-500/30 bg-emerald-500/10"}`}>
            <Badge variant={resultBadgeVariant(check)}>{statusLabel(check.status)}</Badge>
            {existingStudent
              ? <span className="font-medium text-amber-700">A student with this student number already exists. If you want to update their information, use the update workflow instead.</span>
              : check.status === "new" && <span className="font-medium text-emerald-700">Ready to add</span>}
            {check.reasons.map((reason) => <span key={reason} className={reason === "already_up_to_date" ? "font-medium text-emerald-700" : "text-destructive"}>{reasonLabels[reason] ?? reason}</span>)}
          </div>}
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
          <DialogFooter className="px-0"><Button type="button" onClick={() => void commit()} disabled={checking || committing || !check || check.status !== "new"}>{committing ? "Saving..." : "Add student"}</Button><DialogClose render={<Button type="button" variant="outline" />}>Close</DialogClose></DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
