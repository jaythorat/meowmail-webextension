import { render } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';
import './style.css';
import Header from './components/Header';
import AddressBar from './components/AddressBar';
import EmailList from './components/EmailList';
import EmailDetail from './components/EmailDetail';
import Footer from './components/Footer';
import ToastContainer from './components/Toast';
import { usePopupState } from './hooks/usePopupState';

type View = 'list' | 'detail';

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

  const [view, setView] = useState<View>('list');
  const [transitioning, setTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync view with selectedEmailId
  useEffect(() => {
    if (selectedEmailId && view !== 'detail') {
      setSlideDirection('left');
      setTransitioning(true);
      requestAnimationFrame(() => {
        setView('detail');
        // Let the CSS animation handle the transition
        setTimeout(() => setTransitioning(false), 250);
      });
    } else if (!selectedEmailId && view !== 'list') {
      setSlideDirection('right');
      setTransitioning(true);
      requestAnimationFrame(() => {
        setView('list');
        setTimeout(() => setTransitioning(false), 250);
      });
    }
  }, [selectedEmailId]);

  if (isLoading) {
    return (
      <div class="flex flex-col h-[500px]">
        <Header />
        <div class="flex-1 flex items-center justify-center">
          <div class="text-text-muted text-sm font-mono animate-pulse">Loading...</div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div class="flex flex-col h-[500px]" ref={containerRef}>
      {view === 'detail' && selectedEmailId ? (
        <div
          class={transitioning ? `animate-slide-${slideDirection}` : ''}
          style="display: flex; flex-direction: column; height: 100%;"
        >
          <EmailDetail
            emailId={selectedEmailId}
            address={address}
            onBack={deselectEmail}
            onDeleted={handleEmailDeleted}
          />
        </div>
      ) : (
        <div
          class={transitioning ? `animate-slide-${slideDirection}` : ''}
          style="display: flex; flex-direction: column; height: 100%;"
        >
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
      )}
      <ToastContainer />
    </div>
  );
}

render(<App />, document.getElementById('app')!);
