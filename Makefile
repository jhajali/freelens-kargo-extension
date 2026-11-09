.PHONY: install build clean pack type-check lint test help

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	pnpm install

build: ## Build dist/ (no type check)
	pnpm build

type-check: ## Run TypeScript type checker for every program
	pnpm type:check

test: ## Run unit tests
	pnpm test:unit

clean: ## Remove build output
	rm -rf dist
	rm -f *.tgz

pack: build ## Build and pack into .tgz
	pnpm pack

lint: ## Run linter
	pnpm lint:check
