import { render } from 'preact';
import './style.css';
import Header from './components/Header';
import AddressBar from './components/AddressBar';
import Footer from './components/Footer';
import { usePopupState } from './hooks/usePopupState';

function App() {
  const {
    address,
    history,
    emails,
    domains,
    isLoading,
    generateAddress,
    setCustomAddress,
    removeFromHistory,
    clearHistory,
  } = usePopupState();

  if (isLoading) {
    return (
      <div class="flex flex-col h-[500px]">
        <Header />
        <div class="flex-1 flex items-center justify-center">
          <div class="text-text-muted text-sm font-mono animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div class="flex flex-col h-[500px]">
      <Header />

      <div class="flex-1 overflow-y-auto">
        <AddressBar
          address={address}
          domains={domains}
          history={history}
          onGenerate={generateAddress}
          onSetAddress={setCustomAddress}
          onRemoveFromHistory={removeFromHistory}
          onClearHistory={clearHistory}
        />

        {/* Inbox section — Step 3 */}
        <div class="px-4 pb-4">
          <div class="border-t border-border-subtle pt-3">
            <h2 class="text-xs font-mono text-text-muted uppercase tracking-wider mb-3">
              Inbox {emails.length > 0 && `(${emails.length})`}
            </h2>
            <div class="card flex flex-col items-center justify-center py-8 text-center">
              <p class="text-text-secondary text-sm font-mono">No emails yet</p>
              <p class="text-text-muted text-xs font-mono mt-1">
                Use this address and emails will appear here
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer address={address} />
    </div>
  );
}

render(<App />, document.getElementById('app')!);
