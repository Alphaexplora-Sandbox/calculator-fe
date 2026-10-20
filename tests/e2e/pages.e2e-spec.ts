import { expect, test } from '@playwright/test';

import { PAGES, collectPageProblems } from './support';

// Every page in PAGES must answer with a success status and load without
// logging a console error or throwing an uncaught error.
for (const path of PAGES) {
  test('loads ' + path + ' without errors', async ({ page }) => {
    // What this test checks, in words. ALPHACI shows it beside the result.
    test.info().annotations.push({
      type: 'description',
      description:
        'Opens ' + path + ' on the deployed site and fails if it answers with an HTTP error, or logs a console error or an uncaught error while it loads.',
    });
    const problems = collectPageProblems(page);

    const response = await test.step('Open ' + path, () => page.goto(path));
    const status = response?.status() ?? 0;
    await test.step('Check the HTTP status', () => {
      expect(response, 'No response for ' + path).not.toBeNull();
      expect(status, path + ' answered with HTTP ' + String(status)).toBeLessThan(400);
    });

    await test.step('Wait for the page to finish loading', () => page.waitForLoadState('load'));

    // What the test found, recorded before the check so it is there on a failure too.
    test.info().annotations.push({
      type: 'result',
      description:
        path + ' answered HTTP ' + String(status) + ' with ' + String(problems.length) + ' console or page errors',
    });
    await test.step('Check for console and page errors', () => {
      expect(problems, path + ' logged errors:\n' + problems.join('\n')).toEqual([]);
    });
  });
}
