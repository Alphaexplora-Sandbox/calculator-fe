import { expect, test } from '@playwright/test';

// Links checked per run. A cap keeps the stage fast on a link-heavy page.
const MAX_LINKS = 25;

// Follows every same-origin link on the home page and fails on any that
// answers with an error. The `request` fixture is built from the same
// `use` block as the browser, so it sends the same Vercel protection-bypass
// header as every other check.
test('internal links on the home page resolve', async ({ page, request }) => {
  test.info().annotations.push({
    type: 'description',
    description:
      'Collects the links on the home page that stay on this site and requests each one (up to ' + String(MAX_LINKS) + '); fails if any answers with an HTTP error or cannot be reached.',
  });

  await test.step('Open the home page', () => page.goto('/'));

  const targets = await test.step('Collect the same-site links', async () => {
    const origin = new URL(page.url()).origin;
    const hrefs = await page.locator('a[href]').evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('href') ?? ''),
    );
    const found = new Set<string>();
    for (const raw of hrefs) {
      const href = raw.trim();
      if (href === '' || href.startsWith('#')) {
        continue;
      }
      if (/^(mailto|tel|javascript):/i.test(href)) {
        continue;
      }
      let url: URL;
      try {
        url = new URL(href, page.url());
      } catch {
        continue;
      }
      if (url.origin !== origin) {
        continue;
      }
      url.hash = '';
      found.add(url.toString());
    }
    return Array.from(found);
  });

  if (targets.length === 0) {
    const reason = 'No same-site links on the home page, so nothing was checked';
    test.info().annotations.push({ type: 'result', description: reason });
    // A pass here would say 'links are fine' about a page nobody looked at.
    test.skip(true, reason);
  }

  const checked = targets.slice(0, MAX_LINKS);
  const broken: string[] = [];
  await test.step('Request each link', async () => {
    for (const link of checked) {
      try {
        const response = await request.get(link);
        if (response.status() >= 400) {
          broken.push(String(response.status()) + ' ' + link);
        }
      } catch (error) {
        broken.push('unreachable ' + link + ' (' + String(error) + ')');
      }
    }
  });

  test.info().annotations.push({
    type: 'result',
    description:
      String(targets.length) + ' same-site links found, ' + (targets.length > checked.length ? 'first ' : '') + String(checked.length) + ' checked, ' + String(broken.length) + ' broken' + (targets.length > checked.length ? ' (capped at ' + String(MAX_LINKS) + ', the rest were not checked)' : ''),
  });
  await test.step('Check for broken links', () => {
    expect(broken, 'Broken links on the home page:\n' + broken.join('\n')).toEqual([]);
  });
});
