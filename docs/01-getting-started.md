# Getting Started with Sprout OS Orbit

This guide walks you from clone to first green test run.

## Prerequisites

| Tool | Min Version | Install |
|---|---|---|
| Node.js | v18 | https://nodejs.org |
| npm | v8 | bundled with Node |
| Git | any | https://git-scm.com |

## 1. Clone & Install

```bash
git clone https://github.com/DevPosimyth/sproutos-orbit.git
cd sproutos-orbit
npm install
npx playwright install
```

## 2. Configure

```bash
cp qa.config.example.json qa.config.json
```

Create a `.env` at the repo root:

```
SPROUTOS_URL=https://sproutos.ai
TEST_USER_EMAIL=qa@example.com
TEST_USER_PASSWORD=change-me
```

> `qa.config.json` and `.env` are gitignored — never commit credentials.

## 3. Run Your First Test

```bash
npm run test:landing
```

This runs the landing-page suite against `https://sproutos.ai`. You should see green checks in ~20 seconds.

## 4. Run Everything

```bash
npm test
```

## 5. Open the HTML Report

```bash
npm run test:report
npx playwright show-report reports/playwright-html
```

## Next Steps

- Read [02-test-architecture.md](./02-test-architecture.md) to understand the folder layout
- Read [03-writing-tests.md](./03-writing-tests.md) to add new specs
- Browse [../checklists/](../checklists/) for manual QA checklists
