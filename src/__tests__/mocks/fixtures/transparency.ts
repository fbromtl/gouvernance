import type { AutomatedDecision, Contestation } from "@/types/database";

export const mockAutomatedDecisions: AutomatedDecision[] = [
  {
    id: "ad-001",
    organization_id: "org-001",
    ai_system_id: "ais-001",
    decision_type: "scoring",
    information_channel: "email",
    explanation_method: "feature_importance",
    human_review_available: true,
    appeal_process: "Formulaire en ligne sous 30 jours",
    status: "active",
    created_by: "user-001",
    updated_by: "user-001",
    created_at: "2025-01-15T09:00:00Z",
    updated_at: "2025-01-15T09:00:00Z",
  } as AutomatedDecision,
];

export const mockContestations: Contestation[] = [
  {
    id: "cont-001",
    organization_id: "org-001",
    ai_system_id: "ais-001",
    case_number: "CONT-2025-1234",
    requester_name: "Jean Dupont",
    requester_email: "jean@example.com",
    contested_decision_description: "Refus de prêt automatisé",
    status: "received",
    received_at: "2025-05-01T09:00:00Z",
    created_by: "user-001",
    updated_by: "user-001",
    created_at: "2025-05-01T09:00:00Z",
    updated_at: "2025-05-01T09:00:00Z",
  } as Contestation,
];
