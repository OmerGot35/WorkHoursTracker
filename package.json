import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Calculator, AlertCircle, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const WorkHoursTracker = () => {
  const workplaces = [
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
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxs41lg1Qi3ilyEMBqWATn-RaVy_91IVGN2ki2RyF8pL1jBRabtOO2J7P9eCPSqg_0MHg/exec';
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({
    workplace: workplaces[0].name,
    date: new Date().toISOString().split('T')[0],
    hours: "1"
  });
  const [monthSummary, setMonthSummary] = useState(null);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Load entries from localStorage on initial render
  useEffect(() => {
    const savedEntries = localStorage.getItem('workHoursEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('workHoursEntries', JSON.stringify(entries));
  }, [entries]);
  
  const saveToGoogleSheets = async (entry) => {
  const workplace = workplaces.find(w => w.name === entry.workplace);
  const rate = entry.isSaturday ? workplace.saturdayRate : workplace.weekdayRate;
  const totalPay = rate * parseInt(entry.hours);

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        date: entry.date,
        workplace: entry.workplace,
        hours: entry.hours,
        isSaturday: entry.isSaturday,
        rate: rate,
        totalPay: totalPay
      })
    });

    const result = await response.json();
    if (result.status === 'success') {
      console.log('Successfully saved to Google Sheets');
    }
  } catch (error) {
    console.error('Error saving to Google Sheets:', error);
    setError('Failed to save to Google Sheets');
  }
};
  const handleInputChange = (e) => {
    if (e.target.name === "date") {
      const selectedDate = new Date(e.target.value);
      const isSaturday = selectedDate.getDay() === 6;
      const selectedWorkplace = workplaces.find(w => w.name === formData.workplace);
      
      if (isSaturday && !selectedWorkplace.allowsSaturday) {
        setError(`${selectedWorkplace.name} does not operate on Saturdays`);
        return;
      }
    }

    if (e.target.name === "workplace") {
      const selectedWorkplace = workplaces.find(w => w.name === e.target.value);
      const currentDate = new Date(formData.date);
      const isSaturday = currentDate.getDay() === 6;
      
      if (isSaturday && !selectedWorkplace.allowsSaturday) {
        setError(`${selectedWorkplace.name} does not operate on Saturdays`);
        return;
      }
    }

    setError("");
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  const selectedDate = new Date(formData.date);
  const isSaturday = selectedDate.getDay() === 6;
  const selectedWorkplace = workplaces.find(w => w.name === formData.workplace);

  if (isSaturday && !selectedWorkplace.allowsSaturday) {
    setError(`${selectedWorkplace.name} does not operate on Saturdays`);
    return;
  }

  const newEntry = {
    ...formData,
    id: Date.now(),
    isSaturday
  };
  
  setEntries([...entries, newEntry]);
  setError("");
  
  // Save to Google Sheets
  await saveToGoogleSheets(newEntry);
};

  const getMonthName = (monthIndex) => {
    const months = ["January", "February", "March", "April", "May", "June", 
                   "July", "August", "September", "October", "November", "December"];
    return months[monthIndex];
  };

  const calculateMonthSummary = () => {
    const currentMonth = selectedMonth.getMonth();
    const currentYear = selectedMonth.getFullYear();
    
    const currentMonthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && 
             entryDate.getFullYear() === currentYear;
    });

    return workplaces.map(workplace => {
      const workplaceEntries = currentMonthEntries.filter(
        entry => entry.workplace === workplace.name
      );

      const weekdayHours = workplaceEntries
        .filter(entry => !entry.isSaturday)
        .reduce((sum, entry) => sum + parseInt(entry.hours), 0);

      const saturdayHours = workplaceEntries
        .filter(entry => entry.isSaturday)
        .reduce((sum, entry) => sum + parseInt(entry.hours), 0);

      const weekdayPay = weekdayHours * workplace.weekdayRate;
      const saturdayPay = saturdayHours * workplace.saturdayRate;

      return {
        workplace: workplace.name,
        weekdayHours,
        saturdayHours,
        totalHours: weekdayHours + saturdayHours,
        weekdayPay,
        saturdayPay,
        totalPay: weekdayPay + saturdayPay
      };
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(selectedMonth);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedMonth(newDate);
  };

  const exportToCSV = () => {
    const currentMonth = selectedMonth.getMonth();
    const currentYear = selectedMonth.getFullYear();
    
    // Filter entries for current month
    const monthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && 
             entryDate.getFullYear() === currentYear;
    });

    // Create CSV content
    const headers = ['Date', 'Workplace', 'Hours', 'Is Saturday', 'Pay Rate', 'Total Pay'];
    const rows = monthEntries.map(entry => {
      const workplace = workplaces.find(w => w.name === entry.workplace);
      const rate = entry.isSaturday ? workplace.saturdayRate : workplace.weekdayRate;
      const pay = rate * parseInt(entry.hours);
      return [
        entry.date,
        entry.workplace,
        entry.hours,
        entry.isSaturday ? 'Yes' : 'No',
        rate,
        pay
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `work_hours_${getMonthName(currentMonth)}_${currentYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const summary = calculateMonthSummary();
    setMonthSummary(summary);
  }, [entries, selectedMonth]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Work Hours Entry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Workplace</label>
              <select 
                name="workplace"
                value={formData.workplace}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                {workplaces.map(workplace => (
                  <option key={workplace.name} value={workplace.name}>
                    {workplace.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Hours</label>
              <select
                name="hours"
                value={formData.hours}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                {[1,2,3,4,5,6,7].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
              disabled={!!error}
            >
              Add Entry
            </button>
          </form>
        </CardContent>
      </Card>

      {monthSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigateMonth('prev')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="flex items-center gap-2">
                  <Calculator className="w-6 h-6" />
                  {getMonthName(selectedMonth.getMonth())} {selectedMonth.getFullYear()}
                </span>
                <button 
                  onClick={() => navigateMonth('next')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={exportToCSV}
                className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Month
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthSummary.map(summary => (
                <div key={summary.workplace} className="border-b pb-4">
                  <h3 className="font-bold text-lg mb-2">{summary.workplace}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Weekday Hours: {summary.weekdayHours}</p>
                      <p className="text-gray-600">Pay: ₪{summary.weekdayPay}</p>
                    </div>
                    {workplaces.find(w => w.name === summary.workplace).allowsSaturday && (
                      <div>
                        <p className="font-medium">Saturday Hours: {summary.saturdayHours}</p>
                        <p className="text-gray-600">Pay: ₪{summary.saturdayPay}</p>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 font-bold">
                    Total Hours: {summary.totalHours} | Total Pay: ₪{summary.totalPay}
                  </p>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t">
                <p className="font-bold text-xl">
                  Total Monthly Pay: ₪
                  {monthSummary.reduce((sum, workplace) => sum + workplace.totalPay, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkHoursTracker;
