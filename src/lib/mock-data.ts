export type ThreatLevel = "critical" | "high" | "medium" | "low" | "info";

export interface ThreatItem {
  id: string;
  title: string;
  source: string;
  platform: string;
  content: string;
  threatLevel: ThreatLevel;
  sentiment: number; // -1 to 1
  timestamp: string;
  engagementScore: number;
  tags: string[];
}

export interface SentimentData {
  time: string;
  positive: number;
  negative: number;
  neutral: number;
}

export const mockThreats: ThreatItem[] = [
  {
    id: "t1",
    title: "Coordinated bot network pushing election misinformation",
    source: "@bot_cluster_7291",
    platform: "X/Twitter",
    content: "Detected cluster of 47 accounts posting identical narratives about election fraud with AI-generated profile images. Engagement velocity suggests coordinated amplification.",
    threatLevel: "critical",
    sentiment: -0.89,
    timestamp: "2 min ago",
    engagementScore: 94200,
    tags: ["election", "bot-network", "coordinated"],
  },
  {
    id: "t2",
    title: "Deepfake video of public official circulating",
    source: "Multiple sources",
    platform: "Facebook",
    content: "Manipulated video showing fabricated statements by a government official. Over 12K shares in 3 hours. Content flagged by media verification tools.",
    threatLevel: "critical",
    sentiment: -0.92,
    timestamp: "8 min ago",
    engagementScore: 78500,
    tags: ["deepfake", "public-official", "viral"],
  },
  {
    id: "t3",
    title: "Hate speech surge targeting ethnic community",
    source: "Regional groups",
    platform: "Telegram",
    content: "Spike in hateful rhetoric detected across 12 regional Telegram channels. Language analysis indicates escalation patterns consistent with pre-violence indicators.",
    threatLevel: "high",
    sentiment: -0.78,
    timestamp: "15 min ago",
    engagementScore: 34100,
    tags: ["hate-speech", "ethnic", "escalation"],
  },
  {
    id: "t4",
    title: "Misinformation about public health policy",
    source: "@health_truth_now",
    platform: "Instagram",
    content: "False claims about government health mandates gaining traction. Linked to known disinformation network. Moderate engagement but growing.",
    threatLevel: "medium",
    sentiment: -0.45,
    timestamp: "32 min ago",
    engagementScore: 12400,
    tags: ["health", "misinformation", "policy"],
  },
  {
    id: "t5",
    title: "Positive counter-narrative campaign detected",
    source: "Civil society groups",
    platform: "Multiple",
    content: "Organic grassroots campaign promoting media literacy and fact-checking. Positive sentiment and high engagement from verified accounts.",
    threatLevel: "info",
    sentiment: 0.72,
    timestamp: "1 hr ago",
    engagementScore: 8900,
    tags: ["counter-narrative", "media-literacy", "positive"],
  },
  {
    id: "t6",
    title: "Suspicious phishing campaign via social DMs",
    source: "Automated detection",
    platform: "LinkedIn",
    content: "Mass direct message campaign impersonating government agencies. Contains links to credential-harvesting sites. 200+ reports in last hour.",
    threatLevel: "high",
    sentiment: -0.65,
    timestamp: "45 min ago",
    engagementScore: 5600,
    tags: ["phishing", "impersonation", "credential-theft"],
  },
];

export const mockSentimentData: SentimentData[] = [
  { time: "00:00", positive: 35, negative: 25, neutral: 40 },
  { time: "04:00", positive: 30, negative: 30, neutral: 40 },
  { time: "08:00", positive: 25, negative: 45, neutral: 30 },
  { time: "12:00", positive: 20, negative: 55, neutral: 25 },
  { time: "16:00", positive: 28, negative: 42, neutral: 30 },
  { time: "20:00", positive: 32, negative: 38, neutral: 30 },
  { time: "Now", positive: 22, negative: 48, neutral: 30 },
];

export const platformStats = [
  { name: "X/Twitter", threats: 127, change: +12 },
  { name: "Facebook", threats: 89, change: +8 },
  { name: "Telegram", threats: 64, change: +23 },
  { name: "Instagram", threats: 43, change: -5 },
  { name: "TikTok", threats: 31, change: +15 },
];
