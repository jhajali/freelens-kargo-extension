import { Renderer } from "@freelensapp/extensions";

import type { KargoKubeObjectCRD, KargoKubeObjectStatus } from "./types";

export interface PromotionPolicySpec {
  stage?: string;
  enableAutoPromotion?: boolean;
}

export interface PromotionPolicyStatus extends KargoKubeObjectStatus {}

export class PromotionPolicy extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  PromotionPolicyStatus,
  PromotionPolicySpec
> {
  static readonly kind = "PromotionPolicy";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/kargo.akuity.io/v1alpha1/promotionpolicies";

  static readonly crd: KargoKubeObjectCRD = {
    apiVersions: ["kargo.akuity.io/v1alpha1"],
    plural: "promotionpolicies",
    singular: "promotionpolicy",
    shortNames: [],
    title: "Promotion Policies",
  };

  static getStage(object: PromotionPolicy): string {
    return object.spec?.stage ?? "";
  }

  static isAutoPromotionEnabled(object: PromotionPolicy): boolean {
    return object.spec?.enableAutoPromotion ?? false;
  }
}

export class PromotionPolicyApi extends Renderer.K8sApi.KubeApi<PromotionPolicy> {}
export class PromotionPolicyStore extends Renderer.K8sApi.KubeObjectStore<PromotionPolicy> {}
