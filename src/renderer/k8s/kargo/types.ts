import { Renderer } from "@freelensapp/extensions";

import type { Condition } from "@freelensapp/kube-object";

export interface KargoKubeObjectCRD extends Renderer.K8sApi.LensExtensionKubeObjectCRD {
  title: string;
}

export interface KargoKubeObjectStatus {
  conditions?: Condition[];
}

// --- Stage types ---

export type StagePhase = "NotApplicable" | "Steady" | "Promoting" | "Verifying" | "";
export type StageHealthState = "Healthy" | "Unhealthy" | "Progressing" | "Unknown" | "";

export interface StageHealth {
  status?: StageHealthState;
  issues?: string[];
}

export interface FreightReference {
  name?: string;
  warehouse?: string;
  origin?: FreightOrigin;
  commits?: GitCommit[];
  images?: Image[];
  charts?: Chart[];
}

export interface StageSubscriptions {
  warehouse?: string;
  upstreamStages?: UpstreamStageSubscription[];
}

export interface UpstreamStageSubscription {
  name: string;
}

export interface PromotionMechanism {
  gitRepoUpdates?: GitRepoUpdate[];
  argoCDAppUpdates?: ArgoCDAppUpdate[];
}

export interface GitRepoUpdate {
  repoURL: string;
  writeBranch?: string;
  pullRequest?: PullRequestPromotion;
  kustomize?: KustomizePromotion;
  helm?: HelmPromotion;
}

export interface PullRequestPromotion {
  enabled?: boolean;
}

export interface KustomizePromotion {
  images?: KustomizeImageUpdate[];
}

export interface KustomizeImageUpdate {
  image: string;
  path: string;
}

export interface HelmPromotion {
  images?: HelmImageUpdate[];
}

export interface HelmImageUpdate {
  image: string;
  key: string;
  value: string;
}

export interface ArgoCDAppUpdate {
  appName: string;
  appNamespace?: string;
  sourceUpdates?: ArgoCDSourceUpdate[];
}

export interface ArgoCDSourceUpdate {
  repoURL: string;
  chart?: string;
  updateTargetRevision?: boolean;
  kustomize?: KustomizePromotion;
  helm?: ArgoCDHelmUpdate;
}

export interface ArgoCDHelmUpdate {
  images?: HelmImageUpdate[];
}

export interface Verification {
  analysisTemplates?: AnalysisTemplateReference[];
  analysisRunMetadata?: AnalysisRunMetadata;
  args?: AnalysisRunArgument[];
}

export interface AnalysisTemplateReference {
  name: string;
}

export interface AnalysisRunMetadata {
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

export interface AnalysisRunArgument {
  name: string;
  value?: string;
}

export interface PromotionStep {
  uses: string;
  as?: string;
  config?: Record<string, unknown>;
}

export interface StagePromotionInfo {
  name?: string;
  freight?: FreightReference;
}

// --- Freight types ---

export interface FreightOrigin {
  kind?: string;
  name?: string;
}

export interface GitCommit {
  repoURL?: string;
  id?: string;
  branch?: string;
  tag?: string;
  message?: string;
  author?: string;
  committer?: string;
}

export interface Image {
  repoURL?: string;
  gitRepoURL?: string;
  tag?: string;
  digest?: string;
}

export interface Chart {
  repoURL?: string;
  name?: string;
  version?: string;
}

// --- Warehouse types ---

export type FreightCreationPolicy = "Automatic" | "Manual";

export interface WarehouseSubscription {
  git?: GitSubscription[];
  images?: ImageSubscription[];
  charts?: ChartSubscription[];
}

export interface GitSubscription {
  repoURL: string;
  branch?: string;
  commitSelectionStrategy?: string;
  allowTags?: string;
  ignoreTags?: string[];
  semverConstraint?: string;
}

export interface ImageSubscription {
  repoURL: string;
  gitRepoURL?: string;
  tagSelectionStrategy?: string;
  semverConstraint?: string;
  allowTags?: string;
  ignoreTags?: string[];
  platform?: string;
}

export interface ChartSubscription {
  repoURL: string;
  name?: string;
  semverConstraint?: string;
}

// --- Promotion types ---

export type PromotionPhase = "Pending" | "Running" | "Succeeded" | "Failed" | "Errored" | "Aborted" | "";

// --- PromotionPolicy types ---

// (simple — no additional types needed beyond spec fields)

// --- AnalysisTemplate types ---

export interface AnalysisMetric {
  name: string;
  provider?: Record<string, unknown>;
  successCondition?: string;
  failureCondition?: string;
  failureLimit?: number;
  interval?: string;
  count?: number;
}

export interface AnalysisArg {
  name: string;
  value?: string;
}

// --- Project types ---

export type ProjectPhase = "Initializing" | "Ready" | "Error" | "";

export interface ProjectPromotionPolicy {
  stage: string;
  autoPromotionEnabled?: boolean;
}
