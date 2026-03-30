# Freelens Kargo Extension — Design Spec

## Overview

A Freelens extension that provides full visibility and control over Kargo resources within the Freelens Kubernetes IDE. Mirrors the architecture of the existing [freelens-argocd-extension](https://github.com/jhajali/freelens-argocd-extension) — same build tooling, same CRD-as-class pattern, same store-based data loading — with Kargo-specific features including an interactive pipeline visualization, editable Monaco editors, and context menu actions for core Kargo workflows.

**Target API:** `kargo.akuity.io/v1alpha1`

---

## Project Structure

```
freelens-kargo-extension/
├── src/
│   ├── main/
│   │   └── index.ts                          # Main process (empty shell)
│   └── renderer/
│       ├── index.tsx                          # Extension registration
│       ├── utils.ts                           # Utility functions
│       ├── vars.scss                          # SCSS variables
│       ├── icons/
│       │   └── kargo.svg                      # Kargo logo
│       ├── k8s/kargo/
│       │   ├── types.ts                       # Shared Kargo type interfaces
│       │   ├── project-v1alpha1.ts            # Project CRD class
│       │   ├── stage-v1alpha1.ts              # Stage CRD class
│       │   ├── freight-v1alpha1.ts            # Freight CRD class
│       │   ├── warehouse-v1alpha1.ts          # Warehouse CRD class
│       │   ├── promotion-v1alpha1.ts          # Promotion CRD class
│       │   ├── promotion-policy-v1alpha1.ts   # PromotionPolicy CRD class
│       │   └── analysis-template-v1alpha1.ts  # AnalysisTemplate CRD class
│       ├── components/
│       │   ├── details/
│       │   │   ├── project-details.tsx
│       │   │   ├── stage-details.tsx
│       │   │   ├── freight-details.tsx
│       │   │   ├── warehouse-details.tsx
│       │   │   ├── promotion-details.tsx
│       │   │   ├── promotion-policy-details.tsx
│       │   │   ├── analysis-template-details.tsx
│       │   │   └── [*.module.scss + .module.d.scss.ts]
│       │   ├── pipeline/
│       │   │   ├── pipeline-graph.tsx          # Main DAG container
│       │   │   ├── stage-node.tsx              # Clickable Stage node
│       │   │   ├── freight-card.tsx            # Freight card between stages
│       │   │   ├── promotion-overlay.tsx       # Promotion status overlay
│       │   │   └── [*.module.scss]
│       │   ├── kargo-events.tsx               # Filtered event stream
│       │   ├── pie-chart.tsx                  # Status pie charts
│       │   ├── duration-absolute.tsx          # Relative + absolute timestamps
│       │   ├── status-conditions.ts           # Status CSS class mapping
│       │   ├── error-page.tsx                 # Error boundary
│       │   └── info-page.tsx                  # Loading/info display
│       ├── menus/
│       │   ├── promote-freight-menu-item.tsx
│       │   ├── refresh-warehouse-menu-item.tsx
│       │   ├── approve-freight-menu-item.tsx
│       │   └── abort-promotion-menu-item.tsx
│       └── pages/
│           ├── overview.tsx                   # Dashboard: pipeline + charts
│           ├── projects.tsx
│           ├── stages.tsx
│           ├── freight.tsx
│           ├── warehouses.tsx
│           ├── promotions.tsx
│           ├── promotion-policies.tsx
│           ├── analysis-templates.tsx
│           └── [*.module.scss]
├── electron.vite.config.js
├── tsconfig.json
├── package.json
├── biome.jsonc
├── Makefile
└── .github/workflows/
    ├── check.yaml
    └── release.yaml
```

---

## Build Configuration

Identical to the ArgoCD extension:

- **Build tool:** `electron-vite@^5.0.0`
- **Package manager:** `pnpm`
- **Styling:** `sass` with CSS Modules (`.module.scss` + TypeScript type generation)
- **Linting/Formatting:** `biome`
- **Node.js:** >= 22.16.0
- **Freelens:** >= 1.6.0

**Key dependencies:**
- `@freelensapp/extensions@^1.5.3`
- `@freelensapp/kube-object@^1.6.2`
- `react@17.0.2`
- `mobx@6.13.7` + `mobx-react@7.6.0`
- `moment@^2.30.1`
- `js-yaml@^4.1.1`

**Externals (resolved via globals at runtime):**
- `@freelensapp/extensions`, `electron`, `mobx`, `mobx-react`, `react`, `react-dom`, `react-router-dom`

**Build scripts:**
```json
{
  "type:check": "tsc --noEmit -p tsconfig.json --composite false",
  "prebuild": "pnpm type:check",
  "build": "electron-vite build",
  "build:force": "electron-vite build",
  "clean": "rm -rf out",
  "pack:dev": "pnpm version prerelease --no-commit-hooks --no-git-tag-version && pnpm build:force && pnpm pack"
}
```

---

## CRD Classes & Type System

All CRDs under API group `kargo.akuity.io/v1alpha1`. Each extends `LensExtensionKubeObject` with static helper methods.

### Project

- **Spec:** promotionPolicies (per-stage auto-promotion rules)
- **Status:** phase (Initializing/Ready/Error), conditions
- **Helpers:** `getPhase()`, `getConditions()`

### Stage

- **Spec:** subscriptions (upstream stages + freight sources), promotionMechanisms (Git commits, Helm updates, Kustomize images, Argo CD app updates), verification (analysisTemplates, analysisRunMetadata)
- **Status:** currentFreight, health (Healthy/Unhealthy/Progressing/Unknown), phase (NotApplicable/Steady/Promoting/Verifying), currentPromotion, lastPromotion
- **Helpers:** `getPhase()`, `getHealth()`, `getCurrentFreight()`, `getUpstreamStages()`, `getPromotionMechanisms()`, `getVerificationStatus()`

### Freight

- **Spec:** origin (warehouse reference), commits (git repo + ID + message), images (repo + tag + digest), charts (name + version + repo)
- **Status:** verifiedIn (map of stage names), approvedFor (map of stage names)
- **Helpers:** `getOriginWarehouse()`, `getCommits()`, `getImages()`, `getCharts()`, `isVerifiedIn(stage)`, `isApprovedFor(stage)`, `getAlias()`

### Warehouse

- **Spec:** subscriptions (git repos, image repos, chart repos), freightCreationPolicy (Automatic/Manual), interval
- **Status:** lastFreight, observedGeneration, lastHandledRefresh
- **Helpers:** `getSubscriptions()`, `getFreightCreationPolicy()`, `getLastFreightID()`

### Promotion

- **Spec:** stage (target), freight (reference), steps (promotion steps array)
- **Status:** phase (Pending/Running/Succeeded/Failed/Errored/Aborted), message, freight, finishedAt
- **Helpers:** `getPhase()`, `getTargetStage()`, `getFreightRef()`, `getMessage()`, `isTerminal()`

### PromotionPolicy

- **Spec:** stage (reference), enableAutoPromotion (boolean)
- **Helpers:** `getStage()`, `isAutoPromotionEnabled()`

### AnalysisTemplate

- **Spec:** metrics (name, provider, successCondition, failureLimit), args (name, value)
- **Helpers:** `getMetrics()`, `getArgs()`

### Status CSS Mapping

| Resource | Value | CSS Class |
|----------|-------|-----------|
| Stage health | Healthy | success |
| Stage health | Unhealthy | error |
| Stage health | Progressing | warning |
| Stage health | Unknown | info |
| Stage phase | Steady | success |
| Stage phase | Promoting | warning |
| Stage phase | Verifying | info |
| Promotion phase | Succeeded | success |
| Promotion phase | Failed/Errored | error |
| Promotion phase | Running | warning |
| Promotion phase | Pending | info |
| Promotion phase | Aborted | error |
| Freight | Verified | success |
| Freight | Not verified | warning |

---

## Extension Registration

### Cluster Pages (8)

1. **dashboard** — Overview with pipeline visualization + status charts
2. **projects** — Projects list view
3. **stages** — Stages list view
4. **freight** — Freight list view
5. **warehouses** — Warehouses list view
6. **promotions** — Promotions list view
7. **promotion-policies** — PromotionPolicies list view
8. **analysis-templates** — AnalysisTemplates list view

### Cluster Page Menus

- Parent menu **"Kargo"** with Kargo SVG icon
- 8 submenu items linking to each page

### Kube Object Detail Items (7)

One custom detail panel per CRD with:
- Structured data display of key spec/status fields
- Related resources tables linking to associated objects
- Editable Monaco editor (YAML) with Save button that patches via K8s API store
- Error handling for validation failures shown inline below the editor

### Kube Object Menu Items (4)

- **Promote Freight** (on Stage)
- **Refresh Warehouse** (on Warehouse)
- **Approve Freight** (on Freight)
- **Abort Promotion** (on Promotion)

---

## Dashboard & Pipeline Visualization

The overview page has two sections:

### Top: Interactive Pipeline Graph

**Layout:** Horizontal left-to-right DAG in a scrollable/zoomable container.

**Nodes:**
- **Warehouse nodes** (left side) — rectangular, subscription type icons (git/image/chart), colored by freshness
- **Stage nodes** (middle/right) — rounded rectangles, colored by health status, showing stage name + phase badge
- **Edges** — arrows between Warehouses → Stages and Stage → Stage (based on subscriptions), animated during active promotions

**Freight Cards:**
- Small cards on edges or docked at Stage nodes showing Freight alias
- Compact summary: commit SHA, image tag, or chart version
- CSS animation "moving" between stages during active promotions

**Promotion Overlays:**
- Active promotion: pulsing border + overlay badge (Running/Pending)
- Click Stage node → inline detail panel with current Freight, last promotion result, "Promote" quick-action button

**Interactivity:**
- Click Stage → inline detail panel
- Click Freight card → navigate to Freight detail view
- Click Warehouse → navigate to Warehouse detail view
- Right-click nodes → context menu with relevant actions
- Project selector dropdown to filter by Kargo Project

**Implementation:** Pure React + CSS. CSS Grid/Flexbox for node layout, SVG for edges. MobX observables drive re-renders.

### Bottom: Status Charts + Events

**Left column — two pie charts:**
- Stage Health distribution (Healthy/Unhealthy/Progressing/Unknown)
- Promotion Results (Succeeded/Failed/Errored/Aborted/Running) for recent promotions

**Right column — Kargo Events:**
- Filtered event stream: `involvedObject.apiVersion` contains `kargo.akuity.io/`
- Same table pattern as ArgoCD extension events component

---

## List Views

All use `KubeObjectListLayout` with sortable columns and search:

| View | Columns |
|------|---------|
| Projects | Name, Phase (badge), Promotion Policies count, Age |
| Stages | Name, Namespace, Project, Phase (badge), Health (badge), Current Freight, Upstream Stages, Age |
| Freight | Name, Namespace, Origin Warehouse, Alias, Commits, Images, Charts, Verified In (count), Approved For (count), Age |
| Warehouses | Name, Namespace, Freight Creation Policy, Subscriptions summary, Last Freight, Age |
| Promotions | Name, Namespace, Stage, Freight, Phase (badge), Message (truncated), Started, Finished, Age |
| Promotion Policies | Name, Namespace, Stage, Auto-Promotion (enabled/disabled badge), Age |
| Analysis Templates | Name, Namespace, Metrics count, Args count, Age |

---

## Detail Views

Each detail view has three sections:

### 1. Structured Fields

Key spec/status fields as labeled rows, status badges, and collapsible sub-sections.

### 2. Related Resources

Tables linking to associated objects:
- Stage → current Freight, recent Promotions, associated AnalysisTemplates
- Freight → Stages verified/approved in, originating Warehouse
- Warehouse → recent Freight produced
- Promotion → target Stage, referenced Freight
- Project → child Stages, Warehouses, PromotionPolicies

### 3. Editable Monaco Editor

Full resource spec in YAML. Save button patches via K8s API store. Validation failures shown inline below editor.

---

## Context Menu Actions

### Promote Freight (on Stage)

1. Fetch available Freight (verified in upstream stages or approved for this stage)
2. Open dialog listing Freight with alias, commits, images, charts
3. User selects Freight → create `Promotion` resource via K8s API
4. Dialog closes

### Refresh Warehouse (on Warehouse)

Patch annotation `kargo.akuity.io/refresh` with timestamp via `store.patch()` merge strategy.

### Approve Freight (on Freight)

1. Open dialog listing Stages in the same Project not yet approved
2. User selects Stage → patch annotation `kargo.akuity.io/approved-for` with stage name

### Abort Promotion (on Promotion)

Only shown when phase is `Pending` or `Running`. Confirmation dialog ("Are you sure?"). Patch annotation `kargo.akuity.io/abort` with `"true"`.

---

## CI/CD

Same as ArgoCD extension:

**check.yaml** — runs on push/PR to main: install → type-check → build (Node 22 + pnpm cached)

**release.yaml** — runs on version tags (v*): install → build → pack → GitHub release with .tgz artifact
