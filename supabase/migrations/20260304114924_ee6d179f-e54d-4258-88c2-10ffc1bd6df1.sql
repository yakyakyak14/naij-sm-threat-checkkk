
-- Threat reports table
CREATE TABLE public.threat_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  platform TEXT NOT NULL,
  source TEXT,
  threat_level TEXT NOT NULL DEFAULT 'low',
  sentiment NUMERIC DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  ai_analysis TEXT,
  country TEXT DEFAULT 'Nigeria',
  original_url TEXT,
  author_handle TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Threat actors (individuals tracked across platforms)
CREATE TABLE public.threat_actors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  risk_score INTEGER DEFAULT 0,
  total_violations INTEGER DEFAULT 0,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Actor accounts on different platforms
CREATE TABLE public.actor_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.threat_actors(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  handle TEXT NOT NULL,
  profile_url TEXT,
  follower_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(platform, handle)
);

-- Link threat reports to actors
CREATE TABLE public.report_actors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.threat_reports(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES public.threat_actors(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(report_id, actor_id)
);

-- Enable RLS (public read for dashboard, no auth required for this monitoring tool)
ALTER TABLE public.threat_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_actors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actor_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_actors ENABLE ROW LEVEL SECURITY;

-- Public read policies for monitoring dashboard
CREATE POLICY "Public read threat_reports" ON public.threat_reports FOR SELECT USING (true);
CREATE POLICY "Public insert threat_reports" ON public.threat_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update threat_reports" ON public.threat_reports FOR UPDATE USING (true);

CREATE POLICY "Public read threat_actors" ON public.threat_actors FOR SELECT USING (true);
CREATE POLICY "Public insert threat_actors" ON public.threat_actors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update threat_actors" ON public.threat_actors FOR UPDATE USING (true);

CREATE POLICY "Public read actor_accounts" ON public.actor_accounts FOR SELECT USING (true);
CREATE POLICY "Public insert actor_accounts" ON public.actor_accounts FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read report_actors" ON public.report_actors FOR SELECT USING (true);
CREATE POLICY "Public insert report_actors" ON public.report_actors FOR INSERT WITH CHECK (true);

-- Enable realtime for threat_reports
ALTER PUBLICATION supabase_realtime ADD TABLE public.threat_reports;
