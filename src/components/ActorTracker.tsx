import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trackActor } from "@/lib/api/threats";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, UserX, AlertTriangle, CheckCircle, Globe } from "lucide-react";

interface TrackedAccount {
  platform: string;
  handle: string;
  profile_url?: string;
  confidence: number;
  hate_speech_detected: boolean;
  sample_content?: string;
}

interface TrackResult {
  display_name: string;
  risk_score: number;
  accounts: TrackedAccount[];
  analysis: string;
  hate_speech_instances: { platform: string; content: string; severity: string }[];
  actor_id?: string;
}

const platformIcons: Record<string, string> = {
  twitter: "𝕏", facebook: "f", instagram: "📷", tiktok: "♪", reddit: "⊕", linkedin: "in", youtube: "▶",
};

export function ActorTracker() {
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [platform, setPlatform] = useState("twitter");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const { toast } = useToast();

  const handleTrack = async () => {
    if (!handle.trim()) return;
    setIsLoading(true);
    setResult(null);
    try {
      const data = await trackActor(handle.trim(), platform, email.trim() || undefined);
      if (data.success) {
        setResult(data);
        toast({ title: "Actor tracked", description: `Found ${data.accounts?.length || 0} accounts across platforms.` });
      } else {
        toast({ title: "Tracking failed", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Could not track actor.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const riskColor = (score: number) =>
    score >= 70 ? "text-threat-critical" : score >= 40 ? "text-threat-high" : score >= 20 ? "text-threat-medium" : "text-threat-low";

  return (
    <div className="glass-panel rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded bg-threat-high/10 text-threat-high">
          <UserX className="h-4 w-4" />
        </div>
        <h2 className="font-semibold text-sm uppercase tracking-wider">Cross-Platform Actor Tracker</h2>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex gap-2">
          <Input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="Enter username or handle..."
            className="bg-secondary/50 border-border/30 text-sm flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleTrack()}
          />
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-[130px] bg-secondary/50 border-border/30 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["twitter", "facebook", "instagram", "tiktok", "reddit", "linkedin"].map(p => (
                <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address (optional, for cross-platform matching)..."
            type="email"
            className="bg-secondary/50 border-border/30 text-sm flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleTrack()}
          />
          <Button onClick={handleTrack} disabled={isLoading || !handle.trim()} size="sm" className="gap-1.5">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Track
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 overflow-hidden"
          >
            <ScrollArea className="h-full max-h-[500px]">
              {/* Summary */}
              <div className="flex items-center justify-between mb-3 p-3 rounded-md bg-secondary/30 border border-border/30">
                <div>
                  <div className="font-semibold text-sm">{result.display_name}</div>
                  <div className="text-xs text-muted-foreground">{result.accounts?.length || 0} accounts found</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Risk Score</div>
                  <div className={`text-xl font-bold font-mono ${riskColor(result.risk_score)}`}>
                    {result.risk_score}
                  </div>
                </div>
              </div>

              {/* Accounts */}
              <div className="space-y-2 mb-4">
                {result.accounts?.map((acc, i) => (
                  <motion.div
                    key={`${acc.platform}-${acc.handle}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-2.5 rounded-md bg-secondary/50 border border-border/30 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                      {platformIcons[acc.platform] || <Globe className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{acc.handle}</span>
                        <Badge variant="outline" className="text-[9px] px-1">
                          {acc.platform}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {Math.round(acc.confidence * 100)}% match
                        </span>
                      </div>
                      {acc.sample_content && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{acc.sample_content}</p>
                      )}
                    </div>
                    {acc.hate_speech_detected ? (
                      <AlertTriangle className="h-4 w-4 text-threat-critical shrink-0" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-threat-low shrink-0" />
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Hate speech instances */}
              {result.hate_speech_instances?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-threat-critical mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" /> Hate Speech Detected
                  </h3>
                  <div className="space-y-1.5">
                    {result.hate_speech_instances.map((inst, i) => (
                      <div key={i} className="p-2 rounded bg-threat-critical/10 border border-threat-critical/20 text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[9px] bg-threat-critical/20 text-threat-critical border-threat-critical/30">
                            {inst.severity.toUpperCase()}
                          </Badge>
                          <span className="text-muted-foreground font-mono">{inst.platform}</span>
                        </div>
                        <p className="text-foreground/80">{inst.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analysis */}
              {result.analysis && (
                <div className="p-3 rounded-md bg-secondary/30 border border-border/30">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">AI Analysis</h3>
                  <p className="text-xs text-foreground/80 leading-relaxed">{result.analysis}</p>
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
