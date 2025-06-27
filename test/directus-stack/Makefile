# 🚀 Directus Docker Stacks - Makefile
# Quick commands for managing different stacks

.PHONY: help dev dragonfly headless simple prod status logs stop clean backup check-performance purge-cache

# Default target
help: ## Show this help message
	@echo "🚀 Directus Docker Stacks - Available Commands"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development environments
dev: ## Start development environment (Redis)
	@echo "🧪 Starting development environment..."
	cd environments/dev && docker compose up -d
	@echo "✅ Development ready at http://localhost:8055"

dragonfly: ## Start development with Dragonfly cache
	@echo "⚡ Starting Dragonfly development environment..."
	cd variants/dragonfly-dev && docker compose up -d
	@echo "✅ Dragonfly dev ready at http://localhost:8056"

headless: ## Start headless API optimized stack
	@echo "🎯 Starting headless API environment..."
	cd variants/dragonfly-prod && docker compose -f docker-compose.headless.yml up -d
	@echo "✅ Headless API ready at http://localhost:8057"

simple: ## Start simple debug environment
	@echo "🔧 Starting simple debug environment..."
	cd variants/dragonfly-prod && docker compose -f docker-compose.simple.yml up -d
	@echo "✅ Simple debug ready at http://localhost:8058"

prod: ## Start production environment (requires setup)
	@echo "🌐 Starting production environment..."
	@echo "⚠️  Make sure you have configured .env and Docker secrets!"
	cd environments/prod && docker compose up -d

# Monitoring and management
status: ## Show status of all stacks
	@echo "📊 Checking stack status..."
	@echo ""
	@echo "=== Running Containers ==="
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(directus|postgres|dragonfly|redis)" || echo "No stacks running"
	@echo ""
	@echo "=== Health Checks ==="
	@-curl -s http://localhost:8055/server/health >/dev/null && echo "✅ Development (8055)" || echo "❌ Development (8055)"
	@-curl -s http://localhost:8056/server/health >/dev/null && echo "✅ Dragonfly Dev (8056)" || echo "❌ Dragonfly Dev (8056)"
	@-curl -s http://localhost:8057/server/health >/dev/null && echo "✅ Headless API (8057)" || echo "❌ Headless API (8057)"
	@-curl -s http://localhost:8058/server/health >/dev/null && echo "✅ Simple Debug (8058)" || echo "❌ Simple Debug (8058)"

logs: ## Follow logs for all running stacks
	@echo "📋 Following logs for all stacks..."
	@docker logs -f $(shell docker ps -q --filter "name=directus") 2>/dev/null || echo "No running containers found"

logs-dev: ## Follow logs for development stack
	cd environments/dev && docker compose logs -f

logs-dragonfly: ## Follow logs for Dragonfly development
	cd variants/dragonfly-dev && docker compose logs -f

logs-headless: ## Follow logs for headless API
	cd variants/dragonfly-prod && docker compose -f docker-compose.headless.yml logs -f

logs-simple: ## Follow logs for simple debug
	cd variants/dragonfly-prod && docker compose -f docker-compose.simple.yml logs -f

# Cleanup
stop: ## Stop all running stacks
	@echo "🛑 Stopping all stacks..."
	@docker stop $(shell docker ps -q --filter "name=directus" --filter "name=postgres" --filter "name=dragonfly" --filter "name=redis") 2>/dev/null || echo "No containers to stop"

stop-dev: ## Stop development stack
	cd environments/dev && docker compose down

stop-dragonfly: ## Stop Dragonfly development
	cd variants/dragonfly-dev && docker compose down

stop-headless: ## Stop headless API
	cd variants/dragonfly-prod && docker compose -f docker-compose.headless.yml down

stop-simple: ## Stop simple debug
	cd variants/dragonfly-prod && docker compose -f docker-compose.simple.yml down

clean: ## Remove all containers, networks, and volumes
	@echo "🧹 Cleaning up all resources..."
	@echo "⚠️  This will remove all data! Press Ctrl+C to cancel, Enter to continue..."
	@read
	@docker compose -f environments/dev/docker-compose.yml down -v 2>/dev/null || true
	@docker compose -f variants/dragonfly-dev/docker-compose.yml down -v 2>/dev/null || true
	@docker compose -f variants/dragonfly-prod/docker-compose.headless.yml down -v 2>/dev/null || true
	@docker compose -f variants/dragonfly-prod/docker-compose.simple.yml down -v 2>/dev/null || true
	@echo "✅ Cleanup complete"

# Backup and restore
backup: ## Backup all databases
	@echo "💾 Creating database backups..."
	@mkdir -p backups
	@echo "Backing up development database..."
	@docker exec -i directus-dev-postgres pg_dump -U directus directus_dev > backups/dev-$(shell date +%Y%m%d_%H%M%S).sql 2>/dev/null || echo "Development DB not running"
	@echo "Backing up Dragonfly dev database..."
	@docker exec -i directus-dragonfly-dev-postgres pg_dump -U directus directus_dragonfly_dev > backups/dragonfly-dev-$(shell date +%Y%m%d_%H%M%S).sql 2>/dev/null || echo "Dragonfly dev DB not running"
	@echo "Backing up headless database..."
	@docker exec -i directus-headless-postgres pg_dump -U directus_user directus_headless > backups/headless-$(shell date +%Y%m%d_%H%M%S).sql 2>/dev/null || echo "Headless DB not running"
	@echo "✅ Backups completed in ./backups/"

# Performance monitoring
check-performance: ## Check cache performance and response times
	@echo "📈 Performance Check"
	@echo ""
	@echo "=== Cache Statistics ==="
	@echo "Dragonfly Dev Cache:"
	@-docker exec directus-dragonfly-dev-dragonfly redis-cli -a dragonfly_cache_456 info stats 2>/dev/null | grep -E "(keyspace_hits|keyspace_misses)" || echo "  Not running"
	@echo ""
	@echo "Headless API Cache:"
	@-docker exec directus-headless-dragonfly redis-cli -a headless_dragonfly_456 info stats 2>/dev/null | grep -E "(keyspace_hits|keyspace_misses)" || echo "  Not running"
	@echo ""
	@echo "=== API Response Times ==="
	@echo "Testing development API..."
	@-time curl -s http://localhost:8055/server/info >/dev/null 2>&1 || echo "  Not running"
	@echo "Testing Dragonfly dev API..."
	@-time curl -s http://localhost:8056/server/info >/dev/null 2>&1 || echo "  Not running"
	@echo "Testing headless API..."
	@-time curl -s http://localhost:8057/server/info >/dev/null 2>&1 || echo "  Not running"

purge-cache: ## Purge all cache data
	@echo "🗑️  Purging cache data..."
	@echo "Purging Dragonfly dev cache..."
	@-docker exec directus-dragonfly-dev-dragonfly redis-cli -a dragonfly_cache_456 flushall 2>/dev/null || echo "  Not running"
	@echo "Purging headless cache..."
	@-docker exec directus-headless-dragonfly redis-cli -a headless_dragonfly_456 flushall 2>/dev/null || echo "  Not running"
	@echo "✅ Cache purged"

# Quick actions
restart-dev: stop-dev dev ## Restart development stack

restart-dragonfly: stop-dragonfly dragonfly ## Restart Dragonfly development

restart-headless: stop-headless headless ## Restart headless API

restart-simple: stop-simple simple ## Restart simple debug

# Environment setup
setup-prod-secrets: ## Setup production Docker secrets (interactive)
	@echo "🔐 Setting up production secrets..."
	@echo "Enter database name:" && read db_name && echo "$$db_name" | docker secret create postgres_db -
	@echo "Enter database user:" && read db_user && echo "$$db_user" | docker secret create postgres_user -
	@echo "Enter database password:" && read -s db_pass && echo "$$db_pass" | docker secret create postgres_password -
	@echo "Generating Directus key..." && uuidgen | docker secret create directus_key -
	@echo "Generating Directus secret..." && openssl rand -hex 32 | docker secret create directus_secret -
	@echo "Enter Dragonfly password:" && read -s df_pass && echo "$$df_pass" | docker secret create dragonfly_password -
	@echo "✅ Production secrets created"

# Development helpers
shell-dev: ## Shell into development Directus container
	docker exec -it directus-dev bash

shell-dragonfly: ## Shell into Dragonfly development container
	docker exec -it directus-dragonfly-dev bash

shell-headless: ## Shell into headless Directus container
	docker exec -it directus-headless bash

# Database access
db-dev: ## Connect to development database
	docker exec -it directus-dev-postgres psql -U directus -d directus_dev

db-dragonfly: ## Connect to Dragonfly development database
	docker exec -it directus-dragonfly-dev-postgres psql -U directus -d directus_dragonfly_dev

db-headless: ## Connect to headless database
	docker exec -it directus-headless-postgres psql -U directus_user -d directus_headless

# Cache access
cache-dragonfly: ## Connect to Dragonfly development cache
	docker exec -it directus-dragonfly-dev-dragonfly redis-cli -a dragonfly_cache_456

cache-headless: ## Connect to headless cache
	docker exec -it directus-headless-dragonfly redis-cli -a headless_dragonfly_456

# Upgrade helpers
pull-images: ## Pull latest images for all stacks
	@echo "📥 Pulling latest images..."
	docker pull directus/directus:latest
	docker pull postgres:17.5-alpine
	docker pull docker.dragonflydb.io/dragonflydb/dragonfly:latest
	docker pull redis:7-alpine
	docker pull adminer:4.8.1-standalone
	docker pull rediscommander/redis-commander:latest
	@echo "✅ Images updated"

update-stacks: pull-images ## Update and restart all running stacks
	@echo "🔄 Updating running stacks..."
	@if docker ps -q --filter "name=directus-dev" | grep -q .; then $(MAKE) restart-dev; fi
	@if docker ps -q --filter "name=directus-dragonfly-dev" | grep -q .; then $(MAKE) restart-dragonfly; fi
	@if docker ps -q --filter "name=directus-headless" | grep -q .; then $(MAKE) restart-headless; fi
	@if docker ps -q --filter "name=directus-simple" | grep -q .; then $(MAKE) restart-simple; fi
	@echo "✅ All stacks updated"