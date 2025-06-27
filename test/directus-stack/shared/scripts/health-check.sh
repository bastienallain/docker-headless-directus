#!/bin/bash

# Script de vérification de santé de la stack Directus

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔍 Health Check - Directus Stack${NC}"
echo "=================================="

# Function pour tester un service
check_service() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -n "Checking $name... "
    
    if response=$(curl -s -f "$url" 2>/dev/null); then
        if [[ "$response" == *"$expected"* ]] || [[ -z "$expected" ]]; then
            echo -e "${GREEN}✓ OK${NC}"
            return 0
        else
            echo -e "${RED}✗ Unexpected response${NC}"
            return 1
        fi
    else
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

# Check Directus
check_service "Directus API" "http://localhost:8055/server/info" "project"

# Check Adminer
check_service "Adminer" "http://localhost:8080" "Login"

# Check Dragonfly/Redis
echo -n "Checking Dragonfly... "
if docker compose exec -T dragonfly redis-cli ping 2>/dev/null | grep -q "PONG"; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

# Check PostgreSQL
echo -n "Checking PostgreSQL... "
if docker compose exec -T postgres pg_isready -U directus 2>/dev/null | grep -q "accepting connections"; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

# Check Metrics
if docker compose ps | grep -q "dragonfly-exporter"; then
    check_service "Metrics Exporter" "http://localhost:9121/metrics" "redis_"
fi

echo ""
echo -e "${GREEN}Health check complete!${NC}"