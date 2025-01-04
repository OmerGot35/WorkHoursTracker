// Constants for views
const VIEWS = {
  ENTRY: 'entry',
  DASHBOARD: 'dashboard',
  RAW: 'raw'
};

// Workplace data
const WORKPLACES = [
  { 
    name: "Sher fitness", 
    weekdayRate: 120,
    saturdayRate: 120,
    allowsSaturday: true
  },
  { 
    name: "Calma", 
    weekdayRate: 130,
    saturdayRate: 150,
    allowsSaturday: true
  },
  { 
    name: "Holmes Place", 
    weekdayRate: 120,
    saturdayRate: 0,
    allowsSaturday: false
  }
];

// Client ID and API Key from your Google Developer Console
const CLIENT_ID = '1030264403343-bc3g0kfsub6b8j91snvnr542p766j75u.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCIP3fKpsSJCByo6uETx6CPwxhEemKyDzM';

// Scopes required for Google Drive access
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let gapiLoaded = false;
let auth2;

// Main component
const WorkHoursTracker = () => {
  const [currentView, setCurrentView] = React.useState(VIEWS.ENTRY);
  const [entries, setEntries] = React.useState([]);
  const [formData, setFormData] = React.useState({
    workplace: WORKPLACES[0].name,
    date: new Date().toISOString().split('T')[0],
    hours: "1"
  });
  const [error, setError] = React.useState("");
  const [selectedMonth, setSelectedMonth] = React.useState(new Date());
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSignedIn, setIsSignedIn] = React.useState(false);

  // ... rest of the component logic ...
};

// Initialize the app
const initApp = () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    ReactDOM.render(<WorkHoursTracker />, rootElement);
  }
};

// Load the Google API client
window.onload = () => {
  console.log('Window loaded, initializing Google API...');
  gapi.load('client:auth2', () => {
    console.log('Google API loaded');
  });
};
