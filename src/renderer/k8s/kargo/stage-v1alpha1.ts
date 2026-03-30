import { Renderer } from "@freelensapp/extensions";

import type { Condition } from "@freelensapp/kube-object";

import type {
  FreightReference,
  KargoKubeObjectCRD,
  KargoKubeObjectStatus,
  PromotionMechanism,
  PromotionStep,
  StageHealth,
  StageHealthState,
  StagePhase,
  StagePromotionInfo,
  StageSubscriptions,
  Verification,
} from "./types";

export interface StageSpec {
  subscriptions?: StageSubscriptions;
  promotionMechanisms?: PromotionMechanism;
  promotionTemplate?: {
    spec?: {
      steps?: PromotionStep[];
    };
  };
  verification?: Verification;
}

export interface StageStatus extends KargoKubeObjectStatus {
  phase?: StagePhase;
  health?: StageHealth;
  currentFreight?: FreightReference;
  freightHistory?: FreightReference[];
  conditions?: Condition[];
  currentPromotion?: StagePromotionInfo;
  lastPromotion?: StagePromotionInfo;
  observedGeneration?: number;
}

export class Stage extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  StageStatus,
  StageSpec
> {
  static readonly kind = "Stage";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/kargo.akuity.io/v1alpha1/stages";

  static readonly crd: KargoKubeObjectCRD = {
    apiVersions: ["kargo.akuity.io/v1alpha1"],
    plural: "stages",
    singular: "stage",
    shortNames: [],
    title: "Stages",
  };

  static getPhase(object: Stage): string {
    return object.status?.phase ?? "Unknown";
  }

  static getHealth(object: Stage): StageHealthState {
    return object.status?.health?.status ?? "Unknown";
  }

  static getHealthIssues(object: Stage): string[] {
    return object.status?.health?.issues ?? [];
  }

  static getCurrentFreight(object: Stage): FreightReference | undefined {
    return object.status?.currentFreight;
  }

  static getCurrentFreightName(object: Stage): string {
    return object.status?.currentFreight?.name ?? "";
  }

  static getUpstreamStages(object: Stage): string[] {
    return object.spec?.subscriptions?.upstreamStages?.map((s) => s.name) ?? [];
  }

  static getWarehouseSubscription(object: Stage): string {
    return object.spec?.subscriptions?.warehouse ?? "";
  }

  static getPromotionMechanisms(object: Stage): string {
    const mechanisms: string[] = [];
    const pm = object.spec?.promotionMechanisms;
    if (pm?.gitRepoUpdates?.length) mechanisms.push("Git");
    if (pm?.argoCDAppUpdates?.length) mechanisms.push("ArgoCD");
    const steps = object.spec?.promotionTemplate?.spec?.steps;
    if (steps?.length) mechanisms.push(`${steps.length} steps`);
    return mechanisms.join(", ") || "None";
  }

  static getVerificationStatus(object: Stage): string {
    if (object.spec?.verification?.analysisTemplates?.length) return "Configured";
    return "None";
  }

  static getCurrentPromotionName(object: Stage): string {
    return object.status?.currentPromotion?.name ?? "";
  }

  static getLastPromotionName(object: Stage): string {
    return object.status?.lastPromotion?.name ?? "";
  }

  static getProject(object: Stage): string {
    return object.getNs() ?? "";
  }
}

export class StageApi extends Renderer.K8sApi.KubeApi<Stage> {}
export class StageStore extends Renderer.K8sApi.KubeObjectStore<Stage> {}
