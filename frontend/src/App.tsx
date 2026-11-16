import React, { useState } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { MarketTicker } from '@/components/layout/MarketTicker';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Dashboard } from '@/pages/Dashboard';
import { IPOsPage } from '@/pages/IPOsPage';
import { IPODetailPage } from '@/pages/IPODetailPage';
import { SentimentPage } from '@/pages/SentimentPage';
import { ProspectusRAGPage } from '@/pages/ProspectusRAGPage';
import { PredictorPage } from '@/pages/PredictorPage';
import { IPO } from '@/types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedIpoId, setSelectedIpoId] = useState<number | null>(null);

  const handleSelectIPO = (ipo: IPO) => {
    setSelectedIpoId(ipo.id);
    setActiveTab('ipo-detail');
  };

  const handleBackToIPOs = () => {
    setSelectedIpoId(null);
    setActiveTab('ipos');
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
        <MarketTicker />
        <Navbar
          activeTab={activeTab === 'ipo-detail' ? 'ipos' : activeTab}
          setActiveTab={(tab) => {
            setSelectedIpoId(null);
            setActiveTab(tab);
          }}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
          {activeTab === 'dashboard' && (
            <Dashboard onSelectIPO={handleSelectIPO} setActiveTab={setActiveTab} />
          )}

          {activeTab === 'ipos' && <IPOsPage onSelectIPO={handleSelectIPO} />}

          {activeTab === 'ipo-detail' && selectedIpoId && (
            <IPODetailPage ipoId={selectedIpoId} onBack={handleBackToIPOs} />
          )}

          {activeTab === 'sentiment' && <SentimentPage />}

          {activeTab === 'rag' && <ProspectusRAGPage />}

          {activeTab === 'predictor' && <PredictorPage />}
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default App;

