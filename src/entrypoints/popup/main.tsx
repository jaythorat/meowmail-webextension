import { render } from 'preact';
import './style.css';

function App() {
  return (
    <div class="flex flex-col items-center justify-center min-h-[500px] p-6">
      <div class="text-amber text-2xl font-display font-bold mb-2">
        MeowMail
      </div>
      <div class="text-text-secondary text-sm font-mono">
        Extension loading...
      </div>
    </div>
  );
}

render(<App />, document.getElementById('app')!);
