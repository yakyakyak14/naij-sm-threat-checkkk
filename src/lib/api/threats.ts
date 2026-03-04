import { supabase } from "@/integrations/supabase/client";

export async function fetchThreatReports() {
  const { data, error } = await supabase
    .from("threat_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

export async function saveThreatReport(report: {
  title: string;
  content: string;
  platform: string;
  source?: string;
  threat_level: string;
  sentiment?: number;
  engagement_score?: number;
  tags?: string[];
  ai_analysis?: string;
  original_url?: string;
  author_handle?: string;
}) {
  const { data, error } = await supabase.from("threat_reports").insert(report).select().single();
  if (error) throw error;
  return data;
}

export async function fetchThreatActors() {
  const { data, error } = await supabase
    .from("threat_actors")
    .select("*")
    .order("risk_score", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchActorAccounts(actorId: string) {
  const { data, error } = await supabase
    .from("actor_accounts")
    .select("*")
    .eq("actor_id", actorId);
  if (error) throw error;
  return data;
}

export async function searchNigerianContent(query?: string) {
  const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-nigerian-content`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ query, limit: 10 }),
  });
  if (!resp.ok) throw new Error("Search failed");
  return resp.json();
}

export async function trackActor(handle: string, platform: string, email?: string) {
  const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-actor`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ handle, platform, email }),
  });
  if (!resp.ok) throw new Error("Tracking failed");
  return resp.json();
}
