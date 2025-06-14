import React from 'react';
import { useMedication } from '../context/MedicationContext';
import ReminderCard from './ReminderCard';
import StreakCounter from './StreakCounter';
import { Pill, Clock, TrendingUp, Users } from 'lucide-react';

function Dashboard() {
  const { 
    medications, 
    getTodaysReminders, 
    getAdherenceRate,
    streak,
    notifications
  } = useMedication();

  const todaysReminders = getTodaysReminders();
  const adherenceRate = getAdherenceRate();
  const overdueReminders = todaysReminders.filter(r => r.isOverdue);

  const stats = [
    {
      title: 'Active Medications',
      value: medications.length,
      icon: <Pill className="w-8 h-8" />,
      color: '#667eea'
    },
    {
      title: 'Today\'s Reminders',
      value: todaysReminders.length,
      icon: <Clock className="w-8 h-8" />,
      color: '#4ecdc4'
    },
    {
      title: 'Adherence Rate',
      value: `${adherenceRate}%`,
      icon: <TrendingUp className="w-8 h-8" />,
      color: '#4caf50'
    },
    {
      title: 'Current Streak',
      value: `${streak} days`,
      icon: <Users className="w-8 h-8" />,
      color: '#ff9068'
    }
  ];

  return (
    <div>
      {/* Quick Stats */}
      <div className="dashboard-grid">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '15px'
            }}>
              <div>
                <h3 style={{ 
                  fontSize: '2rem', 
                  fontWeight: '700', 
                  color: stat.color,
                  margin: 0
                }}>
                  {stat.value}
                </h3>
                <p style={{ 
                  color: '#666', 
                  fontSize: '0.9rem',
                  margin: 0
                }}>
                  {stat.title}
                </p>
              </div>
              <div style={{ color: stat.color, opacity: 0.7 }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Streak Counter */}
      <div className="card">
        <StreakCounter />
      </div>

      {/* Today's Reminders */}
      <div className="card">
        <h2 style={{ marginBottom: '20px', color: '#333' }}>
          📅 Today's Reminders
        </h2>
        
        {todaysReminders.length === 0 ? (
          <div className="empty-state">
            <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>No reminders for today!</p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              Great job staying on track with your medications.
            </p>
          </div>
        ) : (
          <div>
            {overdueReminders.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#f44336', marginBottom: '10px' }}>
                  ⚠️ Overdue Medications
                </h3>
                {overdueReminders.map((reminder, index) => (
                  <ReminderCard key={index} reminder={reminder} />
                ))}
              </div>
            )}
            
            <h3 style={{ marginBottom: '10px', color: '#333' }}>
              📋 All Today's Reminders
            </h3>
            {todaysReminders.map((reminder, index) => (
              <ReminderCard key={index} reminder={reminder} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#333' }}>
            🔔 Recent Notifications
          </h2>
          {notifications.slice(-5).reverse().map(notification => (
            <div 
              key={notification.id}
              style={{
                padding: '12px',
                marginBottom: '10px',
                borderRadius: '8px',
                backgroundColor: notification.type === 'success' ? '#e8f5e8' : '#fff3cd',
                borderLeft: `4px solid ${notification.type === 'success' ? '#4caf50' : '#ffc107'}`
              }}
            >
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                {notification.message}
              </p>
              <small style={{ color: '#666' }}>
                {new Date(notification.timestamp).toLocaleTimeString()}
              </small>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h2 style={{ marginBottom: '20px', color: '#333' }}>
          🚀 Quick Actions
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <button className="btn btn-primary">
            ➕ Add New Medication
          </button>
          <button className="btn btn-success">
            📊 View Progress Report
          </button>
          <button className="btn btn-primary">
            ⚠️ Check Interactions
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;