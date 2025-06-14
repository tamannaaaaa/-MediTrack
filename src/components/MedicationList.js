import React, { useState } from 'react';
import { useMedication } from '../context/MedicationContext';
import { Trash2, Edit3, Clock, Calendar, AlertCircle, Pill } from 'lucide-react';

function MedicationList() {
  const { medications, deleteMedication, takenHistory } = useMedication();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const getMedicationStatus = (medication) => {
    const today = new Date().toDateString();
    const todaysTaken = takenHistory.filter(taken => 
      taken.medicationId === medication.id &&
      new Date(taken.timestamp).toDateString() === today
    );
    
    const totalScheduledToday = medication.times.length;
    const takenToday = todaysTaken.length;
    
    if (takenToday === totalScheduledToday) return 'completed';
    if (takenToday > 0) return 'partial';
    return 'pending';
  };

  const getNextDose = (medication) => {
    const now = new Date();
    const today = new Date().toDateString();
    
    const todaysTaken = takenHistory.filter(taken => 
      taken.medicationId === medication.id &&
      new Date(taken.timestamp).toDateString() === today
    );
    
    const takenTimes = todaysTaken.map(taken => taken.scheduledTime);
    const pendingTimes = medication.times.filter(time => !takenTimes.includes(time));
    
    if (pendingTimes.length === 0) return null;
    
    const nextTime = pendingTimes.find(time => {
      const [hours, minutes] = time.split(':');
      const timeDate = new Date();
      timeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return timeDate > now;
    });
    
    return nextTime || pendingTimes[0];
  };

  const filteredMedications = medications.filter(medication => {
    if (filter === 'all') return true;
    const status = getMedicationStatus(medication);
    return status === filter;
  });

  const sortedMedications = [...filteredMedications].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'frequency':
        return b.times.length - a.times.length;
      case 'status':
        const statusOrder = { pending: 0, partial: 1, completed: 2 };
        return statusOrder[getMedicationStatus(a)] - statusOrder[getMedicationStatus(b)];
      default:
        return 0;
    }
  });

  const handleDelete = (id) => {
    deleteMedication(id);
    setShowDeleteConfirm(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return { bg: '#e8f5e8', border: '#4caf50', text: '#2e7d32' };
      case 'partial':
        return { bg: '#fff3e0', border: '#ff9800', text: '#f57c00' };
      case 'pending':
        return { bg: '#ffebee', border: '#f44336', text: '#d32f2f' };
      default:
        return { bg: '#f5f5f5', border: '#ccc', text: '#666' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'partial':
        return '🔄';
      case 'pending':
        return '⏰';
      default:
        return '❓';
    }
  };

  if (medications.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <Pill className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3>No medications added yet</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Start by adding your first medication to track your adherence.
          </p>
          <button className="btn btn-primary">
            ➕ Add Your First Medication
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '25px',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <h2 style={{ color: '#333', margin: 0 }}>
            💊 My Medications ({medications.length})
          </h2>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="form-input"
              style={{ width: 'auto', minWidth: '120px' }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="completed">Completed</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input"
              style={{ width: 'auto', minWidth: '120px' }}
            >
              <option value="name">Sort by Name</option>
              <option value="frequency">Sort by Frequency</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px',
          marginBottom: '25px'
        }}>
          {['completed', 'partial', 'pending'].map(status => {
            const count = medications.filter(med => getMedicationStatus(med) === status).length;
            const colors = getStatusColor(status);
            return (
              <div
                key={status}
                style={{
                  padding: '15px',
                  borderRadius: '8px',
                  backgroundColor: colors.bg,
                  border: `1px solid ${colors.border}`,
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>
                  {getStatusIcon(status)}
                </div>
                <div style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '600',
                  color: colors.text
                }}>
                  {count}
                </div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: colors.text,
                  textTransform: 'capitalize'
                }}>
                  {status}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Medications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {sortedMedications.map(medication => {
          const status = getMedicationStatus(medication);
          const colors = getStatusColor(status);
          const nextDose = getNextDose(medication);
          
          return (
            <div key={medication.id} className="card">
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '15px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    marginBottom: '8px'
                  }}>
                    <h3 style={{ 
                      margin: 0, 
                      color: '#333',
                      fontSize: '1.2rem'
                    }}>
                      {medication.name}
                    </h3>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        backgroundColor: colors.bg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`
                      }}
                    >
                      {getStatusIcon(status)} {status.toUpperCase()}
                    </span>
                  </div>
                  
                  <p style={{ 
                    margin: '0 0 8px 0', 
                    color: '#666',
                    fontSize: '0.9rem'
                  }}>
                    <strong>Dosage:</strong> {medication.dosage}
                  </p>
                  
                  {medication.notes && (
                    <p style={{ 
                      margin: '0 0 8px 0', 
                      color: '#666',
                      fontSize: '0.9rem',
                      fontStyle: 'italic'
                    }}>
                      📝 {medication.notes}
                    </p>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn"
                    style={{
                      padding: '8px',
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2',
                      border: '1px solid #bbdefb'
                    }}
                    title="Edit medication"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    className="btn"
                    style={{
                      padding: '8px',
                      backgroundColor: '#ffebee',
                      color: '#f44336',
                      border: '1px solid #ffcdd2'
                    }}
                    onClick={() => setShowDeleteConfirm(medication.id)}
                    title="Delete medication"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Schedule Info */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '15px'
              }}>
                <div style={{ 
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '5px'
                  }}>
                    <Clock size={16} color="#667eea" />
                    <strong style={{ fontSize: '0.9rem', color: '#333' }}>
                      Schedule ({medication.times.length}x daily)
                    </strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {medication.times.join(', ')}
                  </div>
                </div>

                {nextDose && (
                  <div style={{ 
                    padding: '12px',
                    backgroundColor: '#fff3e0',
                    borderRadius: '6px',
                    border: '1px solid #ffcc02'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      marginBottom: '5px'
                    }}>
                      <AlertCircle size={16} color="#ff9800" />
                      <strong style={{ fontSize: '0.9rem', color: '#f57c00' }}>
                        Next Dose
                      </strong>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#f57c00' }}>
                      {nextDose}
                    </div>
                  </div>
                )}

                <div style={{ 
                  padding: '12px',
                  backgroundColor: '#f0f8ff',
                  borderRadius: '6px',
                  border: '1px solid #cce7ff'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '5px'
                  }}>
                    <Calendar size={16} color="#2196f3" />
                    <strong style={{ fontSize: '0.9rem', color: '#1976d2' }}>
                      Duration
                    </strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#1976d2' }}>
                    {new Date(medication.startDate).toLocaleDateString()} - 
                    {medication.endDate ? new Date(medication.endDate).toLocaleDateString() : 'Ongoing'}
                  </div>
                </div>
              </div>

              {/* Daily Progress */}
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#333', marginBottom: '8px', display: 'block' }}>
                  Today's Progress:
                </strong>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  {medication.times.map((time, index) => {
                    const today = new Date().toDateString();
                    const wasTaken = takenHistory.some(taken => 
                      taken.medicationId === medication.id &&
                      taken.scheduledTime === time &&
                      new Date(taken.timestamp).toDateString() === today
                    );
                    
                    return (
                      <div
                        key={index}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '15px',
                          fontSize: '0.8rem',
                          backgroundColor: wasTaken ? '#e8f5e8' : '#ffebee',
                          color: wasTaken ? '#2e7d32' : '#d32f2f',
                          border: `1px solid ${wasTaken ? '#4caf50' : '#f44336'}`
                        }}
                      >
                        {wasTaken ? '✅' : '⏰'} {time}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delete Confirmation Modal */}
              {showDeleteConfirm === medication.id && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000
                }}>
                  <div style={{
                    backgroundColor: 'white',
                    padding: '25px',
                    borderRadius: '12px',
                    maxWidth: '400px',
                    width: '90%'
                  }}>
                    <h3 style={{ marginBottom: '15px', color: '#333' }}>
                      🗑️ Delete Medication
                    </h3>
                    <p style={{ marginBottom: '20px', color: '#666' }}>
                      Are you sure you want to delete <strong>{medication.name}</strong>? 
                      This action cannot be undone and will remove all tracking history.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button
                        className="btn"
                        style={{ backgroundColor: '#f5f5f5', color: '#666' }}
                        onClick={() => setShowDeleteConfirm(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn"
                        style={{ backgroundColor: '#f44336', color: 'white' }}
                        onClick={() => handleDelete(medication.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MedicationList;