MediTrack – Smart Medication Reminder & Tracker
MediTrack is a full-stack React application designed to help users manage their medications effectively by providing smart reminders, tracking streaks, checking drug interactions, and sending browser notifications.

🚀 Features
⏰ Smart Reminders – Get alerts for upcoming or overdue medications.

✅ Mark as Taken – Log medications with timestamps and dosages.

📊 Streak Counter – Visualize your consistency with progress bars, emojis, and achievements.

📅 Weekly Overview – See daily adherence and medication history for the past 7 days.

⚠️ Drug Interaction Detection – Warns about potential interactions based on a local database.

🔔 Browser Notifications – Timely reminders using native browser notifications.

🧠 Local Persistence – Data saved via localStorage so progress isn’t lost.

👨‍👩‍👧 Family Notification Generator – Custom alerts for caregivers/family.

📂 Project Structure
css
Copy
Edit
src/
├── components/
│   ├── ReminderCard.jsx
│   ├── StreakCounter.jsx
│   └── ...
├── context/
│   └── MedicationContext.js
├── utils/
│   ├── drugInteractions.js
│   └── notifications.js
├── App.js
└── index.js
🧑‍💻 Technologies Used
React.js (with Hooks & Context API)

Lucide React (for icons)

HTML5/CSS3 with inline styling

LocalStorage for state persistence

Browser Notifications API

🛠️ Installation
bash
Copy
Edit
git clone https://github.com/yourusername/MediTrack.git
cd MediTrack
npm install
npm start
🧪 Usage
Add a Medication: Enter name, dosage, times (e.g., 08:00, 21:00).

Receive Reminders: Get browser notifications at scheduled times.

Mark as Taken: Click "Mark as Taken" to update history.

Check Progress: View streaks, adherence rate, and achievements.

Stay Informed: Warnings appear for any known drug interactions.

🧠 Design Highlights
Reducer pattern: Central state management using useReducer.

Pure logic separation: Drug interactions, time formatting, and notification logic are in utils/.

Auto streak calculation: Based on medication adherence and timestamp validation.

🧩 Example Medication Entry
json
Copy
Edit
{
  "name": "Metformin",
  "dosage": "500mg",
  "times": ["08:00", "20:00"],
  "notes": "Take with meals",
  "startDate": "2025-06-01",
  "endDate": null
}
💡 Future Enhancements
🔁 Recurring prescriptions

☁️ Sync with backend or cloud

📱 Mobile PWA support

📬 SMS or email alerts

📸 Screenshots
(You can add screenshots here)

📜 License
This project is licensed under the MIT License.

🤝 Contribution
Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

🙋‍♀️ Author
Tamanna Singh
🛠 Built with React and ❤️









