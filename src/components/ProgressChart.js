import React, { useState, useMemo } from 'react';
import { useMedication } from '../context/MedicationContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calendar, TrendingUp, Award, Target } from 'lucide-react';

function ProgressChart() {
  const { medications, takenHistory, streak } = useMedication();
  const [timeRange, setTimeRange] = useState('7');
  const [viewType, setViewType] = useState('adherence');

  const generateDateRange = (days) => {
    return Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      return d;
    });
  };

  const adherenceData = useMemo(() => {
    const dates = generateDateRange(parseInt(timeRange));
    return dates.map(date => {
      const dateStr = date.toDateString();
      const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });

      const scheduled = medications.reduce((count, med) => {
        const from = new Date(med.startDate);
        const to = med.endDate ? new Date(med.endDate) : new Date();
        return date >= from && date <= to ? count + med.times.length : count;
      }, 0);

      const taken = takenHistory.filter(t => new Date(t.timestamp).toDateString() === dateStr).length;
      const adherence = scheduled ? Math.round((taken / scheduled) * 100) : 0;

      return { date: formatted, day, adherence, taken, scheduled };
    });
  }, [timeRange, medications, takenHistory]);

  const streakData = useMemo(() => {
    let current = 0;
    return generateDateRange(parseInt(timeRange)).map(date => {
      const str = date.toDateString();
      const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const scheduled = medications.reduce((count, med) => {
        const from = new Date(med.startDate);
        const to = med.endDate ? new Date(med.endDate) : new Date();
        return date >= from && date <= to ? count + med.times.length : count;
      }, 0);

      const taken = takenHistory.filter(t => new Date(t.timestamp).toDateString() === str).length;
      const allTaken = scheduled > 0 && taken >= scheduled;

      current = allTaken ? current + 1 : 0;
      return { date: formatted, streak: current, perfect: allTaken ? 1 : 0 };
    });
  }, [timeRange, medications, takenHistory]);

  const getColor = (name) => {
    const palette = ['#667eea', '#764ba2', '#4ecdc4', '#44a08d', '#fd746c', '#ff9068', '#4caf50', '#8bc34a'];
    return palette[name.length % palette.length];
  };

  const medicationBreakdown = useMemo(() => {
    return medications.map(med => {
      const taken = takenHistory.filter(t => t.medicationId === med.id).length;
      const total = med.times.length * parseInt(timeRange);
      const adherence = total ? Math.round((taken / total) * 100) : 0;
      return {
        name: med.name,
        taken,
        scheduled: total,
        adherence,
        color: getColor(med.name)
      };
    });
  }, [medications, takenHistory, timeRange]);

  const stats = useMemo(() => {
    const total = adherenceData.reduce((acc, d) => acc + d.scheduled, 0);
    const taken = adherenceData.reduce((acc, d) => acc + d.taken, 0);
    const average = adherenceData.reduce((acc, d) => acc + d.adherence, 0) / adherenceData.length;
    return {
      totalScheduled: total,
      totalTaken: taken,
      averageAdherence: Math.round(average || 0),
      perfectDays: adherenceData.filter(d => d.adherence === 100).length,
      missedDoses: total - taken
    };
  }, [adherenceData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
        <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
        {payload.map((item, idx) => (
          <p key={idx} style={{ margin: 0, color: item.color }}>{item.name}: {item.value}{item.name === 'adherence' ? '%' : ''}</p>
        ))}
      </div>
    );
  };

  if (!medications.length) {
    return (
      <div className="card">
        <h2 style={{ color: '#333' }}>📈 Progress & Analytics</h2>
        <div className="empty-state">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p>No data yet. Add medications to begin tracking.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>📈 Progress & Analytics</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select value={timeRange} onChange={e => setTimeRange(e.target.value)} className="form-select">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <select value={viewType} onChange={e => setViewType(e.target.value)} className="form-select">
              <option value="adherence">Adherence</option>
              <option value="streak">Streak</option>
              <option value="medications">Per Medication</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <SummaryCard title="Average Adherence" value={`${stats.averageAdherence}%`} color="#4caf50" />
          <SummaryCard title="Perfect Days" value={stats.perfectDays} color="#667eea" />
          <SummaryCard title="Missed Doses" value={stats.missedDoses} color="#ff9068" />
          <SummaryCard title="Streak" value={streak} color="#4ecdc4" />
        </div>
      </div>

      {/* Chart Section */}
      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>
          {viewType === 'adherence' ? '📊 Adherence Rate' : viewType === 'streak' ? '🔥 Streak History' : '💊 Medication Wise' }
        </h3>
        <div style={{ height: '400px' }}>
          {viewType === 'adherence' && (
            <ResponsiveContainer>
              <LineChart data={adherenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="adherence" stroke="#667eea" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
          {viewType === 'streak' && (
            <ResponsiveContainer>
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
            <ResponsiveContainer>
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

      {/* Medication Cards */}
      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>📋 Medication Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
          {medicationBreakdown.map((med, idx) => (
            <div key={idx} style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', borderLeft: `4px solid ${med.color}` }}>
              <h4>{med.name}</h4>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Adherence</span>
                  <strong style={{ color: med.color }}>{med.adherence}%</strong>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${med.adherence}%`, background: med.color }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666' }}>
                <span>Taken: {med.taken}</span>
                <span>Scheduled: {med.scheduled}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const SummaryCard = ({ title, value, color }) => (
  <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
    <div style={{ fontSize: '2rem', fontWeight: 700, color }}>{value}</div>
    <div style={{ color: '#666', fontSize: '0.9rem' }}>{title}</div>
  </div>
);

export default ProgressChart;
