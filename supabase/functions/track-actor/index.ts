import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { handle, platform, email } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Search for the user across platforms using Firecrawl
    let crossPlatformData: any[] = [];
    if (FIRECRAWL_API_KEY) {
      const platforms = ["twitter", "facebook", "instagram", "tiktok", "reddit", "linkedin"];
      
      // Search by handle
      const handleQueries = platforms.map(p =>
        fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `"${handle}" ${p} profile Nigeria`,
            limit: 3,
            scrapeOptions: { formats: ["markdown"] },
          }),
        }).then(r => r.json()).then(d => ({ platform: p, searchType: "handle", results: d.data || [] })).catch(() => ({ platform: p, searchType: "handle", results: [] }))
      );

      // Search by email if provided
      const emailQueries = email ? platforms.map(p =>
        fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `"${email}" ${p} profile account`,
            limit: 3,
            scrapeOptions: { formats: ["markdown"] },
          }),
        }).then(r => r.json()).then(d => ({ platform: p, searchType: "email", results: d.data || [] })).catch(() => ({ platform: p, searchType: "email", results: [] }))
      ) : [];

      crossPlatformData = await Promise.all([...handleQueries, ...emailQueries]);
    }

    // Use AI to analyze cross-platform presence
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a cross-platform social media investigator. Given a handle/username, optional email, and search results from various platforms, identify likely accounts belonging to the same person. Look for matching usernames, email addresses, similar bios, shared content patterns, cross-references, and posting style. When an email is provided, prioritize email-based matches. Return valid JSON only.`,
          },
          {
            role: "user",
            content: `Track this user across platforms:
Handle: ${handle}
Platform: ${platform}
${email ? `Email: ${email}` : "No email provided"}

Search results:
${JSON.stringify(crossPlatformData, null, 2)}

Return JSON:
{
  "display_name": "likely real name or primary alias",
  "email": "associated email if found or provided",
  "risk_score": 0-100,
  "accounts": [
    {
      "platform": "twitter",
      "handle": "@example",
      "profile_url": "https://...",
      "confidence": 0.95,
      "match_method": "handle" or "email" or "both",
      "hate_speech_detected": false,
      "sample_content": "...",
      "hate_speech_posts": [
        { "url": "https://direct-link-to-post", "content": "...", "severity": "high" }
      ]
    }
  ],
  "analysis": "Brief analysis of cross-platform activity",
  "hate_speech_instances": [
    { "platform": "...", "content": "...", "severity": "high", "post_url": "https://..." }
  ]
}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResp.ok) throw new Error("AI analysis failed");
    const aiData = await aiResp.json();
    const text = aiData.choices?.[0]?.message?.content || "{}";
    const result = JSON.parse(text);

    // Persist to database
    const { data: actor, error: actorErr } = await supabase
      .from("threat_actors")
      .upsert({
        display_name: result.display_name || handle,
        risk_score: result.risk_score || 0,
        total_violations: (result.hate_speech_instances || []).length,
        last_seen: new Date().toISOString(),
      }, { onConflict: "id" })
      .select()
      .single();

    if (actorErr) console.error("Actor upsert error:", actorErr);

    // Save accounts
    if (actor && result.accounts) {
      for (const acc of result.accounts) {
        const { error: accErr } = await supabase.from("actor_accounts").upsert({
          actor_id: actor.id,
          platform: acc.platform,
          handle: acc.handle,
          profile_url: acc.profile_url || null,
        }, { onConflict: "platform,handle" });
        if (accErr) console.error("Account upsert error:", accErr);
      }
    }

    return new Response(JSON.stringify({ success: true, ...result, actor_id: actor?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("track-actor error:", e);
    return new Response(JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
