import { Renderer } from "@freelensapp/extensions";

import type { AnalysisArg, AnalysisMetric, KargoKubeObjectCRD, KargoKubeObjectStatus } from "./types";

export interface AnalysisTemplateSpec {
  metrics?: AnalysisMetric[];
  args?: AnalysisArg[];
}

export interface AnalysisTemplateStatus extends KargoKubeObjectStatus {}

export class AnalysisTemplate extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  AnalysisTemplateStatus,
  AnalysisTemplateSpec
> {
  static readonly kind = "AnalysisTemplate";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/kargo.akuity.io/v1alpha1/analysistemplates";

  static readonly crd: KargoKubeObjectCRD = {
    apiVersions: ["kargo.akuity.io/v1alpha1"],
    plural: "analysistemplates",
    singular: "analysistemplate",
    shortNames: [],
    title: "Analysis Templates",
  };

  static getMetrics(object: AnalysisTemplate): AnalysisMetric[] {
    return object.spec?.metrics ?? [];
  }

  static getMetricsCount(object: AnalysisTemplate): number {
    return object.spec?.metrics?.length ?? 0;
  }

  static getArgs(object: AnalysisTemplate): AnalysisArg[] {
    return object.spec?.args ?? [];
  }

  static getArgsCount(object: AnalysisTemplate): number {
    return object.spec?.args?.length ?? 0;
  }
}

export class AnalysisTemplateApi extends Renderer.K8sApi.KubeApi<AnalysisTemplate> {}
export class AnalysisTemplateStore extends Renderer.K8sApi.KubeObjectStore<AnalysisTemplate> {}
