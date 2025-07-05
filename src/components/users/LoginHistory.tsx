import React, { useState } from 'react';
import { X, Clock, MapPin, Monitor, Download, Calendar, Filter, Search } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { User, LoginLog } from '../../types';

interface LoginHistoryProps {
  user: User;
  onClose: () => void;
}

export default function LoginHistory({ user, onClose }: LoginHistoryProps) {
  const { loginLogs } = useData();
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter login logs for this user
  const userLogs = loginLogs.filter(log => log.userId === user.id);

  const filteredLogs = userLogs.filter(log => {
    const matchesSearch = log.ipAddress.includes(searchTerm) ||
                         log.userAgent.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const logDate = new Date(log.loginTime);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = logDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = logDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = logDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'locked': return 'bg-orange-100 text-orange-800';
      case 'logout': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return '📱';
    } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      return '📱';
    } else {
      return '💻';
    }
  };

  const getBrowser = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const getOS = (userAgent: string) => {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  };

  const exportToCSV = () => {
    const headers = ['Date/Time', 'Status', 'IP Address', 'Location', 'Browser', 'OS', 'Session Duration'];
    const csvData = filteredLogs.map(log => [
      new Date(log.loginTime).toLocaleString(),
      log.status,
      log.ipAddress,
      log.location || 'Unknown',
      getBrowser(log.userAgent),
      getOS(log.userAgent),
      log.logoutTime ? 
        Math.round((new Date(log.logoutTime).getTime() - new Date(log.loginTime).getTime()) / (1000 * 60)) + ' minutes' :
        'Active'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `login-history-${user.username}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getLoginStats = () => {
    const totalLogins = userLogs.length;
    const successfulLogins = userLogs.filter(log => log.status === 'success').length;
    const failedLogins = userLogs.filter(log => log.status === 'failed').length;
    const uniqueIPs = new Set(userLogs.map(log => log.ipAddress)).size;
    
    return { totalLogins, successfulLogins, failedLogins, uniqueIPs };
  };

  const stats = getLoginStats();

  const getMostUsedLocation = () => {
    if (userLogs.length === 0) return 'No data';
    
    const locationCounts = userLogs.reduce((acc, log) => {
      const location = log.location || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const entries = Object.entries(locationCounts);
    const sortedEntries = entries.sort(([,a], [,b]) => b - a);
    return sortedEntries[0]?.[0] || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Login History</h2>
          <p className="text-gray-600">Login activity for {user.name} (@{user.username})</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Logins</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLogins}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Successful</p>
              <p className="text-2xl font-bold text-gray-900">{stats.successfulLogins}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.failedLogins}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unique IPs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.uniqueIPs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Export */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by IP, location, or device..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="success">Successful</option>
                <option value="failed">Failed</option>
                <option value="locked">Locked</option>
                <option value="logout">Logout</option>
              </select>
            </div>
          </div>
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Login History Table */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location & IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device & Browser
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session Duration
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(log.loginTime).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(log.loginTime).toLocaleTimeString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        {log.location || 'Unknown Location'}
                      </div>
                      <div className="text-sm text-gray-500 font-mono">{log.ipAddress}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        <span className="mr-2">{getDeviceIcon(log.userAgent)}</span>
                        {getBrowser(log.userAgent)} on {getOS(log.userAgent)}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs" title={log.userAgent}>
                        {log.userAgent}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {log.logoutTime ? (
                        <>
                          <div className="font-medium">
                            {Math.round((new Date(log.logoutTime).getTime() - new Date(log.loginTime).getTime()) / (1000 * 60))} minutes
                          </div>
                          <div className="text-xs text-gray-500">
                            Logged out: {new Date(log.logoutTime).toLocaleTimeString()}
                          </div>
                        </>
                      ) : (
                        <span className="text-green-600 font-medium">Active Session</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No login history found</h3>
            <p className="text-gray-500">
              {searchTerm || dateFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search criteria'
                : 'No login activity recorded for this user'}
            </p>
          </div>
        )}
      </div>

      {/* Recent Activity Summary */}
      {filteredLogs.length > 0 && (
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Recent Activity Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-blue-600">Last Successful Login</p>
              <p className="font-medium text-blue-900">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Most Used Location</p>
              <p className="font-medium text-blue-900">
                {getMostUsedLocation()}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Login Success Rate</p>
              <p className="font-medium text-blue-900">
                {userLogs.length > 0 ? 
                  Math.round((stats.successfulLogins / stats.totalLogins) * 100) + '%' : 
                  'No data'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}