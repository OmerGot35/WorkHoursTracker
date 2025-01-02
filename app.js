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

  // Load entries from localStorage
  React.useEffect(() => {
    const savedEntries = localStorage.getItem('workHoursEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  // Save entries to localStorage
  React.useEffect(() => {
    localStorage.setItem('workHoursEntries', JSON.stringify(entries));
  }, [entries]);

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
    
    setEntries(prev => [...prev, newEntry]);
    setError("");
  };

  const getMonthlyData = () => {
    const monthYear = `${selectedMonth.getFullYear()}-${selectedMonth.getMonth() + 1}`;
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === selectedMonth.getMonth() &&
             entryDate.getFullYear() === selectedMonth.getFullYear();
    });
  };

  const calculateMonthSummary = () => {
    const monthEntries = getMonthlyData();
    
    return WORKPLACES.map(workplace => {
      const workplaceEntries = monthEntries.filter(
        entry => entry.workplace === workplace.name
      );

      const weekdayHours = workplaceEntries
        .filter(entry => !entry.isSaturday)
        .reduce((sum, entry) => sum + parseInt(entry.hours), 0);

      const saturdayHours = workplaceEntries
        .filter(entry => entry.isSaturday)
        .reduce((sum, entry) => sum + parseInt(entry.hours), 0);

      return {
        workplace: workplace.name,
        weekdayHours,
        saturdayHours,
        totalHours: weekdayHours + saturdayHours,
        weekdayPay: weekdayHours * workplace.weekdayRate,
        saturdayPay: saturdayHours * workplace.saturdayRate,
        totalPay: (weekdayHours * workplace.weekdayRate) + 
                 (saturdayHours * workplace.saturdayRate)
      };
    });
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
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">New Entry</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Workplace
          </label>
          <select 
            name="workplace"
            value={formData.workplace}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg bg-white shadow-sm"
          >
            {WORKPLACES.map(workplace => (
              <option key={workplace.name} value={workplace.name}>
                {workplace.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hours
          </label>
          <select
            name="hours"
            value={formData.hours}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg bg-white shadow-sm"
          >
            {[1,2,3,4,5,6,7,8].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          disabled={!!error}
        >
          Add Entry
        </button>
      </form>
    </div>
  );

  const renderDashboard = () => {
    const monthSummary = calculateMonthSummary();
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">
            {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="space-y-6">
            {monthSummary.map(summary => (
              summary.totalHours > 0 && (
                <div key={summary.workplace} className="border-b pb-6">
                  <h3 className="font-bold text-lg mb-4">{summary.workplace}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">Weekday Hours: {summary.weekdayHours}</p>
                      <p className="text-gray-600">Pay: ₪{summary.weekdayPay}</p>
                    </div>
                    {WORKPLACES.find(w => w.name === summary.workplace).allowsSaturday && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium">Saturday Hours: {summary.saturdayHours}</p>
                        <p className="text-gray-600">Pay: ₪{summary.saturdayPay}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                    <p className="font-bold text-blue-900">
                      Total Hours: {summary.totalHours} | Total Pay: ₪{summary.totalPay}
                    </p>
                  </div>
                </div>
              )
            ))}
          </div>
          <div className="pt-6 border-t mt-6">
            <p className="text-2xl font-bold text-green-700">
              Total Monthly Pay: ₪
              {monthSummary.reduce((sum, workplace) => sum + workplace.totalPay, 0)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderRawEntries = () => {
    const monthEntries = getMonthlyData();
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">
            {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Workplace</th>
                <th className="p-4 text-left">Hours</th>
                <th className="p-4 text-left">Day Type</th>
                <th className="p-4 text-left">Pay</th>
              </tr>
            </thead>
            <tbody>
              {monthEntries
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map(entry => {
                  const workplace = WORKPLACES.find(w => w.name === entry.workplace);
                  const rate = entry.isSaturday ? workplace.saturdayRate : workplace.weekdayRate;
                  const pay = parseInt(entry.hours) * rate;
                  
                  return (
                    <tr key={entry.id} className="border-t hover:bg-gray-50">
                      <td className="p-4">{new Date(entry.date).toLocaleDateString()}</td>
                      <td className="p-4">{entry.workplace}</td>
                      <td className="p-4">{entry.hours}</td>
                      <td className="p-4">{entry.isSaturday ? 'Saturday' : 'Weekday'}</td>
                      <td className="p-4">₪{pay}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {renderNavigation()}
      
      <div className="max-w-4xl mx-auto p-6">
        {currentView === VIEWS.ENTRY && renderEntryForm()}
        {currentView === VIEWS.DASHBOARD && renderDashboard()}
        {currentView === VIEWS.RAW && renderRawEntries()}
      </div>
    </div>
  );
};
