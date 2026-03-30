import type { Condition } from "@freelensapp/kube-object";

import type { PromotionPhase, StageHealthState, StagePhase } from "../k8s/kargo/types";

// --- Stage Health ---

export function getStageHealthText(health?: StageHealthState): string {
  return health || "Unknown";
}

export function getStageHealthClass(health?: StageHealthState): string {
  switch (health) {
    case "Healthy":
      return "success";
    case "Unhealthy":
      return "error";
    case "Progressing":
      return "warning";
    default:
      return "";
  }
}

// --- Stage Phase ---

export function getStagePhaseText(phase?: StagePhase): string {
  return phase || "Unknown";
}

export function getStagePhaseClass(phase?: StagePhase): string {
  switch (phase) {
    case "Steady":
      return "success";
    case "Promoting":
      return "warning";
    case "Verifying":
      return "info";
    default:
      return "";
  }
}

// --- Promotion Phase ---

export function getPromotionPhaseText(phase?: PromotionPhase): string {
  return phase || "Unknown";
}

export function getPromotionPhaseClass(phase?: PromotionPhase): string {
  switch (phase) {
    case "Succeeded":
      return "success";
    case "Failed":
    case "Errored":
    case "Aborted":
      return "error";
    case "Running":
      return "warning";
    case "Pending":
      return "info";
    default:
      return "";
  }
}

// --- Project Phase ---

export function getProjectPhaseText(phase?: string): string {
  return phase || "Unknown";
}

export function getProjectPhaseClass(phase?: string): string {
  switch (phase) {
    case "Ready":
      return "success";
    case "Error":
      return "error";
    case "Initializing":
      return "warning";
    default:
      return "";
  }
}

// --- Freight Verification ---

export function getFreightVerificationText(verifiedCount: number): string {
  return verifiedCount > 0 ? "Verified" : "Not Verified";
}

export function getFreightVerificationClass(verifiedCount: number): string {
  return verifiedCount > 0 ? "success" : "warning";
}

// --- Auto-Promotion ---

export function getAutoPromotionText(enabled: boolean): string {
  return enabled ? "Enabled" : "Disabled";
}

export function getAutoPromotionClass(enabled: boolean): string {
  return enabled ? "success" : "";
}

// --- Conditions ---

export function getConditionText(conditions?: Condition[]): string {
  if (!conditions || conditions.length === 0) return "OK";
  const errors = conditions.filter((c) => c.type === "Error" || c.status === "False");
  if (errors.length > 0) return `${errors.length} Error(s)`;
  return "OK";
}

export function getConditionClass(conditions?: Condition[]): string {
  if (!conditions || conditions.length === 0) return "success";
  const errors = conditions.filter((c) => c.type === "Error" || c.status === "False");
  if (errors.length > 0) return "error";
  return "success";
}

export function getStatusMessage(conditions?: Condition[]): string | undefined {
  if (!conditions || conditions.length === 0) return undefined;
  return conditions[0]?.message;
}
