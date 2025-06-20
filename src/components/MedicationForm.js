import React, { useState } from 'react';
import { useMedication } from '../context/MedicationContext';
import { Plus, Trash2, Clock } from 'lucide-react';

function MedicationForm() {
  const { addMedication } = useMedication();

  const [medicationInfo, setMedicationInfo] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    times: ['08:00'],
    notes: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    reminderEnabled: true
  });

  // Handles input and checkbox updates
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMedicationInfo((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Updates specific time slot
  const updateTime = (idx, value) => {
    const updatedTimes = [...medicationInfo.times];
    updatedTimes[idx] = value;
    setMedicationInfo((prev) => ({
      ...prev,
      times: updatedTimes
    }));
  };

  // Adds new time slot
  const addNewTime = () => {
    if (medicationInfo.times.length >= 6) {
      alert('Maximum 6 reminders allowed per medication');
      return;
    }
    setMedicationInfo((prev) => ({
      ...prev,
      times: [...prev.times, '08:00']
    }));
  };

  // Removes a specific time slot
  const removeTime = (idx) => {
    const updated = medicationInfo.times.filter((_, i) => i !== idx);
    setMedicationInfo((prev) => ({
      ...prev,
      times: updated
    }));
  };

  // Handles frequency presets
  const setFrequency = (freq) => {
    const presets = {
      once: ['08:00'],
      twice: ['08:00', '20:00'],
      'three-times': ['08:00', '14:00', '20:00'],
      'four-times': ['08:00', '12:00', '16:00', '20:00'],
      custom: ['08:00']
    };

    setMedicationInfo((prev) => ({
      ...prev,
      frequency: freq,
      times: presets[freq] || ['08:00']
    }));
  };

  // Final form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!medicationInfo.name.trim() || !medicationInfo.dosage.trim()) {
      alert('Please provide both name and dosage.');
      return;
    }

    const newMedication = {
      ...medicationInfo,
      name: medicationInfo.name.trim(),
      dosage: medicationInfo.dosage.trim(),
      notes: medicationInfo.notes.trim(),
      createdAt: new Date().toISOString()
    };

    addMedication(newMedication);

    // Clear the form
    setMedicationInfo({
      name: '',
      dosage: '',
      frequency: 'daily',
      times: ['08:00'],
      notes: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      reminderEnabled: true
    });

    alert('Medication successfully saved!');
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '25px', color: '#333' }}>
        ➕ Log Your Medication
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={medicationInfo.name}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g., Metformin, Iron Tablet"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="dosage">Dosage *</label>
          <input
            type="text"
            id="dosage"
            name="dosage"
            value={medicationInfo.dosage}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g., 1 tablet, 500mg"
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
              { value: 'once', label: 'Once' },
              { value: 'twice', label: 'Twice' },
              { value: 'three-times', label: '3x daily' },
              { value: 'four-times', label: '4x daily' },
              { value: 'custom', label: 'Custom' }
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFrequency(opt.value)}
                style={{
                  padding: '10px',
                  border: `2px solid ${medicationInfo.frequency === opt.value ? '#007bff' : '#ccc'}`,
                  borderRadius: '6px',
                  background: medicationInfo.frequency === opt.value ? '#e6f0ff' : '#fff',
                  color: medicationInfo.frequency === opt.value ? '#007bff' : '#333',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Reminder Times</label>
          {medicationInfo.times.map((time, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Clock size={20} color="#007bff" />
              <input
                type="time"
                value={time}
                onChange={(e) => updateTime(idx, e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
              />
              {medicationInfo.times.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTime(idx)}
                  style={{
                    padding: '6px',
                    background: '#ffe6e6',
                    color: '#d32f2f',
                    borderRadius: '6px',
                    border: 'none'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addNewTime}
            style={{
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              border: '2px dashed #007bff',
              borderRadius: '6px',
              background: 'transparent',
              color: '#007bff',
              width: '100%'
            }}
          >
            <Plus size={16} />
            Add Another Time
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={medicationInfo.startDate}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              name="endDate"
              value={medicationInfo.endDate}
              onChange={handleChange}
              className="form-input"
              min={medicationInfo.startDate}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            name="notes"
            value={medicationInfo.notes}
            onChange={handleChange}
            className="form-textarea"
            rows="3"
            placeholder="e.g., Take after food, avoid dairy"
          />
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              name="reminderEnabled"
              checked={medicationInfo.reminderEnabled}
              onChange={handleChange}
              style={{ width: 'auto' }}
            />
            Enable reminder notifications
          </label>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
            <Plus size={16} />
            Save Medication
          </button>
          <button
            type="button"
            className="btn"
            style={{ flex: 1, background: '#f8f9fa', color: '#333' }}
            onClick={() => {
              setMedicationInfo({
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
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

export default MedicationForm;
