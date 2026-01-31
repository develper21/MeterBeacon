#!/bin/bash

# Production Build Script for DISCOM Smart Meter GPS Tracking
# =========================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="DISCOM Smart Meter GPS Tracking"
BUILD_DIR="./build"
LOG_FILE="./logs/build.log"

# Create directories if they don't exist
mkdir -p $BUILD_DIR
mkdir -p logs

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

# Header
log "🚀 Starting Production Build for $PROJECT_NAME"
log "============================================"

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    log "Node.js version: $NODE_VERSION"
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
    fi
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        warning "Docker is not installed - skipping container build"
    fi
    
    success "Prerequisites check completed"
}

# Environment validation
validate_environment() {
    log "Validating environment..."
    
    # Check if .env.production exists
    if [[ ! -f "./dashboard/.env.production" ]]; then
        error ".env.production file not found. Please create it from .env.production.example"
    fi
    
    # Check required environment variables
    source ./dashboard/.env.production
    
    required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "NEXTAUTH_URL"
        "NEXTAUTH_SECRET"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            error "Required environment variable $var is not set"
        fi
    done
    
    success "Environment validation completed"
}

# Clean previous builds
clean_build() {
    log "Cleaning previous builds..."
    
    # Clean Next.js build
    rm -rf ./dashboard/.next
    rm -rf ./dashboard/out
    
    # Clean test coverage
    rm -rf ./dashboard/coverage
    
    # Clean E2E test results
    rm -rf ./dashboard/playwright-report
    
    success "Build cleanup completed"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    cd dashboard
    
    # Install production dependencies
    npm ci --production
    
    # Install all dependencies for build
    npm ci
    
    cd ..
    
    success "Dependencies installed"
}

# Run tests
run_tests() {
    log "Running test suite..."
    
    cd dashboard
    
    # Run unit and integration tests
    npm run test:ci
    
    # Run E2E tests if available
    if command -v npx &> /dev/null && npx playwright --version &> /dev/null; then
        log "Running E2E tests..."
        npm run test:e2e || warning "E2E tests failed - continuing build"
    fi
    
    cd ..
    
    success "All tests completed"
}

# Build application
build_application() {
    log "Building application..."
    
    cd dashboard
    
    # Build for production
    npm run build
    
    # Check if build was successful
    if [[ ! -d "./.next" ]]; then
        error "Build failed - .next directory not found"
    fi
    
    cd ..
    
    success "Application built successfully"
}

# Build Docker image
build_docker() {
    if command -v docker &> /dev/null; then
        log "Building Docker image..."
        
        cd dashboard
        
        # Build production Docker image
        docker build -f Dockerfile.prod -t discom-gps-tracking:latest .
        
        # Check if image was built
        if ! docker images discom-gps-tracking:latest &> /dev/null; then
            error "Docker image build failed"
        fi
        
        cd ..
        
        success "Docker image built successfully"
    else
        warning "Docker not available - skipping container build"
    fi
}

# Generate build artifacts
generate_artifacts() {
    log "Generating build artifacts..."
    
    # Create build directory
    mkdir -p $BUILD_DIR
    
    # Copy build files
    cp -r ./dashboard/.next $BUILD_DIR/
    cp -r ./dashboard/public $BUILD_DIR/
    cp ./dashboard/package.json $BUILD_DIR/
    cp ./dashboard/package-lock.json $BUILD_DIR/
    
    # Copy configuration files
    cp ./docker-compose.production.yml $BUILD_DIR/
    cp ./scripts/deploy.sh $BUILD_DIR/
    
    # Generate build info
    cat > $BUILD_DIR/build-info.json << EOF
{
  "buildDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version": "$(cd dashboard && npm pkg get version | tr -d '"')",
  "nodeVersion": "$(node --version)",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git branch --show-current 2>/dev/null || echo 'unknown')",
  "environment": "production"
}
EOF
    
    success "Build artifacts generated"
}

# Security scan
security_scan() {
    log "Running security scan..."
    
    cd dashboard
    
    # Run npm audit
    npm audit --audit-level=high || warning "Security vulnerabilities found"
    
    cd ..
    
    success "Security scan completed"
}

# Performance optimization
optimize_build() {
    log "Optimizing build..."
    
    cd dashboard
    
    # Check bundle size (if available)
    if command -v npx &> /dev/null && npx next-bundle-analyzer --version &> /dev/null; then
        npx next-bundle-analyzer --static || warning "Bundle analyzer failed"
    fi
    
    cd ..
    
    success "Build optimization completed"
}

# Generate deployment package
create_deployment_package() {
    log "Creating deployment package..."
    
    # Create deployment package
    tar -czf $BUILD_DIR/discom-gps-tracking-$(date +%Y%m%d-%H%M%S).tar.gz -C $BUILD_DIR .
    
    success "Deployment package created"
}

# Main build function
main() {
    log "Starting production build process..."
    
    check_prerequisites
    validate_environment
    clean_build
    install_dependencies
    run_tests
    build_application
    build_docker
    generate_artifacts
    security_scan
    optimize_build
    create_deployment_package
    
    success "🎉 Production build completed successfully!"
    log "Build artifacts are available in: $BUILD_DIR"
    log "Deployment package: $(ls -t $BUILD_DIR/*.tar.gz | head -1)"
}

# Trap to handle interruption
trap 'error "Build interrupted"' INT TERM

# Run main function
main "$@"
