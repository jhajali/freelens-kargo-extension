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
