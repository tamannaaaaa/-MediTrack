import React, { createContext, useContext, useReducer, useEffect } from 'react';

const MedicationContext = createContext();

const initialState = {
  medications: [],
  takenHistory: [],
  streak: 0,
  notifications: []
};

function medicationReducer(state, action) {
  switch (action.type) {
    case 'ADD_MEDICATION':
      return {
        ...state,
        medications: [...state.medications, { ...action.payload, id: Date.now() }]
      };
    
    case 'DELETE_MEDICATION':
      return {
        ...state,
        medications: state.medications.filter(med => med.id !== action.payload)
      };
    
    case 'MARK_TAKEN':
      const newTaken = {
        medicationId: action.payload.medicationId,
        timestamp: new Date(),
        scheduledTime: action.payload.scheduledTime
      };
      return {
        ...state,
        takenHistory: [...state.takenHistory, newTaken]
      };
    
    case 'UPDATE_STREAK':
      return {
        ...state,
        streak: action.payload
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    
    case 'CLEAR_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notif => notif.id !== action.payload)
      };
    
    case 'LOAD_DATA':
      return action.payload;
    
    default:
      return state;
  }
}

export function MedicationProvider({ children }) {
  const [state, dispatch] = useReducer(medicationReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('meditrack-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_DATA', payload: parsedData });
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('meditrack-data', JSON.stringify(state));
  }, [state]);

  // Calculate streak
  useEffect(() => {
    const calculateStreak = () => {
      const today = new Date();
      const todayStr = today.toDateString();
      
      // Get all medications that should have been taken today
      const todaysMedications = state.medications.filter(med => {
        return med.times.some(time => {
          const [hours, minutes] = time.split(':');
          const scheduledTime = new Date();
          scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          return scheduledTime <= today;
        });
      });

      // Check if all today's medications were taken
      const todaysTaken = state.takenHistory.filter(taken => 
        new Date(taken.timestamp).toDateString() === todayStr
      );

      const allTakenToday = todaysMedications.every(med =>
        todaysTaken.some(taken => taken.medicationId === med.id)
      );

      if (allTakenToday && todaysMedications.length > 0) {
        dispatch({ type: 'UPDATE_STREAK', payload: state.streak + 1 });
      }
    };

    if (state.medications.length > 0) {
      calculateStreak();
    }
  }, [state.takenHistory, state.medications]);

  const addMedication = (medication) => {
    dispatch({ type: 'ADD_MEDICATION', payload: medication });
  };

  const deleteMedication = (id) => {
    dispatch({ type: 'DELETE_MEDICATION', payload: id });
  };

  const markAsTaken = (medicationId, scheduledTime) => {
    dispatch({ 
      type: 'MARK_TAKEN', 
      payload: { medicationId, scheduledTime }
    });
    
    // Add success notification
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now(),
        type: 'success',
        message: 'Medication marked as taken!',
        timestamp: new Date()
      }
    });
  };

  const addNotification = (notification) => {
    dispatch({ 
      type: 'ADD_NOTIFICATION', 
      payload: { ...notification, id: Date.now() }
    });
  };

  const clearNotification = (id) => {
    dispatch({ type: 'CLEAR_NOTIFICATION', payload: id });
  };

  const getTodaysReminders = () => {
    const now = new Date();
    const today = now.toDateString();
    
    const reminders = [];
    
    state.medications.forEach(medication => {
      medication.times.forEach(time => {
        const [hours, minutes] = time.split(':');
        const scheduledTime = new Date();
        scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        const isToday = scheduledTime.toDateString() === today;
        const wasTaken = state.takenHistory.some(taken => 
          taken.medicationId === medication.id &&
          taken.scheduledTime === time &&
          new Date(taken.timestamp).toDateString() === today
        );
        
        if (isToday && !wasTaken) {
          reminders.push({
            medication,
            scheduledTime: time,
            timestamp: scheduledTime,
            isOverdue: scheduledTime < now
          });
        }
      });
    });
    
    return reminders.sort((a, b) => a.timestamp - b.timestamp);
  };

  const getAdherenceRate = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toDateString();
    });

    let totalScheduled = 0;
    let totalTaken = 0;

    last7Days.forEach(dateStr => {
      state.medications.forEach(medication => {
        medication.times.forEach(time => {
          totalScheduled++;
          
          const wasTaken = state.takenHistory.some(taken =>
            taken.medicationId === medication.id &&
            taken.scheduledTime === time &&
            new Date(taken.timestamp).toDateString() === dateStr
          );
          
          if (wasTaken) totalTaken++;
        });
      });
    });

    return totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 0;
  };

  const value = {
    ...state,
    addMedication,
    deleteMedication,
    markAsTaken,
    addNotification,
    clearNotification,
    getTodaysReminders,
    getAdherenceRate
  };

  return (
    <MedicationContext.Provider value={value}>
      {children}
    </MedicationContext.Provider>
  );
}

export function useMedication() {
  const context = useContext(MedicationContext);
  if (!context) {
    throw new Error('useMedication must be used within a MedicationProvider');
  }
  return context;
}