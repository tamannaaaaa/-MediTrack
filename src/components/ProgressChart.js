import React, { useState, useMemo } from 'react';
import { useMedication } from '../context/MedicationContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Award, Target } from 'lucide-react';

function ProgressChart() {
  const { medications, takenHistory, streak } = useMedication();
  const [timeRange, setTimeRange] = useState('7'); // 7, 30, 90 days
  const [viewType, setViewType] = useState('adherence'); // adherence, streak, medications

  const getDateRange = (days) => {
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
    return dates;
  };

  const adherenceData = useMemo(() => {
    const days = parseInt(timeRange);
    const dateRange = getDateRange(days);
    
    return dateRange.map(date => {
      const dateStr = date.toDateString();
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayMonth = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Calculate scheduled medications for this day
      let scheduledCount = 0;
      medications.forEach(med => {
        const medStartDate = new Date(med.startDate);
        const medEndDate = med.endDate ? new Date(med.endDate) : new Date();
        
        if (date >= medStartDate && date <= medEndDate) {
          scheduledCount += med.times.length;
        }
      });
      
      // Calculate taken medications for this day
      const takenCount = takenHistory.filter(taken => 
        new Date(taken.timestamp).toDateString() === dateStr
      ).length;
      
      const adherenceRate = scheduledCount > 0 ? Math.round((takenCount / scheduledCount) * 100) : 0;
      
      return {
        date: dayMonth,
        day: dayName,
        adherence: adherenceRate,
        taken: takenCount,
        scheduled: scheduledCount
      };
    });
  }, [timeRange, medications, takenHistory]);

  const streakData = useMemo(() => {
    const days = parseInt(timeRange);
    const dateRange = getDateRange(days);
    let currentStreak = 0;
    
    return dateRange.map(date => {
      const dateStr = date.toDateString();
      const dayMonth = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Check if all medications were taken on this day
      let scheduledCount = 0;
      medications.forEach(med => {
        const medStartDate = new Date(med.startDate);
        const medEndDate = med.endDate ? new Date(med.endDate) : new Date();
        
        if (date >= medStartDate && date <= medEndDate) {
          scheduledCount += med.times.length;
        }
      });
      
      const takenCount = takenHistory.filter(taken => 
        new Date(taken.timestamp).toDateString() === dateStr
      ).length;
      
      const allTaken = scheduledCount > 0 && takenCount >= scheduledCount;
      
      if (allTaken) {
        currentStreak++;
      } else {
        currentStreak = 0;
      }
      
      return {
        date: dayMonth,
        streak: currentStreak,
        perfect: allTaken ? 1 : 0
      };
    });
  }, [timeRange, medications, takenHistory]);

    const getColorForMedication = (name) => {
    const colors = ['#667eea', '#764ba2', '#4ecdc4', '#44a08d', '#fd746c', '#ff9068', '#4caf50', '#8bc34a'];
    const index = name.length % colors.length;
    return colors[index];
  };


  const medicationBreakdown = useMemo(() => {
    const breakdown = {};
    
    medications.forEach(med => {
      const takenForMed = takenHistory.filter(taken => taken.medicationId === med.id);
      const totalScheduled = med.times.length * parseInt(timeRange); // Simplified calculation
      const adherenceRate = totalScheduled > 0 ? Math.round((takenForMed.length / totalScheduled) * 100) : 0;
      
      breakdown[med.name] = {
        name: med.name,
        taken: takenForMed.length,
        scheduled: totalScheduled,
        adherence: adherenceRate,
        color: getColorForMedication(med.name)
      };
    });
    
    return Object.values(breakdown);
  }, [medications, takenHistory, timeRange]);


  const overallStats = useMemo(() => {
    const totalScheduled = adherenceData.reduce((sum, day) => sum + day.scheduled, 0);
    const totalTaken = adherenceData.reduce((sum, day) => sum + day.taken, 0);
    const averageAdherence = adherenceData.reduce((sum, day) => sum + day.adherence, 0) / adherenceData.length;
    const perfectDays = adherenceData.filter(day => day.adherence === 100).length;
    
    return {
      totalScheduled,
      totalTaken,
      averageAdherence: Math.round(averageAdherence || 0),
      perfectDays,
      missedDoses: totalScheduled - totalTaken
    };
  }, [adherenceData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: '600' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '4px 0', color: entry.color }}>
              {entry.name}: {entry.value}{entry.name === 'adherence' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (medications.length === 0) {
    return (
      <div className="card">
        <h2 style={{ marginBottom: '20px', color: '#333' }}>
          📈 Progress & Analytics
        </h2>
        <div className="empty-state">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p>No progress data available</p>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            Add medications and start tracking to see your progress.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with controls */}
      <div className="card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>
            📈 Progress & Analytics
          </h2>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="form-select"
              style={{ width: 'auto', minWidth: '120px' }}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            
            <select 
              value={viewType} 
              onChange={(e) => setViewType(e.target.value)}
              className="form-select"
              style={{ width: 'auto', minWidth: '150px' }}
            >
              <option value="adherence">Adherence Rate</option>
              <option value="streak">Streak Progress</option>
              <option value="medications">By Medication</option>
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#4caf50' }}>
              {overallStats.averageAdherence}%
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Average Adherence</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>
              {overallStats.perfectDays}
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Perfect Days</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ff9068' }}>
              {overallStats.missedDoses}
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Missed Doses</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#4ecdc4' }}>
              {streak}
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Current Streak</div>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="card">
        <h3 style={{ marginBottom: '20px', color: '#333' }}>
          {viewType === 'adherence' && '📊 Daily Adherence Rate'}
          {viewType === 'streak' && '🔥 Streak Progress'}
          {viewType === 'medications' && '💊 Medication Breakdown'}
        </h3>
        
        <div style={{ height: '400px', width: '100%' }}>
          {viewType === 'adherence' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={adherenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="adherence" 
                  stroke="#667eea" 
                  strokeWidth={3}
                  dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
          
          {viewType === 'streak' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={streakData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="streak" fill="#4caf50" />
              </BarChart>
            </ResponsiveContainer>
          )}
          
          {viewType === 'medications' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={medicationBreakdown} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="adherence" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Medication Details */}
      <div className="card">
        <h3 style={{ marginBottom: '20px', color: '#333' }}>
          📋 Medication Performance
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '15px'
        }}>
          {medicationBreakdown.map((med, index) => (
            <div key={index} style={{
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '10px',
              borderLeft: `4px solid ${med.color}`
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                {med.name}
              </h4>
              
              <div style={{ marginBottom: '10px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '5px'
                }}>
                  <span>Adherence Rate</span>
                  <span style={{ fontWeight: '600', color: med.color }}>
                    {med.adherence}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${med.adherence}%`,
                      background: med.color
                    }}
                  />
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '0.9rem',
                color: '#666'
              }}>
                <span>Taken: {med.taken}</span>
                <span>Scheduled: {med.scheduled}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="card">
        <h3 style={{ marginBottom: '20px', color: '#333' }}>
          🏆 Achievements
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <div style={{
            padding: '20px',
            background: overallStats.averageAdherence >= 90 ? '#e8f5e8' : '#f8f9fa',
            borderRadius: '10px',
            textAlign: 'center',
            border: overallStats.averageAdherence >= 90 ? '2px solid #4caf50' : '2px solid #e0e0e0'
          }}>
            <Award className="w-8 h-8 mx-auto mb-2" style={{ 
              color: overallStats.averageAdherence >= 90 ? '#4caf50' : '#ccc' 
            }} />
            <h4 style={{ margin: '0 0 5px 0' }}>Consistent</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
              90%+ adherence rate
            </p>
          </div>
          
          <div style={{
            padding: '20px',
            background: streak >= 7 ? '#e8f5e8' : '#f8f9fa',
            borderRadius: '10px',
            textAlign: 'center',
            border: streak >= 7 ? '2px solid #4caf50' : '2px solid #e0e0e0'
          }}>
            <Target className="w-8 h-8 mx-auto mb-2" style={{ 
              color: streak >= 7 ? '#4caf50' : '#ccc' 
            }} />
            <h4 style={{ margin: '0 0 5px 0' }}>Week Warrior</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
              7+ day streak
            </p>
          </div>
          
          <div style={{
            padding: '20px',
            background: overallStats.perfectDays >= 5 ? '#e8f5e8' : '#f8f9fa',
            borderRadius: '10px',
            textAlign: 'center',
            border: overallStats.perfectDays >= 5 ? '2px solid #4caf50' : '2px solid #e0e0e0'
          }}>
            <Calendar className="w-8 h-8 mx-auto mb-2" style={{ 
              color: overallStats.perfectDays >= 5 ? '#4caf50' : '#ccc' 
            }} />
            <h4 style={{ margin: '0 0 5px 0' }}>Perfect Week</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
              5+ perfect days
            </p>
          </div>
          
          <div style={{
            padding: '20px',
            background: overallStats.missedDoses === 0 ? '#e8f5e8' : '#f8f9fa',
            borderRadius: '10px',
            textAlign: 'center',
            border: overallStats.missedDoses === 0 ? '2px solid #4caf50' : '2px solid #e0e0e0'
          }}>
            <TrendingUp className="w-8 h-8 mx-auto mb-2" style={{ 
              color: overallStats.missedDoses === 0 ? '#4caf50' : '#ccc' 
            }} />
            <h4 style={{ margin: '0 0 5px 0' }}>Flawless</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
              Zero missed doses
            </p>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="card">
        <h3 style={{ marginBottom: '20px', color: '#333' }}>
          💡 Insights & Recommendations
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {overallStats.averageAdherence < 80 && (
            <div style={{
              padding: '15px',
              background: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '8px',
              borderLeft: '4px solid #fdcb6e'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#856404' }}>
                💡 Improvement Opportunity
              </h4>
              <p style={{ margin: 0, color: '#856404' }}>
                Your adherence rate is below 80%. Consider setting more reminders or reviewing your medication schedule.
              </p>
            </div>
          )}
          
          {overallStats.averageAdherence >= 90 && (
            <div style={{
              padding: '15px',
              background: '#d1ecf1',
              border: '1px solid #bee5eb',
              borderRadius: '8px',
              borderLeft: '4px solid #17a2b8'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#0c5460' }}>
                🎉 Excellent Work!
              </h4>
              <p style={{ margin: 0, color: '#0c5460' }}>
                You're maintaining excellent adherence! Keep up the great work with your medication routine.
              </p>
            </div>
          )}
          
          {streak >= 14 && (
            <div style={{
              padding: '15px',
              background: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '8px',
              borderLeft: '4px solid #28a745'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#155724' }}>
                🔥 Amazing Streak!
              </h4>
              <p style={{ margin: 0, color: '#155724' }}>
                You've maintained a {streak}-day streak! This consistency will greatly benefit your health.
              </p>
            </div>
          )}
          
          {overallStats.missedDoses > 0 && overallStats.missedDoses <= 3 && (
            <div style={{
              padding: '15px',
              background: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '8px',
              borderLeft: '4px solid #dc3545'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#721c24' }}>
                ⚠️ Missed Doses Alert
              </h4>
              <p style={{ margin: 0, color: '#721c24' }}>
                You've missed {overallStats.missedDoses} dose{overallStats.missedDoses > 1 ? 's' : ''} recently. 
                Try setting up additional reminders to stay on track.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProgressChart;