import { SERVICE_NAME } from '../../src/index';

describe('calculator-fe', () => {
  it('should export SERVICE_NAME', () => {
    expect(SERVICE_NAME).toBe('calculator-fe');
  });
});