#!/bin/bash

# Production Deployment Script
# ============================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="meter-gps-tracking"
BACKUP_DIR="./backups"
LOG_FILE="./logs/deploy.log"

# Create directories if they don't exist
mkdir -p $BACKUP_DIR
mkdir -p logs

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root for security reasons"
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    # Check if .env.production exists
    if [[ ! -f "./dashboard/.env.production" ]]; then
        error ".env.production file not found. Please create it first."
    fi
    
    success "Prerequisites check passed"
}

# Backup current deployment
backup_current() {
    log "Creating backup of current deployment..."
    
    # Backup database
    if docker-compose -f docker-compose.production.yml ps postgres | grep -q "Up"; then
        docker-compose -f docker-compose.production.yml exec -T postgres pg_dump -U $POSTGRES_USER meter_gps_tracking > "$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql"
        success "Database backup created"
    fi
    
    # Backup application files
    if [[ -d "./dashboard/.next" ]]; then
        tar -czf "$BACKUP_DIR/app_backup_$(date +%Y%m%d_%H%M%S).tar.gz" ./dashboard/.next
        success "Application backup created"
    fi
}

# Run tests
run_tests() {
    log "Running tests..."
    
    cd dashboard
    npm ci
    npm run test:ci
    cd ..
    
    success "All tests passed"
}

# Build and deploy
deploy() {
    log "Building and deploying application..."
    
    # Pull latest images
    docker-compose -f docker-compose.production.yml pull
    
    # Build application
    docker-compose -f docker-compose.production.yml build --no-cache
    
    # Stop existing services
    docker-compose -f docker-compose.production.yml down
    
    # Start services
    docker-compose -f docker-compose.production.yml up -d
    
    success "Application deployed successfully"
}

# Health check
health_check() {
    log "Performing health checks..."
    
    # Wait for services to start
    sleep 30
    
    # Check dashboard
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        success "Dashboard health check passed"
    else
        error "Dashboard health check failed"
    fi
    
    # Check database
    if docker-compose -f docker-compose.production.yml exec -T postgres pg_isready -U $POSTGRES_USER > /dev/null 2>&1; then
        success "Database health check passed"
    else
        error "Database health check failed"
    fi
    
    # Check Redis
    if docker-compose -f docker-compose.production.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
        success "Redis health check passed"
    else
        error "Redis health check failed"
    fi
}

# Cleanup old backups
cleanup() {
    log "Cleaning up old backups..."
    
    # Keep only last 7 days of backups
    find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
    find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
    
    success "Old backups cleaned up"
}

# Rollback function
rollback() {
    log "Rolling back to previous deployment..."
    
    # Stop current services
    docker-compose -f docker-compose.production.yml down
    
    # Restore from latest backup (implement as needed)
    warning "Rollback functionality needs to be implemented based on your backup strategy"
    
    error "Rollback not fully implemented"
}

# Main deployment function
main() {
    log "Starting deployment process..."
    
    check_root
    check_prerequisites
    
    # Parse command line arguments
    case "${1:-deploy}" in
        "deploy")
            backup_current
            run_tests
            deploy
            health_check
            cleanup
            success "Deployment completed successfully!"
            ;;
        "test")
            run_tests
            success "Tests completed successfully!"
            ;;
        "backup")
            backup_current
            success "Backup completed successfully!"
            ;;
        "health")
            health_check
            success "Health checks completed successfully!"
            ;;
        "rollback")
            rollback
            ;;
        "cleanup")
            cleanup
            success "Cleanup completed successfully!"
            ;;
        *)
            echo "Usage: $0 {deploy|test|backup|health|rollback|cleanup}"
            exit 1
            ;;
    esac
}

# Trap to handle interruption
trap 'error "Deployment interrupted"' INT TERM

# Run main function with all arguments
main "$@"
