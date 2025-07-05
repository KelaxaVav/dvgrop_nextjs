import React from 'react';
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle, Calendar, Download } from 'lucide-react';

interface CollectionReportProps {
  dateRange: { startDate: string; endDate: string };
  loans: any[];
  customers: any[];
  repayments: any[];
}

export default function CollectionReport({ dateRange, loans, customers, repayments }: CollectionReportProps) {
  const getCollectionMetrics = () => {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    // Filter repayments within date range
    const periodRepayments = repayments.filter(r => {
      if (!r.paymentDate) return false;
      const paymentDate = new Date(r.paymentDate);
      return paymentDate >= startDate && paymentDate <= endDate;
    });

    // Calculate collection metrics
    const totalCollected = periodRepayments
      .filter(r => r.status === 'paid')
      .reduce((sum, r) => sum + (r.paidAmount || 0), 0);

    const totalDue = repayments
      .filter(r => new Date(r.dueDate) >= startDate && new Date(r.dueDate) <= endDate)
      .reduce((sum, r) => sum + r.amount, 0);

    const collectionRate = totalDue > 0 ? (totalCollected / totalDue) * 100 : 0;

    // Overdue analysis
    const overdueRepayments = repayments.filter(r => 
      r.status === 'pending' && new Date(r.dueDate) < new Date()
    );
    
    const totalOverdue = overdueRepayments.reduce((sum, r) => sum + r.balance, 0);

    // Payment mode analysis
    const paymentModes = periodRepayments
      .filter(r => r.status === 'paid' && r.paymentMode)
      .reduce((acc, r) => {
        acc[r.paymentMode] = (acc[r.paymentMode] || 0) + (r.paidAmount || 0);
        return acc;
      }, {} as Record<string, number>);

    // Daily collections
    const dailyCollections = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayRepayments = periodRepayments.filter(r => {
        if (!r.paymentDate) return false;
        return new Date(r.paymentDate).toDateString() === currentDate.toDateString();
      });
      
      dailyCollections.push({
        date: new Date(currentDate).toISOString().split('T')[0],
        amount: dayRepayments.reduce((sum, r) => sum + (r.paidAmount || 0), 0),
        count: dayRepayments.length
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      totalCollected,
      totalDue,
      collectionRate,
      overdueCount: overdueRepayments.length,
      totalOverdue,
      paymentModes,
      dailyCollections,
      periodRepayments: periodRepayments.filter(r => r.status === 'paid')
    };
  };

  const metrics = getCollectionMetrics();

  const getTopCollectors = () => {
    const customerCollections = metrics.periodRepayments.reduce((acc, repayment) => {
      const loan = loans.find(l => l.id === repayment.loanId);
      if (loan) {
        const customer = customers.find(c => c.id === loan.customerId);
        if (customer) {
          const key = customer.id;
          if (!acc[key]) {
            acc[key] = {
              customer,
              totalPaid: 0,
              paymentCount: 0
            };
          }
          acc[key].totalPaid += repayment.paidAmount || 0;
          acc[key].paymentCount += 1;
        }
      }
      return acc;
    }, {} as Record<string, any>);

    return Object.values(customerCollections)
      .sort((a: any, b: any) => b.totalPaid - a.totalPaid)
      .slice(0, 10);
  };

  const topCollectors = getTopCollectors();

  const exportCollectionReport = () => {
    const reportData = {
      reportType: 'Collection Report',
      dateRange,
      summary: {
        totalCollected: metrics.totalCollected,
        totalDue: metrics.totalDue,
        collectionRate: metrics.collectionRate,
        overdueCount: metrics.overdueCount,
        totalOverdue: metrics.totalOverdue
      },
      paymentModes: metrics.paymentModes,
      dailyCollections: metrics.dailyCollections,
      topCollectors: topCollectors.map(tc => ({
        customerName: tc.customer.name,
        customerNIC: tc.customer.nic,
        totalPaid: tc.totalPaid,
        paymentCount: tc.paymentCount
      })),
      generatedAt: new Date().toISOString()
    };

    const csvContent = [
      ['Collection Report Summary'],
      ['Date Range', `${dateRange.startDate} to ${dateRange.endDate}`],
      ['Total Collected', `LKR ${metrics.totalCollected.toLocaleString()}`],
      ['Total Due', `LKR ${metrics.totalDue.toLocaleString()}`],
      ['Collection Rate', `${metrics.collectionRate.toFixed(2)}%`],
      ['Overdue Payments', metrics.overdueCount.toString()],
      ['Total Overdue Amount', `LKR ${metrics.totalOverdue.toLocaleString()}`],
      [],
      ['Daily Collections'],
      ['Date', 'Amount (LKR)', 'Payment Count'],
      ...metrics.dailyCollections.map(dc => [
        dc.date,
        dc.amount.toString(),
        dc.count.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `collection-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Collection Summary */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Collection Summary</h3>
          <button
            onClick={exportCollectionReport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Collected</p>
                <p className="text-3xl font-bold text-green-900">LKR {metrics.totalCollected.toLocaleString()}</p>
                <p className="text-sm text-green-700">{metrics.periodRepayments.length} payments</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Collection Rate</p>
                <p className="text-3xl font-bold text-blue-900">{metrics.collectionRate.toFixed(1)}%</p>
                <p className="text-sm text-blue-700">of total due amount</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-xl border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Overdue Amount</p>
                <p className="text-3xl font-bold text-red-900">LKR {metrics.totalOverdue.toLocaleString()}</p>
                <p className="text-sm text-red-700">{metrics.overdueCount} payments</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Average Payment</p>
                <p className="text-3xl font-bold text-purple-900">
                  LKR {metrics.periodRepayments.length > 0 ? 
                    Math.round(metrics.totalCollected / metrics.periodRepayments.length).toLocaleString() : 
                    '0'
                  }
                </p>
                <p className="text-sm text-purple-700">per transaction</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Mode Analysis */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Mode Analysis</h3>
        <div className="bg-white p-6 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(metrics.paymentModes).map(([mode, amount]) => {
              const percentage = metrics.totalCollected > 0 ? (amount / metrics.totalCollected) * 100 : 0;
              return (
                <div key={mode} className="text-center">
                  <div className="mb-2">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                      mode === 'cash' ? 'bg-green-100' :
                      mode === 'online' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      <DollarSign className={`w-8 h-8 ${
                        mode === 'cash' ? 'text-green-600' :
                        mode === 'online' ? 'text-blue-600' : 'text-purple-600'
                      }`} />
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-800 capitalize">{mode}</h4>
                  <p className="text-2xl font-bold text-gray-900">LKR {amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{percentage.toFixed(1)}% of total</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Collection Trend */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Collection Trend</h3>
        <div className="bg-white p-6 rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-gray-600">Date</th>
                  <th className="text-right py-2 text-gray-600">Amount (LKR)</th>
                  <th className="text-right py-2 text-gray-600">Payments</th>
                  <th className="text-right py-2 text-gray-600">Average</th>
                </tr>
              </thead>
              <tbody>
                {metrics.dailyCollections
                  .filter(dc => dc.amount > 0)
                  .slice(-10)
                  .map((day) => (
                  <tr key={day.date} className="border-b">
                    <td className="py-3 font-medium text-gray-900">
                      {new Date(day.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right text-gray-700">
                      {day.amount.toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-gray-700">{day.count}</td>
                    <td className="py-3 text-right text-gray-700">
                      {day.count > 0 ? Math.round(day.amount / day.count).toLocaleString() : '0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top Paying Customers */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Paying Customers</h3>
        <div className="bg-white p-6 rounded-lg border">
          <div className="space-y-4">
            {topCollectors.map((collector, index) => (
              <div key={collector.customer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{collector.customer.name}</h4>
                    <p className="text-sm text-gray-600">{collector.customer.nic}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">LKR {collector.totalPaid.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{collector.paymentCount} payments</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Collection Performance Indicators */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <h4 className="font-medium text-gray-800 mb-4">Collection Efficiency</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Collection Rate</span>
                <span className={`font-medium ${
                  metrics.collectionRate >= 90 ? 'text-green-600' :
                  metrics.collectionRate >= 75 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {metrics.collectionRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    metrics.collectionRate >= 90 ? 'bg-green-500' :
                    metrics.collectionRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(metrics.collectionRate, 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">
                {metrics.collectionRate >= 90 ? 'Excellent' :
                 metrics.collectionRate >= 75 ? 'Good' : 'Needs Improvement'}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h4 className="font-medium text-gray-800 mb-4">Recovery Status</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Overdue Recovery Rate</span>
                <span className="font-medium text-gray-900">
                  {metrics.overdueCount > 0 ? 
                    ((repayments.filter(r => r.status === 'paid').length / repayments.length) * 100).toFixed(1) : 
                    '0'
                  }%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Days to Collect</span>
                <span className="font-medium text-gray-900">2.5 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Recovery Amount</span>
                <span className="font-medium text-green-600">
                  LKR {(metrics.totalCollected - metrics.totalOverdue).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}