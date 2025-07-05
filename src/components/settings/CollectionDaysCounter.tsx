import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Plus, Trash2, Download, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LeaveDay {
  id: string;
  date: string;
  reason: string;
}

interface CollectionDaysCounterProps {
  onSave?: (message?: string) => void;
  onError?: (message?: string) => void;
}

export default function CollectionDaysCounter({ onSave, onError }: CollectionDaysCounterProps) {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // Default to 30 days from now
    return date.toISOString().split('T')[0];
  });
  const [leaveDays, setLeaveDays] = useState<LeaveDay[]>([]);
  const [newLeaveDate, setNewLeaveDate] = useState<string>('');
  const [newLeaveReason, setNewLeaveReason] = useState<string>('');
  const [excludeSaturdays, setExcludeSaturdays] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Load leave days from localStorage
  useEffect(() => {
    const savedLeaveDays = localStorage.getItem('lms_leave_days');
    if (savedLeaveDays) {
      try {
        setLeaveDays(JSON.parse(savedLeaveDays));
      } catch (e) {
        console.error('Error parsing leave days:', e);
        setLeaveDays([]);
      }
    }
  }, []);

  // Save leave days to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('lms_leave_days', JSON.stringify(leaveDays));
  }, [leaveDays]);

  // Check if a date is a Sunday
  const isSunday = (date: Date): boolean => {
    return date.getDay() === 0; // 0 is Sunday in JavaScript
  };

  // Check if a date is a Saturday
  const isSaturday = (date: Date): boolean => {
    return date.getDay() === 6; // 6 is Saturday in JavaScript
  };

  // Check if a date is in the leave days list
  const isLeaveDay = (dateStr: string): boolean => {
    return leaveDays.some(leave => leave.date === dateStr);
  };

  // Calculate collection days
  const calculateResult = useMemo(() => {
    if (!startDate || !endDate) {
      return { 
        totalDays: 0, 
        sundaysCount: 0, 
        saturdaysCount: 0,
        leaveDaysCount: 0, 
        collectionDays: 0,
        leaveDatesInRange: [],
        error: ''
      };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Ensure end date is not before start date
    if (end < start) {
      return { 
        totalDays: 0, 
        sundaysCount: 0, 
        saturdaysCount: 0,
        leaveDaysCount: 0, 
        collectionDays: 0,
        leaveDatesInRange: [],
        error: 'End date cannot be before start date'
      };
    }
    
    // Calculate total days (inclusive of start and end dates)
    const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    let sundaysCount = 0;
    let saturdaysCount = 0;
    let leaveDaysCount = 0;
    const leaveDatesInRange: LeaveDay[] = [];
    
    // Loop through each day in the range
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      if (isSunday(currentDate)) {
        sundaysCount++;
      } else if (excludeSaturdays && isSaturday(currentDate)) {
        saturdaysCount++;
      } else if (isLeaveDay(dateStr)) {
        leaveDaysCount++;
        const leaveDay = leaveDays.find(leave => leave.date === dateStr);
        if (leaveDay) {
          leaveDatesInRange.push(leaveDay);
        }
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Calculate collection days
    const collectionDays = totalDays - sundaysCount - (excludeSaturdays ? saturdaysCount : 0) - leaveDaysCount;
    
    return { 
      totalDays, 
      sundaysCount, 
      saturdaysCount,
      leaveDaysCount, 
      collectionDays,
      leaveDatesInRange,
      error: ''
    };
  }, [startDate, endDate, excludeSaturdays, leaveDays]);

  // Update error state when the calculation result changes
  useEffect(() => {
    if (calculateResult.error) {
      setError(calculateResult.error);
    }
  }, [calculateResult.error]);

  // Add a new leave day
  const addLeaveDay = () => {
    if (!newLeaveDate) {
      setError('Please select a date');
      return;
    }
    
    if (!newLeaveReason.trim()) {
      setError('Please enter a reason');
      return;
    }
    
    // Check if date already exists
    if (leaveDays.some(leave => leave.date === newLeaveDate)) {
      setError('This date is already marked as a leave day');
      return;
    }
    
    setError('');
    
    const newLeave: LeaveDay = {
      id: Date.now().toString(),
      date: newLeaveDate,
      reason: newLeaveReason.trim()
    };
    
    setLeaveDays(prevLeaveDays => [...prevLeaveDays, newLeave]);
    setNewLeaveDate('');
    setNewLeaveReason('');
    
    if (onSave) {
      onSave('Leave day added successfully');
    }
  };

  // Remove a leave day
  const removeLeaveDay = (id: string) => {
    setLeaveDays(prevLeaveDays => prevLeaveDays.filter(leave => leave.id !== id));
    
    if (onSave) {
      onSave('Leave day removed successfully');
    }
  };

  // Export leave days to CSV
  const exportLeaveDays = () => {
    const headers = ['Date', 'Reason'];
    const csvData = leaveDays.map(leave => [
      leave.date,
      leave.reason
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leave_days_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Check if user has permission to edit
  const canEdit = user?.role === 'admin';
  const canView = user?.role === 'admin' || user?.role === 'officer';

  // If user doesn't have permission to view
  if (!canView) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-600 mb-2">Access Denied</h3>
        <p className="text-gray-500">You don't have permission to access this feature.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Collection Days Counter</h2>
          <p className="text-gray-600">Calculate working days between dates (excluding Sundays and holidays)</p>
        </div>
        {canEdit && (
          <button
            onClick={exportLeaveDays}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Leave Days
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Date Range Calculator */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Collection Days Calculator
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="excludeSaturdays"
                checked={excludeSaturdays}
                onChange={(e) => setExcludeSaturdays(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="excludeSaturdays" className="ml-2 block text-sm text-gray-900">
                Also exclude Saturdays
              </label>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                <div className="flex">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  <span>{error}</span>
                </div>
              </div>
            )}
            
            {/* Results */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
              <h4 className="font-medium text-blue-800 mb-3">Results</h4>
              <div className="grid grid-cols-2 gap-y-2">
                <div className="text-sm text-blue-700">Total Days:</div>
                <div className="text-sm font-medium text-blue-900">{calculateResult.totalDays}</div>
                
                <div className="text-sm text-blue-700">Sundays:</div>
                <div className="text-sm font-medium text-blue-900">{calculateResult.sundaysCount}</div>
                
                {excludeSaturdays && (
                  <>
                    <div className="text-sm text-blue-700">Saturdays:</div>
                    <div className="text-sm font-medium text-blue-900">{calculateResult.saturdaysCount}</div>
                  </>
                )}
                
                <div className="text-sm text-blue-700">Leave Days:</div>
                <div className="text-sm font-medium text-blue-900">{calculateResult.leaveDaysCount}</div>
                
                <div className="text-sm text-blue-700 font-semibold">Collection Days:</div>
                <div className="text-sm font-bold text-blue-900">{calculateResult.collectionDays}</div>
              </div>
            </div>
            
            {/* Leave Days in Range */}
            {calculateResult.leaveDatesInRange.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-2">Leave Days in Selected Range:</h4>
                <div className="max-h-40 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {calculateResult.leaveDatesInRange.map((leave) => (
                        <tr key={leave.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {new Date(leave.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {leave.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Leave Days Management */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Leave Days Management
          </h3>
          
          {canEdit ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newLeaveDate}
                    onChange={(e) => setNewLeaveDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <input
                    type="text"
                    value={newLeaveReason}
                    onChange={(e) => setNewLeaveReason(e.target.value)}
                    placeholder="e.g., Poya Holiday, Office Closed"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <button
                  onClick={addLeaveDay}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Leave Day
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg mb-4">
              <div className="flex">
                <Info className="w-5 h-5 text-yellow-500 mr-2" />
                <p className="text-sm text-yellow-700">
                  You have view-only access to leave days. Contact an administrator to make changes.
                </p>
              </div>
            </div>
          )}
          
          {/* Leave Days List */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-800 mb-2">All Leave Days</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    {canEdit && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaveDays.length > 0 ? (
                    leaveDays
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .map((leave) => (
                        <tr key={leave.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(leave.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {leave.reason}
                          </td>
                          {canEdit && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => removeLeaveDay(leave.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={canEdit ? 3 : 2} className="px-6 py-4 text-center text-sm text-gray-500">
                        No leave days added yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Help Text */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2 flex items-center">
              <Info className="w-4 h-4 mr-2" />
              About Collection Days
            </h4>
            <p className="text-sm text-gray-600">
              Collection days are working days when loan officers can collect payments from customers. 
              Sundays are automatically excluded. You can also exclude Saturdays and manually mark 
              specific dates as leave days (like holidays, strikes, or office closures).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}