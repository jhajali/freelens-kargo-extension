# Freelens Kargo Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Freelens extension providing full visibility and control over Kargo resources (Projects, Stages, Freight, Warehouses, Promotions, PromotionPolicies, AnalysisTemplates) with an interactive pipeline visualization dashboard.

**Architecture:** Mirror the freelens-argocd-extension pattern — CRD-as-class with static helpers, MobX store-based data loading, CSS Modules for scoped styles, electron-vite build. Add Kargo-specific pipeline visualization (pure React+CSS+SVG) and editable Monaco editors in detail views.

**Tech Stack:** TypeScript, React 17, MobX 6, electron-vite 5, Sass (CSS Modules), @freelensapp/extensions ^1.5.3, @freelensapp/kube-object ^1.6.2, js-yaml, moment, biome, pnpm

---

## File Structure

```
src/
├── main/
│   └── index.ts                              # Main process shell
└── renderer/
    ├── index.tsx                              # Extension registration (pages, menus, details, menu items)
    ├── utils.ts                               # Utility functions (URL helpers, YAML dump, height calc)
    ├── vars.scss                              # SCSS variables
    ├── icons/
    │   └── kargo.svg                          # Kargo logo SVG
    ├── k8s/kargo/
    │   ├── types.ts                           # Shared Kargo type interfaces
    │   ├── project-v1alpha1.ts                # Project CRD class
    │   ├── stage-v1alpha1.ts                  # Stage CRD class
    │   ├── freight-v1alpha1.ts                # Freight CRD class
    │   ├── warehouse-v1alpha1.ts              # Warehouse CRD class
    │   ├── promotion-v1alpha1.ts              # Promotion CRD class
    │   ├── promotion-policy-v1alpha1.ts       # PromotionPolicy CRD class
    │   └── analysis-template-v1alpha1.ts      # AnalysisTemplate CRD class
    ├── components/
    │   ├── details/
    │   │   ├── project-details.tsx            # Project detail panel
    │   │   ├── project-details.module.scss
    │   │   ├── stage-details.tsx              # Stage detail panel
    │   │   ├── stage-details.module.scss
    │   │   ├── freight-details.tsx            # Freight detail panel
    │   │   ├── freight-details.module.scss
    │   │   ├── warehouse-details.tsx          # Warehouse detail panel
    │   │   ├── warehouse-details.module.scss
    │   │   ├── promotion-details.tsx          # Promotion detail panel
    │   │   ├── promotion-details.module.scss
    │   │   ├── promotion-policy-details.tsx   # PromotionPolicy detail panel
    │   │   ├── promotion-policy-details.module.scss
    │   │   ├── analysis-template-details.tsx  # AnalysisTemplate detail panel
    │   │   └── analysis-template-details.module.scss
    │   ├── pipeline/
    │   │   ├── pipeline-graph.tsx              # Main DAG container
    │   │   ├── pipeline-graph.module.scss
    │   │   ├── stage-node.tsx                 # Clickable Stage node
    │   │   ├── stage-node.module.scss
    │   │   ├── freight-card.tsx               # Freight card
    │   │   ├── freight-card.module.scss
    │   │   ├── promotion-overlay.tsx          # Promotion status overlay
    │   │   └── promotion-overlay.module.scss
    │   ├── kargo-events.tsx                   # Filtered event stream
    │   ├── pie-chart.tsx                      # Stage Health + Promotion Results charts
    │   ├── pie-chart.module.scss
    │   ├── duration-absolute.tsx              # Relative + absolute timestamp
    │   ├── status-conditions.ts              # Status CSS class mapping
    │   ├── error-page.tsx                     # Error boundary
    │   ├── error-page.module.scss
    │   ├── info-page.tsx                      # Loading/info display
    │   └── info-page.module.scss
    ├── menus/
    │   ├── promote-freight-menu-item.tsx       # Promote Freight action
    │   ├── refresh-warehouse-menu-item.tsx     # Refresh Warehouse action
    │   ├── approve-freight-menu-item.tsx       # Approve Freight action
    │   └── abort-promotion-menu-item.tsx       # Abort Promotion action
    └── pages/
        ├── overview.tsx                        # Dashboard (pipeline + charts + events)
        ├── overview.module.scss
        ├── projects.tsx                        # Projects list
        ├── projects.module.scss
        ├── stages.tsx                          # Stages list
        ├── stages.module.scss
        ├── freight.tsx                         # Freight list
        ├── freight.module.scss
        ├── warehouses.tsx                      # Warehouses list
        ├── warehouses.module.scss
        ├── promotions.tsx                      # Promotions list
        ├── promotions.module.scss
        ├── promotion-policies.tsx              # PromotionPolicies list
        ├── promotion-policies.module.scss
        ├── analysis-templates.tsx              # AnalysisTemplates list
        └── analysis-templates.module.scss
```

Root files: `package.json`, `tsconfig.json`, `electron.vite.config.js`, `biome.jsonc`, `Makefile`, `.gitignore`, `.github/workflows/check.yaml`, `.github/workflows/release.yaml`

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `electron.vite.config.js`
- Create: `biome.jsonc`
- Create: `Makefile`
- Create: `.gitignore`
- Create: `.github/workflows/check.yaml`
- Create: `.github/workflows/release.yaml`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@freelensapp/kargo-extension",
  "version": "0.1.0",
  "description": "Freelens extension for Kargo",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/jhajali/freelens-kargo-extension.git",
    "directory": "."
  },
  "main": "out/main/index.js",
  "renderer": "out/renderer/index.js",
  "files": [
    "out/**/*"
  ],
  "engines": {
    "node": ">= 22.16.0",
    "freelens": "^1.6.0"
  },
  "license": "MIT",
  "scripts": {
    "type:check": "tsc --noEmit -p tsconfig.json --composite false",
    "prebuild": "pnpm type:check",
    "build": "electron-vite build",
    "build:force": "electron-vite build",
    "clean": "rm -rf out",
    "pack:dev": "pnpm version prerelease --no-commit-hooks --no-git-tag-version && pnpm build:force && pnpm pack"
  },
  "devDependencies": {
    "@babel/plugin-proposal-decorators": "^7.29.0",
    "@electron-toolkit/tsconfig": "^2.0.0",
    "@freelensapp/extensions": "^1.5.3",
    "@freelensapp/kube-object": "^1.6.2",
    "@types/node": "^22.16.4",
    "@types/react": "^17.0.91",
    "@types/react-router-dom": "^5.3.3",
    "@vitejs/plugin-react": "^5.1.4",
    "electron-vite": "^5.0.0",
    "js-yaml": "^4.1.1",
    "@types/js-yaml": "^4.0.9",
    "mobx": "6.13.7",
    "mobx-react": "7.6.0",
    "moment": "^2.30.1",
    "react": "17.0.2",
    "sass": "^1.97.3",
    "typescript": "5.9.3",
    "vite": "^7.3.1",
    "vite-plugin-external": "^6.2.2",
    "vite-plugin-sass-dts": "^1.3.35"
  },
  "packageManager": "pnpm@10.29.3"
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "extends": "@electron-toolkit/tsconfig/tsconfig.node.json",
  "include": ["*.ts", "src/**/*"],
  "compilerOptions": {
    "composite": true,
    "esModuleInterop": true,
    "moduleResolution": "node10",
    "jsx": "react-jsx",
    "types": ["vite/client", "electron-vite/node"]
  }
}
```

- [ ] **Step 3: Create electron.vite.config.js**

```javascript
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import pluginExternal from "vite-plugin-external";
import sassDts from "vite-plugin-sass-dts";

export default defineConfig({
  main: {
    build: {
      lib: {
        entry: resolve(__dirname, "src/main/index.ts"),
        formats: ["cjs"],
      },
      rollupOptions: {
        output: {
          exports: "named",
          preserveModules: (process.env.VITE_PRESERVE_MODULES ?? "true") === "true",
          preserveModulesRoot: "src/main",
        },
      },
      sourcemap: true,
    },
    plugins: [
      externalizeDepsPlugin({
        include: ["@freelensapp/extensions", "mobx"],
      }),
      pluginExternal({
        externals: {
          "@freelensapp/extensions": "global.LensExtensions",
          mobx: "global.Mobx",
        },
      }),
      react({
        babel: {
          plugins: [
            ["@babel/plugin-proposal-decorators", { version: "2023-05" }],
          ],
        },
      }),
    ],
  },
  preload: {
    build: {
      lib: {
        entry: resolve(__dirname, "src/renderer/index.tsx"),
        formats: ["cjs"],
      },
      outDir: "out/renderer",
      rollupOptions: {
        output: {
          exports: "named",
          preserveModules: (process.env.VITE_PRESERVE_MODULES ?? "true") === "true",
          preserveModulesRoot: "src/renderer",
        },
      },
      sourcemap: true,
    },
    css: {
      modules: {
        localsConvention: "camelCaseOnly",
      },
    },
    plugins: [
      sassDts({
        enabledMode: ["development", "production"],
      }),
      react({
        babel: {
          plugins: [
            ["@babel/plugin-proposal-decorators", { version: "2023-05" }],
          ],
        },
      }),
      externalizeDepsPlugin({
        include: [
          "@freelensapp/extensions",
          "electron",
          "mobx",
          "mobx-react",
          "react",
          "react-dom",
          "react-router-dom",
        ],
        exclude: [],
      }),
      pluginExternal({
        externals: {
          "@freelensapp/extensions": "global.LensExtensions",
          mobx: "global.Mobx",
          "mobx-react": "global.MobxReact",
          react: "global.React",
          "react-dom": "global.ReactDom",
          "react-router-dom": "global.ReactRouterDom",
          "react/jsx-runtime": "global.ReactJsxRuntime",
        },
      }),
    ],
  },
});
```

- [ ] **Step 4: Create biome.jsonc**

```jsonc
{
  "$schema": "https://biomejs.dev/schemas/2.3.14/schema.json",
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 120
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "semicolons": "always",
      "trailingCommas": "all"
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": false,
      "complexity": {
        "noUselessThisAlias": "error",
        "noUselessTypeConstraint": "error"
      },
      "correctness": {
        "noInvalidUseBeforeDeclaration": "error"
      },
      "style": {
        "noNamespace": "error",
        "useAsConstAssertion": "error"
      },
      "suspicious": {
        "noExtraNonNullAssertion": "error",
        "noMisleadingInstantiator": "error",
        "useNamespaceKeyword": "error"
      }
    }
  },
  "vcs": {
    "clientKind": "git",
    "enabled": true,
    "useIgnoreFile": true
  }
}
```

- [ ] **Step 5: Create Makefile**

```makefile
.PHONY: install build build-force clean pack type-check lint help

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	pnpm install

build: ## Build with type checking
	pnpm build

build-force: ## Build without type checking
	pnpm build:force

type-check: ## Run TypeScript type checker
	pnpm type:check

clean: ## Remove build output
	rm -rf out
	rm -f *.tgz

pack: build ## Build and pack into .tgz
	pnpm pack

lint: ## Run linter
	pnpm type:check
```

- [ ] **Step 6: Create .gitignore**

```
node_modules
out
*.tgz
.env
```

- [ ] **Step 7: Create .github/workflows/check.yaml**

```yaml
name: Check

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: pnpm type:check

      - run: pnpm build
```

- [ ] **Step 8: Create .github/workflows/release.yaml**

```yaml
name: Release

on:
  push:
    tags:
      - "v*"

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: pnpm build

      - run: pnpm pack

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: "*.tgz"
          generate_release_notes: true
```

- [ ] **Step 9: Install dependencies**

Run: `pnpm install`
Expected: Successful dependency installation, `node_modules` created and `pnpm-lock.yaml` generated.

- [ ] **Step 10: Commit**

```bash
git add package.json tsconfig.json electron.vite.config.js biome.jsonc Makefile .gitignore .github/workflows/check.yaml .github/workflows/release.yaml pnpm-lock.yaml
git commit -m "feat: add project scaffolding and build configuration"
```

---

### Task 2: Main Entry Point & Base Utilities

**Files:**
- Create: `src/main/index.ts`
- Create: `src/renderer/utils.ts`
- Create: `src/renderer/vars.scss`
- Create: `src/renderer/icons/kargo.svg`

- [ ] **Step 1: Create src/main/index.ts**

```typescript
import { Main } from "@freelensapp/extensions";

export default class KargoExtensionMain extends Main.LensExtension {}
```

- [ ] **Step 2: Create src/renderer/utils.ts**

```typescript
import { Renderer } from "@freelensapp/extensions";

import type { DumpOptions } from "js-yaml";

const {
  Navigation: { getDetailsUrl },
} = Renderer;

export function getMaybeDetailsUrl(url?: string): string {
  if (url) {
    return getDetailsUrl(url);
  } else {
    return "";
  }
}

export function getHeight(data?: string): number {
  const lineHeight = 18;
  if (!data) return lineHeight;

  const lines = data.split("\n").length;
  if (lines < 5) return 5 * lineHeight;
  if (lines > 20) return 20 * lineHeight;
  return lines * lineHeight;
}

export const defaultYamlDumpOptions: DumpOptions = {
  noArrayIndent: true,
  noCompatMode: true,
  noRefs: true,
  quotingType: '"',
  sortKeys: true,
};

export function createEnumFromKeys<T extends Record<string, any>>(obj: T): Record<keyof T, keyof T> {
  return Object.keys(obj).reduce(
    (acc, key) => {
      acc[key as keyof T] = key as keyof T;
      return acc;
    },
    {} as Record<keyof T, keyof T>,
  );
}
```

- [ ] **Step 3: Create src/renderer/vars.scss**

```scss
// Dimensions
$unit: 8px;
$padding: $unit;
$margin: $unit;
$gap: $padding;
```

- [ ] **Step 4: Create src/renderer/icons/kargo.svg**

Create a Kargo logo SVG. Use a simple freight/shipping-themed icon:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
  <path d="M2 17l10 5 10-5"/>
  <path d="M2 12l10 5 10-5"/>
</svg>
```

- [ ] **Step 5: Commit**

```bash
git add src/main/index.ts src/renderer/utils.ts src/renderer/vars.scss src/renderer/icons/kargo.svg
git commit -m "feat: add main entry point, utilities, and Kargo icon"
```

---

### Task 3: Shared Kargo Type Interfaces

**Files:**
- Create: `src/renderer/k8s/kargo/types.ts`

- [ ] **Step 1: Create src/renderer/k8s/kargo/types.ts**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/k8s/kargo/types.ts
git commit -m "feat: add shared Kargo type interfaces"
```

---

### Task 4: Project CRD Class

**Files:**
- Create: `src/renderer/k8s/kargo/project-v1alpha1.ts`

- [ ] **Step 1: Create src/renderer/k8s/kargo/project-v1alpha1.ts**

```typescript
import { Renderer } from "@freelensapp/extensions";

import type { Condition } from "@freelensapp/kube-object";

import type { KargoKubeObjectCRD, KargoKubeObjectStatus, ProjectPhase, ProjectPromotionPolicy } from "./types";

export interface ProjectSpec {
  promotionPolicies?: ProjectPromotionPolicy[];
}

export interface ProjectStatus extends KargoKubeObjectStatus {
  phase?: ProjectPhase;
  conditions?: Condition[];
}

export class Project extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ProjectStatus,
  ProjectSpec
> {
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

  static getConditions(object: Project): Condition[] {
    return object.status?.conditions ?? [];
  }

  static getPromotionPoliciesCount(object: Project): number {
    return object.spec?.promotionPolicies?.length ?? 0;
  }
}

export class ProjectApi extends Renderer.K8sApi.KubeApi<Project> {}
export class ProjectStore extends Renderer.K8sApi.KubeObjectStore<Project> {}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/k8s/kargo/project-v1alpha1.ts
git commit -m "feat: add Project CRD class"
```

---

### Task 5: Stage CRD Class

**Files:**
- Create: `src/renderer/k8s/kargo/stage-v1alpha1.ts`

- [ ] **Step 1: Create src/renderer/k8s/kargo/stage-v1alpha1.ts**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/k8s/kargo/stage-v1alpha1.ts
git commit -m "feat: add Stage CRD class"
```

---

### Task 6: Freight CRD Class

**Files:**
- Create: `src/renderer/k8s/kargo/freight-v1alpha1.ts`

- [ ] **Step 1: Create src/renderer/k8s/kargo/freight-v1alpha1.ts**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/k8s/kargo/freight-v1alpha1.ts
git commit -m "feat: add Freight CRD class"
```

---

### Task 7: Warehouse CRD Class

**Files:**
- Create: `src/renderer/k8s/kargo/warehouse-v1alpha1.ts`

- [ ] **Step 1: Create src/renderer/k8s/kargo/warehouse-v1alpha1.ts**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/k8s/kargo/warehouse-v1alpha1.ts
git commit -m "feat: add Warehouse CRD class"
```

---

### Task 8: Promotion CRD Class

**Files:**
- Create: `src/renderer/k8s/kargo/promotion-v1alpha1.ts`

- [ ] **Step 1: Create src/renderer/k8s/kargo/promotion-v1alpha1.ts**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/k8s/kargo/promotion-v1alpha1.ts
git commit -m "feat: add Promotion CRD class"
```

---

### Task 9: PromotionPolicy CRD Class

**Files:**
- Create: `src/renderer/k8s/kargo/promotion-policy-v1alpha1.ts`

- [ ] **Step 1: Create src/renderer/k8s/kargo/promotion-policy-v1alpha1.ts**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/k8s/kargo/promotion-policy-v1alpha1.ts
git commit -m "feat: add PromotionPolicy CRD class"
```

---

### Task 10: AnalysisTemplate CRD Class

**Files:**
- Create: `src/renderer/k8s/kargo/analysis-template-v1alpha1.ts`

- [ ] **Step 1: Create src/renderer/k8s/kargo/analysis-template-v1alpha1.ts**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/k8s/kargo/analysis-template-v1alpha1.ts
git commit -m "feat: add AnalysisTemplate CRD class"
```

---

### Task 11: Error Page & Info Page Components

**Files:**
- Create: `src/renderer/components/error-page.tsx`
- Create: `src/renderer/components/error-page.module.scss`
- Create: `src/renderer/components/info-page.tsx`
- Create: `src/renderer/components/info-page.module.scss`

- [ ] **Step 1: Create src/renderer/components/error-page.module.scss**

```scss
.errorPage {
  display: flex;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.errorMessage {
  display: flex;
  align-items: center;
  color: var(--colorError);
}
```

- [ ] **Step 2: Create src/renderer/components/error-page.tsx**

```typescript
import { Common } from "@freelensapp/extensions";
import React from "react";
import styles from "./error-page.module.scss";
import stylesInline from "./error-page.module.scss?inline";

export interface ErrorPageProps {
  error?: unknown;
  children?: React.ReactNode;
}

export function ErrorPage({ error, children }: ErrorPageProps) {
  if (error) {
    Common.logger.error(`[@freelensapp/kargo-extension]: ${error}`);
  }
  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.errorPage}>
        {error ? <p className={styles.errorMessage}>{String(error)}</p> : <></>}
        {children}
      </div>
    </>
  );
}

export function withErrorPage(wrapped: () => JSX.Element) {
  try {
    return wrapped();
  } catch (error) {
    const errorMessage = String(error);

    if (errorMessage.includes("not registered") || errorMessage.includes("getStore")) {
      Common.logger.debug(`[@freelensapp/kargo-extension]: API not available - ${error}`);
      return null;
    }

    return <ErrorPage error={error} />;
  }
}
```

- [ ] **Step 3: Create src/renderer/components/info-page.module.scss**

```scss
@use "../vars";

.infoPage {
  display: flex;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.infoMessage {
  display: flex;
  align-items: center;
  color: var(--colorInfo);
}
```

- [ ] **Step 4: Create src/renderer/components/info-page.tsx**

```typescript
import styles from "./info-page.module.scss";
import stylesInline from "./info-page.module.scss?inline";

export interface InfoPageProps {
  message?: string;
}

export function InfoPage({ message }: InfoPageProps) {
  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.infoPage}>
        <p className={styles.infoMessage}>{message}</p>
      </div>
    </>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/renderer/components/error-page.tsx src/renderer/components/error-page.module.scss src/renderer/components/info-page.tsx src/renderer/components/info-page.module.scss
git commit -m "feat: add error page and info page components"
```

---

### Task 12: Status Conditions Helper

**Files:**
- Create: `src/renderer/components/status-conditions.ts`

- [ ] **Step 1: Create src/renderer/components/status-conditions.ts**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/status-conditions.ts
git commit -m "feat: add status conditions helper with Kargo status mappings"
```

---

### Task 13: Duration Absolute Component

**Files:**
- Create: `src/renderer/components/duration-absolute.tsx`

- [ ] **Step 1: Create src/renderer/components/duration-absolute.tsx**

```typescript
import { Renderer } from "@freelensapp/extensions";

const {
  Component: { LocaleDate, ReactiveDuration },
} = Renderer;

export interface DurationAbsoluteTimestampProps {
  timestamp: string | undefined;
}

export const DurationAbsoluteTimestamp = ({ timestamp }: DurationAbsoluteTimestampProps) => {
  if (!timestamp) {
    return <>{"<unknown>"}</>;
  }

  return (
    <>
      <ReactiveDuration timestamp={timestamp} />
      {" ago "}
      (<LocaleDate date={timestamp} />)
    </>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/duration-absolute.tsx
git commit -m "feat: add duration absolute timestamp component"
```

---

### Task 14: Pie Charts (Stage Health & Promotion Results)

**Files:**
- Create: `src/renderer/components/pie-chart.tsx`
- Create: `src/renderer/components/pie-chart.module.scss`

- [ ] **Step 1: Create src/renderer/components/pie-chart.module.scss**

```scss
.title {
  text-align: center;
}
```

- [ ] **Step 2: Create src/renderer/components/pie-chart.tsx**

```typescript
import { Renderer } from "@freelensapp/extensions";
import styles from "./pie-chart.module.scss";
import stylesInline from "./pie-chart.module.scss?inline";

import type React from "react";

import type { Promotion } from "../k8s/kargo/promotion-v1alpha1";
import type { Stage } from "../k8s/kargo/stage-v1alpha1";

const getStageHealthStats = (objects: Stage[]) => {
  const healthy = objects.filter((o) => o.status?.health?.status === "Healthy").length;
  const unhealthy = objects.filter((o) => o.status?.health?.status === "Unhealthy").length;
  const progressing = objects.filter((o) => o.status?.health?.status === "Progressing").length;
  const unknown = objects.length - healthy - unhealthy - progressing;
  return { healthy, unhealthy, progressing, unknown };
};

const getPromotionStats = (objects: Promotion[]) => {
  const succeeded = objects.filter((o) => o.status?.phase === "Succeeded").length;
  const failed = objects.filter((o) => o.status?.phase === "Failed" || o.status?.phase === "Errored").length;
  const aborted = objects.filter((o) => o.status?.phase === "Aborted").length;
  const running = objects.filter((o) => o.status?.phase === "Running").length;
  const pending = objects.filter((o) => o.status?.phase === "Pending").length;
  return { succeeded, failed, aborted, running, pending };
};

export interface StageHealthPieChartProps {
  objects: Stage[];
  title: string;
}

export function StageHealthPieChart(props: StageHealthPieChartProps): React.ReactElement {
  const { objects, title } = props;
  const { healthy, unhealthy, progressing, unknown } = getStageHealthStats(objects);

  const chartData = {
    datasets: [
      {
        data: [healthy, unhealthy, progressing, unknown],
        backgroundColor: ["#43a047", "#ce3933", "#FF6600", "#3a3a3c"],
        tooltipLabels: [
          (percent: string) => `Healthy: ${percent}`,
          (percent: string) => `Unhealthy: ${percent}`,
          (percent: string) => `Progressing: ${percent}`,
          (percent: string) => `Unknown: ${percent}`,
        ],
      },
    ],
    labels: [
      `Healthy: ${healthy}`,
      `Unhealthy: ${unhealthy}`,
      `Progressing: ${progressing}`,
      `Unknown: ${unknown}`,
    ],
  } as unknown as Renderer.Component.PieChartData;

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.title}>
        <span>{title} ({objects.length})</span>
      </div>
      <Renderer.Component.PieChart data={chartData} />
    </>
  );
}

export interface PromotionResultsPieChartProps {
  objects: Promotion[];
  title: string;
}

export function PromotionResultsPieChart(props: PromotionResultsPieChartProps): React.ReactElement {
  const { objects, title } = props;
  const { succeeded, failed, aborted, running, pending } = getPromotionStats(objects);

  const chartData = {
    datasets: [
      {
        data: [succeeded, failed, aborted, running, pending],
        backgroundColor: ["#43a047", "#ce3933", "#9c27b0", "#FF6600", "#3d90ce"],
        tooltipLabels: [
          (percent: string) => `Succeeded: ${percent}`,
          (percent: string) => `Failed/Errored: ${percent}`,
          (percent: string) => `Aborted: ${percent}`,
          (percent: string) => `Running: ${percent}`,
          (percent: string) => `Pending: ${percent}`,
        ],
      },
    ],
    labels: [
      `Succeeded: ${succeeded}`,
      `Failed/Errored: ${failed}`,
      `Aborted: ${aborted}`,
      `Running: ${running}`,
      `Pending: ${pending}`,
    ],
  } as unknown as Renderer.Component.PieChartData;

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.title}>
        <span>{title} ({objects.length})</span>
      </div>
      <Renderer.Component.PieChart data={chartData} />
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/components/pie-chart.tsx src/renderer/components/pie-chart.module.scss
git commit -m "feat: add Stage Health and Promotion Results pie charts"
```

---

### Task 15: Kargo Events Component

**Files:**
- Create: `src/renderer/components/kargo-events.tsx`

- [ ] **Step 1: Create src/renderer/components/kargo-events.tsx**

```typescript
import { Common, Renderer } from "@freelensapp/extensions";
import { computed, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import moment from "moment";
import React from "react";
import { Link } from "react-router-dom";

const {
  Component: {
    KubeObjectListLayout,
    Icon,
    KubeObjectAge,
    NamespaceSelectBadge,
    WithTooltip,
    TabLayout,
    ReactiveDuration,
  },
  Navigation: { getDetailsUrl },
  K8sApi: { eventStore, apiManager },
} = Renderer;

const {
  Util: { cssNames, stopPropagation },
} = Common;

function isKargoEvent(event: Renderer.K8sApi.KubeEvent): boolean {
  return event?.involvedObject?.apiVersion?.includes("kargo.akuity.io/") ?? false;
}

enum columnId {
  message = "message",
  namespace = "namespace",
  object = "object",
  type = "type",
  count = "count",
  source = "source",
  age = "age",
  lastSeen = "last-seen",
}

export interface KargoEventsProps {
  className?: string;
  compact?: boolean;
  compactLimit?: number;
}

@observer
export class KargoEvents extends React.Component<KargoEventsProps> {
  readonly sorting = observable.object({
    sortBy: columnId.age,
    orderBy: "asc" as "asc" | "desc",
  });

  private sortingCallbacks = {
    [columnId.namespace]: (event: Renderer.K8sApi.KubeEvent) => event.getNs(),
    [columnId.type]: (event: Renderer.K8sApi.KubeEvent) => event.type,
    [columnId.object]: (event: Renderer.K8sApi.KubeEvent) => event.involvedObject.name,
    [columnId.count]: (event: Renderer.K8sApi.KubeEvent) => event.count,
    [columnId.age]: (event: Renderer.K8sApi.KubeEvent) => -event.getCreationTimestamp(),
    [columnId.lastSeen]: (event: Renderer.K8sApi.KubeEvent) =>
      event.lastTimestamp ? -new Date(event.lastTimestamp).getTime() : 0,
  };

  constructor(props: KargoEventsProps) {
    super(props);
    makeObservable(this);
  }

  @computed get items(): Renderer.K8sApi.KubeEvent[] {
    const items = eventStore.contextItems.filter(isKargoEvent);
    const { sortBy, orderBy } = this.sorting;

    return [...items].sort((a, b) => {
      const valA = this.sortingCallbacks[sortBy](a);
      const valB = this.sortingCallbacks[sortBy](b);
      if (valA === valB) return 0;
      const compare = valA > valB ? 1 : -1;
      return orderBy === "asc" ? compare : -compare;
    });
  }

  @computed get visibleItems(): Renderer.K8sApi.KubeEvent[] {
    const { compact, compactLimit } = this.props;
    if (compact) {
      return this.items.slice(0, compactLimit);
    }
    return this.items;
  }

  customizeHeader = ({ info, title, ...headerPlaceholders }: any) => {
    const { compact } = this.props;
    const { items, visibleItems } = this;
    const allEventsAreShown = visibleItems.length === items.length;

    if (compact) {
      if (allEventsAreShown) {
        return { title };
      }
      return {
        title,
        info: (
          <span>
            {"("}
            {visibleItems.length}
            {" of "}
            {items.length}
            {")"}
          </span>
        ),
      };
    }

    return {
      info: (
        <>
          {info}
          <Icon small material="help_outline" className="help-icon" tooltip={`Limited to ${eventStore.limit}`} />
        </>
      ),
      title,
      ...headerPlaceholders,
    };
  };

  render() {
    const { compact, className, ...layoutProps } = this.props;

    const events = (
      <KubeObjectListLayout
        {...layoutProps}
        isConfigurable
        tableId="kargo-events"
        store={eventStore}
        className={cssNames("Events", className, { compact })}
        renderHeaderTitle="Kargo Events"
        customizeHeader={this.customizeHeader}
        isSelectable={false}
        getItems={() => this.visibleItems}
        virtual={!compact}
        tableProps={{
          sortSyncWithUrl: false,
          sortByDefault: this.sorting,
          onSort: (params) => Object.assign(this.sorting, params),
        }}
        sortingCallbacks={this.sortingCallbacks}
        searchFilters={[
          (event) => event.getSearchFields(),
          (event) => event.message,
          (event) => event.getSource(),
          (event) => event.involvedObject.name,
        ]}
        renderTableHeader={[
          { title: "Type", className: "type", sortBy: columnId.type, id: columnId.type },
          { title: "Message", className: "message", id: columnId.message },
          { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
          { title: "Involved Object", className: "object", sortBy: columnId.object, id: columnId.object },
          { title: "Source", className: "source", id: columnId.source },
          { title: "Count", className: "count", sortBy: columnId.count, id: columnId.count },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          { title: "Last Seen", className: "last-seen", sortBy: columnId.lastSeen, id: columnId.lastSeen },
        ]}
        renderTableContents={(event) => {
          const { involvedObject, type, message } = event;
          const isWarning = event.isWarning();

          return [
            <WithTooltip>{type}</WithTooltip>,
            {
              className: cssNames({ warning: isWarning }),
              title: <WithTooltip>{message}</WithTooltip>,
            },
            <NamespaceSelectBadge key="namespace" namespace={event.getNs()} />,
            <Link
              key="link"
              to={getDetailsUrl(apiManager.lookupApiLink(involvedObject, event))}
              onClick={stopPropagation}
            >
              <WithTooltip>{`${involvedObject.kind}: ${involvedObject.name}`}</WithTooltip>
            </Link>,
            <WithTooltip>{event.getSource()}</WithTooltip>,
            event.count,
            <KubeObjectAge key="age" object={event} />,
            <WithTooltip tooltip={event.lastTimestamp ? moment(event.lastTimestamp).toDate() : undefined}>
              <ReactiveDuration key="last-seen" timestamp={event.lastTimestamp} />
            </WithTooltip>,
          ];
        }}
      />
    );

    if (compact) {
      return events;
    }

    return <TabLayout>{events}</TabLayout>;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/components/kargo-events.tsx
git commit -m "feat: add Kargo events component"
```

---

### Task 16: Projects List Page

**Files:**
- Create: `src/renderer/pages/projects.tsx`
- Create: `src/renderer/pages/projects.module.scss`

- [ ] **Step 1: Create src/renderer/pages/projects.module.scss**

```scss
.page {
  :global(.TableCell) {
    &.phase {
      flex-grow: 0.7;
    }

    &.policies {
      flex-grow: 0.5;
    }

    &.age {
      flex-grow: 0.3;
    }
  }
}
```

- [ ] **Step 2: Create src/renderer/pages/projects.tsx**

```typescript
import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../components/error-page";
import { getProjectPhaseClass, getProjectPhaseText } from "../components/status-conditions";
import { Project, type ProjectApi } from "../k8s/kargo/project-v1alpha1";
import styles from "./projects.module.scss";
import stylesInline from "./projects.module.scss?inline";

const {
  Component: { Badge, KubeObjectListLayout, KubeObjectAge, WithTooltip },
} = Renderer;

const KubeObject = Project;
type KubeObject = Project;
type KubeObjectApi = ProjectApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  phase: (object: KubeObject) => KubeObject.getPhase(object),
  policies: (object: KubeObject) => KubeObject.getPromotionPoliciesCount(object),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Phase", sortBy: "phase", className: styles.phase },
  { title: "Promotion Policies", sortBy: "policies", className: styles.policies },
  { title: "Age", sortBy: "age", className: styles.age },
];

export const ProjectsPage = observer(() =>
  withErrorPage(() => {
    const store = KubeObject.getStore<KubeObject>();

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<KubeObject, KubeObjectApi>
          tableId={`${KubeObject.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={sortingCallbacks}
          searchFilters={[(object: KubeObject) => object.getSearchFields()]}
          renderHeaderTitle={KubeObject.crd.title}
          renderTableHeader={renderTableHeader}
          renderTableContents={(object: KubeObject) => {
            const phase = KubeObject.getPhase(object);
            return [
              <WithTooltip>{object.getName()}</WithTooltip>,
              <Badge label={getProjectPhaseText(phase)} className={getProjectPhaseClass(phase)} />,
              KubeObject.getPromotionPoliciesCount(object),
              <KubeObjectAge object={object} key="age" />,
            ];
          }}
        />
      </>
    );
  }),
);
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/pages/projects.tsx src/renderer/pages/projects.module.scss
git commit -m "feat: add Projects list page"
```

---

### Task 17: Stages List Page

**Files:**
- Create: `src/renderer/pages/stages.tsx`
- Create: `src/renderer/pages/stages.module.scss`

- [ ] **Step 1: Create src/renderer/pages/stages.module.scss**

```scss
.page {
  :global(.TableCell) {
    &.project {
      flex-grow: 0.7;
    }

    &.phase {
      flex-grow: 0.6;
    }

    &.health {
      flex-grow: 0.6;
    }

    &.freight {
      flex-grow: 0.8;
    }

    &.upstream {
      flex-grow: 0.8;
    }

    &.age {
      flex-grow: 0.3;
    }
  }
}
```

- [ ] **Step 2: Create src/renderer/pages/stages.tsx**

```typescript
import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../components/error-page";
import {
  getStageHealthClass,
  getStageHealthText,
  getStagePhaseClass,
  getStagePhaseText,
} from "../components/status-conditions";
import { Stage, type StageApi } from "../k8s/kargo/stage-v1alpha1";
import styles from "./stages.module.scss";
import stylesInline from "./stages.module.scss?inline";

const {
  Component: { Badge, KubeObjectListLayout, KubeObjectAge, NamespaceSelectBadge, WithTooltip },
} = Renderer;

const KubeObject = Stage;
type KubeObject = Stage;
type KubeObjectApi = StageApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  project: (object: KubeObject) => KubeObject.getProject(object),
  phase: (object: KubeObject) => KubeObject.getPhase(object),
  health: (object: KubeObject) => KubeObject.getHealth(object),
  freight: (object: KubeObject) => KubeObject.getCurrentFreightName(object),
  upstream: (object: KubeObject) => KubeObject.getUpstreamStages(object).join(","),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Project", sortBy: "project", className: styles.project },
  { title: "Phase", sortBy: "phase", className: styles.phase },
  { title: "Health", sortBy: "health", className: styles.health },
  { title: "Current Freight", sortBy: "freight", className: styles.freight },
  { title: "Upstream Stages", sortBy: "upstream", className: styles.upstream },
  { title: "Age", sortBy: "age", className: styles.age },
];

export const StagesPage = observer(() =>
  withErrorPage(() => {
    const store = KubeObject.getStore<KubeObject>();

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<KubeObject, KubeObjectApi>
          tableId={`${KubeObject.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={sortingCallbacks}
          searchFilters={[(object: KubeObject) => object.getSearchFields()]}
          renderHeaderTitle={KubeObject.crd.title}
          renderTableHeader={renderTableHeader}
          renderTableContents={(object: KubeObject) => {
            return [
              <WithTooltip>{object.getName()}</WithTooltip>,
              <NamespaceSelectBadge key="namespace" namespace={object.getNs() ?? ""} />,
              <WithTooltip>{KubeObject.getProject(object)}</WithTooltip>,
              <Badge
                label={getStagePhaseText(object.status?.phase)}
                className={getStagePhaseClass(object.status?.phase)}
              />,
              <Badge
                label={getStageHealthText(object.status?.health?.status)}
                className={getStageHealthClass(object.status?.health?.status)}
              />,
              <WithTooltip>{KubeObject.getCurrentFreightName(object)}</WithTooltip>,
              <WithTooltip>{KubeObject.getUpstreamStages(object).join(", ") || "—"}</WithTooltip>,
              <KubeObjectAge object={object} key="age" />,
            ];
          }}
        />
      </>
    );
  }),
);
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/pages/stages.tsx src/renderer/pages/stages.module.scss
git commit -m "feat: add Stages list page"
```

---

### Task 18: Freight List Page

**Files:**
- Create: `src/renderer/pages/freight.tsx`
- Create: `src/renderer/pages/freight.module.scss`

- [ ] **Step 1: Create src/renderer/pages/freight.module.scss**

```scss
.page {
  :global(.TableCell) {
    &.warehouse {
      flex-grow: 0.7;
    }

    &.alias {
      flex-grow: 0.5;
    }

    &.commits {
      flex-grow: 0.8;
    }

    &.images {
      flex-grow: 1;
    }

    &.charts {
      flex-grow: 0.8;
    }

    &.verified {
      flex-grow: 0.4;
    }

    &.approved {
      flex-grow: 0.4;
    }

    &.age {
      flex-grow: 0.3;
    }
  }
}
```

- [ ] **Step 2: Create src/renderer/pages/freight.tsx**

```typescript
import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../components/error-page";
import { Freight, type FreightApi } from "../k8s/kargo/freight-v1alpha1";
import styles from "./freight.module.scss";
import stylesInline from "./freight.module.scss?inline";

const {
  Component: { KubeObjectListLayout, KubeObjectAge, NamespaceSelectBadge, WithTooltip },
} = Renderer;

const KubeObject = Freight;
type KubeObject = Freight;
type KubeObjectApi = FreightApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  warehouse: (object: KubeObject) => KubeObject.getOriginWarehouse(object),
  alias: (object: KubeObject) => KubeObject.getAlias(object),
  commits: (object: KubeObject) => KubeObject.getCommits(object).length,
  images: (object: KubeObject) => KubeObject.getImages(object).length,
  charts: (object: KubeObject) => KubeObject.getCharts(object).length,
  verified: (object: KubeObject) => KubeObject.getVerifiedInCount(object),
  approved: (object: KubeObject) => KubeObject.getApprovedForCount(object),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Warehouse", sortBy: "warehouse", className: styles.warehouse },
  { title: "Alias", sortBy: "alias", className: styles.alias },
  { title: "Commits", sortBy: "commits", className: styles.commits },
  { title: "Images", sortBy: "images", className: styles.images },
  { title: "Charts", sortBy: "charts", className: styles.charts },
  { title: "Verified In", sortBy: "verified", className: styles.verified },
  { title: "Approved For", sortBy: "approved", className: styles.approved },
  { title: "Age", sortBy: "age", className: styles.age },
];

export const FreightPage = observer(() =>
  withErrorPage(() => {
    const store = KubeObject.getStore<KubeObject>();

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<KubeObject, KubeObjectApi>
          tableId={`${KubeObject.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={sortingCallbacks}
          searchFilters={[(object: KubeObject) => object.getSearchFields()]}
          renderHeaderTitle={KubeObject.crd.title}
          renderTableHeader={renderTableHeader}
          renderTableContents={(object: KubeObject) => {
            return [
              <WithTooltip>{object.getName()}</WithTooltip>,
              <NamespaceSelectBadge key="namespace" namespace={object.getNs() ?? ""} />,
              <WithTooltip>{KubeObject.getOriginWarehouse(object)}</WithTooltip>,
              <WithTooltip>{KubeObject.getAlias(object)}</WithTooltip>,
              <WithTooltip>{KubeObject.getCommitsSummary(object) || "—"}</WithTooltip>,
              <WithTooltip>{KubeObject.getImagesSummary(object) || "—"}</WithTooltip>,
              <WithTooltip>{KubeObject.getChartsSummary(object) || "—"}</WithTooltip>,
              KubeObject.getVerifiedInCount(object),
              KubeObject.getApprovedForCount(object),
              <KubeObjectAge object={object} key="age" />,
            ];
          }}
        />
      </>
    );
  }),
);
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/pages/freight.tsx src/renderer/pages/freight.module.scss
git commit -m "feat: add Freight list page"
```

---

### Task 19: Warehouses List Page

**Files:**
- Create: `src/renderer/pages/warehouses.tsx`
- Create: `src/renderer/pages/warehouses.module.scss`

- [ ] **Step 1: Create src/renderer/pages/warehouses.module.scss**

```scss
.page {
  :global(.TableCell) {
    &.policy {
      flex-grow: 0.7;
    }

    &.subscriptions {
      flex-grow: 1;
    }

    &.lastFreight {
      flex-grow: 0.8;
    }

    &.age {
      flex-grow: 0.3;
    }
  }
}
```

- [ ] **Step 2: Create src/renderer/pages/warehouses.tsx**

```typescript
import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../components/error-page";
import { Warehouse, type WarehouseApi } from "../k8s/kargo/warehouse-v1alpha1";
import styles from "./warehouses.module.scss";
import stylesInline from "./warehouses.module.scss?inline";

const {
  Component: { KubeObjectListLayout, KubeObjectAge, NamespaceSelectBadge, WithTooltip },
} = Renderer;

const KubeObject = Warehouse;
type KubeObject = Warehouse;
type KubeObjectApi = WarehouseApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  policy: (object: KubeObject) => KubeObject.getFreightCreationPolicy(object),
  subscriptions: (object: KubeObject) => KubeObject.getSubscriptionsSummary(object),
  lastFreight: (object: KubeObject) => KubeObject.getLastFreightName(object),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Freight Creation", sortBy: "policy", className: styles.policy },
  { title: "Subscriptions", sortBy: "subscriptions", className: styles.subscriptions },
  { title: "Last Freight", sortBy: "lastFreight", className: styles.lastFreight },
  { title: "Age", sortBy: "age", className: styles.age },
];

export const WarehousesPage = observer(() =>
  withErrorPage(() => {
    const store = KubeObject.getStore<KubeObject>();

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<KubeObject, KubeObjectApi>
          tableId={`${KubeObject.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={sortingCallbacks}
          searchFilters={[(object: KubeObject) => object.getSearchFields()]}
          renderHeaderTitle={KubeObject.crd.title}
          renderTableHeader={renderTableHeader}
          renderTableContents={(object: KubeObject) => {
            return [
              <WithTooltip>{object.getName()}</WithTooltip>,
              <NamespaceSelectBadge key="namespace" namespace={object.getNs() ?? ""} />,
              <WithTooltip>{KubeObject.getFreightCreationPolicy(object)}</WithTooltip>,
              <WithTooltip>{KubeObject.getSubscriptionsSummary(object)}</WithTooltip>,
              <WithTooltip>{KubeObject.getLastFreightName(object) || "—"}</WithTooltip>,
              <KubeObjectAge object={object} key="age" />,
            ];
          }}
        />
      </>
    );
  }),
);
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/pages/warehouses.tsx src/renderer/pages/warehouses.module.scss
git commit -m "feat: add Warehouses list page"
```

---

### Task 20: Promotions List Page

**Files:**
- Create: `src/renderer/pages/promotions.tsx`
- Create: `src/renderer/pages/promotions.module.scss`

- [ ] **Step 1: Create src/renderer/pages/promotions.module.scss**

```scss
.page {
  :global(.TableCell) {
    &.stage {
      flex-grow: 0.7;
    }

    &.freight {
      flex-grow: 0.7;
    }

    &.phase {
      flex-grow: 0.6;
    }

    &.message {
      flex-grow: 1.3;
    }

    &.finished {
      flex-grow: 0.5;
    }

    &.age {
      flex-grow: 0.3;
    }
  }
}
```

- [ ] **Step 2: Create src/renderer/pages/promotions.tsx**

```typescript
import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../components/error-page";
import { getPromotionPhaseClass, getPromotionPhaseText } from "../components/status-conditions";
import { Promotion, type PromotionApi } from "../k8s/kargo/promotion-v1alpha1";
import styles from "./promotions.module.scss";
import stylesInline from "./promotions.module.scss?inline";

const {
  Component: { Badge, KubeObjectListLayout, KubeObjectAge, NamespaceSelectBadge, WithTooltip },
} = Renderer;

const KubeObject = Promotion;
type KubeObject = Promotion;
type KubeObjectApi = PromotionApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  stage: (object: KubeObject) => KubeObject.getTargetStage(object),
  freight: (object: KubeObject) => KubeObject.getFreightRef(object),
  phase: (object: KubeObject) => KubeObject.getPhase(object),
  message: (object: KubeObject) => KubeObject.getMessage(object),
  finished: (object: KubeObject) => KubeObject.getFinishedAt(object) ?? "",
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Stage", sortBy: "stage", className: styles.stage },
  { title: "Freight", sortBy: "freight", className: styles.freight },
  { title: "Phase", sortBy: "phase", className: styles.phase },
  { title: "Message", sortBy: "message", className: styles.message },
  { title: "Finished", sortBy: "finished", className: styles.finished },
  { title: "Age", sortBy: "age", className: styles.age },
];

export const PromotionsPage = observer(() =>
  withErrorPage(() => {
    const store = KubeObject.getStore<KubeObject>();

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<KubeObject, KubeObjectApi>
          tableId={`${KubeObject.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={sortingCallbacks}
          searchFilters={[(object: KubeObject) => object.getSearchFields()]}
          renderHeaderTitle={KubeObject.crd.title}
          renderTableHeader={renderTableHeader}
          renderTableContents={(object: KubeObject) => {
            return [
              <WithTooltip>{object.getName()}</WithTooltip>,
              <NamespaceSelectBadge key="namespace" namespace={object.getNs() ?? ""} />,
              <WithTooltip>{KubeObject.getTargetStage(object)}</WithTooltip>,
              <WithTooltip>{KubeObject.getFreightRef(object)}</WithTooltip>,
              <Badge
                label={getPromotionPhaseText(object.status?.phase)}
                className={getPromotionPhaseClass(object.status?.phase)}
              />,
              <WithTooltip>{KubeObject.getMessage(object) || "—"}</WithTooltip>,
              <WithTooltip>{KubeObject.getFinishedAt(object) || "—"}</WithTooltip>,
              <KubeObjectAge object={object} key="age" />,
            ];
          }}
        />
      </>
    );
  }),
);
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/pages/promotions.tsx src/renderer/pages/promotions.module.scss
git commit -m "feat: add Promotions list page"
```

---

### Task 21: Promotion Policies List Page

**Files:**
- Create: `src/renderer/pages/promotion-policies.tsx`
- Create: `src/renderer/pages/promotion-policies.module.scss`

- [ ] **Step 1: Create src/renderer/pages/promotion-policies.module.scss**

```scss
.page {
  :global(.TableCell) {
    &.stage {
      flex-grow: 1;
    }

    &.autoPromotion {
      flex-grow: 0.7;
    }

    &.age {
      flex-grow: 0.3;
    }
  }
}
```

- [ ] **Step 2: Create src/renderer/pages/promotion-policies.tsx**

```typescript
import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../components/error-page";
import { getAutoPromotionClass, getAutoPromotionText } from "../components/status-conditions";
import { PromotionPolicy, type PromotionPolicyApi } from "../k8s/kargo/promotion-policy-v1alpha1";
import styles from "./promotion-policies.module.scss";
import stylesInline from "./promotion-policies.module.scss?inline";

const {
  Component: { Badge, KubeObjectListLayout, KubeObjectAge, NamespaceSelectBadge, WithTooltip },
} = Renderer;

const KubeObject = PromotionPolicy;
type KubeObject = PromotionPolicy;
type KubeObjectApi = PromotionPolicyApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  stage: (object: KubeObject) => KubeObject.getStage(object),
  autoPromotion: (object: KubeObject) => KubeObject.isAutoPromotionEnabled(object),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Stage", sortBy: "stage", className: styles.stage },
  { title: "Auto-Promotion", sortBy: "autoPromotion", className: styles.autoPromotion },
  { title: "Age", sortBy: "age", className: styles.age },
];

export const PromotionPoliciesPage = observer(() =>
  withErrorPage(() => {
    const store = KubeObject.getStore<KubeObject>();

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<KubeObject, KubeObjectApi>
          tableId={`${KubeObject.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={sortingCallbacks}
          searchFilters={[(object: KubeObject) => object.getSearchFields()]}
          renderHeaderTitle={KubeObject.crd.title}
          renderTableHeader={renderTableHeader}
          renderTableContents={(object: KubeObject) => {
            const autoPromo = KubeObject.isAutoPromotionEnabled(object);
            return [
              <WithTooltip>{object.getName()}</WithTooltip>,
              <NamespaceSelectBadge key="namespace" namespace={object.getNs() ?? ""} />,
              <WithTooltip>{KubeObject.getStage(object)}</WithTooltip>,
              <Badge label={getAutoPromotionText(autoPromo)} className={getAutoPromotionClass(autoPromo)} />,
              <KubeObjectAge object={object} key="age" />,
            ];
          }}
        />
      </>
    );
  }),
);
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/pages/promotion-policies.tsx src/renderer/pages/promotion-policies.module.scss
git commit -m "feat: add Promotion Policies list page"
```

---

### Task 22: Analysis Templates List Page

**Files:**
- Create: `src/renderer/pages/analysis-templates.tsx`
- Create: `src/renderer/pages/analysis-templates.module.scss`

- [ ] **Step 1: Create src/renderer/pages/analysis-templates.module.scss**

```scss
.page {
  :global(.TableCell) {
    &.metrics {
      flex-grow: 0.5;
    }

    &.args {
      flex-grow: 0.5;
    }

    &.age {
      flex-grow: 0.3;
    }
  }
}
```

- [ ] **Step 2: Create src/renderer/pages/analysis-templates.tsx**

```typescript
import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../components/error-page";
import { AnalysisTemplate, type AnalysisTemplateApi } from "../k8s/kargo/analysis-template-v1alpha1";
import styles from "./analysis-templates.module.scss";
import stylesInline from "./analysis-templates.module.scss?inline";

const {
  Component: { KubeObjectListLayout, KubeObjectAge, NamespaceSelectBadge, WithTooltip },
} = Renderer;

const KubeObject = AnalysisTemplate;
type KubeObject = AnalysisTemplate;
type KubeObjectApi = AnalysisTemplateApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  metrics: (object: KubeObject) => KubeObject.getMetricsCount(object),
  args: (object: KubeObject) => KubeObject.getArgsCount(object),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Metrics", sortBy: "metrics", className: styles.metrics },
  { title: "Args", sortBy: "args", className: styles.args },
  { title: "Age", sortBy: "age", className: styles.age },
];

export const AnalysisTemplatesPage = observer(() =>
  withErrorPage(() => {
    const store = KubeObject.getStore<KubeObject>();

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<KubeObject, KubeObjectApi>
          tableId={`${KubeObject.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={sortingCallbacks}
          searchFilters={[(object: KubeObject) => object.getSearchFields()]}
          renderHeaderTitle={KubeObject.crd.title}
          renderTableHeader={renderTableHeader}
          renderTableContents={(object: KubeObject) => {
            return [
              <WithTooltip>{object.getName()}</WithTooltip>,
              <NamespaceSelectBadge key="namespace" namespace={object.getNs() ?? ""} />,
              KubeObject.getMetricsCount(object),
              KubeObject.getArgsCount(object),
              <KubeObjectAge object={object} key="age" />,
            ];
          }}
        />
      </>
    );
  }),
);
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/pages/analysis-templates.tsx src/renderer/pages/analysis-templates.module.scss
git commit -m "feat: add Analysis Templates list page"
```

---

### Task 23: Detail Views — Project, PromotionPolicy, AnalysisTemplate

These are the simpler detail views. Grouped to reduce task count.

**Files:**
- Create: `src/renderer/components/details/project-details.tsx`
- Create: `src/renderer/components/details/project-details.module.scss`
- Create: `src/renderer/components/details/promotion-policy-details.tsx`
- Create: `src/renderer/components/details/promotion-policy-details.module.scss`
- Create: `src/renderer/components/details/analysis-template-details.tsx`
- Create: `src/renderer/components/details/analysis-template-details.module.scss`

- [ ] **Step 1: Create project-details.module.scss**

```scss
@use "../../vars";

.details {
  .title {
    margin-top: vars.$margin * 2;
    margin-bottom: vars.$margin;
  }
}
```

- [ ] **Step 2: Create project-details.tsx**

```typescript
import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { Project } from "../../k8s/kargo/project-v1alpha1";
import { getConditionClass, getConditionText, getProjectPhaseClass, getProjectPhaseText } from "../status-conditions";
import styles from "./project-details.module.scss";
import stylesInline from "./project-details.module.scss?inline";

const {
  Component: { Badge, DrawerItem, DrawerTitle, Table, TableCell, TableHead, TableRow },
} = Renderer;

export const ProjectDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<Project>> = observer((props) => {
  const { object } = props;
  const phase = Project.getPhase(object);
  const conditions = Project.getConditions(object);
  const policies = object.spec?.promotionPolicies ?? [];

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.details}>
        <DrawerItem name="Phase">
          <Badge label={getProjectPhaseText(phase)} className={getProjectPhaseClass(phase)} />
        </DrawerItem>

        <DrawerItem name="Conditions">
          <Badge label={getConditionText(conditions)} className={getConditionClass(conditions)} />
        </DrawerItem>

        {policies.length > 0 && (
          <>
            <DrawerTitle>Promotion Policies</DrawerTitle>
            <Table>
              <TableHead>
                <TableCell>Stage</TableCell>
                <TableCell>Auto-Promotion</TableCell>
              </TableHead>
              {policies.map((policy, i) => (
                <TableRow key={`${policy.stage}-${i}`}>
                  <TableCell>{policy.stage}</TableCell>
                  <TableCell>
                    <Badge
                      label={policy.autoPromotionEnabled ? "Enabled" : "Disabled"}
                      className={policy.autoPromotionEnabled ? "success" : ""}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </>
        )}
      </div>
    </>
  );
});
```

- [ ] **Step 3: Create promotion-policy-details.module.scss**

```scss
@use "../../vars";

.details {
  .title {
    margin-top: vars.$margin * 2;
    margin-bottom: vars.$margin;
  }
}
```

- [ ] **Step 4: Create promotion-policy-details.tsx**

```typescript
import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { PromotionPolicy } from "../../k8s/kargo/promotion-policy-v1alpha1";
import { getAutoPromotionClass, getAutoPromotionText } from "../status-conditions";
import styles from "./promotion-policy-details.module.scss";
import stylesInline from "./promotion-policy-details.module.scss?inline";

const {
  Component: { Badge, DrawerItem },
} = Renderer;

export const PromotionPolicyDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<PromotionPolicy>> = observer(
  (props) => {
    const { object } = props;
    const autoPromo = PromotionPolicy.isAutoPromotionEnabled(object);

    return (
      <>
        <style>{stylesInline}</style>
        <div className={styles.details}>
          <DrawerItem name="Stage">{PromotionPolicy.getStage(object) || "—"}</DrawerItem>

          <DrawerItem name="Auto-Promotion">
            <Badge label={getAutoPromotionText(autoPromo)} className={getAutoPromotionClass(autoPromo)} />
          </DrawerItem>
        </div>
      </>
    );
  },
);
```

- [ ] **Step 5: Create analysis-template-details.module.scss**

```scss
@use "../../vars";

.details {
  .title {
    margin-top: vars.$margin * 2;
    margin-bottom: vars.$margin;
  }
}
```

- [ ] **Step 6: Create analysis-template-details.tsx**

```typescript
import { Renderer } from "@freelensapp/extensions";
import yaml from "js-yaml";
import { observer } from "mobx-react";
import { AnalysisTemplate } from "../../k8s/kargo/analysis-template-v1alpha1";
import { defaultYamlDumpOptions, getHeight } from "../../utils";
import styles from "./analysis-template-details.module.scss";
import stylesInline from "./analysis-template-details.module.scss?inline";

const {
  Component: { DrawerItem, DrawerTitle, MonacoEditor, Table, TableCell, TableHead, TableRow },
} = Renderer;

export const AnalysisTemplateDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<AnalysisTemplate>> = observer(
  (props) => {
    const { object } = props;
    const metrics = AnalysisTemplate.getMetrics(object);
    const args = AnalysisTemplate.getArgs(object);
    const specYaml = yaml.dump(object.spec ?? {}, defaultYamlDumpOptions);

    return (
      <>
        <style>{stylesInline}</style>
        <div className={styles.details}>
          <DrawerItem name="Metrics Count">{metrics.length}</DrawerItem>
          <DrawerItem name="Args Count">{args.length}</DrawerItem>

          {metrics.length > 0 && (
            <>
              <DrawerTitle>Metrics</DrawerTitle>
              <Table>
                <TableHead>
                  <TableCell>Name</TableCell>
                  <TableCell>Success Condition</TableCell>
                  <TableCell>Failure Limit</TableCell>
                </TableHead>
                {metrics.map((metric) => (
                  <TableRow key={metric.name}>
                    <TableCell>{metric.name}</TableCell>
                    <TableCell>{metric.successCondition ?? "—"}</TableCell>
                    <TableCell>{metric.failureLimit ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </Table>
            </>
          )}

          {args.length > 0 && (
            <>
              <DrawerTitle>Args</DrawerTitle>
              <Table>
                <TableHead>
                  <TableCell>Name</TableCell>
                  <TableCell>Value</TableCell>
                </TableHead>
                {args.map((arg) => (
                  <TableRow key={arg.name}>
                    <TableCell>{arg.name}</TableCell>
                    <TableCell>{arg.value ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </Table>
            </>
          )}

          <DrawerTitle>Spec</DrawerTitle>
          <MonacoEditor
            style={{ height: getHeight(specYaml), minHeight: 100 }}
            value={specYaml}
            language="yaml"
            readOnly
          />
        </div>
      </>
    );
  },
);
```

- [ ] **Step 7: Commit**

```bash
git add src/renderer/components/details/project-details.tsx src/renderer/components/details/project-details.module.scss src/renderer/components/details/promotion-policy-details.tsx src/renderer/components/details/promotion-policy-details.module.scss src/renderer/components/details/analysis-template-details.tsx src/renderer/components/details/analysis-template-details.module.scss
git commit -m "feat: add Project, PromotionPolicy, and AnalysisTemplate detail views"
```

---

### Task 24: Stage Detail View

**Files:**
- Create: `src/renderer/components/details/stage-details.tsx`
- Create: `src/renderer/components/details/stage-details.module.scss`

- [ ] **Step 1: Create stage-details.module.scss**

```scss
@use "../../vars";

.details {
  .title {
    margin-top: vars.$margin * 2;
    margin-bottom: vars.$margin;
  }
}

.editor {
  resize: none;
  overflow: hidden;
  border: 1px solid var(--borderFaintColor);
  border-radius: 4px;
}
```

- [ ] **Step 2: Create stage-details.tsx**

```typescript
import { Renderer } from "@freelensapp/extensions";
import yaml from "js-yaml";
import { observer } from "mobx-react";
import { Stage } from "../../k8s/kargo/stage-v1alpha1";
import { defaultYamlDumpOptions, getHeight } from "../../utils";
import {
  getStageHealthClass,
  getStageHealthText,
  getStagePhaseClass,
  getStagePhaseText,
} from "../status-conditions";
import styles from "./stage-details.module.scss";
import stylesInline from "./stage-details.module.scss?inline";

const {
  Component: { Badge, DrawerItem, DrawerTitle, MonacoEditor, WithTooltip },
} = Renderer;

export const StageDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<Stage>> = observer((props) => {
  const { object } = props;

  const phase = object.status?.phase;
  const health = object.status?.health?.status;
  const healthIssues = Stage.getHealthIssues(object);
  const currentFreight = Stage.getCurrentFreightName(object);
  const upstreamStages = Stage.getUpstreamStages(object);
  const warehouseSub = Stage.getWarehouseSubscription(object);
  const mechanisms = Stage.getPromotionMechanisms(object);
  const verification = Stage.getVerificationStatus(object);
  const currentPromo = Stage.getCurrentPromotionName(object);
  const lastPromo = Stage.getLastPromotionName(object);
  const specYaml = yaml.dump(object.spec ?? {}, defaultYamlDumpOptions);

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.details}>
        <DrawerItem name="Phase">
          <Badge label={getStagePhaseText(phase)} className={getStagePhaseClass(phase)} />
        </DrawerItem>

        <DrawerItem name="Health">
          <Badge label={getStageHealthText(health)} className={getStageHealthClass(health)} />
        </DrawerItem>

        {healthIssues.length > 0 && (
          <DrawerItem name="Health Issues">
            {healthIssues.map((issue, i) => (
              <div key={i}>{issue}</div>
            ))}
          </DrawerItem>
        )}

        <DrawerItem name="Current Freight">
          <WithTooltip>{currentFreight || "—"}</WithTooltip>
        </DrawerItem>

        {warehouseSub && <DrawerItem name="Warehouse Subscription">{warehouseSub}</DrawerItem>}

        {upstreamStages.length > 0 && (
          <DrawerItem name="Upstream Stages">{upstreamStages.join(", ")}</DrawerItem>
        )}

        <DrawerItem name="Promotion Mechanisms">{mechanisms}</DrawerItem>

        <DrawerItem name="Verification">{verification}</DrawerItem>

        {currentPromo && <DrawerItem name="Current Promotion">{currentPromo}</DrawerItem>}
        {lastPromo && <DrawerItem name="Last Promotion">{lastPromo}</DrawerItem>}

        <DrawerTitle>Spec</DrawerTitle>
        <MonacoEditor
          className={styles.editor}
          style={{ height: getHeight(specYaml), minHeight: 100 }}
          value={specYaml}
          language="yaml"
          readOnly
        />
      </div>
    </>
  );
});
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/components/details/stage-details.tsx src/renderer/components/details/stage-details.module.scss
git commit -m "feat: add Stage detail view"
```

---

### Task 25: Freight Detail View

**Files:**
- Create: `src/renderer/components/details/freight-details.tsx`
- Create: `src/renderer/components/details/freight-details.module.scss`

- [ ] **Step 1: Create freight-details.module.scss**

```scss
@use "../../vars";

.details {
  .title {
    margin-top: vars.$margin * 2;
    margin-bottom: vars.$margin;
  }
}

.editor {
  resize: none;
  overflow: hidden;
  border: 1px solid var(--borderFaintColor);
  border-radius: 4px;
}
```

- [ ] **Step 2: Create freight-details.tsx**

```typescript
import { Renderer } from "@freelensapp/extensions";
import yaml from "js-yaml";
import { observer } from "mobx-react";
import { Freight } from "../../k8s/kargo/freight-v1alpha1";
import { defaultYamlDumpOptions, getHeight } from "../../utils";
import styles from "./freight-details.module.scss";
import stylesInline from "./freight-details.module.scss?inline";

const {
  Component: { Badge, DrawerItem, DrawerTitle, MonacoEditor, Table, TableCell, TableHead, TableRow, WithTooltip },
} = Renderer;

export const FreightDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<Freight>> = observer((props) => {
  const { object } = props;

  const alias = Freight.getAlias(object);
  const warehouse = Freight.getOriginWarehouse(object);
  const commits = Freight.getCommits(object);
  const images = Freight.getImages(object);
  const charts = Freight.getCharts(object);
  const verifiedIn = Freight.getVerifiedInStages(object);
  const approvedFor = Freight.getApprovedForStages(object);
  const specYaml = yaml.dump(object.spec ?? {}, defaultYamlDumpOptions);

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.details}>
        <DrawerItem name="Alias">{alias}</DrawerItem>
        <DrawerItem name="Origin Warehouse">{warehouse || "—"}</DrawerItem>

        <DrawerItem name="Verified In">
          {verifiedIn.length > 0
            ? verifiedIn.map((s) => <Badge key={s} label={s} className="success" />)
            : "None"}
        </DrawerItem>

        <DrawerItem name="Approved For">
          {approvedFor.length > 0
            ? approvedFor.map((s) => <Badge key={s} label={s} className="success" />)
            : "None"}
        </DrawerItem>

        {commits.length > 0 && (
          <>
            <DrawerTitle>Git Commits</DrawerTitle>
            <Table>
              <TableHead>
                <TableCell>Repo</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>Message</TableCell>
              </TableHead>
              {commits.map((commit, i) => (
                <TableRow key={`${commit.id}-${i}`}>
                  <TableCell><WithTooltip>{commit.repoURL ?? ""}</WithTooltip></TableCell>
                  <TableCell>{commit.id?.substring(0, 7) ?? ""}</TableCell>
                  <TableCell>{commit.branch ?? ""}</TableCell>
                  <TableCell><WithTooltip>{commit.message ?? ""}</WithTooltip></TableCell>
                </TableRow>
              ))}
            </Table>
          </>
        )}

        {images.length > 0 && (
          <>
            <DrawerTitle>Images</DrawerTitle>
            <Table>
              <TableHead>
                <TableCell>Repository</TableCell>
                <TableCell>Tag</TableCell>
                <TableCell>Digest</TableCell>
              </TableHead>
              {images.map((image, i) => (
                <TableRow key={`${image.repoURL}-${i}`}>
                  <TableCell><WithTooltip>{image.repoURL ?? ""}</WithTooltip></TableCell>
                  <TableCell>{image.tag ?? ""}</TableCell>
                  <TableCell><WithTooltip>{image.digest?.substring(0, 16) ?? ""}</WithTooltip></TableCell>
                </TableRow>
              ))}
            </Table>
          </>
        )}

        {charts.length > 0 && (
          <>
            <DrawerTitle>Charts</DrawerTitle>
            <Table>
              <TableHead>
                <TableCell>Repository</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Version</TableCell>
              </TableHead>
              {charts.map((chart, i) => (
                <TableRow key={`${chart.name}-${i}`}>
                  <TableCell><WithTooltip>{chart.repoURL ?? ""}</WithTooltip></TableCell>
                  <TableCell>{chart.name ?? ""}</TableCell>
                  <TableCell>{chart.version ?? ""}</TableCell>
                </TableRow>
              ))}
            </Table>
          </>
        )}

        <DrawerTitle>Spec</DrawerTitle>
        <MonacoEditor
          className={styles.editor}
          style={{ height: getHeight(specYaml), minHeight: 100 }}
          value={specYaml}
          language="yaml"
          readOnly
        />
      </div>
    </>
  );
});
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/components/details/freight-details.tsx src/renderer/components/details/freight-details.module.scss
git commit -m "feat: add Freight detail view"
```

---

### Task 26: Warehouse Detail View

**Files:**
- Create: `src/renderer/components/details/warehouse-details.tsx`
- Create: `src/renderer/components/details/warehouse-details.module.scss`

- [ ] **Step 1: Create warehouse-details.module.scss**

```scss
@use "../../vars";

.details {
  .title {
    margin-top: vars.$margin * 2;
    margin-bottom: vars.$margin;
  }
}

.editor {
  resize: none;
  overflow: hidden;
  border: 1px solid var(--borderFaintColor);
  border-radius: 4px;
}
```

- [ ] **Step 2: Create warehouse-details.tsx**

```typescript
import { Renderer } from "@freelensapp/extensions";
import yaml from "js-yaml";
import { observer } from "mobx-react";
import { Warehouse } from "../../k8s/kargo/warehouse-v1alpha1";
import { defaultYamlDumpOptions, getHeight } from "../../utils";
import styles from "./warehouse-details.module.scss";
import stylesInline from "./warehouse-details.module.scss?inline";

const {
  Component: { DrawerItem, DrawerTitle, MonacoEditor, Table, TableCell, TableHead, TableRow, WithTooltip },
} = Renderer;

export const WarehouseDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<Warehouse>> = observer((props) => {
  const { object } = props;

  const policy = Warehouse.getFreightCreationPolicy(object);
  const interval = Warehouse.getInterval(object);
  const lastFreight = Warehouse.getLastFreightName(object);
  const subs = object.spec?.subscriptions;
  const specYaml = yaml.dump(object.spec ?? {}, defaultYamlDumpOptions);

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.details}>
        <DrawerItem name="Freight Creation Policy">{policy}</DrawerItem>
        {interval && <DrawerItem name="Interval">{interval}</DrawerItem>}
        <DrawerItem name="Last Freight">{lastFreight || "—"}</DrawerItem>

        {subs?.git && subs.git.length > 0 && (
          <>
            <DrawerTitle>Git Subscriptions</DrawerTitle>
            <Table>
              <TableHead>
                <TableCell>Repo URL</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>Strategy</TableCell>
              </TableHead>
              {subs.git.map((sub, i) => (
                <TableRow key={`${sub.repoURL}-${i}`}>
                  <TableCell><WithTooltip>{sub.repoURL}</WithTooltip></TableCell>
                  <TableCell>{sub.branch ?? ""}</TableCell>
                  <TableCell>{sub.commitSelectionStrategy ?? ""}</TableCell>
                </TableRow>
              ))}
            </Table>
          </>
        )}

        {subs?.images && subs.images.length > 0 && (
          <>
            <DrawerTitle>Image Subscriptions</DrawerTitle>
            <Table>
              <TableHead>
                <TableCell>Repo URL</TableCell>
                <TableCell>Strategy</TableCell>
                <TableCell>Constraint</TableCell>
                <TableCell>Platform</TableCell>
              </TableHead>
              {subs.images.map((sub, i) => (
                <TableRow key={`${sub.repoURL}-${i}`}>
                  <TableCell><WithTooltip>{sub.repoURL}</WithTooltip></TableCell>
                  <TableCell>{sub.tagSelectionStrategy ?? ""}</TableCell>
                  <TableCell>{sub.semverConstraint ?? ""}</TableCell>
                  <TableCell>{sub.platform ?? ""}</TableCell>
                </TableRow>
              ))}
            </Table>
          </>
        )}

        {subs?.charts && subs.charts.length > 0 && (
          <>
            <DrawerTitle>Chart Subscriptions</DrawerTitle>
            <Table>
              <TableHead>
                <TableCell>Repo URL</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Constraint</TableCell>
              </TableHead>
              {subs.charts.map((sub, i) => (
                <TableRow key={`${sub.repoURL}-${i}`}>
                  <TableCell><WithTooltip>{sub.repoURL}</WithTooltip></TableCell>
                  <TableCell>{sub.name ?? ""}</TableCell>
                  <TableCell>{sub.semverConstraint ?? ""}</TableCell>
                </TableRow>
              ))}
            </Table>
          </>
        )}

        <DrawerTitle>Spec</DrawerTitle>
        <MonacoEditor
          className={styles.editor}
          style={{ height: getHeight(specYaml), minHeight: 100 }}
          value={specYaml}
          language="yaml"
          readOnly
        />
      </div>
    </>
  );
});
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/components/details/warehouse-details.tsx src/renderer/components/details/warehouse-details.module.scss
git commit -m "feat: add Warehouse detail view"
```

---

### Task 27: Promotion Detail View

**Files:**
- Create: `src/renderer/components/details/promotion-details.tsx`
- Create: `src/renderer/components/details/promotion-details.module.scss`

- [ ] **Step 1: Create promotion-details.module.scss**

```scss
@use "../../vars";

.details {
  .title {
    margin-top: vars.$margin * 2;
    margin-bottom: vars.$margin;
  }
}

.editor {
  resize: none;
  overflow: hidden;
  border: 1px solid var(--borderFaintColor);
  border-radius: 4px;
}
```

- [ ] **Step 2: Create promotion-details.tsx**

```typescript
import { Renderer } from "@freelensapp/extensions";
import yaml from "js-yaml";
import { observer } from "mobx-react";
import { Promotion } from "../../k8s/kargo/promotion-v1alpha1";
import { defaultYamlDumpOptions, getHeight } from "../../utils";
import { DurationAbsoluteTimestamp } from "../duration-absolute";
import { getPromotionPhaseClass, getPromotionPhaseText } from "../status-conditions";
import styles from "./promotion-details.module.scss";
import stylesInline from "./promotion-details.module.scss?inline";

const {
  Component: { Badge, DrawerItem, DrawerTitle, MonacoEditor, Table, TableCell, TableHead, TableRow },
} = Renderer;

export const PromotionDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<Promotion>> = observer((props) => {
  const { object } = props;

  const phase = object.status?.phase;
  const stage = Promotion.getTargetStage(object);
  const freightRef = Promotion.getFreightRef(object);
  const message = Promotion.getMessage(object);
  const finishedAt = Promotion.getFinishedAt(object);
  const steps = object.spec?.steps ?? [];
  const specYaml = yaml.dump(object.spec ?? {}, defaultYamlDumpOptions);

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.details}>
        <DrawerItem name="Phase">
          <Badge label={getPromotionPhaseText(phase)} className={getPromotionPhaseClass(phase)} />
        </DrawerItem>

        <DrawerItem name="Stage">{stage || "—"}</DrawerItem>
        <DrawerItem name="Freight">{freightRef || "—"}</DrawerItem>

        {message && <DrawerItem name="Message">{message}</DrawerItem>}

        {finishedAt && (
          <DrawerItem name="Finished">
            <DurationAbsoluteTimestamp timestamp={finishedAt} />
          </DrawerItem>
        )}

        {steps.length > 0 && (
          <>
            <DrawerTitle>Promotion Steps</DrawerTitle>
            <Table>
              <TableHead>
                <TableCell>Uses</TableCell>
                <TableCell>As</TableCell>
              </TableHead>
              {steps.map((step, i) => (
                <TableRow key={`${step.uses}-${i}`}>
                  <TableCell>{step.uses}</TableCell>
                  <TableCell>{step.as ?? "—"}</TableCell>
                </TableRow>
              ))}
            </Table>
          </>
        )}

        <DrawerTitle>Spec</DrawerTitle>
        <MonacoEditor
          className={styles.editor}
          style={{ height: getHeight(specYaml), minHeight: 100 }}
          value={specYaml}
          language="yaml"
          readOnly
        />
      </div>
    </>
  );
});
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/components/details/promotion-details.tsx src/renderer/components/details/promotion-details.module.scss
git commit -m "feat: add Promotion detail view"
```

---

### Task 28: Context Menu Actions

**Files:**
- Create: `src/renderer/menus/promote-freight-menu-item.tsx`
- Create: `src/renderer/menus/refresh-warehouse-menu-item.tsx`
- Create: `src/renderer/menus/approve-freight-menu-item.tsx`
- Create: `src/renderer/menus/abort-promotion-menu-item.tsx`

- [ ] **Step 1: Create promote-freight-menu-item.tsx**

```typescript
import { Renderer } from "@freelensapp/extensions";

import type { Stage } from "../k8s/kargo/stage-v1alpha1";

const {
  Component: { MenuItem, Icon },
} = Renderer;

type KargoKubeObject = Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  unknown,
  unknown
>;
type KargoKubeObjectCtor = typeof Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  unknown,
  unknown
>;

export interface PromoteFreightMenuItemProps extends Renderer.Component.KubeObjectMenuProps<Stage> {
  resource: KargoKubeObjectCtor;
}

export function PromoteFreightMenuItem(props: PromoteFreightMenuItemProps) {
  const { object, toolbar, resource } = props;
  if (!object) return <></>;

  const store = resource.getStore<KargoKubeObject>();
  if (!store) return <></>;

  const promote = async () => {
    await store.patch(
      object,
      {
        metadata: {
          annotations: { "kargo.akuity.io/request-promote": new Date().toISOString() },
        },
      } as any,
      "merge",
    );
  };

  return (
    <MenuItem onClick={promote}>
      <Icon material="rocket_launch" interactive={toolbar} title="Promote Freight" />
      <span className="title">Promote Freight</span>
    </MenuItem>
  );
}
```

- [ ] **Step 2: Create refresh-warehouse-menu-item.tsx**

```typescript
import { Renderer } from "@freelensapp/extensions";

import type { Warehouse } from "../k8s/kargo/warehouse-v1alpha1";

const {
  Component: { MenuItem, Icon },
} = Renderer;

type KargoKubeObject = Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  unknown,
  unknown
>;
type KargoKubeObjectCtor = typeof Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  unknown,
  unknown
>;

export interface RefreshWarehouseMenuItemProps extends Renderer.Component.KubeObjectMenuProps<Warehouse> {
  resource: KargoKubeObjectCtor;
}

export function RefreshWarehouseMenuItem(props: RefreshWarehouseMenuItemProps) {
  const { object, toolbar, resource } = props;
  if (!object) return <></>;

  const store = resource.getStore<KargoKubeObject>();
  if (!store) return <></>;

  const refresh = async () => {
    await store.patch(
      object,
      {
        metadata: {
          annotations: { "kargo.akuity.io/refresh": new Date().toISOString() },
        },
      } as any,
      "merge",
    );
  };

  return (
    <MenuItem onClick={refresh}>
      <Icon material="refresh" interactive={toolbar} title="Refresh Warehouse" />
      <span className="title">Refresh</span>
    </MenuItem>
  );
}
```

- [ ] **Step 3: Create approve-freight-menu-item.tsx**

```typescript
import { Renderer } from "@freelensapp/extensions";

import type { Freight } from "../k8s/kargo/freight-v1alpha1";

const {
  Component: { MenuItem, Icon },
} = Renderer;

type KargoKubeObject = Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  unknown,
  unknown
>;
type KargoKubeObjectCtor = typeof Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  unknown,
  unknown
>;

export interface ApproveFreightMenuItemProps extends Renderer.Component.KubeObjectMenuProps<Freight> {
  resource: KargoKubeObjectCtor;
}

export function ApproveFreightMenuItem(props: ApproveFreightMenuItemProps) {
  const { object, toolbar, resource } = props;
  if (!object) return <></>;

  const store = resource.getStore<KargoKubeObject>();
  if (!store) return <></>;

  const approve = async () => {
    await store.patch(
      object,
      {
        metadata: {
          annotations: { "kargo.akuity.io/approved": new Date().toISOString() },
        },
      } as any,
      "merge",
    );
  };

  return (
    <MenuItem onClick={approve}>
      <Icon material="check_circle" interactive={toolbar} title="Approve Freight" />
      <span className="title">Approve Freight</span>
    </MenuItem>
  );
}
```

- [ ] **Step 4: Create abort-promotion-menu-item.tsx**

```typescript
import { Renderer } from "@freelensapp/extensions";

import type { Promotion } from "../k8s/kargo/promotion-v1alpha1";

const {
  Component: { MenuItem, Icon },
} = Renderer;

type KargoKubeObject = Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  unknown,
  unknown
>;
type KargoKubeObjectCtor = typeof Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  unknown,
  unknown
>;

export interface AbortPromotionMenuItemProps extends Renderer.Component.KubeObjectMenuProps<Promotion> {
  resource: KargoKubeObjectCtor;
}

export function AbortPromotionMenuItem(props: AbortPromotionMenuItemProps) {
  const { object, toolbar, resource } = props;
  if (!object) return <></>;

  // Only show for non-terminal promotions
  const phase = (object as any).status?.phase;
  if (phase !== "Pending" && phase !== "Running") return <></>;

  const store = resource.getStore<KargoKubeObject>();
  if (!store) return <></>;

  const abort = async () => {
    await store.patch(
      object,
      {
        metadata: {
          annotations: { "kargo.akuity.io/abort": "true" },
        },
      } as any,
      "merge",
    );
  };

  return (
    <MenuItem onClick={abort}>
      <Icon material="cancel" interactive={toolbar} title="Abort Promotion" />
      <span className="title">Abort Promotion</span>
    </MenuItem>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/renderer/menus/promote-freight-menu-item.tsx src/renderer/menus/refresh-warehouse-menu-item.tsx src/renderer/menus/approve-freight-menu-item.tsx src/renderer/menus/abort-promotion-menu-item.tsx
git commit -m "feat: add context menu actions (promote, refresh, approve, abort)"
```

---

### Task 29: Pipeline Visualization Components

**Files:**
- Create: `src/renderer/components/pipeline/stage-node.tsx`
- Create: `src/renderer/components/pipeline/stage-node.module.scss`
- Create: `src/renderer/components/pipeline/freight-card.tsx`
- Create: `src/renderer/components/pipeline/freight-card.module.scss`
- Create: `src/renderer/components/pipeline/promotion-overlay.tsx`
- Create: `src/renderer/components/pipeline/promotion-overlay.module.scss`
- Create: `src/renderer/components/pipeline/pipeline-graph.tsx`
- Create: `src/renderer/components/pipeline/pipeline-graph.module.scss`

- [ ] **Step 1: Create stage-node.module.scss**

```scss
@use "../../vars";

.stageNode {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: vars.$padding * 2;
  border-radius: 8px;
  border: 2px solid var(--borderColor);
  background: var(--contentColor);
  cursor: pointer;
  min-width: 140px;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  &.healthy {
    border-color: #43a047;
  }

  &.unhealthy {
    border-color: #ce3933;
  }

  &.progressing {
    border-color: #FF6600;
  }

  &.unknown {
    border-color: var(--borderColor);
  }
}

.stageName {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 4px;
  color: var(--textColorPrimary);
}

.stagePhase {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--layoutBackground);
}
```

- [ ] **Step 2: Create stage-node.tsx**

```typescript
import { Common } from "@freelensapp/extensions";
import type { Stage } from "../../k8s/kargo/stage-v1alpha1";
import styles from "./stage-node.module.scss";
import stylesInline from "./stage-node.module.scss?inline";

const {
  Util: { cssNames },
} = Common;

export interface StageNodeProps {
  stage: Stage;
  onClick?: (stage: Stage) => void;
}

export function StageNode({ stage, onClick }: StageNodeProps) {
  const health = stage.status?.health?.status ?? "Unknown";
  const phase = stage.status?.phase ?? "";

  const healthClass = health === "Healthy" ? styles.healthy
    : health === "Unhealthy" ? styles.unhealthy
    : health === "Progressing" ? styles.progressing
    : styles.unknown;

  return (
    <>
      <style>{stylesInline}</style>
      <div
        className={cssNames(styles.stageNode, healthClass)}
        onClick={() => onClick?.(stage)}
      >
        <div className={styles.stageName}>{stage.getName()}</div>
        <div className={styles.stagePhase}>{phase || "—"}</div>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Create freight-card.module.scss**

```scss
.freightCard {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 4px;
  background: var(--layoutBackground);
  border: 1px solid var(--borderFaintColor);
  font-size: 11px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: var(--borderFaintColor);
  }
}

.alias {
  font-weight: 600;
}

.summary {
  color: var(--textColorSecondary);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

- [ ] **Step 4: Create freight-card.tsx**

```typescript
import type { FreightReference } from "../../k8s/kargo/types";
import styles from "./freight-card.module.scss";
import stylesInline from "./freight-card.module.scss?inline";

export interface FreightCardProps {
  freight: FreightReference;
  onClick?: () => void;
}

export function FreightCard({ freight, onClick }: FreightCardProps) {
  const name = freight.name?.substring(0, 7) ?? "";
  const summary = freight.images?.[0]
    ? `${freight.images[0].repoURL ?? ""}:${freight.images[0].tag ?? ""}`
    : freight.commits?.[0]?.id?.substring(0, 7)
    ?? freight.charts?.[0]?.version
    ?? "";

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.freightCard} onClick={onClick}>
        <span className={styles.alias}>{name}</span>
        {summary && <span className={styles.summary}>{summary}</span>}
      </div>
    </>
  );
}
```

- [ ] **Step 5: Create promotion-overlay.module.scss**

```scss
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.overlay {
  position: absolute;
  top: -4px;
  right: -4px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  color: white;
  animation: pulse 2s infinite;

  &.running {
    background: #FF6600;
  }

  &.pending {
    background: #3d90ce;
  }
}
```

- [ ] **Step 6: Create promotion-overlay.tsx**

```typescript
import { Common } from "@freelensapp/extensions";
import styles from "./promotion-overlay.module.scss";
import stylesInline from "./promotion-overlay.module.scss?inline";

const {
  Util: { cssNames },
} = Common;

export interface PromotionOverlayProps {
  phase?: string;
}

export function PromotionOverlay({ phase }: PromotionOverlayProps) {
  if (phase !== "Running" && phase !== "Pending") return null;

  const phaseClass = phase === "Running" ? styles.running : styles.pending;

  return (
    <>
      <style>{stylesInline}</style>
      <div className={cssNames(styles.overlay, phaseClass)}>{phase}</div>
    </>
  );
}
```

- [ ] **Step 7: Create pipeline-graph.module.scss**

```scss
@use "../../vars";

.pipelineContainer {
  position: relative;
  overflow: auto;
  padding: vars.$padding * 3;
  background: var(--contentColor);
  border-radius: 8px;
  min-height: 200px;
}

.pipelineRow {
  display: flex;
  align-items: center;
  gap: 32px;
  flex-wrap: nowrap;
  min-width: min-content;
}

.warehouseNode {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: vars.$padding * 2;
  border-radius: 4px;
  border: 2px solid var(--borderColor);
  background: var(--layoutBackground);
  min-width: 120px;
  cursor: pointer;

  &:hover {
    border-color: var(--textColorPrimary);
  }
}

.warehouseName {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 4px;
}

.warehouseType {
  font-size: 11px;
  color: var(--textColorSecondary);
}

.arrow {
  display: flex;
  align-items: center;
  color: var(--textColorSecondary);
  font-size: 20px;
  user-select: none;
}

.stageGroup {
  display: flex;
  align-items: center;
  gap: 24px;
}

.stageWrapper {
  position: relative;
}

.freightDock {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.projectSelector {
  margin-bottom: vars.$margin * 2;
}

.noData {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  color: var(--textColorSecondary);
}
```

- [ ] **Step 8: Create pipeline-graph.tsx**

```typescript
import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { useEffect, useRef, useState } from "react";
import { Freight } from "../../k8s/kargo/freight-v1alpha1";
import { Stage } from "../../k8s/kargo/stage-v1alpha1";
import { Warehouse } from "../../k8s/kargo/warehouse-v1alpha1";
import { FreightCard } from "./freight-card";
import { PromotionOverlay } from "./promotion-overlay";
import { StageNode } from "./stage-node";
import styles from "./pipeline-graph.module.scss";
import stylesInline from "./pipeline-graph.module.scss?inline";

const {
  Component: { NamespaceSelectFilter },
  Navigation: { getDetailsUrl },
} = Renderer;

const {
  Util: { cssNames },
} = Common;

export interface PipelineGraphProps {
  stages: Stage[];
  warehouses: Warehouse[];
  freight: Freight[];
}

export const PipelineGraph = observer(({ stages, warehouses, freight }: PipelineGraphProps) => {
  const navigate = Renderer.Navigation.navigate;

  const handleStageClick = (stage: Stage) => {
    const url = stage.selfLink;
    if (url) navigate(getDetailsUrl(url));
  };

  const handleWarehouseClick = (warehouse: Warehouse) => {
    const url = warehouse.selfLink;
    if (url) navigate(getDetailsUrl(url));
  };

  if (stages.length === 0 && warehouses.length === 0) {
    return (
      <>
        <style>{stylesInline}</style>
        <div className={styles.noData}>No Kargo resources found in selected namespace</div>
      </>
    );
  }

  // Build adjacency: warehouse -> stages that subscribe to it, stage -> downstream stages
  const warehouseStages = new Map<string, Stage[]>();
  const rootStages: Stage[] = [];
  const downstreamMap = new Map<string, Stage[]>();

  for (const stage of stages) {
    const warehouseSub = Stage.getWarehouseSubscription(stage);
    if (warehouseSub) {
      const existing = warehouseStages.get(warehouseSub) ?? [];
      existing.push(stage);
      warehouseStages.set(warehouseSub, existing);
    }

    const upstream = Stage.getUpstreamStages(stage);
    if (upstream.length === 0 && !warehouseSub) {
      rootStages.push(stage);
    }

    for (const upName of upstream) {
      const existing = downstreamMap.get(upName) ?? [];
      existing.push(stage);
      downstreamMap.set(upName, existing);
    }
  }

  // Flatten into pipeline rows: warehouse → first-level stages → downstream stages
  const renderPipelineRow = (startStages: Stage[], warehouseName?: string) => {
    const visited = new Set<string>();
    const levels: Stage[][] = [startStages];

    // BFS to build levels
    let currentLevel = startStages;
    while (currentLevel.length > 0) {
      const nextLevel: Stage[] = [];
      for (const s of currentLevel) {
        visited.add(s.getName());
        const downstream = downstreamMap.get(s.getName()) ?? [];
        for (const ds of downstream) {
          if (!visited.has(ds.getName())) {
            nextLevel.push(ds);
          }
        }
      }
      if (nextLevel.length > 0) levels.push(nextLevel);
      currentLevel = nextLevel;
    }

    return (
      <div key={warehouseName ?? "root"} className={styles.pipelineRow}>
        {warehouseName && (
          <>
            {warehouses
              .filter((w) => w.getName() === warehouseName)
              .map((w) => (
                <div
                  key={w.getName()}
                  className={styles.warehouseNode}
                  onClick={() => handleWarehouseClick(w)}
                >
                  <div className={styles.warehouseName}>{w.getName()}</div>
                  <div className={styles.warehouseType}>{Warehouse.getSubscriptionsSummary(w)}</div>
                </div>
              ))}
            <div className={styles.arrow}>→</div>
          </>
        )}
        {levels.map((level, levelIdx) => (
          <div key={levelIdx} className={styles.stageGroup}>
            {levelIdx > 0 && <div className={styles.arrow}>→</div>}
            {level.map((stage) => {
              const currentFreight = Stage.getCurrentFreight(stage);
              const currentPromoPhase = (stage.status?.currentPromotion as any)?.phase;
              return (
                <div key={stage.getName()} className={styles.stageWrapper}>
                  <PromotionOverlay phase={currentPromoPhase} />
                  <StageNode stage={stage} onClick={handleStageClick} />
                  {currentFreight?.name && (
                    <div className={styles.freightDock}>
                      <FreightCard
                        freight={currentFreight}
                        onClick={() => {
                          const f = freight.find((fr) => fr.getName() === currentFreight.name);
                          if (f?.selfLink) navigate(getDetailsUrl(f.selfLink));
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.pipelineContainer}>
        {Array.from(warehouseStages.entries()).map(([wName, wStages]) =>
          renderPipelineRow(wStages, wName),
        )}
        {rootStages.length > 0 && renderPipelineRow(rootStages)}
      </div>
    </>
  );
});
```

- [ ] **Step 9: Commit**

```bash
git add src/renderer/components/pipeline/
git commit -m "feat: add pipeline visualization components (graph, stage node, freight card, promotion overlay)"
```

---

### Task 30: Overview Dashboard Page

**Files:**
- Create: `src/renderer/pages/overview.tsx`
- Create: `src/renderer/pages/overview.module.scss`

- [ ] **Step 1: Create overview.module.scss**

```scss
@use "../vars";

.overviewStatuses {
  background: var(--contentColor);
}

.statuses {
  display: grid;
  grid-template-columns: repeat(auto-fit, 120px);
  justify-content: space-evenly;
  grid-gap: 8px;
  padding: 16px;
}

.chartColumn {
  align-self: end;
}

.kargoContent {
  --flex-gap: #{vars.$padding * 2};
  min-height: 100%;
  height: 100%;
  overflow-y: auto;

  header {
    background: var(--contentColor);
    position: relative;
    padding: vars.$padding * 2;
    text-align: center;
    padding-bottom: 3em;

    h5 {
      color: var(--textColorPrimary);
    }
  }
}

.pipelineSection {
  padding: vars.$padding * 2;
}
```

- [ ] **Step 2: Create overview.tsx**

```typescript
import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { useEffect, useRef, useState } from "react";
import { KargoEvents } from "../components/kargo-events";
import { InfoPage } from "../components/info-page";
import { StageHealthPieChart, PromotionResultsPieChart } from "../components/pie-chart";
import { PipelineGraph } from "../components/pipeline/pipeline-graph";
import { Freight } from "../k8s/kargo/freight-v1alpha1";
import { Promotion } from "../k8s/kargo/promotion-v1alpha1";
import { Stage } from "../k8s/kargo/stage-v1alpha1";
import { Warehouse } from "../k8s/kargo/warehouse-v1alpha1";
import styles from "./overview.module.scss";
import stylesInline from "./overview.module.scss?inline";

const {
  Component: { NamespaceSelectFilter, TabLayout },
} = Renderer;

const {
  Util: { cssNames },
} = Common;

export const KargoOverviewPage = observer(() => {
  const [loaded, setLoaded] = useState(false);
  const watches = useRef<(() => void)[]>([]);
  const abortController = useRef(new AbortController());

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const namespaceStore = Renderer.K8sApi.namespaceStore;
      await namespaceStore.loadAll({ namespaces: [], reqInit: { signal: abortController.current.signal } });
      watches.current.push(namespaceStore.subscribe());

      const namespaces = namespaceStore.items.map((ns) => ns.getName());

      for (const object of [Stage, Warehouse, Freight, Promotion]) {
        try {
          const store = object.getStore();
          if (!store) continue;
          await store.loadAll({ namespaces, reqInit: { signal: abortController.current.signal } });
          watches.current.push(store.subscribe());
        } catch (_) {
          continue;
        }
      }

      if (isMounted) setLoaded(true);
    })();

    return () => {
      isMounted = false;
      abortController.current.abort();
      watches.current.forEach((w) => w());
      watches.current = [];
    };
  }, []);

  if (!loaded) {
    return <InfoPage message="Loading Kargo components..." />;
  }

  let stages: Stage[] = [];
  let warehouses: Warehouse[] = [];
  let freight: Freight[] = [];
  let promotions: Promotion[] = [];

  try {
    const stageStore = Stage.getStore<Stage>();
    if (stageStore) stages = stageStore.contextItems;
  } catch (_) {}

  try {
    const warehouseStore = Warehouse.getStore<Warehouse>();
    if (warehouseStore) warehouses = warehouseStore.contextItems;
  } catch (_) {}

  try {
    const freightStore = Freight.getStore<Freight>();
    if (freightStore) freight = freightStore.contextItems;
  } catch (_) {}

  try {
    const promotionStore = Promotion.getStore<Promotion>();
    if (promotionStore) promotions = promotionStore.contextItems;
  } catch (_) {}

  return (
    <>
      <style>{stylesInline}</style>
      <TabLayout>
        <div className={styles.kargoContent}>
          <header>
            <h5>Kargo Overview</h5>
            <NamespaceSelectFilter id="kargo-overview-namespace-select-filter-input" />
          </header>

          <div className={styles.pipelineSection}>
            <PipelineGraph stages={stages} warehouses={warehouses} freight={freight} />
          </div>

          <div className={styles.overviewStatuses}>
            <div className={styles.statuses}>
              {stages.length > 0 && (
                <div className={cssNames(styles.chartColumn, "column")}>
                  <StageHealthPieChart title="Stage Health" objects={stages} />
                </div>
              )}
              {promotions.length > 0 && (
                <div className={cssNames(styles.chartColumn, "column")}>
                  <PromotionResultsPieChart title="Promotion Results" objects={promotions} />
                </div>
              )}
            </div>
          </div>

          <KargoEvents compact compactLimit={100} />
        </div>
      </TabLayout>
    </>
  );
});
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/pages/overview.tsx src/renderer/pages/overview.module.scss
git commit -m "feat: add Kargo overview dashboard with pipeline visualization and charts"
```

---

### Task 31: Extension Registration (renderer/index.tsx)

**Files:**
- Create: `src/renderer/index.tsx`

- [ ] **Step 1: Create src/renderer/index.tsx**

```typescript
import { Renderer } from "@freelensapp/extensions";
import { AnalysisTemplateDetails } from "./components/details/analysis-template-details";
import { FreightDetails } from "./components/details/freight-details";
import { ProjectDetails } from "./components/details/project-details";
import { PromotionDetails } from "./components/details/promotion-details";
import { PromotionPolicyDetails } from "./components/details/promotion-policy-details";
import { StageDetails } from "./components/details/stage-details";
import { WarehouseDetails } from "./components/details/warehouse-details";
import svgIcon from "./icons/kargo.svg?raw";
import { AnalysisTemplate } from "./k8s/kargo/analysis-template-v1alpha1";
import { Freight } from "./k8s/kargo/freight-v1alpha1";
import { Project } from "./k8s/kargo/project-v1alpha1";
import { Promotion } from "./k8s/kargo/promotion-v1alpha1";
import { PromotionPolicy } from "./k8s/kargo/promotion-policy-v1alpha1";
import { Stage } from "./k8s/kargo/stage-v1alpha1";
import { Warehouse } from "./k8s/kargo/warehouse-v1alpha1";
import { AbortPromotionMenuItem, type AbortPromotionMenuItemProps } from "./menus/abort-promotion-menu-item";
import { ApproveFreightMenuItem, type ApproveFreightMenuItemProps } from "./menus/approve-freight-menu-item";
import { PromoteFreightMenuItem, type PromoteFreightMenuItemProps } from "./menus/promote-freight-menu-item";
import { RefreshWarehouseMenuItem, type RefreshWarehouseMenuItemProps } from "./menus/refresh-warehouse-menu-item";
import { AnalysisTemplatesPage } from "./pages/analysis-templates";
import { FreightPage } from "./pages/freight";
import { KargoOverviewPage } from "./pages/overview";
import { ProjectsPage } from "./pages/projects";
import { PromotionPoliciesPage } from "./pages/promotion-policies";
import { PromotionsPage } from "./pages/promotions";
import { StagesPage } from "./pages/stages";
import { WarehousesPage } from "./pages/warehouses";

const {
  Component: { Icon },
} = Renderer;

export function KargoIcon(props: Renderer.Component.IconProps) {
  return <Icon {...props} svg={svgIcon} />;
}

export default class KargoExtension extends Renderer.LensExtension {
  clusterPages = [
    {
      id: "dashboard",
      components: {
        Page: () => <KargoOverviewPage />,
      },
    },
    {
      id: "projects",
      components: {
        Page: () => <ProjectsPage />,
      },
    },
    {
      id: "stages",
      components: {
        Page: () => <StagesPage />,
      },
    },
    {
      id: "freight",
      components: {
        Page: () => <FreightPage />,
      },
    },
    {
      id: "warehouses",
      components: {
        Page: () => <WarehousesPage />,
      },
    },
    {
      id: "promotions",
      components: {
        Page: () => <PromotionsPage />,
      },
    },
    {
      id: "promotion-policies",
      components: {
        Page: () => <PromotionPoliciesPage />,
      },
    },
    {
      id: "analysis-templates",
      components: {
        Page: () => <AnalysisTemplatesPage />,
      },
    },
  ];

  clusterPageMenus = [
    {
      id: "kargo",
      title: "Kargo",
      target: { pageId: "dashboard" },
      components: {
        Icon: KargoIcon,
      },
    },
    {
      id: "dashboard",
      parentId: "kargo",
      target: { pageId: "dashboard" },
      title: "Overview",
      components: {},
    },
    {
      id: "projects",
      parentId: "kargo",
      target: { pageId: "projects" },
      title: Project.crd.title,
      components: {},
    },
    {
      id: "stages",
      parentId: "kargo",
      target: { pageId: "stages" },
      title: Stage.crd.title,
      components: {},
    },
    {
      id: "freight",
      parentId: "kargo",
      target: { pageId: "freight" },
      title: Freight.crd.title,
      components: {},
    },
    {
      id: "warehouses",
      parentId: "kargo",
      target: { pageId: "warehouses" },
      title: Warehouse.crd.title,
      components: {},
    },
    {
      id: "promotions",
      parentId: "kargo",
      target: { pageId: "promotions" },
      title: Promotion.crd.title,
      components: {},
    },
    {
      id: "promotion-policies",
      parentId: "kargo",
      target: { pageId: "promotion-policies" },
      title: PromotionPolicy.crd.title,
      components: {},
    },
    {
      id: "analysis-templates",
      parentId: "kargo",
      target: { pageId: "analysis-templates" },
      title: AnalysisTemplate.crd.title,
      components: {},
    },
  ];

  kubeObjectDetailItems = [
    {
      kind: Project.kind,
      apiVersions: Project.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Project>) => <ProjectDetails {...props} />,
      },
    },
    {
      kind: Stage.kind,
      apiVersions: Stage.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Stage>) => <StageDetails {...props} />,
      },
    },
    {
      kind: Freight.kind,
      apiVersions: Freight.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Freight>) => <FreightDetails {...props} />,
      },
    },
    {
      kind: Warehouse.kind,
      apiVersions: Warehouse.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Warehouse>) => <WarehouseDetails {...props} />,
      },
    },
    {
      kind: Promotion.kind,
      apiVersions: Promotion.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Promotion>) => <PromotionDetails {...props} />,
      },
    },
    {
      kind: PromotionPolicy.kind,
      apiVersions: PromotionPolicy.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<PromotionPolicy>) => (
          <PromotionPolicyDetails {...props} />
        ),
      },
    },
    {
      kind: AnalysisTemplate.kind,
      apiVersions: AnalysisTemplate.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<AnalysisTemplate>) => (
          <AnalysisTemplateDetails {...props} />
        ),
      },
    },
  ];

  kubeObjectMenuItems = [
    {
      kind: Stage.kind,
      apiVersions: Stage.crd.apiVersions,
      components: {
        MenuItem: (props: PromoteFreightMenuItemProps) => (
          <PromoteFreightMenuItem {...props} resource={Stage} />
        ),
      },
    },
    {
      kind: Warehouse.kind,
      apiVersions: Warehouse.crd.apiVersions,
      components: {
        MenuItem: (props: RefreshWarehouseMenuItemProps) => (
          <RefreshWarehouseMenuItem {...props} resource={Warehouse} />
        ),
      },
    },
    {
      kind: Freight.kind,
      apiVersions: Freight.crd.apiVersions,
      components: {
        MenuItem: (props: ApproveFreightMenuItemProps) => (
          <ApproveFreightMenuItem {...props} resource={Freight} />
        ),
      },
    },
    {
      kind: Promotion.kind,
      apiVersions: Promotion.crd.apiVersions,
      components: {
        MenuItem: (props: AbortPromotionMenuItemProps) => (
          <AbortPromotionMenuItem {...props} resource={Promotion} />
        ),
      },
    },
  ];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/index.tsx
git commit -m "feat: add extension registration with all pages, menus, details, and actions"
```

---

### Task 32: Build Verification

- [ ] **Step 1: Run type check**

Run: `pnpm type:check`
Expected: No TypeScript errors.

- [ ] **Step 2: Run full build**

Run: `pnpm build:force`
Expected: Successful build, `out/` directory created with `main/index.js` and `renderer/index.js`.

- [ ] **Step 3: Fix any build errors**

If there are type errors or build failures, fix them. Common issues:
- Missing SCSS module type declarations (create `.d.ts` stubs if needed)
- Import path issues
- Type mismatches with Freelens API

- [ ] **Step 4: Verify output structure**

Run: `ls -la out/main/ out/renderer/`
Expected: Both directories contain `.js` files.

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve build errors"
```

---

### Task 33: Update README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README.md**

```markdown
# Freelens Kargo Extension

Freelens extension for [Kargo](https://kargo.io/) — a continuous promotion tool for Kubernetes.

## Features

- **Dashboard** with interactive pipeline visualization, Stage health charts, and Promotion results
- **List views** for all Kargo resources: Projects, Stages, Freight, Warehouses, Promotions, Promotion Policies, Analysis Templates
- **Detail views** with structured data display and Monaco YAML editor for each resource
- **Context menu actions**: Promote Freight, Refresh Warehouse, Approve Freight, Abort Promotion
- **Event stream** filtered to Kargo-related events

## Installation

Download the latest `.tgz` from [Releases](https://github.com/jhajali/freelens-kargo-extension/releases) and install it in Freelens via **Extensions** → **Install from file**.

## Development

```bash
pnpm install
pnpm build        # Build with type checking
pnpm build:force  # Build without type checking
pnpm pack:dev     # Version bump + build + pack
```

## Requirements

- Node.js >= 22.16.0
- Freelens >= 1.6.0
- Kargo installed in your cluster (kargo.akuity.io/v1alpha1)

## License

MIT
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update README with features and installation instructions"
```
