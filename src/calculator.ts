export type Operator = '+' | '-' | '*' | '/';

export interface CalculatorState {
  /** The text on the main display: the number being typed, or the last result. */
  display: string;
  /** The left-hand operand and operator waiting for a right-hand operand. */
  pending: { value: number; operator: Operator } | null;
  /** True after an operator or equals: the next digit starts a new number. */
  overwrite: boolean;
}

export type CalculatorAction =
  | { type: 'digit'; digit: string }
  | { type: 'decimal' }
  | { type: 'operator'; operator: Operator }
  | { type: 'equals' }
  | { type: 'backspace' }
  | { type: 'clear' };

export const ERROR = 'Error';
export const MAX_DIGITS = 12;

export const initialState: CalculatorState = {
  display: '0',
  pending: null,
  overwrite: false,
};

export function compute(left: number, operator: Operator, right: number): number {
  switch (operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      return left / right;
  }
}

/**
 * Turns a computed number into the text shown on the display.
 *
 * Return ERROR for a result that should not be shown as a number; the next
 * key press then starts over from a clean state.
 *
 * TODO(you): decide how results should look. Things the raw String(value)
 * gets wrong today:
 *   - 0.1 + 0.2 shows 0.30000000000000004
 *   - 5 / 0 shows Infinity, and 0 / 0 shows NaN
 *   - 1e21 or 1 / 3 can overflow a display sized for MAX_DIGITS digits
 */
export function formatResult(value: number): string {
  return String(value);
}

export function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction,
): CalculatorState {
  // After an error, any key acts on a fresh calculator.
  if (state.display === ERROR) {
    state = initialState;
  }

  switch (action.type) {
    case 'digit': {
      if (state.overwrite) {
        return { ...state, display: action.digit, overwrite: false };
      }
      if (state.display.replace(/[-.]/g, '').length >= MAX_DIGITS) {
        return state;
      }
      const display = state.display === '0' ? action.digit : state.display + action.digit;
      return { ...state, display };
    }

    case 'decimal': {
      if (state.overwrite) {
        return { ...state, display: '0.', overwrite: false };
      }
      if (state.display.includes('.')) {
        return state;
      }
      return { ...state, display: state.display + '.' };
    }

    case 'operator': {
      // A second operator before a new number replaces the first: 5 + × 2 is 5 × 2.
      if (state.pending && state.overwrite) {
        return { ...state, pending: { ...state.pending, operator: action.operator } };
      }
      // Chaining evaluates left to right: 2 + 3 × 4 is (2 + 3) × 4.
      const current = Number(state.display);
      const value = state.pending
        ? compute(state.pending.value, state.pending.operator, current)
        : current;
      return {
        display: formatResult(value),
        pending: { value, operator: action.operator },
        overwrite: true,
      };
    }

    case 'equals': {
      if (!state.pending) {
        return state;
      }
      const { value, operator } = state.pending;
      const result = compute(value, operator, Number(state.display));
      return { display: formatResult(result), pending: null, overwrite: true };
    }

    case 'backspace': {
      if (state.overwrite) {
        return state;
      }
      const display = state.display.slice(0, -1);
      return { ...state, display: display === '' || display === '-' ? '0' : display };
    }

    case 'clear':
      return initialState;
  }
}

// A Map rather than an object literal, so keys like "constructor" or
// "toString" cannot match inherited Object.prototype members.
const KEY_ACTIONS = new Map<string, CalculatorAction>([
  ['.', { type: 'decimal' }],
  [',', { type: 'decimal' }],
  ['+', { type: 'operator', operator: '+' }],
  ['-', { type: 'operator', operator: '-' }],
  ['*', { type: 'operator', operator: '*' }],
  ['x', { type: 'operator', operator: '*' }],
  ['/', { type: 'operator', operator: '/' }],
  ['=', { type: 'equals' }],
  ['Enter', { type: 'equals' }],
  ['Backspace', { type: 'backspace' }],
  ['Escape', { type: 'clear' }],
  ['Delete', { type: 'clear' }],
]);

/** Maps a KeyboardEvent.key to a calculator action, or null for any other key. */
export function keyToAction(key: string): CalculatorAction | null {
  if (/^[0-9]$/.test(key)) {
    return { type: 'digit', digit: key };
  }
  return KEY_ACTIONS.get(key) ?? null;
}
