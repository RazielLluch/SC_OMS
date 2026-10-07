import {createClient} from "@/utils/supabase/server";
import {apiFetch} from "@/utils/api/fetch";

export type StudentsSemester = {
  schoolYear: string;
  term: string;
};

export async function getStudents(semester?: StudentsSemester) {
  const supabase = await createClient();

  const params = new URLSearchParams();
  if (semester?.schoolYear) {
    const [startYear, endYear] = semester.schoolYear.split("-");
    if (startYear && endYear) {
      params.set("semester_start_year", startYear);
      params.set("semester_end_year", endYear);
    }
  }
  if (semester?.term) {
    params.set("semester_term", semester.term);
  }
  const query = params.toString();
  const res = await apiFetch(supabase, `/students${query ? `?${query}` : ""}`, { cache: "no-store" });

  if (!res.ok) {
    // map Flask's 401 to a redirect if that's your convention
    throw new Error(`Failed to load students: ${res.status}`);
  }

  return await res.json();
}

export async function getSemesters() {
  const supabase = await createClient();

  const res = await apiFetch(supabase, "/students/semesters", { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to load semesters: ${res.status}`);
  }

  return await res.json();
}

export async function getAnalytics() {
  const supabase = await createClient();

  const res = await apiFetch(supabase, "/students/analytics", { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to load analytics: ${res.status}`);
  }

  return await res.json();
}