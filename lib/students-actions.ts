"use server";

import { apiFetch } from "@/utils/api/fetch";
import { createClient } from "@/utils/supabase/server";

export type StudentImportRow = {
  row_number: number;
  student_number: string;
  full_name: string;
  program_code: string;
  year_level: number;
};

async function postStudents(endpoint: string, body: unknown) {
  const supabase = await createClient();
  const response = await apiFetch(supabase, endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  return response.json();
}

export async function checkStudentImport(rows: StudentImportRow[]) {
  return postStudents("/students/import/check", { rows });
}

export async function commitStudentImport(
  rows: StudentImportRow[],
  updateExisting: boolean,
) {
  return postStudents("/students/import/commit", { rows, updateExisting });
}

export async function createStudent(row: Omit<StudentImportRow, "row_number">) {
  return postStudents("/students", row);
}
