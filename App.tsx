import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Pricing } from './pages/Pricing';
import { Checkout } from './pages/Checkout';
import { ClientDashboard } from './pages/ClientDashboard';
import { AnalystDashboard } from './pages/AnalystDashboard';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Terms } from './pages/Terms';
import { DebugGenerator } from './pages/DebugGenerator';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Routes>
          {/* Routes with Standard Layout */}
          <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
          <Route path="/services" element={<><Navbar /><Pricing /><Footer /></>} />
          <Route path="/checkout/:packageId" element={<><Navbar /><Checkout /><Footer /></>} />
          <Route path="/dashboard" element={<><Navbar /><ClientDashboard /><Footer /></>} />
          <Route path="/privacy" element={<><Navbar /><PrivacyPolicy /><Footer /></>} />
          <Route path="/terms" element={<><Navbar /><Terms /><Footer /></>} />

          {/* Analyst Dashboard (Standalone Layout) */}
          <Route path="/analyst" element={<AnalystDashboard />} />
          <Route path="/debug" element={<DebugGenerator />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;