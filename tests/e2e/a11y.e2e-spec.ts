import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { PAGES } from './support';

// Only the two worst impact levels fail the check. Minor and moderate
// findings are real but would turn a first run red on almost any app.
const BLOCKING_IMPACTS = ['critical', 'serious'];

for (const path of PAGES) {
  test('no critical or serious accessibility violations on ' + path, async ({
    page,
  }) => {
    test.info().annotations.push({
      type: 'description',
      description:
        'Runs the axe accessibility checker on ' + path + ' and fails on any critical or serious violation, such as missing form labels or text that is too low in contrast. Minor and moderate findings are counted but do not fail.',
    });

    await test.step('Open ' + path, () => page.goto(path));

    // @axe-core/playwright peers on any playwright-core, so npm can install a
    // newer copy than @playwright/test brings and the two Page types stop
    // matching under tsc. At runtime it is the same page object.
    const axePage = page as unknown as ConstructorParameters<typeof AxeBuilder>[0]['page'];
    const results = await test.step('Run the axe accessibility scan', () =>
      new AxeBuilder({ page: axePage }).analyze(),
    );
    const blocking = results.violations.filter(
      (violation) =>
        violation.impact != null && BLOCKING_IMPACTS.includes(violation.impact),
    );

    const report = blocking.map((violation) => {
      const targets = violation.nodes
        .slice(0, 3)
        .map((node) => node.target.join(' '))
        .join(', ');
      return (
        violation.id + ' (' + String(violation.impact) + '): ' +
        violation.help + ' - ' + targets
      );
    });

    test.info().annotations.push({
      type: 'result',
      description:
        String(blocking.length) + ' critical or serious and ' + String(results.violations.length - blocking.length) + ' minor or moderate violations; ' + String(results.passes.length) + ' accessibility rules passed',
    });
    await test.step('Check for critical or serious violations', () => {
      expect(report, 'Accessibility violations on ' + path + ':\n' + report.join('\n')).toEqual([]);
    });
  });
}
