import {
  ERROR,
  MAX_DIGITS,
  calculatorReducer,
  compute,
  initialState,
  keyToAction,
  type CalculatorState,
} from '../../src/calculator';

/** Feeds keyboard keys through keyToAction and the reducer, like a user typing. */
function type(keys: string, from: CalculatorState = initialState): CalculatorState {
  return keys.split('').reduce((state, key) => {
    const action = keyToAction(key);
    if (!action) throw new Error('No action for key ' + key);
    return calculatorReducer(state, action);
  }, from);
}

describe('compute', () => {
  it.each([
    [6, '+', 3, 9],
    [6, '-', 3, 3],
    [6, '*', 3, 18],
    [6, '/', 3, 2],
  ] as const)('%d %s %d = %d', (left, operator, right, expected) => {
    expect(compute(left, operator, right)).toBe(expected);
  });
});

describe('calculatorReducer', () => {
  it('starts at 0', () => {
    expect(initialState.display).toBe('0');
  });

  it('builds a number from digits without a leading zero', () => {
    expect(type('0012').display).toBe('12');
  });

  it('caps input at MAX_DIGITS digits', () => {
    expect(type('9'.repeat(MAX_DIGITS + 3)).display).toBe('9'.repeat(MAX_DIGITS));
  });

  it('allows one decimal point per number', () => {
    expect(type('1.2.3').display).toBe('1.23');
  });

  it('starts a new number with 0. when the decimal comes first', () => {
    expect(type('5+.5').display).toBe('0.5');
  });

  it('evaluates on equals', () => {
    expect(type('12+30=').display).toBe('42');
  });

  it('chains operators left to right', () => {
    const state = type('2+3*');
    expect(state.display).toBe('5');
    expect(type('4=', state).display).toBe('20');
  });

  it('replaces the operator when two are pressed in a row', () => {
    expect(type('8+-3=').display).toBe('5');
  });

  it('starts a fresh number when a digit follows a result', () => {
    expect(type('2+2=7').display).toBe('7');
  });

  it('continues from a result when an operator follows it', () => {
    expect(type('2+2=*3=').display).toBe('12');
  });

  it('ignores equals with nothing pending', () => {
    expect(type('7=').display).toBe('7');
  });

  it('deletes the last digit on backspace, down to 0', () => {
    const state = type('12');
    const once = calculatorReducer(state, { type: 'backspace' });
    expect(once.display).toBe('1');
    expect(calculatorReducer(once, { type: 'backspace' }).display).toBe('0');
  });

  it('does not backspace into a result', () => {
    const state = calculatorReducer(type('9+1='), { type: 'backspace' });
    expect(state.display).toBe('10');
  });

  it('turns a lone minus sign into 0 on backspace', () => {
    const state = calculatorReducer(
      { ...initialState, display: '-5' },
      { type: 'backspace' },
    );
    expect(state.display).toBe('0');
  });

  it('resets everything on clear', () => {
    expect(calculatorReducer(type('5+3'), { type: 'clear' })).toEqual(initialState);
  });

  it('starts over on the next key after an error', () => {
    const errored = { ...initialState, display: ERROR };
    expect(type('7', errored)).toEqual({ ...initialState, display: '7' });
  });
});

describe('keyToAction', () => {
  it.each([
    ['5', { type: 'digit', digit: '5' }],
    [',', { type: 'decimal' }],
    ['x', { type: 'operator', operator: '*' }],
    ['Enter', { type: 'equals' }],
    ['Escape', { type: 'clear' }],
    ['Backspace', { type: 'backspace' }],
  ])('maps %s', (key, action) => {
    expect(keyToAction(key)).toEqual(action);
  });

  it.each(['a', 'F5', 'Tab', 'constructor', '55'])('ignores %s', (key) => {
    expect(keyToAction(key)).toBeNull();
  });
});
