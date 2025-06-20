import React from 'react';
import { useMedication } from '../context/MedicationContext';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';

function ReminderCard({ reminder }) {
  const { markAsTaken } = useMedication();

  const handleMarkAsTaken = () => {
    markAsTaken(reminder.medication.id, reminder.scheduledTime);
  };

  const getTimeStatus = () => {
    const now = new Date();
    const reminderTime = new Date();
    const [hours, minutes] = reminder.scheduledTime.split(':');
    reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const diffInMinutes = Math.floor((now - reminderTime) / (1000 * 60));

    if (diffInMinutes < -30) {
      return { status: 'upcoming', color: '#2196f3', message: 'Upcoming' };
    } else if (diffInMinutes < 0) {
      return { status: 'soon', color: '#ff9800', message: 'Due soon' };
    } else if (diffInMinutes <= 30) {
      return { status: 'due', color: '#f44336', message: 'Due now' };
    } else {
      return { status: 'overdue', color: '#d32f2f', message: `${diffInMinutes} min overdue` };
    }
  };

  const timeStatus = getTimeStatus();
  const { medication } = reminder;

  return (
    <div
      style={{
        border: `2px solid ${timeStatus.color}`,
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        backgroundColor: reminder.isOverdue ? '#fff5f5' : '#f8f9fa',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          {/* Medication Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <h3 style={{ margin: 0, color: '#333', fontSize: '1.2rem' }}>💊 {medication.name}</h3>
            <span
              style={{
                padding: '4px 8px',
                borderRadius: 12,
                fontSize: '0.7rem',
                fontWeight: 600,
                backgroundColor: timeStatus.status === 'overdue' ? '#ffebee' : '#e3f2fd',
                color: timeStatus.color,
                border: `1px solid ${timeStatus.color}`,
              }}
            >
              {timeStatus.message}
            </span>
          </div>

          {/* Dosage Info */}
          <p style={{ margin: '0 0 8px', color: '#666', fontSize: '0.9rem' }}>
            <strong>Dosage:</strong> {medication.dosage}
          </p>

          {/* Time Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: timeStatus.color }}>
            <Clock size={16} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              Scheduled for {reminder.scheduledTime}
            </span>
          </div>

          {/* Optional Notes */}
          {medication.notes && (
            <p
              style={{
                marginTop: 8,
                color: '#666',
                fontSize: '0.8rem',
                fontStyle: 'italic',
                backgroundColor: '#f0f0f0',
                padding: 8,
                borderRadius: 6,
              }}
            >
              📝 {medication.notes}
            </p>
          )}
        </div>

        {/* Right Section: Actions */}
        <div style={{ marginLeft: 15 }}>
          {reminder.isOverdue && (
            <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5, color: '#f44336' }}>
              <AlertTriangle size={16} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>OVERDUE</span>
            </div>
          )}

          <button
            onClick={handleMarkAsTaken}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              fontSize: '0.9rem',
              fontWeight: 600,
              backgroundColor: '#4caf50',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <CheckCircle size={16} />
            Mark as Taken
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginTop: 15 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: '0.8rem', color: '#666' }}>Today's Progress</span>
          <span style={{ fontSize: '0.8rem', color: '#666' }}>
            {medication.times.length} doses scheduled
          </span>
        </div>

        <div
          style={{
            width: '100%',
            height: 6,
            backgroundColor: '#e0e0e0',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${(1 / medication.times.length) * 100}%`,
              height: '100%',
              backgroundColor: timeStatus.color,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ReminderCard;
