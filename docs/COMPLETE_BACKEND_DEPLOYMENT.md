# Complete Backend Deployment Guide
## Nigeria Restaurant Tech Platform

**Version:** 2.0  
**Last Updated:** 2025-10-27  
**Target Market:** Nigeria with Global Scalability

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Cloud Deployment Options](#cloud-deployment-options)
   - [AWS Deployment](#aws-deployment)
   - [Google Cloud Platform](#google-cloud-platform)
   - [Microsoft Azure](#microsoft-azure)
   - [Vercel Deployment](#vercel-deployment)
   - [DigitalOcean](#digitalocean)
5. [Security Configuration](#security-configuration)
6. [Payment Gateway Setup](#payment-gateway-setup)
7. [Real-time Services](#real-time-services)
8. [Monitoring & Logging](#monitoring--logging)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts & Services
- **Database:** PostgreSQL 14+ (Recommended: Supabase, AWS RDS, or DigitalOcean Managed DB)
- **Redis:** For caching and session management
- **Nigerian Payment Gateways:**
  - Paystack account (https://paystack.com)
  - Flutterwave account (https://flutterwave.com)
- **Cloud Provider:** AWS, GCP, Azure, Vercel, or DigitalOcean
- **Email Service:** SendGrid, AWS SES, or Mailgun
- **SMS Service:** Twilio or Africa's Talking

### Local Development Tools
```bash
# Required software
- Node.js 18+ and npm/pnpm
- Docker and Docker Compose
- PostgreSQL client
- Redis client
- Git
```

---

## Environment Configuration

### 1. Create Production Environment File

Create `.env.production` in the root directory:

```bash
# ==========================================
# APPLICATION CONFIGURATION
# ==========================================
NODE_ENV=production
APP_URL=https://your-domain.com
API_URL=https://api.your-domain.com
PORT=3000

# ==========================================
# DATABASE CONFIGURATION
# ==========================================
# PostgreSQL Connection
DATABASE_URL="postgresql://username:password@host:5432/restaurant_db?schema=public"
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_TIMEOUT=30000

# Optional: Direct connection for migrations
DIRECT_URL="postgresql://username:password@host:5432/restaurant_db?schema=public"

# ==========================================
# REDIS CONFIGURATION
# ==========================================
REDIS_URL="redis://username:password@host:6379"
REDIS_TLS_URL="rediss://username:password@host:6380"
REDIS_SESSION_PREFIX="sess:"
REDIS_CACHE_TTL=3600

# ==========================================
# AUTHENTICATION & SECURITY
# ==========================================
# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-production"
JWT_REFRESH_SECRET="your-refresh-token-secret-min-32-chars"
JWT_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# Session Configuration
SESSION_SECRET="your-session-secret-min-32-chars-production"
SESSION_MAX_AGE=604800000

# Encryption Keys
ENCRYPTION_KEY="your-encryption-key-32-chars-exactly"
HASH_SALT_ROUNDS=12

# ==========================================
# NIGERIAN PAYMENT GATEWAYS
# ==========================================
# Paystack (Primary for Nigeria)
PAYSTACK_SECRET_KEY="sk_live_your_paystack_secret_key"
PAYSTACK_PUBLIC_KEY="pk_live_your_paystack_public_key"
PAYSTACK_WEBHOOK_SECRET="your_paystack_webhook_secret"

# Flutterwave (Secondary for Nigeria)
FLUTTERWAVE_SECRET_KEY="FLWSECK-your-flutterwave-secret-key"
FLUTTERWAVE_PUBLIC_KEY="FLWPUBK-your-flutterwave-public-key"
FLUTTERWAVE_ENCRYPTION_KEY="FLWSECK_TEST-your-encryption-key"

# Payment Configuration
PAYMENT_CURRENCY="NGN"
PAYMENT_CALLBACK_URL="${APP_URL}/api/delivery/payment/callback"
PAYMENT_WEBHOOK_URL="${APP_URL}/api/webhooks/payment"

# ==========================================
# EMAIL CONFIGURATION
# ==========================================
# SendGrid (Recommended for Nigeria)
SENDGRID_API_KEY="SG.your_sendgrid_api_key"
EMAIL_FROM="noreply@your-domain.com"
EMAIL_FROM_NAME="Restaurant Platform"

# AWS SES (Alternative)
AWS_SES_ACCESS_KEY_ID="your_aws_access_key"
AWS_SES_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_SES_REGION="us-east-1"

# ==========================================
# SMS CONFIGURATION
# ==========================================
# Twilio (International)
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"

# Africa's Talking (Nigeria-focused)
AFRICAS_TALKING_API_KEY="your_africas_talking_api_key"
AFRICAS_TALKING_USERNAME="your_username"

# ==========================================
# DELIVERY PLATFORM INTEGRATION
# ==========================================
# Uber Eats
UBER_EATS_CLIENT_ID="your_uber_eats_client_id"
UBER_EATS_CLIENT_SECRET="your_uber_eats_client_secret"
UBER_EATS_API_URL="https://api.uber.com/v1/eats"

# DoorDash
DOORDASH_DEVELOPER_ID="your_doordash_developer_id"
DOORDASH_KEY_ID="your_doordash_key_id"
DOORDASH_SIGNING_SECRET="your_doordash_signing_secret"
DOORDASH_API_URL="https://openapi.doordash.com"

# Grubhub
GRUBHUB_API_KEY="your_grubhub_api_key"
GRUBHUB_API_SECRET="your_grubhub_api_secret"
GRUBHUB_API_URL="https://api.grubhub.com"

# ==========================================
# AI & RECOMMENDATION ENGINE
# ==========================================
# OpenAI (Optional for enhanced recommendations)
OPENAI_API_KEY="sk-your-openai-api-key"
OPENAI_MODEL="gpt-4"

# ML Model Configuration
ML_MODEL_PATH="/app/models"
ML_CACHE_TTL=86400
ML_MIN_CONFIDENCE=0.6
ML_RECOMMENDATION_LIMIT=20

# ==========================================
# WEBSOCKET & REAL-TIME
# ==========================================
WEBSOCKET_PORT=3001
WEBSOCKET_PATH="/socket.io"
WEBSOCKET_CORS_ORIGIN="${APP_URL}"
WEBSOCKET_PING_TIMEOUT=60000
WEBSOCKET_PING_INTERVAL=25000

# ==========================================
# CLOUD STORAGE (for AR & Media)
# ==========================================
# AWS S3
AWS_S3_BUCKET="your-restaurant-platform-bucket"
AWS_S3_REGION="us-east-1"
AWS_S3_ACCESS_KEY_ID="your_aws_access_key"
AWS_S3_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_S3_CDN_URL="https://cdn.your-domain.com"

# Cloudinary (Alternative for Images)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# ==========================================
# EXTERNAL SERVICES
# ==========================================
# Google Maps (for location services)
GOOGLE_MAPS_API_KEY="your_google_maps_api_key"

# Mapbox (Alternative)
MAPBOX_ACCESS_TOKEN="your_mapbox_access_token"

# ==========================================
# MONITORING & LOGGING
# ==========================================
# Sentry (Error Tracking)
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
SENTRY_ENVIRONMENT="production"

# LogRocket (Session Replay)
LOGROCKET_APP_ID="your-logrocket-app-id"

# New Relic (APM)
NEW_RELIC_LICENSE_KEY="your_new_relic_license_key"
NEW_RELIC_APP_NAME="Restaurant Platform Production"

# ==========================================
# ANALYTICS
# ==========================================
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
MIXPANEL_TOKEN="your_mixpanel_token"

# ==========================================
# FEATURE FLAGS
# ==========================================
ENABLE_AR_FEATURES=true
ENABLE_LOYALTY_PROGRAM=true
ENABLE_DELIVERY_INTEGRATION=true
ENABLE_AI_RECOMMENDATIONS=true
ENABLE_PWA=true
ENABLE_SOCIAL_FEATURES=true

# ==========================================
# RATE LIMITING
# ==========================================
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS=false

# ==========================================
# CORS CONFIGURATION
# ==========================================
CORS_ORIGIN="${APP_URL}"
CORS_CREDENTIALS=true
CORS_MAX_AGE=86400

# ==========================================
# NIGERIAN LOCALIZATION
# ==========================================
DEFAULT_LOCALE="en"
DEFAULT_CURRENCY="NGN"
DEFAULT_TIMEZONE="Africa/Lagos"
SUPPORTED_LOCALES="en,ha,yo,ig,fr,ar,es,de,zh,ja"

# ==========================================
# BUSINESS CONFIGURATION
# ==========================================
PLATFORM_FEE_PERCENTAGE=5.0
LOYALTY_POINTS_PER_NGN=0.01
REFERRAL_BONUS_POINTS=100
MINIMUM_BOOKING_AMOUNT=1000
CURRENCY_EXCHANGE_API_KEY="your_currency_api_key"
```

### 2. Validate Environment Variables

Create a validation script `scripts/validate-env.ts`:

```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  PAYSTACK_SECRET_KEY: z.string().startsWith('sk_'),
  FLUTTERWAVE_SECRET_KEY: z.string().startsWith('FLWSECK-'),
  // Add more validations
});

try {
  envSchema.parse(process.env);
  console.log('Environment variables validated successfully');
} catch (error) {
  console.error('Environment validation failed:', error);
  process.exit(1);
}
```

---

## Database Setup

### 1. PostgreSQL Production Setup

#### Option A: Managed Database (Recommended)

**Supabase (Recommended for Nigeria):**
```bash
# 1. Create project at https://supabase.com
# 2. Get connection string from Settings > Database
# 3. Update DATABASE_URL in .env.production
```

**AWS RDS:**
```bash
# 1. Create PostgreSQL instance in AWS RDS
# 2. Configure security groups for access
# 3. Enable automated backups
# 4. Set up read replicas for high availability
```

**DigitalOcean Managed Database:**
```bash
# 1. Create PostgreSQL cluster
# 2. Configure firewall rules
# 3. Enable connection pooling
# 4. Download CA certificate
```

### 2. Run Database Migrations

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### 3. Database Migration Script

Create `scripts/migrate-production.sh`:

```bash
#!/bin/bash
set -e

echo "Starting production database migration..."

# Backup database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migrations
npx prisma migrate deploy

# Verify migration
npx prisma migrate status

echo "Migration completed successfully!"
```

### 4. Redis Setup

**Managed Redis Options:**
- **AWS ElastiCache:** Recommended for AWS deployments
- **Redis Cloud:** Global availability with Nigerian support
- **DigitalOcean Managed Redis:** Simple and cost-effective

```bash
# Test Redis connection
redis-cli -h your-redis-host -p 6379 -a your-password ping
```

---

## Cloud Deployment Options

## AWS Deployment

### Architecture Overview
- **Compute:** ECS Fargate or EC2
- **Database:** RDS PostgreSQL
- **Cache:** ElastiCache Redis
- **Storage:** S3 for AR models and media
- **CDN:** CloudFront
- **Load Balancer:** Application Load Balancer

### Step-by-Step Deployment

#### 1. Prepare Docker Image

Create `Dockerfile.production`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Expose ports
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["npm", "start"]
```

#### 2. Build and Push to ECR

```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -f Dockerfile.production -t restaurant-platform:latest .

# Tag image
docker tag restaurant-platform:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/restaurant-platform:latest

# Push to ECR
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/restaurant-platform:latest
```

#### 3. ECS Task Definition

Create `aws/task-definition.json`:

```json
{
  "family": "restaurant-platform",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::YOUR_ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "restaurant-platform-web",
      "image": "YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/restaurant-platform:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        },
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "environment": [],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT:secret:restaurant/database-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT:secret:restaurant/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/restaurant-platform",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "node -e \"require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})\""],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

#### 4. Deploy to ECS

```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://aws/task-definition.json

# Create or update service
aws ecs create-service \
  --cluster restaurant-platform-cluster \
  --service-name restaurant-platform-service \
  --task-definition restaurant-platform \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:YOUR_ACCOUNT:targetgroup/restaurant-platform/xxx,containerName=restaurant-platform-web,containerPort=3000"
```

#### 5. CloudFormation Template (Infrastructure as Code)

Create `aws/cloudformation-stack.yaml`:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Restaurant Platform Infrastructure'

Parameters:
  Environment:
    Type: String
    Default: production
    AllowedValues:
      - development
      - staging
      - production

Resources:
  # VPC
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: !Sub '${Environment}-restaurant-vpc'

  # RDS PostgreSQL
  DatabaseInstance:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceIdentifier: !Sub '${Environment}-restaurant-db'
      DBInstanceClass: db.t3.medium
      Engine: postgres
      EngineVersion: '14.7'
      MasterUsername: admin
      MasterUserPassword: !Ref DatabasePassword
      AllocatedStorage: 20
      StorageType: gp3
      StorageEncrypted: true
      BackupRetentionPeriod: 7
      MultiAZ: true
      PubliclyAccessible: false
      VPCSecurityGroups:
        - !Ref DatabaseSecurityGroup

  # ElastiCache Redis
  RedisCluster:
    Type: AWS::ElastiCache::ReplicationGroup
    Properties:
      ReplicationGroupId: !Sub '${Environment}-restaurant-redis'
      ReplicationGroupDescription: Redis cluster for restaurant platform
      Engine: redis
      EngineVersion: '7.0'
      CacheNodeType: cache.t3.micro
      NumCacheClusters: 2
      AutomaticFailoverEnabled: true
      AtRestEncryptionEnabled: true
      TransitEncryptionEnabled: true
      SecurityGroupIds:
        - !Ref RedisSecurityGroup

  # S3 Bucket for AR Models
  ARModelsBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub '${Environment}-restaurant-ar-models'
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
      VersioningConfiguration:
        Status: Enabled
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - ServerSideEncryptionByDefault:
              SSEAlgorithm: AES256

  # Application Load Balancer
  LoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name: !Sub '${Environment}-restaurant-alb'
      Type: application
      Scheme: internet-facing
      SecurityGroups:
        - !Ref LoadBalancerSecurityGroup
      Subnets:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2

Outputs:
  DatabaseEndpoint:
    Value: !GetAtt DatabaseInstance.Endpoint.Address
  RedisEndpoint:
    Value: !GetAtt RedisCluster.PrimaryEndPoint.Address
  LoadBalancerDNS:
    Value: !GetAtt LoadBalancer.DNSName
```

Deploy stack:
```bash
aws cloudformation create-stack \
  --stack-name restaurant-platform \
  --template-body file://aws/cloudformation-stack.yaml \
  --parameters ParameterKey=Environment,ParameterValue=production \
  --capabilities CAPABILITY_IAM
```

---

## Google Cloud Platform

### Architecture Overview
- **Compute:** Cloud Run or GKE
- **Database:** Cloud SQL PostgreSQL
- **Cache:** Memorystore Redis
- **Storage:** Cloud Storage
- **CDN:** Cloud CDN

### Deployment Steps

#### 1. Build and Push to Container Registry

```bash
# Configure gcloud
gcloud auth configure-docker

# Build image
docker build -f Dockerfile.production -t gcr.io/YOUR_PROJECT/restaurant-platform:latest .

# Push to GCR
docker push gcr.io/YOUR_PROJECT/restaurant-platform:latest
```

#### 2. Deploy to Cloud Run

```bash
gcloud run deploy restaurant-platform \
  --image gcr.io/YOUR_PROJECT/restaurant-platform:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production" \
  --set-secrets="DATABASE_URL=restaurant-db-url:latest,JWT_SECRET=jwt-secret:latest" \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 10 \
  --min-instances 1 \
  --port 3000
```

#### 3. Terraform Configuration

Create `gcp/terraform/main.tf`:

```hcl
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Cloud SQL PostgreSQL
resource "google_sql_database_instance" "main" {
  name             = "restaurant-platform-db"
  database_version = "POSTGRES_14"
  region           = var.region

  settings {
    tier = "db-g1-small"
    
    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        name  = "all"
        value = "0.0.0.0/0"
      }
    }

    backup_configuration {
      enabled = true
      start_time = "02:00"
    }
  }
}

# Memorystore Redis
resource "google_redis_instance" "cache" {
  name           = "restaurant-platform-redis"
  tier           = "STANDARD_HA"
  memory_size_gb = 1
  region         = var.region
  redis_version  = "REDIS_7_0"
}

# Cloud Storage Bucket
resource "google_storage_bucket" "ar_models" {
  name          = "${var.project_id}-ar-models"
  location      = "US"
  force_destroy = false

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }
}

# Cloud Run Service
resource "google_cloud_run_service" "api" {
  name     = "restaurant-platform-api"
  location = var.region

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/restaurant-platform:latest"
        
        env {
          name  = "NODE_ENV"
          value = "production"
        }

        resources {
          limits = {
            cpu    = "2"
            memory = "2Gi"
          }
        }

        ports {
          container_port = 3000
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}
```

---

## Microsoft Azure

### Architecture Overview
- **Compute:** Azure Container Instances or AKS
- **Database:** Azure Database for PostgreSQL
- **Cache:** Azure Cache for Redis
- **Storage:** Azure Blob Storage
- **CDN:** Azure CDN

### Deployment Steps

#### 1. Azure Container Registry

```bash
# Login to Azure
az login

# Create resource group
az group create --name restaurant-platform-rg --location eastus

# Create container registry
az acr create --resource-group restaurant-platform-rg \
  --name restaurantplatformacr --sku Basic

# Build and push image
az acr build --registry restaurantplatformacr \
  --image restaurant-platform:latest \
  --file Dockerfile.production .
```

#### 2. Deploy to Azure Container Instances

```bash
# Create container instance
az container create \
  --resource-group restaurant-platform-rg \
  --name restaurant-platform-api \
  --image restaurantplatformacr.azurecr.io/restaurant-platform:latest \
  --dns-name-label restaurant-platform-api \
  --ports 3000 3001 \
  --environment-variables NODE_ENV=production \
  --secure-environment-variables \
    DATABASE_URL=$DATABASE_URL \
    JWT_SECRET=$JWT_SECRET \
  --cpu 2 \
  --memory 2
```

#### 3. ARM Template

Create `azure/template.json`:

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "location": {
      "type": "string",
      "defaultValue": "[resourceGroup().location]"
    }
  },
  "resources": [
    {
      "type": "Microsoft.DBforPostgreSQL/servers",
      "apiVersion": "2017-12-01",
      "name": "restaurant-platform-db",
      "location": "[parameters('location')]",
      "sku": {
        "name": "GP_Gen5_2",
        "tier": "GeneralPurpose",
        "capacity": 2,
        "family": "Gen5"
      },
      "properties": {
        "version": "11",
        "sslEnforcement": "Enabled",
        "storageProfile": {
          "storageMB": 51200,
          "backupRetentionDays": 7,
          "geoRedundantBackup": "Enabled"
        }
      }
    }
  ]
}
```

---

## Vercel Deployment

### Optimal for Frontend + Serverless API

#### 1. Install Vercel CLI

```bash
npm i -g vercel
vercel login
```

#### 2. Configure `vercel.json`

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1", "lhr1"],
  "env": {
    "NODE_ENV": "production"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_APP_URL": "@app-url",
      "DATABASE_URL": "@database-url",
      "REDIS_URL": "@redis-url"
    }
  },
  "functions": {
    "app/api/**/*.ts": {
      "memory": 3008,
      "maxDuration": 60
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Credentials",
          "value": "true"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT"
        }
      ]
    }
  ]
}
```

#### 3. Deploy

```bash
# Deploy to production
vercel --prod

# Set environment variables
vercel env add DATABASE_URL production
vercel env add REDIS_URL production
vercel env add JWT_SECRET production
# ... add all production env vars
```

---

## DigitalOcean

### Architecture Overview
- **Compute:** App Platform or Droplets
- **Database:** Managed PostgreSQL
- **Cache:** Managed Redis
- **Storage:** Spaces (S3-compatible)

### Deployment Steps

#### 1. App Platform Configuration

Create `.do/app.yaml`:

```yaml
name: restaurant-platform
region: nyc
services:
  - name: web
    github:
      repo: your-username/restaurant-platform
      branch: main
      deploy_on_push: true
    build_command: npm run build
    run_command: npm start
    environment_slug: node-js
    instance_count: 2
    instance_size_slug: professional-s
    http_port: 3000
    health_check:
      http_path: /api/health
    envs:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        scope: RUN_TIME
        type: SECRET
      - key: REDIS_URL
        scope: RUN_TIME
        type: SECRET
databases:
  - name: restaurant-db
    engine: PG
    version: "14"
    size: db-s-2vcpu-4gb
    num_nodes: 1
    region: nyc1
workers:
  - name: websocket-server
    github:
      repo: your-username/restaurant-platform
      branch: main
    build_command: npm run build
    run_command: node dist/server/websocket.js
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: professional-xs
```

#### 2. Deploy via CLI

```bash
# Install doctl
brew install doctl  # macOS
# or snap install doctl  # Linux

# Authenticate
doctl auth init

# Create app
doctl apps create --spec .do/app.yaml

# Deploy
doctl apps create-deployment <app-id>
```

---

## Security Configuration

### 1. SSL/TLS Certificates

**Let's Encrypt (Free):**
```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com -d api.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 0 * * * certbot renew --quiet
```

### 2. Firewall Rules

```bash
# UFW (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable

# AWS Security Group
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0
```

### 3. Secrets Management

**AWS Secrets Manager:**
```bash
# Store secret
aws secretsmanager create-secret \
  --name restaurant/jwt-secret \
  --secret-string "your-secret-value"

# Retrieve secret (in application)
aws secretsmanager get-secret-value \
  --secret-id restaurant/jwt-secret \
  --query SecretString \
  --output text
```

**HashiCorp Vault:**
```bash
# Initialize Vault
vault operator init

# Store secret
vault kv put secret/restaurant/jwt JWT_SECRET="your-secret"

# Read secret
vault kv get secret/restaurant/jwt
```

### 4. Rate Limiting

Already implemented in `lib/middleware.ts`. Configure via environment:

```bash
RATE_LIMIT_WINDOW=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Payment Gateway Setup

### Paystack (Primary for Nigeria)

#### 1. Create Account
1. Sign up at https://paystack.com
2. Complete KYC verification
3. Get API keys from Settings > API Keys & Webhooks

#### 2. Configure Webhooks
```bash
Webhook URL: https://your-domain.com/api/webhooks/paystack
Events to listen:
  - charge.success
  - transfer.success
  - transfer.failed
```

#### 3. Test Payment Flow

Create test script `scripts/test-paystack.ts`:

```typescript
import axios from 'axios';

const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

async function initializePayment() {
  const response = await axios.post(
    'https://api.paystack.co/transaction/initialize',
    {
      email: 'customer@example.com',
      amount: 50000, // Amount in kobo (500 NGN)
      currency: 'NGN',
      callback_url: 'https://your-domain.com/payment/callback'
    },
    {
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  console.log('Payment initialized:', response.data);
  return response.data;
}

initializePayment();
```

### Flutterwave (Secondary)

#### 1. Setup
1. Create account at https://flutterwave.com
2. Get API keys from Settings > API
3. Configure webhook URL

#### 2. Test Integration

```typescript
import axios from 'axios';

async function initiateFlutterwavePayment() {
  const response = await axios.post(
    'https://api.flutterwave.com/v3/payments',
    {
      tx_ref: `TX-${Date.now()}`,
      amount: 500,
      currency: 'NGN',
      redirect_url: 'https://your-domain.com/payment/callback',
      customer: {
        email: 'customer@example.com',
        name: 'John Doe'
      }
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
      }
    }
  );
  
  console.log('Payment link:', response.data.data.link);
}
```

---

## Real-time Services

### WebSocket Server Setup

Already implemented in `lib/delivery/websocket-service.ts`.

#### Production Configuration

Create `server/websocket-production.ts`:

```typescript
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Redis adapter for horizontal scaling
const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
  console.log('Redis adapter configured');
});

// Authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }
  
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.data.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
});

// Connection handler
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.data.userId}`);
  
  // Join user-specific room
  socket.join(`user:${socket.data.userId}`);
  
  // Handle delivery tracking
  socket.on('track:delivery', (orderId) => {
    socket.join(`delivery:${orderId}`);
  });
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.data.userId}`);
  });
});

const PORT = process.env.WEBSOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
```

#### Deploy WebSocket with PM2

```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'api',
      script: 'npm',
      args: 'start',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'websocket',
      script: 'dist/server/websocket-production.js',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        WEBSOCKET_PORT: 3001
      }
    }
  ]
};
EOF

# Start services
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

---

## Monitoring & Logging

### 1. Application Monitoring (Sentry)

```typescript
// lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.authorization;
    }
    return event;
  }
});
```

### 2. Logging Configuration

Already implemented in `lib/logger.ts`. Production setup:

```typescript
// winston configuration for production
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // CloudWatch Logs
    new WinstonCloudWatch({
      logGroupName: '/restaurant-platform/api',
      logStreamName: `${process.env.NODE_ENV}-${new Date().toISOString().split('T')[0]}`,
      awsRegion: 'us-east-1'
    }),
    // File rotation
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d'
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d'
    })
  ]
});
```

### 3. Health Check Endpoint

Create `app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {
      database: 'unknown',
      redis: 'unknown',
      disk: 'unknown',
      memory: 'unknown'
    }
  };

  try {
    // Database check
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = 'healthy';
  } catch (error) {
    checks.checks.database = 'unhealthy';
    checks.status = 'degraded';
  }

  try {
    // Redis check
    await redis.ping();
    checks.checks.redis = 'healthy';
  } catch (error) {
    checks.checks.redis = 'unhealthy';
    checks.status = 'degraded';
  }

  // Memory check
  const used = process.memoryUsage();
  checks.checks.memory = used.heapUsed < (used.heapTotal * 0.9) ? 'healthy' : 'warning';

  return NextResponse.json(checks, {
    status: checks.status === 'healthy' ? 200 : 503
  });
}
```

### 4. Monitoring Dashboard Setup

**Grafana + Prometheus:**

```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
    ports:
      - '9090:9090'

  grafana:
    image: grafana/grafana
    ports:
      - '3000:3000'
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  prometheus_data:
  grafana_data:
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"

# Check connection pool
# In application logs, look for:
# Error: remaining connection slots are reserved
# Solution: Increase DATABASE_POOL_MAX or use connection pooling (PgBouncer)
```

#### 2. Redis Connection Timeouts

```bash
# Test Redis
redis-cli -h your-redis-host -p 6379 -a password ping

# Check latency
redis-cli --latency -h your-redis-host -p 6379 -a password

# Flush cache if needed
redis-cli -h your-redis-host -p 6379 -a password FLUSHDB
```

#### 3. Payment Gateway Failures

```typescript
// Enable detailed logging
logger.error('Paystack payment failed', {
  reference: tx_ref,
  statusCode: response.status,
  error: response.data
});

// Test credentials
curl https://api.paystack.co/transaction/initialize \
  -H "Authorization: Bearer YOUR_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","amount":"50000"}'
```

#### 4. WebSocket Connection Issues

```javascript
// Client-side debugging
const socket = io('https://your-domain.com', {
  transports: ['websocket'],
  debug: true,
  reconnection: true,
  reconnectionAttempts: 5
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

#### 5. High Memory Usage

```bash
# Check Node memory
node --max-old-space-size=4096 server.js

# Profile memory usage
node --inspect server.js
# Open chrome://inspect in Chrome
```

#### 6. Slow API Responses

```typescript
// Add request timing middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      duration,
      status: res.statusCode
    });
  });
  next();
});
```

---

## Performance Optimization

### 1. Database Query Optimization

```typescript
// Use indexes
await prisma.restaurant.findMany({
  where: { city: 'Lagos', isActive: true },
  // Ensure indexes exist on city and isActive
});

// Use connection pooling
// DATABASE_POOL_MAX=20 in production

// Use read replicas for heavy queries
const readReplica = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_READ_REPLICA_URL }
  }
});
```

### 2. Caching Strategy

```typescript
// Cache frequently accessed data
import { redis } from '@/lib/redis';

async function getRestaurant(id: string) {
  const cacheKey = `restaurant:${id}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // Fetch from database
  const restaurant = await prisma.restaurant.findUnique({
    where: { id }
  });
  
  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(restaurant));
  
  return restaurant;
}
```

### 3. CDN Configuration

```nginx
# Nginx configuration for static assets
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

# Cloudflare Page Rules
# Pattern: *your-domain.com/images/*
# Cache Level: Cache Everything
# Edge Cache TTL: 1 month
```

---

## Backup & Disaster Recovery

### 1. Automated Database Backups

```bash
#!/bin/bash
# scripts/backup-database.sh

BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/restaurant_db_$DATE.sql.gz"

# Create backup
pg_dump $DATABASE_URL | gzip > $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE s3://restaurant-platform-backups/database/

# Delete local backups older than 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

# Verify backup
gunzip -c $BACKUP_FILE | head -n 1
```

Setup cron job:
```bash
# Run daily at 2 AM
0 2 * * * /app/scripts/backup-database.sh
```

### 2. Disaster Recovery Plan

```markdown
1. Database Failure:
   - Restore from latest backup
   - Enable read replica promotion
   - Update DNS to point to replica

2. Application Failure:
   - Roll back to previous deployment
   - Scale up healthy instances
   - Check logs for root cause

3. Complete Outage:
   - Activate disaster recovery region
   - Restore database from backup
   - Update DNS records
   - Verify all services
```

---

## Cost Optimization

### AWS Cost Estimates (Monthly)

```
ECS Fargate (2 tasks):        $50
RDS PostgreSQL (db.t3.medium): $75
ElastiCache Redis (cache.t3.micro): $15
S3 Storage (100GB):           $3
CloudFront (1TB):             $85
Total:                        ~$228/month
```

### Optimization Tips

1. **Use Spot Instances:** Save up to 90% on compute
2. **Right-size Resources:** Monitor and adjust instance sizes
3. **Enable Auto-scaling:** Scale down during low traffic
4. **Use Reserved Instances:** 1-year commitment saves 30-40%
5. **Optimize Storage:** Archive old data to cheaper storage tiers

---

## Support & Maintenance

### Routine Maintenance Tasks

**Daily:**
- Monitor error logs
- Check health endpoints
- Review payment transactions

**Weekly:**
- Database backup verification
- Security patches
- Performance metrics review

**Monthly:**
- Cost analysis
- Capacity planning
- Dependency updates

### Contact & Resources

- **Documentation:** https://docs.your-platform.com
- **Support Email:** support@your-platform.com
- **Emergency:** +234-XXX-XXXX-XXX
- **Status Page:** https://status.your-platform.com

---

## Next Steps

1. **Choose deployment platform** based on your requirements
2. **Set up staging environment** for testing
3. **Configure monitoring and alerts**
4. **Run load tests** before production launch
5. **Create runbook** for operations team
6. **Schedule security audit**
7. **Plan scaling strategy** for growth

**Deployment Checklist:** See `DEPLOYMENT_CHECKLIST.md`

---

*This guide is maintained by the MiniMax Agent development team.*  
*Last updated: 2025-10-27*
