import { Renderer } from "@freelensapp/extensions";

import type {
  FreightReference,
  KargoKubeObjectCRD,
  KargoKubeObjectStatus,
  PromotionPhase,
  PromotionStep,
} from "./types";

export interface PromotionSpec {
  stage?: string;
  freight?: string;
  steps?: PromotionStep[];
}

export interface PromotionStatus extends KargoKubeObjectStatus {
  phase?: PromotionPhase;
  message?: string;
  freight?: FreightReference;
  freightCollection?: {
    id?: string;
    items?: Record<string, FreightReference>;
  };
  finishedAt?: string;
}

export class Promotion extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  PromotionStatus,
  PromotionSpec
> {
  static readonly kind = "Promotion";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/kargo.akuity.io/v1alpha1/promotions";

  static readonly crd: KargoKubeObjectCRD = {
    apiVersions: ["kargo.akuity.io/v1alpha1"],
    plural: "promotions",
    singular: "promotion",
    shortNames: ["promo", "promos"],
    title: "Promotions",
  };

  static getPhase(object: Promotion): string {
    return object.status?.phase ?? "Unknown";
  }

  static getTargetStage(object: Promotion): string {
    return object.spec?.stage ?? "";
  }

  static getFreightRef(object: Promotion): string {
    return object.spec?.freight ?? "";
  }

  static getMessage(object: Promotion): string {
    return object.status?.message ?? "";
  }

  static getFinishedAt(object: Promotion): string | undefined {
    return object.status?.finishedAt;
  }

  static isTerminal(object: Promotion): boolean {
    const phase = object.status?.phase;
    return phase === "Succeeded" || phase === "Failed" || phase === "Errored" || phase === "Aborted";
  }

  static getStepsCount(object: Promotion): number {
    return object.spec?.steps?.length ?? 0;
  }
}

export class PromotionApi extends Renderer.K8sApi.KubeApi<Promotion> {}
export class PromotionStore extends Renderer.K8sApi.KubeObjectStore<Promotion> {}
