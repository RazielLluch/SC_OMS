import {createClient} from "@/utils/supabase/server";
import {apiFetch} from "@/utils/api/fetch";

export async function getStudents() {
  const supabase = await createClient();

  const res = await apiFetch(supabase, "/students", { cache: "no-store" });

  if (!res.ok) {
    // map Flask's 401 to a redirect if that's your convention
    throw new Error(`Failed to load students: ${res.status}`);
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