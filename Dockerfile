# =============================================================================
# Sprout OS Orbit — Playwright Test Container
# Base: official Playwright image (matches installed version 1.59.1)
# =============================================================================

FROM mcr.microsoft.com/playwright:v1.59.1-jammy

WORKDIR /app

# Install dependencies first (layer cache)
COPY package.json package-lock.json ./
RUN npm ci

# Copy project files
COPY . .

# Default: run dashboard tests (override with CMD at runtime)
CMD ["npx", "playwright", "test", "tests/sproutos/dashboard/", "--project=sproutos-desktop", "--reporter=list"]
