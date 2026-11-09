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
pnpm type:check   # Type check every program (main, renderer, tests, tooling, environment tests)
pnpm build        # Build dist/main.js, dist/renderer.js and dist/renderer.css
pnpm test:unit    # Unit tests
pnpm dev          # Rebuild on change, for a directory install
pnpm pack:dev     # Version bump + build + pack
```

For the development loop, install the checkout's directory from the Extensions page of Freelens and run
`pnpm dev`: every rebuild reloads the extension.

## Requirements

- Node.js >= 24
- Freelens >= 2.0.0
- Kargo installed in your cluster (kargo.akuity.io/v1alpha1)

## License

MIT
