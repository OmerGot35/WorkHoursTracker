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

  // Initialize Google API client
  React.useEffect(() => {
    const initClient = () => {
      console.log('Initializing Google API client...');
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPES,
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
      }).then(() => {
        console.log('Google API client initialized');
        auth2 = gapi.auth2.getAuthInstance();
        setIsSignedIn(auth2.isSignedIn.get());
        auth2.isSignedIn.listen(updateSignInStatus);
        updateSignInStatus(auth2.isSignedIn.get());
        gapiLoaded = true;
      }).catch(error => {
        console.error('Error initializing Google API client:', error);
        setError('Failed to initialize Google API client');
      });
    };

    gapi.load('client:auth2', initClient);
  }, []);

  const updateSignInStatus = (isSignedIn) => {
    console.log('Sign in status updated:', isSignedIn);
    setIsSignedIn(isSignedIn);
    if (isSignedIn) {
      loadEntriesFromDrive();
    }
  };

  // Handle sign-in
  const handleSignIn = () => {
    console.log('Attempting to sign in...');
    if (!auth2) {
      console.error('Auth2 not initialized');
      setError('Authentication not initialized. Please refresh the page.');
      return;
    }

    setIsLoading(true);
    auth2.signIn().then(() => {
      console.log('Successfully signed in');
      const profile = auth2.currentUser.get().getBasicProfile();
      console.log('Signed in as:', profile.getName());
      loadEntriesFromDrive();
    }).catch(error => {
      console.error('Sign in error:', error);
      setError('Failed to sign in. Please try again.');
    }).finally(() => {
      setIsLoading(false);
    });
  };

  // Handle sign-out
  const handleSignOut = () => {
    if (!auth2) {
      console.error('Auth2 not initialized');
      return;
    }

    auth2.signOut().then(() => {
      console.log('Successfully signed out');
      setEntries([]);
      setIsSignedIn(false);
    }).catch(error => {
      console.error('Sign out error:', error);
      setError('Failed to sign out');
    });
  };

  // Create or get the work hours file
  const getOrCreateWorkHoursFile = async () => {
    try {
      // First, try to find an existing file
      const response = await gapi.client.drive.files.list({
        q: "name='work_hours.json'",
        spaces: 'drive',
        fields: 'files(id, name)'
      });

      const files = response.result.files;
      if (files && files.length > 0) {
        console.log('Found existing file:', files[0].id);
        return files[0].id;
      }

      // If no file exists, create a new one
      const fileMetadata = {
        name: 'work_hours.json',
        mimeType: 'application/json'
      };

      const createResponse = await gapi.client.drive.files.create({
        resource: fileMetadata,
        fields: 'id'
      });

      console.log('Created new file:', createResponse.result.id);
      return createResponse.result.id;
    } catch (error) {
      console.error('Error in getOrCreateWorkHoursFile:', error);
      throw error;
    }
  };

  // Load work hours entries from Google Drive
  const loadEntriesFromDrive = async () => {
    console.log('Loading entries from Drive...');
    setIsLoading(true);
    setError("");

    try {
      const fileId = await getOrCreateWorkHoursFile();
      
      const response = await gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media'
      });

      console.log('Loaded data:', response);
      const data = JSON.parse(response.body);
      setEntries(data.entries || []);
    } catch (error) {
      console.error('Error loading entries:', error);
      setError('Failed to load entries. Please try again.');
      // If file doesn't exist or is empty, initialize with empty array
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Save work hours entries to Google Drive
  const saveEntriesToDrive = async (updatedEntries) => {
    console.log('Saving entries to Drive...');
    setIsLoading(true);
    setError("");

    try {
      const fileId = await getOrCreateWorkHoursFile();
      const data = { entries: updatedEntries };
      
      await gapi.client.drive.files.update({
        fileId: fileId,
        media: {
          mimeType: 'application/json',
          body: JSON.stringify(data)
        }
      });

      console.log('Entries saved successfully');
    } catch (error) {
      console.error('Error saving entries:', error);
      setError('Failed to save entries. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

  const handleSubmit = async (e) => {
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
    
    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    await saveEntriesToDrive(updatedEntries);
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

  const renderEntryForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1">Workplace:</label>
        <select
          name="workplace"
          value={formData.workplace}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        >
          {WORKPLACES.map(workplace => (
            <option key={workplace.name} value={workplace.name}>
              {workplace.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1">Date:</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block mb-1">Hours:</label>
        <input
          type="number"
          name="hours"
          value={formData.hours}
          onChange={handleInputChange}
          min="1"
          max="24"
          className="w-full p-2 border rounded"
        />
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        disabled={isLoading}
      >
        {isLoading ? 'Saving...' : 'Submit'}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {renderNavigation()}
      <div className="max-w-4xl mx-auto p-6">
        {!isSignedIn ? (
          <button
            onClick={handleSignIn}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In with Google'}
          </button>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={handleSignOut}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Sign Out
              </button>
            </div>
            {currentView === VIEWS.ENTRY && renderEntryForm()}
            {currentView === VIEWS.DASHBOARD && <div>Dashboard View (Coming Soon)</div>}
            {currentView === VIEWS.RAW && (
              <pre className="bg-white p-4 rounded shadow overflow-auto">
                {JSON.stringify(entries, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
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
