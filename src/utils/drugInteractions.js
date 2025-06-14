// Simple drug interaction database
export const drugInteractions = {
  // Blood thinners
  'warfarin': {
    interactsWith: ['aspirin', 'ibuprofen', 'naproxen', 'diclofenac'],
    severity: 'severe',
    warning: 'Increased bleeding risk. Monitor closely.'
  },
  
  // NSAIDs
  'ibuprofen': {
    interactsWith: ['warfarin', 'lisinopril', 'enalapril', 'metformin'],
    severity: 'moderate',
    warning: 'May increase bleeding risk or reduce effectiveness of other medications.'
  },
  
  'aspirin': {
    interactsWith: ['warfarin', 'metformin', 'lisinopril'],
    severity: 'moderate',
    warning: 'May increase bleeding risk or affect blood sugar control.'
  },
  
  // ACE Inhibitors
  'lisinopril': {
    interactsWith: ['ibuprofen', 'naproxen', 'potassium'],
    severity: 'moderate',
    warning: 'NSAIDs may reduce effectiveness. Monitor blood pressure.'
  },
  
  'enalapril': {
    interactsWith: ['ibuprofen', 'naproxen', 'potassium'],
    severity: 'moderate',
    warning: 'NSAIDs may reduce effectiveness. Monitor blood pressure.'
  },
  
  // Diabetes medications
  'metformin': {
    interactsWith: ['aspirin', 'ibuprofen', 'alcohol'],
    severity: 'mild',
    warning: 'Monitor blood sugar levels more frequently.'
  },
  
  'insulin': {
    interactsWith: ['alcohol', 'aspirin', 'beta-blockers'],
    severity: 'moderate',
    warning: 'May affect blood sugar control. Monitor closely.'
  },
  
  // Antibiotics
  'amoxicillin': {
    interactsWith: ['warfarin', 'birth-control'],
    severity: 'mild',
    warning: 'May reduce effectiveness of birth control or increase bleeding risk.'
  },
  
  'ciprofloxacin': {
    interactsWith: ['warfarin', 'theophylline', 'calcium', 'iron'],
    severity: 'moderate',
    warning: 'Take 2 hours before or 6 hours after calcium/iron supplements.'
  },
  
  // Heart medications
  'digoxin': {
    interactsWith: ['amiodarone', 'verapamil', 'quinidine'],
    severity: 'severe',
    warning: 'Risk of digoxin toxicity. Monitor blood levels.'
  },
  
  'amiodarone': {
    interactsWith: ['warfarin', 'digoxin', 'simvastatin'],
    severity: 'severe',
    warning: 'Multiple serious interactions. Requires close monitoring.'
  },
  
  // Statins
  'simvastatin': {
    interactsWith: ['amiodarone', 'diltiazem', 'amlodipine'],
    severity: 'moderate',
    warning: 'Increased risk of muscle problems. Watch for muscle pain.'
  },
  
  'atorvastatin': {
    interactsWith: ['diltiazem', 'amlodipine', 'grapefruit'],
    severity: 'moderate',
    warning: 'Avoid grapefruit. May increase statin levels.'
  },
  
  // Supplements
  'calcium': {
    interactsWith: ['ciprofloxacin', 'tetracycline', 'iron'],
    severity: 'mild',
    warning: 'Take antibiotics 2 hours before or 6 hours after calcium.'
  },
  
  'iron': {
    interactsWith: ['ciprofloxacin', 'tetracycline', 'calcium'],
    severity: 'mild',
    warning: 'Take antibiotics 2 hours before or 6 hours after iron.'
  },
  
  'potassium': {
    interactsWith: ['lisinopril', 'enalapril', 'spironolactone'],
    severity: 'moderate',
    warning: 'Risk of high potassium levels. Monitor blood levels.'
  }
};

export function checkInteractions(medications) {
  const interactions = [];
  const medNames = medications.map(med => med.name.toLowerCase());
  
  for (let i = 0; i < medications.length; i++) {
    const med1 = medications[i];
    const med1Name = med1.name.toLowerCase();
    
    if (drugInteractions[med1Name]) {
      const med1Interactions = drugInteractions[med1Name];
      
      for (let j = i + 1; j < medications.length; j++) {
        const med2 = medications[j];
        const med2Name = med2.name.toLowerCase();
        
        if (med1Interactions.interactsWith.includes(med2Name)) {
          interactions.push({
            medication1: med1.name,
            medication2: med2.name,
            severity: med1Interactions.severity,
            warning: med1Interactions.warning,
            id: `${med1.id}-${med2.id}`
          });
        }
      }
    }
  }
  
  return interactions;
}

export function getSeverityColor(severity) {
  switch (severity) {
    case 'severe':
      return '#d32f2f';
    case 'moderate':
      return '#f57c00';
    case 'mild':
      return '#1976d2';
    default:
      return '#666';
  }
}

export function getSeverityIcon(severity) {
  switch (severity) {
    case 'severe':
      return '⚠️';
    case 'moderate':
      return '⚡';
    case 'mild':
      return 'ℹ️';
    default:
      return '💊';
  }
}