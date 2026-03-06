-- Update CHECK constraints on ai_systems to match the frontend wizard values.
-- The original migration used a smaller set of values; the wizard now sends
-- more granular types (e.g. genai_text, genai_code, predictive_ml…).

-- 1. system_type — expand to include all frontend values
ALTER TABLE public.ai_systems DROP CONSTRAINT IF EXISTS ai_systems_system_type_check;
ALTER TABLE public.ai_systems ADD CONSTRAINT ai_systems_system_type_check CHECK (system_type IN (
  -- Original values
  'predictive', 'recommendation', 'classification', 'nlp', 'genai_llm',
  'computer_vision', 'biometric', 'robotic_process', 'decision_support',
  'autonomous_agent', 'other',
  -- New frontend values
  'predictive_ml', 'rules_based',
  'genai_text', 'genai_image', 'genai_code', 'genai_multimodal',
  'robotics'
));

-- 2. genai_subtype — add code_assistant and bare "other"
ALTER TABLE public.ai_systems DROP CONSTRAINT IF EXISTS ai_systems_genai_subtype_check;
ALTER TABLE public.ai_systems ADD CONSTRAINT ai_systems_genai_subtype_check CHECK (genai_subtype IN (
  'chatbot', 'content_generation', 'code_generation', 'summarization',
  'translation', 'image_generation', 'other_genai',
  -- New frontend values
  'code_assistant', 'other'
));

-- 3. system_source — add bare "vendor" (frontend uses "vendor" instead of vendor_saas/vendor_onprem)
ALTER TABLE public.ai_systems DROP CONSTRAINT IF EXISTS ai_systems_system_source_check;
ALTER TABLE public.ai_systems ADD CONSTRAINT ai_systems_system_source_check CHECK (system_source IN (
  'internal', 'vendor_saas', 'vendor_onprem', 'open_source', 'hybrid',
  -- New frontend value
  'vendor'
));
