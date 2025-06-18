import React, { useState } from 'react';
import { useMedication } from '../context/MedicationContext';
import { AlertTriangle, Info, CheckCircle, Search } from 'lucide-react';

function InteractionChecker() {
  const { medications } = useMedication();
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock interaction database - in real app, this would come from a medical API
  const interactionDatabase = {
    'warfarin': {
      'aspirin': { severity: 'severe', description: 'Increased risk of bleeding' },
      'ibuprofen': { severity: 'moderate', description: 'May increase bleeding risk' },
      'vitamin k': { severity: 'moderate', description: 'May reduce warfarin effectiveness' }
    },
    'lisinopril': {
      'potassium': { severity: 'moderate', description: 'May cause hyperkalemia' },
      'ibuprofen': { severity: 'moderate', description: 'May reduce blood pressure control' }
    },
    'metformin': {
      'alcohol': { severity: 'moderate', description: 'May increase risk of lactic acidosis' },
      'contrast dye': { severity: 'severe', description: 'Risk of kidney damage' }
    },
    'simvastatin': {
      'grapefruit': { severity: 'severe', description: 'Increases statin levels significantly' },
      'gemfibrozil': { severity: 'severe', description: 'Increased risk of muscle damage' }
    }
  };

  const checkInteractions = () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const foundInteractions = [];
      
      // Check medication-to-medication interactions
      for (let i = 0; i < medications.length; i++) {
        for (let j = i + 1; j < medications.length; j++) {
          const med1 = medications[i].name.toLowerCase();
          const med2 = medications[j].name.toLowerCase();
          
          // Check both directions
          if (interactionDatabase[med1] && interactionDatabase[med1][med2]) {
            foundInteractions.push({
              type: 'drug-drug',
              medication1: medications[i],
              medication2: medications[j],
              ...interactionDatabase[med1][med2]
            });
          } else if (interactionDatabase[med2] && interactionDatabase[med2][med1]) {
            foundInteractions.push({
              type: 'drug-drug',
              medication1: medications[j],
              medication2: medications[i],
              ...interactionDatabase[med2][med1]
            });
          }
        }
      }

      // Add some general warnings based on medication types
      medications.forEach(med => {
        const medName = med.name.toLowerCase();
        
        // Add food/lifestyle warnings
        if (medName.includes('warfarin') || medName.includes('coumadin')) {
          foundInteractions.push({
            type: 'drug-food',
            medication1: med,
            substance: 'Vitamin K rich foods (spinach, kale)',
            severity: 'moderate',
            description: 'May affect blood clotting control'
          });
        }
        
        if (medName.includes('tetracycline') || medName.includes('doxycycline')) {
          foundInteractions.push({
            type: 'drug-food',
            medication1: med,
            substance: 'Dairy products, calcium',
            severity: 'moderate',
            description: 'May reduce antibiotic absorption'
          });
        }
      });

      setInteractions(foundInteractions);
      setLoading(false);
    }, 1000);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'severe': return '#f44336';
      case 'moderate': return '#ff9800';
      case 'mild': return '#4caf50';
      default: return '#2196f3';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'severe': return <AlertTriangle className="w-5 h-5" />;
      case 'moderate': return <Info className="w-5 h-5" />;
      case 'mild': return <CheckCircle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const filteredInteractions = interactions.filter(interaction =>
    interaction.medication1.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (interaction.medication2 && interaction.medication2.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (interaction.substance && interaction.substance.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (medications.length === 0) {
    return (
      <div className="card">
        <h2 style={{ marginBottom: '20px', color: '#333' }}>
          ⚠️ Drug Interaction Checker
        </h2>
        <div className="empty-state">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p>No medications to check for interactions</p>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            Add some medications first to check for potential interactions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <h2 style={{ marginBottom: '20px', color: '#333' }}>
          ⚠️ Drug Interaction Checker
        </h2>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ position: 'relative' }}>
            <Search className="w-5 h-5" style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#666'
            }} />
            <input
              type="text"
              placeholder="Search interactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '40px' }}
            />
          </div>
        </div>

        <button 
          onClick={checkInteractions}
          disabled={loading}
          className="btn btn-primary"
          style={{ marginBottom: '20px' }}
        >
          {loading ? 'Checking...' : 'Recheck Interactions'}
        </button>

        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ 
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ marginTop: '10px', color: '#666' }}>
              Checking for interactions...
            </p>
          </div>
        )}

        {!loading && filteredInteractions.length === 0 && (
          <div className="empty-state">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#4caf50' }} />
            <p style={{ color: '#4caf50', fontWeight: '600' }}>
              No interactions found!
            </p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              Your current medications appear to be safe to take together.
            </p>
          </div>
        )}

        {!loading && filteredInteractions.length > 0 && (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: '#333' }}>
                Found {filteredInteractions.length} potential interaction{filteredInteractions.length !== 1 ? 's' : ''}
              </h3>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                <span style={{ color: '#f44336' }}>● Severe</span>
                <span style={{ color: '#ff9800', marginLeft: '15px' }}>● Moderate</span>
                <span style={{ color: '#4caf50', marginLeft: '15px' }}>● Mild</span>
              </div>
            </div>

            {filteredInteractions.map((interaction, index) => (
              <div 
                key={index}
                className={`interaction-${interaction.severity === 'severe' ? 'severe' : 'warning'}`}
                style={{ marginBottom: '15px' }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '12px'
                }}>
                  <div style={{ color: getSeverityColor(interaction.severity) }}>
                    {getSeverityIcon(interaction.severity)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      <span style={{ 
                        background: getSeverityColor(interaction.severity),
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {interaction.severity}
                      </span>
                      <span style={{ 
                        background: '#e3f2fd',
                        color: '#1976d2',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {interaction.type.replace('-', ' ')}
                      </span>
                    </div>
                    
                    <h4 style={{ 
                      color: '#333', 
                      marginBottom: '6px',
                      fontSize: '1rem'
                    }}>
                      {interaction.medication1.name}
                      {interaction.medication2 && ` + ${interaction.medication2.name}`}
                      {interaction.substance && ` + ${interaction.substance}`}
                    </h4>
                    
                    <p style={{ 
                      color: '#666', 
                      fontSize: '0.9rem',
                      lineHeight: '1.4'
                    }}>
                      {interaction.description}
                    </p>
                    
                    {interaction.severity === 'severe' && (
                      <p style={{ 
                        color: '#f44336', 
                        fontSize: '0.85rem',
                        marginTop: '8px',
                        fontWeight: '600'
                      }}>
                        ⚠️ Consult your doctor immediately about this interaction
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '15px', color: '#333' }}>
          📋 Your Current Medications
        </h3>
        <div>
          {medications.map((med, index) => (
            <div key={med.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              marginBottom: '8px',
              background: '#f8f9fa',
              borderRadius: '8px',
              borderLeft: '4px solid #667eea'
            }}>
              <div>
                <strong>{med.name}</strong>
                <span style={{ marginLeft: '10px', color: '#666' }}>
                  {med.dosage}
                </span>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                {med.times.length} time{med.times.length !== 1 ? 's' : ''} daily
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '15px', color: '#333' }}>
          💡 General Safety Tips
        </h3>
        <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Always inform your healthcare providers about all medications you're taking</li>
          <li>Don't start or stop medications without consulting your doctor</li>
          <li>Be aware of over-the-counter medications and supplements</li>
          <li>Keep an updated medication list with you at all times</li>
          <li>Report any unusual symptoms to your healthcare provider</li>
        </ul>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default InteractionChecker;