import React from 'react';
import { PensieveScene } from '../pensieve/PensieveScene';
import { CreateMemoryPanel } from './CreateMemoryPanel';
import { UnlockMemoryPanel } from './UnlockMemoryPanel';

export const PageLayout = () => {
  const hasDataParam = new URLSearchParams(window.location.search).has('data');

  return (
    <div className="page-layout">
      <PensieveScene />
      
      <div className="ui-overlay">
        <header>
          <h1>Arix Encrypted Pensieve</h1>
        </header>
        
        <main>
          {hasDataParam ? <UnlockMemoryPanel /> : <CreateMemoryPanel />}
        </main>

        <footer>
          <p>Memory Convergence</p>
        </footer>
      </div>
    </div>
  );
};

