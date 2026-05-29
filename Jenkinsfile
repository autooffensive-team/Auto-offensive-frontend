pipeline {
    agent any

    triggers {
        githubPush()
    }

    options {
        timestamps()
    }

    parameters {
        string(
            name: 'IMAGE_NAME',
            defaultValue: 'autooffensive-frontend',
            description: 'Docker repository name without namespace.'
        )
        string(
            name: 'IMAGE_NAMESPACE',
            defaultValue: '',
            description: 'Optional Docker Hub namespace/org to push into. Leave blank to use the Docker login username.'
        )
    }

    environment {
        DOCKER_CREDENTIALS_ID          = 'DOKCERHUB-ID-CREDENTIALS'
        BUILDER_NAME                   = 'jenkins-builder'
        PRODUCTION_DEPLOYMENT_HOST     = credentials('production-deployment-host')
        DEPLOYMENT_USER                = credentials('deployment-user')
        DEPLOYMENT_KEY                 = credentials('deployment-ssh-key')
    }

    stages {

        // ─────────────────────────────────────────────
        stage('Resolve Build Metadata') {
        // ─────────────────────────────────────────────
            steps {
                script {
                    env.TAG = sh(
                        script: 'git rev-parse --short=8 HEAD',
                        returnStdout: true
                    ).trim()

                    env.IMAGE_NAME = params.IMAGE_NAME.trim()
                    env.IMAGE_NAMESPACE = params.IMAGE_NAMESPACE?.trim() ?: ''
                }
            }
        }

        // ─────────────────────────────────────────────
        stage('Validate') {
        // ─────────────────────────────────────────────
            steps {
                sh '''#!/bin/bash
                    set -euo pipefail

                    docker run --rm \
                        --user "$(id -u):$(id -g)" \
                        --env HOME=/tmp \
                        --volume "$PWD:/app" \
                        --workdir /app \
                        node:24-alpine \
                        sh -lc 'npm ci && npm run lint'
                '''
            }
        }

        // ─────────────────────────────────────────────
        stage('Build & Push Docker Image') {
        // ─────────────────────────────────────────────
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: env.DOCKER_CREDENTIALS_ID,
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    script {
                        sh '''#!/bin/bash
                            set -euo pipefail

                            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                            docker buildx inspect "$BUILDER_NAME" >/dev/null 2>&1 || \
                                docker buildx create --name "$BUILDER_NAME" --driver docker-container
                            docker buildx use "$BUILDER_NAME"
                            docker buildx inspect --bootstrap

                            BRANCH=$(git rev-parse --abbrev-ref HEAD)
                            NAMESPACE="${IMAGE_NAMESPACE:-$DOCKER_USER}"
                            IMAGE_REF="$NAMESPACE/$IMAGE_NAME"

                            echo "▶ Building frontend → $IMAGE_REF:$TAG"

                            EXTRA_TAGS=""
                            [ "$BRANCH" = "main" ] && EXTRA_TAGS="--tag $IMAGE_REF:latest"

                            if ! docker buildx build \
                                --file Dockerfile \
                                --build-arg NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-https://autooffensive.rattanakmony.com}" \
                                --build-arg NEXT_PUBLIC_DOCS_APP_URL="${NEXT_PUBLIC_DOCS_APP_URL:-https://autooffensive.rattanakmony.com/docs}" \
                                --cache-from "type=registry,ref=$IMAGE_REF:cache" \
                                --cache-to   "type=registry,ref=$IMAGE_REF:cache,mode=max" \
                                --push \
                                --tag "$IMAGE_REF:$TAG" \
                                $EXTRA_TAGS \
                                .; then
                                echo "Docker push failed for $IMAGE_REF:$TAG" >&2
                                exit 1
                            fi

                            echo "✓ Pushed $IMAGE_REF:$TAG"
                        '''
                    }
                }
            }
        }

        // ─────────────────────────────────────────────
        stage('Deploy to Production') {
        // ─────────────────────────────────────────────
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: env.DOCKER_CREDENTIALS_ID,
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''#!/bin/bash
                        set -euo pipefail
                        DEPLOY_DIR="/home/rattanakmony.pech.mit18/reffensive-frontend/production"
                        NAMESPACE="${IMAGE_NAMESPACE:-$DOCKER_USER}"
                        IMAGE_REF="$NAMESPACE/$IMAGE_NAME:$TAG"
                        SSH_OPTS="-i $DEPLOYMENT_KEY -o StrictHostKeyChecking=no -o BatchMode=yes"

                        # ── Backup current image ────────────────────────────────────────────
                        ssh $SSH_OPTS "$DEPLOYMENT_USER@$PRODUCTION_DEPLOYMENT_HOST" bash -s "$DEPLOY_DIR" <<'REMOTE'
set -eu
DEPLOY_DIR="$1"
mkdir -p "$DEPLOY_DIR/backups"

CURRENT_IMAGE=$(docker ps \
    --filter "label=com.docker.compose.service=frontend" \
    --format '{{.Image}}' | head -n 1)
if [ -n "$CURRENT_IMAGE" ]; then
    echo "$CURRENT_IMAGE" > "$DEPLOY_DIR/backups/frontend.last-image"
    echo "▶ Backed up frontend → $CURRENT_IMAGE"
fi
REMOTE

                        # ── Push compose file ───────────────────────────────────────────────
                        scp $SSH_OPTS \
                            docker-compose.prod.yml \
                            "$DEPLOYMENT_USER@$PRODUCTION_DEPLOYMENT_HOST:$DEPLOY_DIR/docker-compose.prod.yml"

                        # ── Write .env ──────────────────────────────────────────────────────
                        ssh $SSH_OPTS \
                            "$DEPLOYMENT_USER@$PRODUCTION_DEPLOYMENT_HOST" bash -s \
                            "$DEPLOY_DIR" "$IMAGE_REF" <<'REMOTE'
set -eu
DEPLOY_DIR="$1"
IMAGE_REF="$2"
cat > "$DEPLOY_DIR/.env" <<EOF
FRONTEND_IMAGE=$IMAGE_REF
EOF
REMOTE

                        # ── Deploy ──────────────────────────────────────────────────────────
                        ssh $SSH_OPTS \
                            "$DEPLOYMENT_USER@$PRODUCTION_DEPLOYMENT_HOST" bash -s \
                            "$IMAGE_REF" "$DEPLOY_DIR" <<'REMOTE'
set -eu
IMAGE_REF="$1"
DEPLOY_DIR="$2"

cd "$DEPLOY_DIR"
docker pull "$IMAGE_REF"

docker compose -f docker-compose.prod.yml stop frontend 2>/dev/null || true
docker compose -f docker-compose.prod.yml rm -f frontend 2>/dev/null || true
docker compose -f docker-compose.prod.yml up -d \
    --force-recreate \
    --remove-orphans \
    --no-deps \
    frontend

echo "✓ Deployed: frontend → $IMAGE_REF"
REMOTE
                    '''
                }
            }
        }

        // ─────────────────────────────────────────────
        stage('Health Check') {
        // ─────────────────────────────────────────────
            steps {
                sh '''#!/bin/bash
                    set -euo pipefail
                    SSH_OPTS="-i $DEPLOYMENT_KEY -o StrictHostKeyChecking=no -o BatchMode=yes"
                    MAX_RETRIES=10
                    RETRY_COUNT=0

                    echo "▶ Health checking frontend at http://localhost:3000"
                    until ssh $SSH_OPTS "$DEPLOYMENT_USER@$PRODUCTION_DEPLOYMENT_HOST" \
                            "curl -sf http://localhost:3000 >/dev/null 2>&1"; do
                        RETRY_COUNT=$((RETRY_COUNT + 1))
                        if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
                            echo "✗ Health check failed after $MAX_RETRIES attempts"
                            exit 1
                        fi
                        echo "  Attempt $RETRY_COUNT/$MAX_RETRIES — retrying in 10s..."
                        sleep 10
                    done
                    echo "✓ Frontend is healthy"
                '''
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
        }
        failure {
            sh '''#!/bin/bash
                set -euo pipefail
                SSH_OPTS="-i $DEPLOYMENT_KEY -o StrictHostKeyChecking=no -o BatchMode=yes"
                DEPLOY_DIR="/home/brotherkhode/auto-offensive-frontend"

                echo "▶ Deployment failed — attempting rollback..."

                ssh $SSH_OPTS "$DEPLOYMENT_USER@$PRODUCTION_DEPLOYMENT_HOST" bash -s "$DEPLOY_DIR" <<'REMOTE'
set -eu
DEPLOY_DIR="$1"
BACKUP_FILE="$DEPLOY_DIR/backups/frontend.last-image"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "✗ No backup image found — skipping rollback"
    exit 0
fi

ROLLBACK_IMAGE=$(cat "$BACKUP_FILE")
echo "▶ Rolling back frontend → $ROLLBACK_IMAGE"

cd "$DEPLOY_DIR"
sed -i "s|^FRONTEND_IMAGE=.*|FRONTEND_IMAGE=$ROLLBACK_IMAGE|" .env

docker pull "$ROLLBACK_IMAGE"
docker compose -f docker-compose.prod.yml stop frontend 2>/dev/null || true
docker compose -f docker-compose.prod.yml rm -f frontend 2>/dev/null || true
docker compose -f docker-compose.prod.yml up -d --no-deps frontend

echo "✓ Rollback completed: frontend → $ROLLBACK_IMAGE"
REMOTE
            '''
            emailext(
                subject: "✗ Frontend Deployment FAILED — ${env.TAG}",
                body: """
                    <h2>Frontend Deployment Failed</h2>
                    <p><strong>Tag:</strong> ${env.TAG}</p>
                    <p><strong>Build:</strong> <a href="${env.BUILD_URL}">#${env.BUILD_NUMBER}</a></p>
                    <p><strong style="color:red;">Rollback has been triggered. Review logs immediately.</strong></p>
                """,
                to: '${DEFAULT_RECIPIENTS}',
                mimeType: 'text/html'
            )
        }
        success {
            emailext(
                subject: "✓ Frontend Deployment Successful — ${env.TAG}",
                body: """
                    <h2>Frontend Deployment Completed Successfully</h2>
                    <p><strong>Tag:</strong> ${env.TAG}</p>
                    <p><strong>Build:</strong> <a href="${env.BUILD_URL}">#${env.BUILD_NUMBER}</a></p>
                """,
                to: '${DEFAULT_RECIPIENTS}',
                mimeType: 'text/html'
            )
        }
    }
}
