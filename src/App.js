import React, { useState, useEffect } from 'react';
import { MedicationProvider } from './context/MedicationContext';
import Dashboard from './components/Dashboard';
import MedicationForm from './components/MedicationForm';
import MedicationList from './components/MedicationList';
import ProgressChart from './components/ProgressChart';
import InteractionChecker from './components/InteractionChecker';
import { requestNotificationPermission } from './utils/notifications';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Request notification permission on app load
    requestNotificationPermission();
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'medications', label: 'My Medications', icon: '💊' },
    { id: 'add', label: 'Add Medication', icon: '➕' },
    { id: 'progress', label: 'Progress', icon: '📈' },
    { id: 'interactions', label: 'Interactions', icon: '⚠️' }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'medications':
        return <MedicationList />;
      case 'add':
        return <MedicationForm />;
      case 'progress':
        return <ProgressChart />;
      case 'interactions':
        return <InteractionChecker />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <MedicationProvider>
      <div className="app">
        <header className="header">
          <h1>🏥 MediTrack</h1>
          <p>Your Personal Medication Adherence Tracker</p>
        </header>

        <nav className="tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <main>
          {renderActiveTab()}
        </main>
      </div>
    </MedicationProvider>
  );
}

export default App;