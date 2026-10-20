import { useEffect, useReducer } from 'react';

import {
  calculatorReducer,
  initialState,
  keyToAction,
  type CalculatorAction,
  type Operator,
} from './calculator';

export interface AppProps {
  title?: string;
}

const OPERATOR_SYMBOLS: Record<Operator, string> = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
};

interface Key {
  label: string;
  action: CalculatorAction;
  name?: string;
  variant?: 'operator' | 'function' | 'equals';
  wide?: boolean;
}

const digit = (d: string): Key => ({ label: d, action: { type: 'digit', digit: d } });
const operator = (op: Operator, name: string): Key => ({
  label: OPERATOR_SYMBOLS[op],
  action: { type: 'operator', operator: op },
  name,
  variant: 'operator',
});

// Read left to right, top to bottom, in a four-column grid.
const KEYPAD: Key[] = [
  { label: 'C', action: { type: 'clear' }, name: 'Clear', variant: 'function', wide: true },
  { label: '⌫', action: { type: 'backspace' }, name: 'Backspace', variant: 'function' },
  operator('/', 'Divide'),
  digit('7'), digit('8'), digit('9'), operator('*', 'Multiply'),
  digit('4'), digit('5'), digit('6'), operator('-', 'Subtract'),
  digit('1'), digit('2'), digit('3'), operator('+', 'Add'),
  { ...digit('0'), wide: true },
  { label: '.', action: { type: 'decimal' }, name: 'Decimal point' },
  { label: '=', action: { type: 'equals' }, name: 'Equals', variant: 'equals' },
];

export function App({ title = 'Calculator' }: AppProps) {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      // Leave browser shortcuts such as Ctrl+R or Cmd+C alone.
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      const action = keyToAction(event.key);
      if (action) {
        // Stops Enter from also clicking whichever keypad button has focus.
        event.preventDefault();
        dispatch(action);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const expression = state.pending
    ? `${state.pending.value} ${OPERATOR_SYMBOLS[state.pending.operator]}`
    : '';

  return (
    <main className="calculator">
      <h1>{title}</h1>
      <div className="screen">
        <div className="expression" aria-hidden="true">{expression}</div>
        <output className="display" aria-live="polite" aria-label="Result">
          {state.display}
        </output>
      </div>
      <div className="keypad">
        {KEYPAD.map((key) => (
          <button
            key={key.label}
            type="button"
            aria-label={key.name}
            className={[key.variant, key.wide && 'wide'].filter(Boolean).join(' ') || undefined}
            onClick={() => dispatch(key.action)}
          >
            {key.label}
          </button>
        ))}
      </div>
    </main>
  );
}
