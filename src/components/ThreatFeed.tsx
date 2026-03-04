import { useState, useEffect } from "react";
import { mockThreats, type ThreatLevel, type ThreatItem } from "@/lib/mock-data";
import { fetchThreatReports } from "@/lib/api/threats";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThreatDetailModal } from "@/components/ThreatDetailModal";
import { motion } from "framer-motion";
import { AlertTriangle, AlertCircle, Info, ShieldAlert, Flame, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const levelConfig: Record<ThreatLevel, { icon: typeof AlertTriangle; label: string; className: string }> = {
  critical: { icon: Flame, label: "CRITICAL", className: "bg-threat-critical/20 text-threat-critical border-threat-critical/30" },
  high: { icon: ShieldAlert, label: "HIGH", className: "bg-threat-high/20 text-threat-high border-threat-high/30" },
  medium: { icon: AlertTriangle, label: "MEDIUM", className: "bg-threat-medium/20 text-threat-medium border-threat-medium/30" },
  low: { icon: AlertCircle, label: "LOW", className: "bg-threat-low/20 text-threat-low border-threat-low/30" },
  info: { icon: Info, label: "INFO", className: "bg-threat-info/20 text-threat-info border-threat-info/30" },
};

interface DisplayThreat {
  id: string;
  title: string;
  source?: string;
  platform: string;
  content: string;
  threatLevel: ThreatLevel;
  sentiment: number;
  timestamp: string;
  engagementScore: number;
  tags: string[];
  ai_analysis?: string;
  original_url?: string;
  author_handle?: string;
  fromDb?: boolean;
}

export function ThreatFeed() {
  const [selectedThreat, setSelectedThreat] = useState<DisplayThreat | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [dbThreats, setDbThreats] = useState<DisplayThreat[]>([]);

  useEffect(() => {
    fetchThreatReports()
      .then(data => {
        if (data?.length) {
          setDbThreats(data.map((d: any) => ({
            id: d.id,
            title: d.title,
            source: d.source || d.author_handle,
            platform: d.platform,
            content: d.content,
            threatLevel: (d.threat_level || "info") as ThreatLevel,
            sentiment: d.sentiment || 0,
            timestamp: new Date(d.created_at).toLocaleString(),
            engagementScore: d.engagement_score || 0,
            tags: d.tags || [],
            ai_analysis: d.ai_analysis,
            original_url: d.original_url,
            author_handle: d.author_handle,
            fromDb: true,
          })));
        }
      })
      .catch(() => {});

    // Realtime subscription
    const channel = supabase
      .channel("threat_reports_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "threat_reports" }, (payload) => {
        const d = payload.new as any;
        setDbThreats(prev => [{
          id: d.id,
          title: d.title,
          source: d.source || d.author_handle,
          platform: d.platform,
          content: d.content,
          threatLevel: (d.threat_level || "info") as ThreatLevel,
          sentiment: d.sentiment || 0,
          timestamp: "Just now",
          engagementScore: d.engagement_score || 0,
          tags: d.tags || [],
          ai_analysis: d.ai_analysis,
          original_url: d.original_url,
          fromDb: true,
        }, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const allThreats: DisplayThreat[] = [...dbThreats, ...mockThreats];

  return (
    <>
      <div className="glass-panel rounded-lg h-full flex flex-col">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="font-semibold text-sm uppercase tracking-wider">Live Threat Feed</h2>
          <div className="flex items-center gap-3">
            {dbThreats.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-primary font-mono">
                <Database className="h-3 w-3" /> {dbThreats.length} DB
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs text-threat-critical font-mono">
              <span className="h-2 w-2 rounded-full bg-threat-critical threat-pulse" />
              LIVE
            </span>
          </div>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {allThreats.map((threat, i) => {
              const config = levelConfig[threat.threatLevel];
              const Icon = config.icon;
              return (
                <motion.div
                  key={threat.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-md bg-secondary/50 border border-border/30 hover:border-primary/20 transition-all cursor-pointer group"
                  onClick={() => { setSelectedThreat(threat); setModalOpen(true); }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded ${config.className}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${config.className}`}>
                          {config.label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-mono">{threat.platform}</span>
                        {threat.fromDb && <Badge variant="outline" className="text-[9px] px-1 py-0 text-primary border-primary/30">DB</Badge>}
                        <span className="text-[10px] text-muted-foreground font-mono ml-auto">{threat.timestamp}</span>
                      </div>
                      <p className="text-sm font-medium leading-tight mb-1 group-hover:text-primary transition-colors">
                        {threat.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{threat.content}</p>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {threat.tags.map(tag => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
      <ThreatDetailModal threat={selectedThreat} open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
