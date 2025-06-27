#!/bin/bash

# 🚀 Directus Docker Stacks - Quick Setup Script
# https://github.com/your-username/directus-docker-stacks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# ASCII Art
echo -e "${PURPLE}"
cat << "EOF"
  ____  _               _              
 |  _ \(_)_ __ ___  ___| |_ _   _ ___  
 | | | | | '__/ _ \/ __| __| | | / __| 
 | |_| | | | |  __/ (__| |_| |_| \__ \ 
 |____/|_|_|  \___|\___|\__|\__,_|___/ 
                                      
 Docker Stacks Collection 🚀
EOF
echo -e "${NC}"

# Function to print colored output
print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${PURPLE}[INFO]${NC} $1"
}

# Check requirements
check_requirements() {
    print_step "Checking requirements..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # Check Docker Compose
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available. Please install Docker Compose v2."
        exit 1
    fi
    
    # Check Docker daemon
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi
    
    print_success "All requirements met!"
}

# Show menu
show_menu() {
    echo
    print_info "Choose your Directus stack:"
    echo
    echo "1) 🧪 Development (Redis + Adminer)"
    echo "2) ⚡ Development with Dragonfly"
    echo "3) 🌐 Production (SSL + Secrets)"
    echo "4) 🎯 Headless API (Optimized for external apps)"
    echo "5) 🔧 Simple Debug Setup"
    echo "0) Exit"
    echo
}

# Setup development environment
setup_dev() {
    print_step "Setting up development environment..."
    
    cd test/directus-stack/environments/dev
    
    if [ ! -f .env ]; then
        print_step "Creating .env file..."
        cp .env.example .env 2>/dev/null || cat > .env << EOF
# Development Environment
COMPOSE_PROJECT_NAME=directus_dev

# Database
POSTGRES_DB=directus_dev
POSTGRES_USER=directus
POSTGRES_PASSWORD=dev_password_123

# Directus
DIRECTUS_KEY=255d861b-5ea1-5996-9aa3-922530ec40b1
DIRECTUS_SECRET=6116487b-cda1-52c2-b5b5-c8022c45e263

# Admin
ADMIN_EMAIL=admin@dev.local
ADMIN_PASSWORD=dev_admin_123

# URLs
PUBLIC_URL=http://localhost:8055

# Ports
DIRECTUS_PORT=8055
POSTGRES_PORT=5433
REDIS_PORT=6380
ADMINER_PORT=8081
EOF
    fi
    
    print_step "Starting development stack..."
    docker compose up -d
    
    print_success "Development environment ready!"
    echo
    print_info "Access URLs:"
    echo "  📱 Directus: http://localhost:8055"
    echo "  🗄️  Adminer: http://localhost:8081"
    echo "  🔧 Redis Commander: http://localhost:8082"
    echo
    echo "Login: admin@dev.local / dev_admin_123"
}

# Setup dragonfly development
setup_dragonfly_dev() {
    print_step "Setting up Dragonfly development environment..."
    
    cd test/directus-stack/variants/dragonfly-dev
    
    if [ ! -f .env ]; then
        print_step "Creating .env file..."
        cat > .env << EOF
# Dragonfly Development Environment
COMPOSE_PROJECT_NAME=directus_dragonfly_dev

# Database
POSTGRES_DB=directus_dragonfly_dev
POSTGRES_USER=directus
POSTGRES_PASSWORD=dragonfly_dev_password_123

# Dragonfly Cache
DRAGONFLY_PASSWORD=dragonfly_cache_456

# Directus
DIRECTUS_KEY=255d861b-5ea1-5996-9aa3-922530ec40b1
DIRECTUS_SECRET=6116487b-cda1-52c2-b5b5-c8022c45e263

# Admin
ADMIN_EMAIL=admin@dragonfly-dev.local
ADMIN_PASSWORD=dragonfly_dev_admin_123

# URLs
PUBLIC_URL=http://localhost:8056

# Ports
DIRECTUS_PORT=8056
POSTGRES_PORT=5434
DRAGONFLY_PORT=6381
ADMINER_PORT=8081
REDIS_COMMANDER_PORT=8082
EOF
    fi
    
    print_step "Starting Dragonfly development stack..."
    docker compose up -d
    
    print_success "Dragonfly development environment ready!"
    echo
    print_info "Access URLs:"
    echo "  📱 Directus: http://localhost:8056"
    echo "  🗄️  Adminer: http://localhost:8081"
    echo "  🐉 Redis Commander: http://localhost:8082"
    echo
    echo "Login: admin@dragonfly-dev.local / dragonfly_dev_admin_123"
    echo
    print_info "🐉 Dragonfly provides 25x better performance than Redis!"
}

# Setup production
setup_production() {
    print_step "Setting up production environment..."
    
    cd test/directus-stack/environments/prod
    
    if [ ! -f .env ]; then
        print_step "Creating .env template..."
        cat > .env << EOF
# Production Environment - EDIT BEFORE USE
COMPOSE_PROJECT_NAME=directus_prod

# Domain Configuration - REQUIRED
DEFAULT_HOST=your-domain.com
VIRTUAL_HOST=your-domain.com
LETSENCRYPT_HOST=your-domain.com
LETSENCRYPT_EMAIL=your-email@domain.com
PUBLIC_URL=https://your-domain.com
CORS_ORIGIN=https://your-app.com

# Email Configuration - REQUIRED
EMAIL_FROM=noreply@your-domain.com
EMAIL_SMTP_HOST=smtp.your-provider.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-smtp-user
EMAIL_SMTP_PASSWORD=your-smtp-password
EOF
        
        print_warning "Created .env template - YOU MUST EDIT IT BEFORE STARTING!"
        print_info "Edit .env file with your domain and email settings."
        echo
        echo "Then create Docker secrets:"
        echo "  docker secret create postgres_db - <<< 'your_db_name'"
        echo "  docker secret create postgres_user - <<< 'your_db_user'"
        echo "  docker secret create postgres_password - <<< 'your_secure_password'"
        echo "  docker secret create directus_key - <<< '$(uuidgen)'"
        echo "  docker secret create directus_secret - <<< '$(openssl rand -hex 32)'"
        echo "  docker secret create dragonfly_password - <<< 'your_cache_password'"
        echo
        echo "Finally run: docker compose up -d"
        return
    fi
    
    print_warning "Production setup requires manual configuration."
    print_info "Please check .env file and Docker secrets before starting."
}

# Setup headless API
setup_headless() {
    print_step "Setting up headless API environment..."
    
    cd test/directus-stack/variants/dragonfly-prod
    
    print_step "Starting headless stack..."
    docker compose -f docker-compose.headless.yml up -d
    
    print_success "Headless API environment ready!"
    echo
    print_info "Access URLs:"
    echo "  🎯 Directus API: http://localhost:8057"
    echo "  🗄️  Adminer: http://localhost:8083"
    echo "  🐉 Redis Commander: http://localhost:8082"
    echo
    echo "Login: admin@example.com / headless_admin_123"
    echo
    print_info "🎯 Optimized for external apps (Astro, NextJS, etc.)"
    print_info "📈 Features: 24h cache, open CORS, CDN-ready assets"
}

# Setup simple debug
setup_simple() {
    print_step "Setting up simple debug environment..."
    
    cd test/directus-stack/variants/dragonfly-prod
    
    print_step "Starting simple stack..."
    docker compose -f docker-compose.simple.yml up -d
    
    print_success "Simple debug environment ready!"
    echo
    print_info "Access URLs:"
    echo "  📱 Directus: http://localhost:8058"
    echo
    echo "Login: admin@simple.local / simple123"
    echo
    print_info "🔧 Minimal setup for debugging issues"
}

# Show status
show_status() {
    print_step "Checking running stacks..."
    echo
    
    # Check different stack ports
    if curl -s http://localhost:8055/server/health &>/dev/null; then
        print_success "✅ Development stack running (port 8055)"
    fi
    
    if curl -s http://localhost:8056/server/health &>/dev/null; then
        print_success "✅ Dragonfly dev stack running (port 8056)"
    fi
    
    if curl -s http://localhost:8057/server/health &>/dev/null; then
        print_success "✅ Headless API stack running (port 8057)"
    fi
    
    if curl -s http://localhost:8058/server/health &>/dev/null; then
        print_success "✅ Simple debug stack running (port 8058)"
    fi
    
    echo
    print_info "Running containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep directus || echo "No Directus containers running"
}

# Main script
main() {
    echo
    print_info "Welcome to Directus Docker Stacks Setup!"
    
    # Check if we're in the right directory
    if [ ! -d "test/directus-stack" ]; then
        print_error "Please run this script from the repository root directory."
        exit 1
    fi
    
    check_requirements
    
    if [ $# -eq 1 ]; then
        case $1 in
            "status")
                show_status
                exit 0
                ;;
            "dev")
                setup_dev
                exit 0
                ;;
            "dragonfly")
                setup_dragonfly_dev
                exit 0
                ;;
            "headless")
                setup_headless
                exit 0
                ;;
            "simple")
                setup_simple
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Usage: $0 [dev|dragonfly|headless|simple|status]"
                exit 1
                ;;
        esac
    fi
    
    while true; do
        show_menu
        read -p "Select option [0-5]: " choice
        
        case $choice in
            1) setup_dev ;;
            2) setup_dragonfly_dev ;;
            3) setup_production ;;
            4) setup_headless ;;
            5) setup_simple ;;
            0) 
                print_info "Goodbye! 👋"
                exit 0
                ;;
            *)
                print_error "Invalid option. Please choose 0-5."
                ;;
        esac
        
        echo
        read -p "Press Enter to continue..."
    done
}

# Run main function
main "$@"