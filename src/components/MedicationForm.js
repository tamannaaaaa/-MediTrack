import React, { useState } from 'react';
import { useMedication } from '../context/MedicationContext';
import { Plus, Trash2, Clock } from 'lucide-react';

function MedicationForm() {
  const { addMedication } = useMedication();
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    times: ['08:00'],
    notes: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    reminderEnabled: true
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTimeChange = (index, value) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData(prev => ({
      ...prev,
      times: newTimes
    }));
  };

  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      times: [...prev.times, '08:00']
    }));
  };

  const removeTimeSlot = (index) => {
    if (formData.times.length > 1) {
      const newTimes = formData.times.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        times: newTimes
      }));
    }
  };

  const handleFrequencyChange = (frequency) => {
    let defaultTimes = [];
    switch (frequency) {
      case 'once':
        defaultTimes = ['08:00'];
        break;
      case 'twice':
        defaultTimes = ['08:00', '20:00'];
        break;
      case 'three-times':
        defaultTimes = ['08:00', '14:00', '20:00'];
        break;
      case 'four-times':
        defaultTimes = ['08:00', '12:00', '16:00', '20:00'];
        break;
      default:
        defaultTimes = ['08:00'];
    }
    
    setFormData(prev => ({
      ...prev,
      frequency,
      times: defaultTimes
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.dosage.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const medication = {
      ...formData,
      name: formData.name.trim(),
      dosage: formData.dosage.trim(),
      notes: formData.notes.trim(),
      createdAt: new Date().toISOString()
    };

    addMedication(medication);
    
    // Reset form
    setFormData({
      name: '',
      dosage: '',
      frequency: 'daily',
      times: ['08:00'],
      notes: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      reminderEnabled: true
    });

    alert('Medication added successfully!');
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '25px', color: '#333' }}>
        ➕ Add New Medication
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Medication Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-input"
            placeholder="e.g., Lisinopril, Metformin, Vitamin D"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="dosage">Dosage *</label>
          <input
            type="text"
            id="dosage"
            name="dosage"
            value={formData.dosage}
            onChange={handleInputChange}
            className="form-input"
            placeholder="e.g., 10mg, 2 tablets, 1 capsule"
            required
          />
        </div>

        <div className="form-group">
          <label>Frequency</label>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '10px',
            marginTop: '10px'
          }}>
            {[
              { value: 'once', label: 'Once daily' },
              { value: 'twice', label: 'Twice daily' },
              { value: 'three-times', label: '3 times daily' },
              { value: 'four-times', label: '4 times daily' },
              { value: 'custom', label: 'Custom' }
            ].map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleFrequencyChange(option.value)}
                style={{
                  padding: '10px',
                  border: `2px solid ${formData.frequency === option.value ? '#667eea' : '#e1e5e9'}`,
                  borderRadius: '8px',
                  background: formData.frequency === option.value ? '#f0f3ff' : 'white',
                  color: formData.frequency === option.value ? '#667eea' : '#666',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Reminder Times</label>
          {formData.times.map((time, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              marginBottom: '10px'
            }}>
              <Clock size={20} color="#667eea" />
              <input
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(index, e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
              />
              {formData.times.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTimeSlot(index)}
                  style={{
                    padding: '8px',
                    border: 'none',
                    borderRadius: '6px',
                    background: '#ffebee',
                    color: '#f44336',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addTimeSlot}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px',
              border: '2px dashed #667eea',
              borderRadius: '8px',
              background: 'transparent',
              color: '#667eea',
              cursor: 'pointer',
              width: '100%',
              justifyContent: 'center'
            }}
          >
            <Plus size={16} />
            Add Another Time
          </button>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: '15px'
        }}>
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date (Optional)</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className="form-input"
              min={formData.startDate}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes (Optional)</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            className="form-textarea"
            rows="3"
            placeholder="Any special instructions, side effects to watch for, etc."
          />
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              name="reminderEnabled"
              checked={formData.reminderEnabled}
              onChange={handleInputChange}
              style={{ width: 'auto' }}
            />
            Enable push notifications for reminders
          </label>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
            <Plus size={16} />
            Add Medication
          </button>
          <button 
            type="button" 
            className="btn" 
            style={{ 
              flex: 1,
              background: '#f5f5f5',
              color: '#666'
            }}
            onClick={() => {
              setFormData({
                name: '',
                dosage: '',
                frequency: 'daily',
                times: ['08:00'],
                notes: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                reminderEnabled: true
              });
            }}
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
}

export default MedicationForm;