import React from 'react';
import { useMedication } from '../context/MedicationContext';
import { Target, Calendar, Award } from 'lucide-react';

function StreakCounter() {
  const { streak, medications, takenHistory, getAdherenceRate } = useMedication();
  
  const adherenceRate = getAdherenceRate();
  
  const getStreakMessage = () => {
    if (streak === 0) {
      return "Start your streak today!";
    } else if (streak === 1) {
      return "Great start! Keep it up!";
    } else if (streak < 7) {
      return "Building momentum!";
    } else if (streak < 30) {
      return "Excellent consistency!";
    } else {
      return "Outstanding dedication!";
    }
  };

  const getStreakEmoji = () => {
    if (streak === 0) return "🎯";
    if (streak < 7) return "🔥";
    if (streak < 30) return "💪";
    return "🏆";
  };

  const getNextMilestone = () => {
    const milestones = [1, 7, 14, 30, 60, 90, 180, 365];
    return milestones.find(milestone => milestone > streak) || streak + 30;
  };

  const getMilestoneProgress = () => {
    const nextMilestone = getNextMilestone();
    const previousMilestone = streak === 0 ? 0 : 
      [0, 1, 7, 14, 30, 60, 90, 180, 365].reverse().find(milestone => milestone <= streak) || 0;
    
    const progress = streak === 0 ? 0 : ((streak - previousMilestone) / (nextMilestone - previousMilestone)) * 100;
    return Math.min(progress, 100);
  };

  const getTodayStatus = () => {
    const today = new Date().toDateString();
    const todaysMedications = medications.length;
    
    if (todaysMedications === 0) {
      return { status: 'no-medications', message: 'No medications scheduled' };
    }
    
    const todaysTaken = takenHistory.filter(taken => 
      new Date(taken.timestamp).toDateString() === today
    ).length;
    
    const totalScheduledToday = medications.reduce((total, med) => total + med.times.length, 0);
    
    if (todaysTaken === totalScheduledToday) {
      return { status: 'complete', message: 'All medications taken today!' };
    } else if (todaysTaken > 0) {
      return { status: 'partial', message: `${todaysTaken}/${totalScheduledToday} medications taken` };
    } else {
      return { status: 'pending', message: 'No medications taken today' };
    }
  };

  const getStreakHistory = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const totalScheduled = medications.reduce((total, med) => {
        const medStartDate = new Date(med.startDate);
        const medEndDate = med.endDate ? new Date(med.endDate) : new Date();
        
        if (date >= medStartDate && date <= medEndDate) {
          return total + med.times.length;
        }
        return total;
      }, 0);
      
      const taken = takenHistory.filter(taken => 
        new Date(taken.timestamp).toDateString() === dateStr
      ).length;
      
      const isComplete = totalScheduled > 0 && taken >= totalScheduled;
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        complete: isComplete,
        taken,
        scheduled: totalScheduled
      });
    }
    return last7Days;
  };

  const getAchievements = () => {
    const achievements = [];
    
    if (streak >= 1) achievements.push({ name: 'First Step', icon: '🎯', achieved: true });
    if (streak >= 7) achievements.push({ name: 'Week Warrior', icon: '🔥', achieved: true });
    if (streak >= 14) achievements.push({ name: 'Two Weeks Strong', icon: '💪', achieved: true });
    if (streak >= 30) achievements.push({ name: 'Monthly Master', icon: '🏆', achieved: true });
    if (streak >= 90) achievements.push({ name: 'Quarterly Champion', icon: '🥇', achieved: true });
    if (streak >= 365) achievements.push({ name: 'Year Legend', icon: '👑', achieved: true });
    
    // Add next achievement to work towards
    const nextAchievements = [
      { threshold: 1, name: 'First Step', icon: '🎯' },
      { threshold: 7, name: 'Week Warrior', icon: '🔥' },
      { threshold: 14, name: 'Two Weeks Strong', icon: '💪' },
      { threshold: 30, name: 'Monthly Master', icon: '🏆' },
      { threshold: 90, name: 'Quarterly Champion', icon: '🥇' },
      { threshold: 365, name: 'Year Legend', icon: '👑' }
    ];
    
    const nextAchievement = nextAchievements.find(ach => ach.threshold > streak);
    if (nextAchievement) {
      achievements.push({ ...nextAchievement, achieved: false });
    }
    
    return achievements;
  };

  const todayStatus = getTodayStatus();
  const nextMilestone = getNextMilestone();
  const milestoneProgress = getMilestoneProgress();
  const streakHistory = getStreakHistory();
  const achievements = getAchievements();

  return (
    <div>
      <h2 style={{ marginBottom: '25px', color: '#333' }}>
        🔥 Streak Counter
      </h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '25px'
      }}>
        {/* Main Streak Display */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '25px',
          borderRadius: '16px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            fontSize: '3rem',
            marginBottom: '10px'
          }}>
            {getStreakEmoji()}
          </div>
          <div style={{ 
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '8px'
          }}>
            {streak}
          </div>
          <div style={{ 
            fontSize: '1rem',
            opacity: 0.9,
            marginBottom: '5px'
          }}>
            Day{streak !== 1 ? 's' : ''} Streak
          </div>
          <div style={{ 
            fontSize: '0.9rem',
            opacity: 0.8
          }}>
            {getStreakMessage()}
          </div>
          
          {/* Decorative elements */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.1)'
          }} />
        </div>

        {/* Adherence Rate */}
        <div style={{
          background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
          color: 'white',
          padding: '25px',
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <Target size={32} style={{ marginBottom: '10px' }} />
          <div style={{ 
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '8px'
          }}>
            {adherenceRate}%
          </div>
          <div style={{ 
            fontSize: '1rem',
            opacity: 0.9,
            marginBottom: '5px'
          }}>
            Adherence Rate
          </div>
          <div style={{ 
            fontSize: '0.8rem',
            opacity: 0.8
          }}>
            Last 7 days
          </div>
        </div>

        {/* Today's Status */}
        <div style={{
          background: todayStatus.status === 'complete' ? 
            'linear-gradient(135deg, #4caf50 0%, #45a049 100%)' :
            todayStatus.status === 'partial' ?
            'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' :
            'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
          color: 'white',
          padding: '25px',
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <Calendar size={32} style={{ marginBottom: '10px' }} />
          <div style={{ 
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '8px'
          }}>
            Today
          </div>
          <div style={{ 
            fontSize: '0.9rem',
            opacity: 0.9
          }}>
            {todayStatus.message}
          </div>
        </div>

        {/* Next Milestone */}
        <div style={{
          background: 'linear-gradient(135deg, #fd746c 0%, #ff9068 100%)',
          color: 'white',
          padding: '25px',
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <Award size={32} style={{ marginBottom: '10px' }} />
          <div style={{ 
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '8px'
          }}>
            {nextMilestone - streak}
          </div>
          <div style={{ 
            fontSize: '0.9rem',
            opacity: 0.9,
            marginBottom: '10px'
          }}>
            Days to {nextMilestone}
          </div>
          <div style={{ 
            width: '100%',
            height: '6px',
            backgroundColor: 'rgba(255,255,255,0.3)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${milestoneProgress}%`,
              height: '100%',
              backgroundColor: 'rgba(255,255,255,0.8)',
              borderRadius: '3px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="card" style={{ marginBottom: '25px' }}>
        <h3 style={{ marginBottom: '20px', color: '#333' }}>
          📅 Last 7 Days
        </h3>
        
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          {streakHistory.map((day, index) => (
            <div key={index} style={{
              flex: 1,
              textAlign: 'center',
              padding: '15px 5px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: day.complete ? '#4caf50' : '#e0e0e0',
                margin: '0 auto 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: day.complete ? 'white' : '#666',
                fontSize: '1.2rem',
                fontWeight: '600'
              }}>
                {day.complete ? '✓' : day.scheduled === 0 ? '-' : day.taken}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: '#666',
                fontWeight: '500'
              }}>
                {day.date}
              </div>
              {day.scheduled > 0 && (
                <div style={{
                  fontSize: '0.7rem',
                  color: '#999',
                  marginTop: '2px'
                }}>
                  {day.taken}/{day.scheduled}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="card">
        <h3 style={{ marginBottom: '20px', color: '#333' }}>
          🏆 Achievements
        </h3>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          {achievements.map((achievement, index) => (
            <div key={index} style={{
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center',
              backgroundColor: achievement.achieved ? '#e8f5e8' : '#f5f5f5',
              border: achievement.achieved ? '2px solid #4caf50' : '2px solid #e0e0e0',
              opacity: achievement.achieved ? 1 : 0.7,
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                fontSize: '2rem',
                marginBottom: '10px',
                filter: achievement.achieved ? 'none' : 'grayscale(100%)'
              }}>
                {achievement.icon}
              </div>
              <h4 style={{
                margin: '0 0 5px 0',
                color: achievement.achieved ? '#4caf50' : '#666',
                fontSize: '1rem'
              }}>
                {achievement.name}
              </h4>
              <p style={{
                margin: 0,
                fontSize: '0.8rem',
                color: '#666'
              }}>
                {achievement.achieved ? 'Unlocked!' : 
                 achievement.threshold ? `${achievement.threshold - streak} days to go` : 'Keep going!'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Motivational Section */}
      <div className="card">
        <h3 style={{ marginBottom: '20px', color: '#333' }}>
          💪 Stay Motivated
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '12px'
          }}>
            <h4 style={{ margin: '0 0 10px 0' }}>💡 Did You Know?</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.4' }}>
              Taking medications consistently can improve treatment effectiveness by up to 40%. 
              Every day matters!
            </p>
          </div>
          
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
            color: 'white',
            borderRadius: '12px'
          }}>
            <h4 style={{ margin: '0 0 10px 0' }}>🎯 Pro Tip</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.4' }}>
              Set up multiple reminders and keep medications in a visible place. 
              Small habits lead to big results!
            </p>
          </div>
          
          {streak > 0 && (
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #fd746c 0%, #ff9068 100%)',
              color: 'white',
              borderRadius: '12px'
            }}>
              <h4 style={{ margin: '0 0 10px 0' }}>🔥 You're Crushing It!</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.4' }}>
                {streak} day{streak !== 1 ? 's' : ''} of consistency shows real commitment. 
                Keep up the amazing work!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StreakCounter;