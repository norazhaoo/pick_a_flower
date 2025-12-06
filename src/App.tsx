import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import PageLayout from './components/layout/PageLayout';
import PensieveScene from './components/pensieve/PensieveScene';
import { usePensieveState } from './state/pensieveState';
import { getMemoryFromUrl } from './utils/url';

function App() {
  const { setMode } = usePensieveState();

  useEffect(() => {
    // Initial check
    const checkHash = () => {
    const encrypted = getMemoryFromUrl();
    if (encrypted) {
      setMode('unlocking');
    }
    };

    checkHash();

    // Listen for hash changes
    const handleHashChange = () => {
        checkHash();
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setMode]);

  return (
    <Router>
      <PageLayout>
        <PensieveScene />
      </PageLayout>
    </Router>
  );
}

export default App;

