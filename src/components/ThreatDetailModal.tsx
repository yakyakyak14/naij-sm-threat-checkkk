import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { AlertTriangle, Globe, Clock, TrendingUp, ExternalLink, Shield, User, Mail, Search, Link2, Loader2 } from "lucide-react";
import { trackActor } from "@/lib/api/threats";
import type { ThreatLevel } from "@/lib/mock-data";

interface ThreatDetail {
  id: string;
  title: string;
  content: string;
  platform: string;
  source?: string;
  threatLevel: ThreatLevel;
  sentiment: number;
  timestamp: string;
  engagementScore: number;
  tags: string[];
  ai_analysis?: string;
  original_url?: string;
  author_handle?: string;
}

interface LinkedAccount {
  platform: string;
  handle: string;
  profile_url?: string;
  confidence?: number;
  match_method?: string;
  hate_speech_detected?: boolean;
  sample_content?: string;
  hate_speech_posts?: { url: string; content: string; severity: string }[];
}

interface Props {
  threat: ThreatDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const levelColors: Record<ThreatLevel, string> = {
  critical: "bg-threat-critical/20 text-threat-critical border-threat-critical/30",
  high: "bg-threat-high/20 text-threat-high border-threat-high/30",
  medium: "bg-threat-medium/20 text-threat-medium border-threat-medium/30",
  low: "bg-threat-low/20 text-threat-low border-threat-low/30",
  info: "bg-threat-info/20 text-threat-info border-threat-info/30",
};

const platformIcons: Record<string, string> = {
  twitter: "𝕏",
  facebook: "f",
  instagram: "📷",
  tiktok: "♪",
  reddit: "⊕",
  linkedin: "in",
};

const timelineData = [
  { time: "0h", value: 10 },
  { time: "1h", value: 45 },
  { time: "2h", value: 120 },
  { time: "3h", value: 340 },
  { time: "4h", value: 890 },
  { time: "5h", value: 1200 },
  { time: "6h", value: 2100 },
];

export function ThreatDetailModal({ threat, open, onOpenChange }: Props) {
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [hatePostLinks, setHatePostLinks] = useState<{ url: string; content: string; severity: string; platform: string }[]>([]);
  const [emailSearch, setEmailSearch] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackingResult, setTrackingResult] = useState<any>(null);

  useEffect(() => {
    if (open && threat?.author_handle) {
      handleTrackAuthor();
    }
    if (!open) {
      setLinkedAccounts([]);
      setHatePostLinks([]);
      setTrackingResult(null);
      setEmailSearch("");
    }
  }, [open, threat?.id]);

  const handleTrackAuthor = async (email?: string) => {
    if (!threat?.author_handle) return;
    setIsTracking(true);
    try {
      const result = await trackActor(threat.author_handle, threat.platform, email);
      if (result.success) {
        setTrackingResult(result);
        setLinkedAccounts(result.accounts || []);
        const posts: any[] = [];
        (result.hate_speech_instances || []).forEach((h: any) => {
          posts.push({ url: h.post_url || "", content: h.content, severity: h.severity, platform: h.platform });
        });
        (result.accounts || []).forEach((acc: any) => {
          (acc.hate_speech_posts || []).forEach((p: any) => {
            posts.push({ url: p.url, content: p.content, severity: p.severity, platform: acc.platform });
          });
        });
        setHatePostLinks(posts);
      }
    } catch (e) {
      console.error("Tracking failed:", e);
    } finally {
      setIsTracking(false);
    }
  };

  const handleEmailSearch = () => {
    if (emailSearch.trim()) {
      handleTrackAuthor(emailSearch.trim());
    }
  };

  if (!threat) return null;

  const sentimentLabel = threat.sentiment > 0.3 ? "Positive" : threat.sentiment < -0.3 ? "Negative" : "Neutral";
  const sentimentColor = threat.sentiment > 0.3 ? "text-threat-low" : threat.sentiment < -0.3 ? "text-threat-critical" : "text-muted-foreground";
  const maxVal = Math.max(...timelineData.map(d => d.value));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] bg-card border-border/50 p-0 overflow-hidden">
        <ScrollArea className="max-h-[85vh]">
          <div className="p-6">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className={`text-xs ${levelColors[threat.threatLevel]}`}>
                  {threat.threatLevel.toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">{threat.platform}</span>
                <span className="text-xs text-muted-foreground font-mono">{threat.timestamp}</span>
              </div>
              <DialogTitle className="text-lg leading-tight">{threat.title}</DialogTitle>
            </DialogHeader>

            <Separator className="my-4 bg-border/30" />

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { icon: Shield, label: "Severity", value: `${Math.round(Math.abs(threat.sentiment) * 10)}/10` },
                { icon: TrendingUp, label: "Engagement", value: threat.engagementScore.toLocaleString() },
                { icon: Clock, label: "Detected", value: threat.timestamp },
                { icon: Globe, label: "Sentiment", value: sentimentLabel },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-md bg-secondary/50 border border-border/30 text-center"
                >
                  <stat.icon className="h-4 w-4 mx-auto mb-1 text-primary" />
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                  <div className={`text-sm font-semibold ${stat.label === "Sentiment" ? sentimentColor : ""}`}>{stat.value}</div>
                </motion.div>
              ))}
            </div>

            {/* Content */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-2 text-muted-foreground">Content Analysis</h3>
              <div className="p-3 rounded-md bg-secondary/30 border border-border/30 text-sm text-foreground/90">
                {threat.content}
              </div>
            </div>

            {/* Original Source Link */}
            {threat.original_url && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-2 text-muted-foreground">Original Post</h3>
                <a
                  href={threat.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-md bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm text-primary truncate">{threat.original_url}</span>
                  <span className="text-xs text-muted-foreground ml-auto shrink-0">Open in new tab →</span>
                </a>
              </div>
            )}

            {/* Author Info */}
            {threat.author_handle && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-2 text-muted-foreground">Author</h3>
                <div className="flex items-center gap-2 p-3 rounded-md bg-secondary/30 border border-border/30">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm font-mono">{threat.author_handle}</span>
                  <span className="text-xs text-muted-foreground">on {threat.platform}</span>
                </div>
              </div>
            )}

            {/* Email-based Cross-Platform Search */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5 inline mr-1.5" />
                Email-Based Account Search
              </h3>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email to find linked accounts..."
                  value={emailSearch}
                  onChange={e => setEmailSearch(e.target.value)}
                  className="flex-1 bg-secondary/30 border-border/30 text-sm"
                  onKeyDown={e => e.key === "Enter" && handleEmailSearch()}
                />
                <Button
                  size="sm"
                  onClick={handleEmailSearch}
                  disabled={isTracking || !emailSearch.trim()}
                  className="shrink-0"
                >
                  {isTracking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Search across platforms using an email address to find all accounts belonging to the same user.
              </p>
            </div>

            {/* Linked Social Media Accounts */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 text-muted-foreground">
                <Link2 className="h-3.5 w-3.5 inline mr-1.5" />
                Associated Accounts
                {isTracking && <Loader2 className="h-3 w-3 inline ml-2 animate-spin" />}
              </h3>
              {linkedAccounts.length > 0 ? (
                <div className="space-y-2">
                  {linkedAccounts.map((acc, i) => (
                    <motion.div
                      key={`${acc.platform}-${acc.handle}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-3 rounded-md bg-secondary/30 border border-border/30 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary">
                          {platformIcons[acc.platform.toLowerCase()] || acc.platform[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{acc.handle}</span>
                            <span className="text-[10px] text-muted-foreground capitalize">{acc.platform}</span>
                            {acc.match_method && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 border-primary/30 text-primary">
                                {acc.match_method === "email" ? "📧 Email Match" : acc.match_method === "both" ? "📧+👤 Both" : "👤 Handle"}
                              </Badge>
                            )}
                            {acc.confidence != null && (
                              <span className="text-[10px] text-muted-foreground ml-auto">
                                {Math.round(acc.confidence * 100)}% match
                              </span>
                            )}
                          </div>
                          {acc.hate_speech_detected && (
                            <div className="flex items-center gap-1 mt-1">
                              <AlertTriangle className="h-3 w-3 text-threat-critical" />
                              <span className="text-[10px] text-threat-critical font-semibold">Hate speech detected</span>
                            </div>
                          )}
                        </div>
                        {acc.profile_url && (
                          <a
                            href={acc.profile_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded hover:bg-primary/10 transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5 text-primary" />
                          </a>
                        )}
                      </div>
                      {/* Hate speech posts with direct links */}
                      {acc.hate_speech_posts && acc.hate_speech_posts.length > 0 && (
                        <div className="mt-2 ml-11 space-y-1.5">
                          {acc.hate_speech_posts.map((post, pi) => (
                            <a
                              key={pi}
                              href={post.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start gap-2 p-2 rounded bg-threat-critical/5 border border-threat-critical/10 hover:border-threat-critical/30 transition-colors text-xs"
                            >
                              <ExternalLink className="h-3 w-3 text-threat-critical shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-foreground/80 line-clamp-2">{post.content}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className={`text-[9px] px-1 py-0 ${post.severity === "high" ? "border-threat-critical/30 text-threat-critical" : "border-threat-medium/30 text-threat-medium"}`}>
                                    {post.severity}
                                  </Badge>
                                  <span className="text-[9px] text-muted-foreground truncate">{post.url}</span>
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-md bg-secondary/20 border border-border/20 text-center text-xs text-muted-foreground">
                  {isTracking ? "Searching for associated accounts..." : "No associated accounts found yet. Enter an email above or wait for auto-tracking."}
                </div>
              )}
            </div>

            {/* Hate Speech Post Links */}
            {hatePostLinks.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 text-muted-foreground">
                  <AlertTriangle className="h-3.5 w-3.5 inline mr-1.5 text-threat-critical" />
                  Flagged Posts
                </h3>
                <div className="space-y-1.5">
                  {hatePostLinks.filter(p => p.url).map((post, i) => (
                    <a
                      key={i}
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 rounded-md bg-threat-critical/5 border border-threat-critical/10 hover:border-threat-critical/30 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-threat-critical shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground/80 line-clamp-1">{post.content}</p>
                        <span className="text-[9px] text-muted-foreground">{post.platform} • {post.severity} severity</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Engagement Timeline */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 text-muted-foreground">Engagement Timeline</h3>
              <div className="flex items-end gap-2 h-24 p-3 rounded-md bg-secondary/30 border border-border/30">
                {timelineData.map((d, i) => (
                  <motion.div
                    key={d.time}
                    className="flex-1 flex flex-col items-center gap-1"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    style={{ transformOrigin: "bottom" }}
                  >
                    <div
                      className="w-full rounded-sm bg-primary/60 hover:bg-primary transition-colors"
                      style={{ height: `${(d.value / maxVal) * 70}px` }}
                    />
                    <span className="text-[9px] text-muted-foreground font-mono">{d.time}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Source Network Map */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 text-muted-foreground">Source Network Mapping</h3>
              <div className="p-4 rounded-md bg-secondary/30 border border-border/30 relative min-h-[160px]">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-10 h-10 rounded-full bg-threat-critical/30 border-2 border-threat-critical flex items-center justify-center"
                  >
                    <AlertTriangle className="h-4 w-4 text-threat-critical" />
                  </motion.div>
                </div>
                {(linkedAccounts.length > 0 ? linkedAccounts : [{ platform: "Twitter" }, { platform: "Facebook" }, { platform: "Telegram" }, { platform: "WhatsApp" }, { platform: "Reddit" }]).map((p, i, arr) => {
                  const angle = (i / arr.length) * Math.PI * 2 - Math.PI / 2;
                  const x = 50 + Math.cos(angle) * 38;
                  const y = 50 + Math.sin(angle) * 38;
                  const name = typeof p === "string" ? p : p.platform;
                  return (
                    <motion.div
                      key={`${name}-${i}`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="absolute w-16 text-center"
                      style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
                    >
                      <div className={`w-7 h-7 mx-auto rounded-full border flex items-center justify-center mb-0.5 ${(p as LinkedAccount).hate_speech_detected ? "bg-threat-critical/20 border-threat-critical/40" : "bg-primary/20 border-primary/40"}`}>
                        <span className="text-[10px]">{platformIcons[name.toLowerCase()] || <Globe className="h-3 w-3 text-primary" />}</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground font-mono capitalize">{name}</span>
                    </motion.div>
                  );
                })}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                  {(linkedAccounts.length > 0 ? linkedAccounts : Array(5).fill(null)).map((_, i, arr) => {
                    const angle = (i / arr.length) * Math.PI * 2 - Math.PI / 2;
                    const x = 50 + Math.cos(angle) * 38;
                    const y = 50 + Math.sin(angle) * 38;
                    return <line key={i} x1="50" y1="50" x2={x} y2={y} stroke="hsl(190 100% 50% / 0.2)" strokeWidth="0.3" />;
                  })}
                </svg>
              </div>
            </div>

            {/* AI Analysis */}
            {trackingResult?.analysis && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-2 text-muted-foreground">AI Analysis</h3>
                <div className="p-3 rounded-md bg-secondary/30 border border-border/30 text-sm text-foreground/90">
                  {trackingResult.analysis}
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-2 text-muted-foreground">Tags</h3>
              <div className="flex gap-1.5 flex-wrap">
                {threat.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
