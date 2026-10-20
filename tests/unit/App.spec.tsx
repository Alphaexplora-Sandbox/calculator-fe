import { renderToString } from 'react-dom/server';

import { App } from '../../src/App';

describe('App', () => {
  it('renders the default title', () => {
    expect(renderToString(<App />)).toContain('Calculator');
  });

  it('renders a custom title', () => {
    expect(renderToString(<App title="custom" />)).toContain('custom');
  });

  it('starts with 0 on the display', () => {
    expect(renderToString(<App />)).toMatch(/<output[^>]*>0<\/output>/);
  });

  it('renders all eighteen keys with accessible names for symbols', () => {
    const html = renderToString(<App />);
    expect(html.match(/<button/g)).toHaveLength(18);
    for (const name of ['Clear', 'Backspace', 'Divide', 'Multiply', 'Subtract', 'Add', 'Equals']) {
      expect(html).toContain(`aria-label="${name}"`);
    }
  });
});
