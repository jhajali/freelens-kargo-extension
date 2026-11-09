import { Renderer } from "@freelensapp/extensions";

import type { KargoKubeObjectCRD, KargoKubeObjectStatus, ProjectPhase, ProjectPromotionPolicy } from "./types";

export interface ProjectSpec {
  promotionPolicies?: ProjectPromotionPolicy[];
}

export interface ProjectStatus extends KargoKubeObjectStatus {
  phase?: ProjectPhase;
  conditions?: Renderer.K8sApi.Condition[];
}

export class Project extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ProjectStatus,
  ProjectSpec
> {
  declare kind: "Project";
  declare apiVersion: "kargo.akuity.io/v1alpha1";

  static readonly kind = "Project";
  static readonly namespaced = false;
  static readonly apiBase = "/apis/kargo.akuity.io/v1alpha1/projects";

  static readonly crd: KargoKubeObjectCRD = {
    apiVersions: ["kargo.akuity.io/v1alpha1"],
    plural: "projects",
    singular: "project",
    shortNames: [],
    title: "Projects",
  };

  static getPhase(object: Project): string {
    return object.status?.phase ?? "Unknown";
  }

  static getConditions(object: Project): Renderer.K8sApi.Condition[] {
    return object.status?.conditions ?? [];
  }

  static getPromotionPoliciesCount(object: Project): number {
    return object.spec?.promotionPolicies?.length ?? 0;
  }
}

export class ProjectApi extends Renderer.K8sApi.KubeApi<Project> {}
export class ProjectStore extends Renderer.K8sApi.KubeObjectStore<Project> {}
