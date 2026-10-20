export interface AppProps {
  title?: string;
}

export function App({ title = 'calculator-fe' }: AppProps) {
  return (
    <main>
      <h1>{title}</h1>
    </main>
  );
}