import { Renderer } from "@freelensapp/extensions";

import type {
  FreightCreationPolicy,
  KargoKubeObjectCRD,
  KargoKubeObjectStatus,
  WarehouseSubscription,
} from "./types";

export interface WarehouseSpec {
  subscriptions?: WarehouseSubscription;
  freightCreationPolicy?: FreightCreationPolicy;
  interval?: string;
}

export interface WarehouseStatus extends KargoKubeObjectStatus {
  lastFreight?: {
    name?: string;
    id?: string;
  };
  observedGeneration?: number;
  lastHandledRefresh?: string;
}

export class Warehouse extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  WarehouseStatus,
  WarehouseSpec
> {
  static readonly kind = "Warehouse";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/kargo.akuity.io/v1alpha1/warehouses";

  static readonly crd: KargoKubeObjectCRD = {
    apiVersions: ["kargo.akuity.io/v1alpha1"],
    plural: "warehouses",
    singular: "warehouse",
    shortNames: [],
    title: "Warehouses",
  };

  static getFreightCreationPolicy(object: Warehouse): string {
    return object.spec?.freightCreationPolicy ?? "Automatic";
  }

  static getSubscriptionsSummary(object: Warehouse): string {
    const subs = object.spec?.subscriptions;
    if (!subs) return "None";
    const parts: string[] = [];
    if (subs.git?.length) parts.push(`${subs.git.length} git`);
    if (subs.images?.length) parts.push(`${subs.images.length} image`);
    if (subs.charts?.length) parts.push(`${subs.charts.length} chart`);
    return parts.join(", ") || "None";
  }

  static getLastFreightName(object: Warehouse): string {
    return object.status?.lastFreight?.name ?? "";
  }

  static getLastFreightID(object: Warehouse): string {
    return object.status?.lastFreight?.id ?? "";
  }

  static getInterval(object: Warehouse): string {
    return object.spec?.interval ?? "";
  }
}

export class WarehouseApi extends Renderer.K8sApi.KubeApi<Warehouse> {}
export class WarehouseStore extends Renderer.K8sApi.KubeObjectStore<Warehouse> {}
