import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL;

if (!baseURL) {
  throw new Error(
    'E2E_BASE_URL is not set. The end-to-end suite runs against a deployed environment, so there is no default to fall back to.',
  );
}

const vercelAutomationBypassSecret =
  process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.e2e-spec.ts',
  // Approved screenshots live in ONE flat folder. playwright-e2e.yml
  // downloads the baselines approved in ALPHACI to exactly this path, so
  // the template must not grow per-spec or per-platform subfolders.
  snapshotPathTemplate: '{testDir}/__visual__/{arg}{ext}',
  expect: {
    toHaveScreenshot: {
      // Antialiasing noise between runner images is absorbed per pixel by
      // Playwright's colour threshold (default 0.2). On top of that, at most
      // 0.1% of pixels may differ: 1% let a recoloured, reworded heading pass
      // unnoticed on a full desktop page (~10,000 pixels of headroom).
      maxDiffPixelRatio: 0.001,
    },
  },
  // A deployed environment is shared, so a failure is worth one retry
  // before it is called a failure - but only in CI, where flakes cost a
  // promotion rather than a rerun.
  retries: process.env.CI ? 1 : 0,
  // The json reporter is what ALPHACI reads to show per-test results
  // beside the other tools, instead of one pass/fail word for the whole
  // suite. The verify stage sets PLAYWRIGHT_JSON_OUTPUT_NAME, which takes
  // precedence over the path given here, so the two cannot drift.
  reporter: process.env.CI
    ? [["list"], ["json", { outputFile: "test-results/alphaci-e2e.json" }], ["html", { open: "never" }]]
    : "list",
  use: {
    baseURL,
    trace: 'on-first-retry',
    // Vercel Protection Bypass for Automation: gets Playwright past the
    // deployment's SSO wall on a protected uat/main preview. Omitted
    // entirely when the secret is not set, rather than sent empty.
    ...(vercelAutomationBypassSecret
      ? {
          extraHTTPHeaders: {
            'x-vercel-protection-bypass': vercelAutomationBypassSecret,
            'x-vercel-set-bypass-cookie': 'true',
          },
        }
      : {}),
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
