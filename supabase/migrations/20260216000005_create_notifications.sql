-- ============================================
-- Migration: Create notifications table
-- In-app notifications with Supabase Realtime
-- ============================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN (
    'alert', 'reminder', 'approval_request', 'info', 'escalation'
  )),
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast unread count queries
CREATE INDEX idx_notifications_user_unread
  ON public.notifications(user_id, read) WHERE read = false;

CREATE INDEX idx_notifications_org
  ON public.notifications(organization_id);

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "select_own_notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

-- Users can mark their own notifications as read
CREATE POLICY "update_own_notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Authenticated users in the org can create notifications
CREATE POLICY "insert_notifications_same_org" ON public.notifications
  FOR INSERT WITH CHECK (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

-- Enable Realtime on this table for live notification updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
