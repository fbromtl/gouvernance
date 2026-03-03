-- Migration: Restructure from 3 plans to 2 (Gratuit / Membre)
-- Observer → free (already exists in enum), Expert/Enterprise → removed (merged into member/pro)

-- 1. Update organizations currently on 'enterprise' to 'pro'
UPDATE organizations SET plan = 'pro' WHERE plan = 'enterprise';

-- 2. Enable ALL features for 'pro' plan (member gets everything)
UPDATE plan_features SET enabled = true WHERE plan = 'pro';

-- 3. Remove enterprise rows from plan_features (no longer needed)
DELETE FROM plan_features WHERE plan = 'enterprise';

-- 4. Add is_demo column to main tables for demo data seeding
ALTER TABLE ai_systems ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE risk_assessments ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE compliance_assessments ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE bias_findings ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE monitoring_metrics ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE monitoring_data_points ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE datasets ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE data_transfers ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE governance_policies ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE governance_roles ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE governance_committees ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE lifecycle_events ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE automated_decisions ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE contestations ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;

-- 5. Update subscriptions: map enterprise to pro
UPDATE subscriptions SET plan = 'pro' WHERE plan = 'enterprise';

-- 6. Create function to clean demo data when user upgrades
CREATE OR REPLACE FUNCTION clean_demo_data(p_org_id UUID)
RETURNS void AS $$
BEGIN
  DELETE FROM ai_systems WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM risk_assessments WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM incidents WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM compliance_assessments WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM decisions WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM bias_findings WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM vendors WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM documents WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM monitoring_metrics WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM monitoring_data_points WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM datasets WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM data_transfers WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM governance_policies WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM governance_roles WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM governance_committees WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM lifecycle_events WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM automated_decisions WHERE organization_id = p_org_id AND is_demo = true;
  DELETE FROM contestations WHERE organization_id = p_org_id AND is_demo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
