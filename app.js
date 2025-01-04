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
const CLIENT_ID = '1030264403343-bc3g0kfsub6b8j91snvnr542p766j75u.apps.googleusercontent.com';  // Replace with your Client ID
const API_KEY = 'AIzaSyCIP3fKpsSJCByo6uETx6CPwxhEemKyDzM';  // Replace with your API Key

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

  // Load entries from Google Drive if user is authenticated
  React.useEffect(() => {
    if (gapiLoaded) {
      loadEntriesFromDrive();
    }
  }, [gapiLoaded]);

  // Handle sign-in/out and initialize Google API client
  const handleSignIn = () => {
    if (auth2.isSignedIn.get()) {
      const user = auth2.currentUser.get();
      console.log('User signed in: ', user.getBasicProfile().getName());
      loadEntriesFromDrive();
    } else {
      auth2.signIn().then(() => {
        const user = auth2.currentUser.get();
        console.log('User signed in: ', user.getBasicProfile().getName());
        loadEntriesFromDrive();
      });
    }
  };

  const handleSignOut = () => {
    auth2.signOut().then(() => {
      console.log('User signed out');
      setEntries([]);
    });
  };

  // Initialize Google API client
  const initGoogleAPI = () => {
    gapi.load('client:auth2', () => {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPES,
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
      }).then(() => {
        auth2 = gapi.auth2.getAuthInstance();
        auth2.isSignedIn.listen(handleSignIn);
        gapiLoaded = true;
        if (auth2.isSignedIn.get()) {
          loadEntriesFromDrive();
        }
      });
    });
  };

  // Load work hours entries from Google Drive
  const loadEntriesFromDrive = () => {
    const fileId = 'YOUR_FILE_ID';  // Replace with the file ID from Google Drive

    gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media'
    }).then(response => {
      const data = JSON.parse(response.body);
      setEntries(data.entries || []);
    }).catch(error => {
      console.log('Error loading entries from Google Drive: ', error);
    });
  };

  // Save work hours entries to Google Drive
  const saveEntriesToDrive = () => {
    const fileId = 'YOUR_FILE_ID';  // Replace with the file ID from Google Drive

    const data = { entries: entries };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    
    const formData = new FormData();
    formData.append('file', blob, 'work_hours.json');

    gapi.client.drive.files.update({
      fileId: fileId,
      media: {
        body: blob
      }
    }).then(() => {
      console.log('Entries saved to Google Drive.');
    }).catch(error => {
      console.log('Error saving entries to Google Drive: ', error);
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const selectedDate = name === "date" ? new Date(value) : new Date(formData.date);
    const isSaturday = selectedDate.getDay() === 6;
    const selectedWorkplace = WORKPLACES.find(w => 
      w.name === (name === "workplace" ? value : formData.workplace)
    );

    if (isSaturday && !selectedWorkplace.allowsSaturday) {
      setError(`${selectedWorkplace.name} does not operate on Saturdays`);
      return;
    }

    setError("");
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const selectedDate = new Date(formData.date);
    const isSaturday = selectedDate.getDay() === 6;
    const selectedWorkplace = WORKPLACES.find(w => w.name === formData.workplace);

    if (isSaturday && !selectedWorkplace.allowsSaturday) {
      setError(`${selectedWorkplace.name} does not operate on Saturdays`);
      return;
    }

    const newEntry = {
      ...formData,
      id: Date.now(),
      isSaturday
    };
    
    setEntries(prev => {
      const newEntries = [...prev, newEntry];
      saveEntriesToDrive();  // Save the updated list to Google Drive
      return newEntries;
    });
    setError("");
  };

  const renderNavigation = () => (
    <div className="bg-white border-b mb-6">
      <div className="max-w-4xl mx-auto">
        <nav className="flex space-x-4 p-4">
          <button 
            onClick={() => setCurrentView(VIEWS.ENTRY)}
            className={`px-4 py-2 rounded-lg ${currentView === VIEWS.ENTRY ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
          >
            Entry
          </button>
          <button 
            onClick={() => setCurrentView(VIEWS.DASHBOARD)}
            className={`px-4 py-2 rounded-lg ${currentView === VIEWS.DASHBOARD ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentView(VIEWS.RAW)}
            className={`px-4 py-2 rounded-lg ${currentView === VIEWS.RAW ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
          >
            Raw Data
          </button>
        </nav>
      </div>
    </div>
  );

  // Other functions to render form, dashboard, and raw entries...
  
  return (
    <div className="min-h-screen bg-gray-100">
      {renderNavigation()}
      <div className="max-w-4xl mx-auto p-6">
        <button onClick={handleSignIn} className="btn-signin">
          Sign In to Google
        </button>
        <button onClick={handleSignOut} className="btn-signout">
          Sign Out
        </button>

        {/* Render the appropriate view (entry form, dashboard, or raw data) */}
      </div>
    </div>
  );
};

window.onload = initGoogleAPI;
