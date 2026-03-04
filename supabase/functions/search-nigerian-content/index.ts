import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, limit } = await req.json();
    const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ success: false, error: "Firecrawl not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const searchQuery = query || "Nigeria social media hate speech threats violence";

    const response = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: limit || 10,
        lang: "en",
        country: "ng",
        scrapeOptions: { formats: ["markdown"] },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Firecrawl error:", data);
      return new Response(JSON.stringify({ success: false, error: data.error || "Search failed" }), {
        status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Now analyze each result with AI to classify threats
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      // Return raw results without AI analysis
      return new Response(JSON.stringify({ success: true, data: data.data || [], analyzed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = data.data || [];
    const analysisPrompt = `Analyze these scraped social media/news results for threat intelligence related to Nigeria. For each item, classify threat level (critical/high/medium/low/info), detect hate speech, identify potential threat actors, and extract sentiment.

Results:
${results.map((r: any, i: number) => `[${i}] Title: ${r.title}\nURL: ${r.url}\nContent: ${(r.markdown || r.description || "").slice(0, 500)}`).join("\n\n")}

Respond in JSON format:
{
  "threats": [
    {
      "index": 0,
      "title": "...",
      "threat_level": "high",
      "content_summary": "...",
      "hate_speech_detected": true,
      "threat_actors": ["@handle1"],
      "sentiment": -0.7,
      "tags": ["hate-speech", "ethnic"],
      "platform": "Twitter"
    }
  ]
}`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a threat intelligence analyst. Return valid JSON only." },
          { role: "user", content: analysisPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    let analyzed: any[] = [];
    if (aiResp.ok) {
      const aiData = await aiResp.json();
      const text = aiData.choices?.[0]?.message?.content || "{}";
      try {
        const parsed = JSON.parse(text);
        analyzed = parsed.threats || [];
      } catch { /* use empty */ }
    }

    // Merge scraped data with AI analysis
    const merged = results.map((r: any, i: number) => {
      const analysis = analyzed.find((a: any) => a.index === i);
      return {
        title: analysis?.title || r.title || "Untitled",
        content: analysis?.content_summary || r.description || (r.markdown || "").slice(0, 300),
        url: r.url,
        platform: analysis?.platform || "Web",
        threat_level: analysis?.threat_level || "info",
        sentiment: analysis?.sentiment || 0,
        hate_speech_detected: analysis?.hate_speech_detected || false,
        threat_actors: analysis?.threat_actors || [],
        tags: analysis?.tags || [],
      };
    });

    return new Response(JSON.stringify({ success: true, data: merged, analyzed: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("search error:", e);
    return new Response(JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
