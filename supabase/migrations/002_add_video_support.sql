-- ================================================================
-- DIGIT-EXCEL5G AI STUDIO v3.1
-- Migration: Add HyperFrames Video Generation Support
-- Run in Supabase SQL Editor AFTER 001_initial_schema.sql
-- ================================================================

-- Extend ai_jobs to support 'video' type
-- PostgreSQL CHECK constraint update
ALTER TABLE public.ai_jobs
  DROP CONSTRAINT IF EXISTS ai_jobs_job_type_check;

ALTER TABLE public.ai_jobs
  ADD CONSTRAINT ai_jobs_job_type_check
  CHECK (job_type IN ('image', 'photo', 'flyer', 'song', 'video'));

-- Add video-specific metadata columns
ALTER TABLE public.ai_jobs
  ADD COLUMN IF NOT EXISTS video_template  text,
  ADD COLUMN IF NOT EXISTS video_format    text,
  ADD COLUMN IF NOT EXISTS video_duration  integer,
  ADD COLUMN IF NOT EXISTS thumbnail_url   text;

-- Video jobs queue table (for async processing)
CREATE TABLE IF NOT EXISTS public.video_jobs (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  ai_job_id     uuid references public.ai_jobs(id) on delete set null,
  template      text not null,
  format        text not null default '1920x1080',
  duration      integer not null default 15,
  brand         text not null,
  message       text not null,
  cta           text,
  color         text default '#0F4CFF',
  music         text default 'upbeat-african',
  html_path     text,
  output_url    text,
  thumbnail_url text,
  status        text not null default 'queued'
                check (status in ('queued', 'rendering', 'completed', 'failed')),
  error_message text,
  render_time_ms integer,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_video_jobs_user ON public.video_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_video_jobs_status ON public.video_jobs(status);

CREATE TRIGGER video_jobs_updated_at
  BEFORE UPDATE ON public.video_jobs
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- RLS for video_jobs
ALTER TABLE public.video_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own video jobs"
  ON public.video_jobs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own video jobs"
  ON public.video_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all video jobs"
  ON public.video_jobs FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Update credit costs reference (informational)
COMMENT ON TABLE public.video_jobs IS
  'HyperFrames video generation jobs. Cost: 8 credits per video.';

-- ================================================================
-- DONE: Video generation support added
-- ================================================================
