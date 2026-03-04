import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Loader2, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export function ThreatAnalyzer() {
  const [input, setInput] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const analyze = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setAnalysis("");

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-threat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ content: input }),
      });

      if (resp.status === 429) {
        toast({ title: "Rate limited", description: "Too many requests. Please wait a moment.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast({ title: "Credits required", description: "Please add credits to continue using AI analysis.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error("Failed to analyze");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setAnalysis(fullText);
            }
          } catch { /* partial */ }
        }
      }
    } catch (e) {
      toast({ title: "Analysis failed", description: "Could not complete threat analysis.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded bg-primary/10 text-primary">
          <Brain className="h-4 w-4" />
        </div>
        <h2 className="font-semibold text-sm uppercase tracking-wider">AI Threat Analyzer</h2>
      </div>

      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste social media content, URL, or describe a narrative to analyze for threats..."
        className="bg-secondary/50 border-border/30 text-sm resize-none mb-3 min-h-[80px]"
      />

      <Button onClick={analyze} disabled={isLoading || !input.trim()} className="mb-3 gap-2">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {isLoading ? "Analyzing..." : "Analyze Threat"}
      </Button>

      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 overflow-auto rounded-md bg-secondary/30 border border-border/30 p-3"
          >
            <div className="prose prose-sm prose-invert max-w-none text-sm [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_strong]:text-foreground">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
