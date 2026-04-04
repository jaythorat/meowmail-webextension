import { render } from 'preact';
import './style.css';
import Header from './components/Header';
import AddressBar from './components/AddressBar';
import EmailList from './components/EmailList';
import EmailDetail from './components/EmailDetail';
import Footer from './components/Footer';
import { usePopupState } from './hooks/usePopupState';

function App() {
  const {
    address,
    history,
    emails,
    domains,
    connectionStatus,
    isLoading,
    selectedEmailId,
    generateAddress,
    setCustomAddress,
    removeFromHistory,
    clearHistory,
    selectEmail,
    deselectEmail,
    handleEmailDeleted,
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

  // Email detail view
  if (selectedEmailId) {
    return (
      <div class="flex flex-col h-[500px]">
        <EmailDetail
          emailId={selectedEmailId}
          address={address}
          onBack={deselectEmail}
          onDeleted={handleEmailDeleted}
        />
      </div>
    );
  }

  // Inbox list view
  return (
    <div class="flex flex-col h-[500px]">
      <Header connectionStatus={connectionStatus} />

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

        <EmailList emails={emails} onSelect={selectEmail} />
      </div>

      <Footer address={address} />
    </div>
  );
}

render(<App />, document.getElementById('app')!);
