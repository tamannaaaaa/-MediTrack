// Browser notification utilities
export function requestNotificationPermission() {
  return new Promise((resolve) => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        resolve(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          resolve(permission === 'granted');
        });
      } else {
        resolve(false);
      }
    } else {
      resolve(false);
    }
  });
}

export function showNotification(title, options = {}) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });
    
    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
    
    return notification;
  }
  return null;
}

export function scheduleMedicationReminder(medication, time) {
  const [hours, minutes] = time.split(':');
  const now = new Date();
  const reminderTime = new Date();
  reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  // If the time has passed today, schedule for tomorrow
  if (reminderTime <= now) {
    reminderTime.setDate(reminderTime.getDate() + 1);
  }
  
  const timeUntilReminder = reminderTime.getTime() - now.getTime();
  
  return setTimeout(() => {
    showNotification(`Time for ${medication.name}`, {
      body: `Take ${medication.dosage} as prescribed`,
      tag: `medication-${medication.id}-${time}`,
      requireInteraction: true
    });
  }, timeUntilReminder);
}

export function generateFamilyNotification(patientName, medicationName, status) {
  const messages = {
    taken: `${patientName} has taken their ${medicationName} medication.`,
    missed: `${patientName} missed their scheduled ${medicationName} dose.`,
    overdue: `${patientName}'s ${medicationName} dose is overdue.`
  };
  
  return {
    id: Date.now(),
    type: status,
    message: messages[status] || `Update about ${patientName}'s medication.`,
    timestamp: new Date(),
    medication: medicationName,
    patient: patientName
  };
}

export function formatTimeUntilNext(nextReminderTime) {
  const now = new Date();
  const diff = nextReminderTime.getTime() - now.getTime();
  
  if (diff <= 0) {
    return 'Now';
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export function getNextReminder(medications) {
  const now = new Date();
  let nextReminder = null;
  let nextTime = null;
  
  medications.forEach(medication => {
    medication.times.forEach(time => {
      const [hours, minutes] = time.split(':');
      const reminderTime = new Date();
      reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // If time has passed today, check tomorrow
      if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }
      
      if (!nextTime || reminderTime < nextTime) {
        nextTime = reminderTime;
        nextReminder = {
          medication: medication.name,
          time: time,
          timestamp: reminderTime
        };
      }
    });
  });
  
  return nextReminder;
}