import { Renderer } from "@freelensapp/extensions";

import type {
  Chart,
  FreightOrigin,
  GitCommit,
  Image,
  KargoKubeObjectCRD,
  KargoKubeObjectStatus,
} from "./types";

export interface FreightSpec {
  origin?: FreightOrigin;
  commits?: GitCommit[];
  images?: Image[];
  charts?: Chart[];
}

export interface FreightStatus extends KargoKubeObjectStatus {
  verifiedIn?: Record<string, unknown>;
  approvedFor?: Record<string, unknown>;
}

export class Freight extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  FreightStatus,
  FreightSpec
> {
  static readonly kind = "Freight";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/kargo.akuity.io/v1alpha1/freight";

  static readonly crd: KargoKubeObjectCRD = {
    apiVersions: ["kargo.akuity.io/v1alpha1"],
    plural: "freight",
    singular: "freight",
    shortNames: [],
    title: "Freight",
  };

  static getOriginWarehouse(object: Freight): string {
    return object.spec?.origin?.name ?? "";
  }

  static getAlias(object: Freight): string {
    return object.metadata?.labels?.["kargo.akuity.io/alias"] ?? object.getName().substring(0, 7);
  }

  static getCommits(object: Freight): GitCommit[] {
    return object.spec?.commits ?? [];
  }

  static getImages(object: Freight): Image[] {
    return object.spec?.images ?? [];
  }

  static getCharts(object: Freight): Chart[] {
    return object.spec?.charts ?? [];
  }

  static getCommitsSummary(object: Freight): string {
    const commits = Freight.getCommits(object);
    if (commits.length === 0) return "";
    return commits.map((c) => c.id?.substring(0, 7) ?? "").join(", ");
  }

  static getImagesSummary(object: Freight): string {
    const images = Freight.getImages(object);
    if (images.length === 0) return "";
    return images.map((i) => `${i.repoURL ?? ""}:${i.tag ?? ""}`).join(", ");
  }

  static getChartsSummary(object: Freight): string {
    const charts = Freight.getCharts(object);
    if (charts.length === 0) return "";
    return charts.map((c) => `${c.name ?? ""}@${c.version ?? ""}`).join(", ");
  }

  static getVerifiedInCount(object: Freight): number {
    return Object.keys(object.status?.verifiedIn ?? {}).length;
  }

  static getApprovedForCount(object: Freight): number {
    return Object.keys(object.status?.approvedFor ?? {}).length;
  }

  static isVerifiedIn(object: Freight, stage: string): boolean {
    return stage in (object.status?.verifiedIn ?? {});
  }

  static isApprovedFor(object: Freight, stage: string): boolean {
    return stage in (object.status?.approvedFor ?? {});
  }

  static getVerifiedInStages(object: Freight): string[] {
    return Object.keys(object.status?.verifiedIn ?? {});
  }

  static getApprovedForStages(object: Freight): string[] {
    return Object.keys(object.status?.approvedFor ?? {});
  }
}

export class FreightApi extends Renderer.K8sApi.KubeApi<Freight> {}
export class FreightStore extends Renderer.K8sApi.KubeObjectStore<Freight> {}
