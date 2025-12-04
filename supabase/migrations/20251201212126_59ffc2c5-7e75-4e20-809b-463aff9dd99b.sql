-- Create newsletter subscriptions table
CREATE TABLE public.newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create contact form submissions table
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'new' NOT NULL,
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_status CHECK (status IN ('new', 'read', 'replied', 'archived'))
);

-- Create rate limiting table for API abuse prevention
CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1 NOT NULL,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  blocked_until TIMESTAMP WITH TIME ZONE,
  UNIQUE(identifier, endpoint, window_start)
);

-- Enable RLS on all tables
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin only access (no public read/write)
-- Newsletter subscriptions: Admin can view all, service role can insert
CREATE POLICY "Service role can insert newsletter subscriptions"
  ON public.newsletter_subscriptions
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can view newsletter subscriptions"
  ON public.newsletter_subscriptions
  FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can update newsletter subscriptions"
  ON public.newsletter_subscriptions
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- Contact submissions: Service role only
CREATE POLICY "Service role can insert contact submissions"
  ON public.contact_submissions
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can view contact submissions"
  ON public.contact_submissions
  FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can update contact submissions"
  ON public.contact_submissions
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- Rate limits: Service role only
CREATE POLICY "Service role can manage rate limits"
  ON public.rate_limits
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create indexes for performance
CREATE INDEX idx_newsletter_email ON public.newsletter_subscriptions(email);
CREATE INDEX idx_newsletter_active ON public.newsletter_subscriptions(is_active);
CREATE INDEX idx_contact_submitted_at ON public.contact_submissions(submitted_at DESC);
CREATE INDEX idx_contact_status ON public.contact_submissions(status);
CREATE INDEX idx_rate_limits_lookup ON public.rate_limits(identifier, endpoint, window_start);

-- Create function to clean up old rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE window_start < now() - interval '1 hour';
END;
$$;