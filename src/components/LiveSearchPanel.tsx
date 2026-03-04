import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { searchNigerianContent, saveThreatReport } from "@/lib/api/threats";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Globe, Save, AlertTriangle } from "lucide-react";
import type { ThreatLevel } from "@/lib/mock-data";

interface SearchResult {
  title: string;
  content: string;
  url: string;
  platform: string;
  threat_level: string;
  sentiment: number;
  hate_speech_detected: boolean;
  threat_actors: string[];
  tags: string[];
}

const levelColors: Record<string, string> = {
  critical: "bg-threat-critical/20 text-threat-critical border-threat-critical/30",
  high: "bg-threat-high/20 text-threat-high border-threat-high/30",
  medium: "bg-threat-medium/20 text-threat-medium border-threat-medium/30",
  low: "bg-threat-low/20 text-threat-low border-threat-low/30",
  info: "bg-threat-info/20 text-threat-info border-threat-info/30",
};

export function LiveSearchPanel() {
  const [query, setQuery] = useState("Nigeria social media hate speech threats");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const handleSearch = async () => {
    setIsLoading(true);
    setResults([]);
    try {
      const data = await searchNigerianContent(query);
      if (data.success) {
        setResults(data.data || []);
        toast({ title: "Search complete", description: `Found ${data.data?.length || 0} results. ${data.analyzed ? "AI analyzed." : ""}` });
      } else {
        toast({ title: "Search failed", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Search failed.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (result: SearchResult, index: number) => {
    try {
      await saveThreatReport({
        title: result.title,
        content: result.content,
        platform: result.platform,
        threat_level: result.threat_level,
        sentiment: result.sentiment,
        tags: result.tags,
        original_url: result.url,
        author_handle: result.threat_actors?.[0],
      });
      setSavedIds(prev => new Set([...prev, index]));
      toast({ title: "Saved", description: "Threat report persisted to database." });
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  return (
    <div className="glass-panel rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded bg-primary/10 text-primary">
          <Globe className="h-4 w-4" />
        </div>
        <h2 className="font-semibold text-sm uppercase tracking-wider">Live Content Search</h2>
      </div>

      <div className="flex gap-2 mb-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Nigerian social media content..."
          className="bg-secondary/50 border-border/30 text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={isLoading} size="sm" className="gap-1.5">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <AnimatePresence>
          <div className="space-y-2">
            {results.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-3 rounded-md bg-secondary/50 border border-border/30"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${levelColors[r.threat_level] || levelColors.info}`}>
                      {r.threat_level.toUpperCase()}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">{r.platform}</span>
                    {r.hate_speech_detected && (
                      <span className="text-[10px] text-threat-critical flex items-center gap-0.5">
                        <AlertTriangle className="h-3 w-3" /> Hate Speech
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleSave(r, i)}
                    disabled={savedIds.has(i)}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    {savedIds.has(i) ? "Saved" : "Save"}
                  </Button>
                </div>
                <p className="text-sm font-medium leading-tight mb-1">{r.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{r.content}</p>
                {r.tags?.length > 0 && (
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {r.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}
