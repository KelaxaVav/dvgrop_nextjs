import React, { useState } from 'react';
import { Search, Filter, Download, MessageSquare, CheckCircle, AlertTriangle, Calendar, Clock } from 'lucide-react';

interface SMSLogsProps {
  logs: any[];
  customers: any[];
}

export default function SMSLogs({ logs, customers }: SMSLogsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Filter logs based on search and filters
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.phoneNumber.includes(searchTerm) ||
                         log.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    
    const logDate = new Date(log.sentAt);
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    endDate.setHours(23, 59, 59, 999); // End of the day
    
    const matchesDate = logDate >= startDate && logDate <= endDate;
    
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  // Get SMS log statistics
  const getLogStats = () => {
    const total = filteredLogs.length;
    const delivered = filteredLogs.filter(log => log.status === 'delivered').length;
    const failed = filteredLogs.filter(log => log.status === 'failed').length;
    const deliveryRate = total > 0 ? (delivered / total) * 100 : 0;

    // Count by type
    const byType = filteredLogs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      delivered,
      failed,
      deliveryRate,
      byType
    };
  };

  const stats = getLogStats();

  // Export logs to CSV
  const exportLogs = () => {
    const headers = ['Date', 'Customer', 'Phone', 'Type', 'Message', 'Status', 'Error'];
    const csvData = filteredLogs.map(log => [
      new Date(log.sentAt).toLocaleString(),
      log.customerName,
      log.phoneNumber,
      log.type,
      log.message,
      log.status,
      log.error || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sms-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.deliveryRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by customer, phone, or message content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="loanApplication">Application</option>
              <option value="loanApproval">Approval</option>
              <option value="paymentReceipt">Payment</option>
              <option value="latePayment">Overdue</option>
              <option value="preDueReminder">Reminder</option>
              <option value="loanRejection">Rejection</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-4 items-end justify-between">
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={exportLogs}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </button>
        </div>
      </div>

      {/* SMS Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(log.sentAt).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-500">{new Date(log.sentAt).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{log.customerName}</div>
                    <div className="text-sm text-gray-500">{log.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      log.type === 'loanApplication' ? 'bg-blue-100 text-blue-800' :
                      log.type === 'loanApproval' ? 'bg-green-100 text-green-800' :
                      log.type === 'paymentReceipt' ? 'bg-purple-100 text-purple-800' :
                      log.type === 'latePayment' ? 'bg-red-100 text-red-800' :
                      log.type === 'preDueReminder' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.type === 'loanApplication' ? 'Application' :
                       log.type === 'loanApproval' ? 'Approval' :
                       log.type === 'paymentReceipt' ? 'Payment' :
                       log.type === 'latePayment' ? 'Overdue' :
                       log.type === 'preDueReminder' ? 'Reminder' :
                       log.type === 'loanRejection' ? 'Rejection' : log.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      log.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status}
                    </span>
                    {log.error && (
                      <div className="text-xs text-red-600 mt-1">{log.error}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-md">{log.message}</div>
                    {log.deliveredAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        Delivered: {new Date(log.deliveredAt).toLocaleTimeString()}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No SMS logs found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your search criteria'
                : 'No SMS messages have been sent yet'}
            </p>
          </div>
        )}
      </div>

      {/* SMS Type Distribution */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Message Type Distribution</h3>
        <div className="bg-white p-6 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="text-center">
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                  type === 'loanApplication' ? 'bg-blue-100' :
                  type === 'loanApproval' ? 'bg-green-100' :
                  type === 'paymentReceipt' ? 'bg-purple-100' :
                  type === 'latePayment' ? 'bg-red-100' :
                  type === 'preDueReminder' ? 'bg-yellow-100' :
                  'bg-gray-100'
                }`}>
                  <MessageSquare className={`w-6 h-6 ${
                    type === 'loanApplication' ? 'text-blue-600' :
                    type === 'loanApproval' ? 'text-green-600' :
                    type === 'paymentReceipt' ? 'text-purple-600' :
                    type === 'latePayment' ? 'text-red-600' :
                    type === 'preDueReminder' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`} />
                </div>
                <p className="mt-2 font-medium text-gray-800 capitalize">
                  {type === 'loanApplication' ? 'Application' :
                   type === 'loanApproval' ? 'Approval' :
                   type === 'paymentReceipt' ? 'Payment' :
                   type === 'latePayment' ? 'Overdue' :
                   type === 'preDueReminder' ? 'Reminder' :
                   type === 'loanRejection' ? 'Rejection' : type}
                </p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600">
                  {((count / stats.total) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}