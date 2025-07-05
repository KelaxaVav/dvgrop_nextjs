import React from 'react';
import { AlertTriangle, Clock, DollarSign, TrendingDown, Phone, User, Calendar, Download } from 'lucide-react';

interface OverdueReportProps {
  dateRange: { startDate: string; endDate: string };
  loans: any[];
  customers: any[];
  repayments: any[];
}

export default function OverdueReport({ dateRange, loans, customers, repayments }: OverdueReportProps) {
  const getOverdueAnalysis = () => {
    const today = new Date();
    
    // Get all overdue repayments
    const overdueRepayments = repayments.filter(r => 
      r.status === 'pending' && new Date(r.dueDate) < today
    );

    // Categorize by overdue period
    const overdueCategories = {
      '1-30': [],
      '31-60': [],
      '61-90': [],
      '90+': []
    };

    overdueRepayments.forEach(repayment => {
      const daysOverdue = Math.floor((today.getTime() - new Date(repayment.dueDate).getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysOverdue <= 30) overdueCategories['1-30'].push(repayment);
      else if (daysOverdue <= 60) overdueCategories['31-60'].push(repayment);
      else if (daysOverdue <= 90) overdueCategories['61-90'].push(repayment);
      else overdueCategories['90+'].push(repayment);
    });

    // Calculate totals for each category
    const categoryTotals = Object.entries(overdueCategories).map(([period, repayments]) => ({
      period,
      count: repayments.length,
      amount: repayments.reduce((sum, r) => sum + r.balance, 0),
      repayments
    }));

    // Get customer-wise overdue analysis
    const customerOverdueAnalysis = overdueRepayments.reduce((acc, repayment) => {
      const loan = loans.find(l => l.id === repayment.loanId);
      if (loan) {
        const customer = customers.find(c => c.id === loan.customerId);
        if (customer) {
          if (!acc[customer.id]) {
            acc[customer.id] = {
              customer,
              overdueRepayments: [],
              totalOverdue: 0,
              oldestOverdue: 0,
              riskLevel: 'Low'
            };
          }
          
          const daysOverdue = Math.floor((today.getTime() - new Date(repayment.dueDate).getTime()) / (1000 * 60 * 60 * 24));
          acc[customer.id].overdueRepayments.push({ ...repayment, daysOverdue, loan });
          acc[customer.id].totalOverdue += repayment.balance;
          acc[customer.id].oldestOverdue = Math.max(acc[customer.id].oldestOverdue, daysOverdue);
          
          // Determine risk level
          if (acc[customer.id].oldestOverdue > 90 || acc[customer.id].overdueRepayments.length > 3) {
            acc[customer.id].riskLevel = 'High';
          } else if (acc[customer.id].oldestOverdue > 30 || acc[customer.id].overdueRepayments.length > 1) {
            acc[customer.id].riskLevel = 'Medium';
          }
        }
      }
      return acc;
    }, {} as Record<string, any>);

    const customerOverdueList = Object.values(customerOverdueAnalysis)
      .sort((a: any, b: any) => b.totalOverdue - a.totalOverdue);

    // Calculate recovery potential
    const recoveryAnalysis = {
      immediate: categoryTotals.find(c => c.period === '1-30')?.amount || 0,
      shortTerm: categoryTotals.find(c => c.period === '31-60')?.amount || 0,
      mediumTerm: categoryTotals.find(c => c.period === '61-90')?.amount || 0,
      longTerm: categoryTotals.find(c => c.period === '90+')?.amount || 0
    };

    const totalOverdue = overdueRepayments.reduce((sum, r) => sum + r.balance, 0);
    const totalOverdueCount = overdueRepayments.length;

    return {
      overdueRepayments,
      categoryTotals,
      customerOverdueList,
      recoveryAnalysis,
      totalOverdue,
      totalOverdueCount
    };
  };

  const analysis = getOverdueAnalysis();

  const getOverdueTrend = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      // Count repayments that became overdue in this month
      const monthOverdue = repayments.filter(r => {
        const dueDate = new Date(r.dueDate);
        return dueDate >= monthStart && dueDate <= monthEnd && 
               r.status === 'pending' && dueDate < new Date();
      });

      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        count: monthOverdue.length,
        amount: monthOverdue.reduce((sum, r) => sum + r.balance, 0)
      });
    }
    return months;
  };

  const overdueTrend = getOverdueTrend();

  const exportOverdueReport = () => {
    const reportData = [
      ['Overdue Report'],
      ['Generated:', new Date().toLocaleString()],
      ['Total Overdue Amount:', `LKR ${analysis.totalOverdue.toLocaleString()}`],
      ['Total Overdue Count:', analysis.totalOverdueCount.toString()],
      [],
      ['Customer Overdue Details'],
      ['Customer Name', 'NIC', 'Phone', 'Overdue Amount', 'Overdue Count', 'Oldest Overdue (Days)', 'Risk Level'],
      ...analysis.customerOverdueList.map((customer: any) => [
        customer.customer.name,
        customer.customer.nic,
        customer.customer.phone,
        customer.totalOverdue.toString(),
        customer.overdueRepayments.length.toString(),
        customer.oldestOverdue.toString(),
        customer.riskLevel
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([reportData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `overdue-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Overdue Summary */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Overdue Summary</h3>
          <button
            onClick={exportOverdueReport}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-red-50 p-6 rounded-xl border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Total Overdue</p>
                <p className="text-3xl font-bold text-red-900">LKR {analysis.totalOverdue.toLocaleString()}</p>
                <p className="text-sm text-red-700">{analysis.totalOverdueCount} payments</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">High Risk Customers</p>
                <p className="text-3xl font-bold text-orange-900">
                  {analysis.customerOverdueList.filter((c: any) => c.riskLevel === 'High').length}
                </p>
                <p className="text-sm text-orange-700">require immediate attention</p>
              </div>
              <User className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Recovery Potential</p>
                <p className="text-3xl font-bold text-yellow-900">
                  LKR {(analysis.recoveryAnalysis.immediate / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-yellow-700">within 30 days</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Overdue Period</p>
                <p className="text-3xl font-bold text-purple-900">
                  {analysis.overdueRepayments.length > 0 ? 
                    Math.round(analysis.overdueRepayments.reduce((sum, r) => {
                      const days = Math.floor((new Date().getTime() - new Date(r.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                      return sum + days;
                    }, 0) / analysis.overdueRepayments.length) : 0
                  }
                </p>
                <p className="text-sm text-purple-700">days average</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Overdue by Period */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Overdue by Period</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {analysis.categoryTotals.map((category, index) => {
            const colors = [
              'bg-yellow-50 border-yellow-200 text-yellow-800',
              'bg-orange-50 border-orange-200 text-orange-800',
              'bg-red-50 border-red-200 text-red-800',
              'bg-red-100 border-red-300 text-red-900'
            ];
            
            return (
              <div key={category.period} className={`p-6 rounded-xl border ${colors[index]}`}>
                <h4 className="font-semibold mb-2">{category.period} Days</h4>
                <p className="text-2xl font-bold mb-1">LKR {category.amount.toLocaleString()}</p>
                <p className="text-sm">{category.count} payments</p>
                <div className="mt-3">
                  <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                    <div 
                      className="bg-current h-2 rounded-full"
                      style={{ 
                        width: `${analysis.totalOverdue > 0 ? (category.amount / analysis.totalOverdue) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* High Risk Customers */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">High Risk Customers</h3>
        <div className="bg-white p-6 rounded-lg border">
          <div className="space-y-4">
            {analysis.customerOverdueList
              .filter((customer: any) => customer.riskLevel === 'High')
              .slice(0, 10)
              .map((customerData: any) => (
              <div key={customerData.customer.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-800">{customerData.customer.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {customerData.customer.phone}
                      </span>
                      <span>{customerData.customer.nic}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-900">LKR {customerData.totalOverdue.toLocaleString()}</p>
                  <div className="text-sm text-red-700">
                    <p>{customerData.overdueRepayments.length} overdue payments</p>
                    <p>{customerData.oldestOverdue} days oldest</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Overdue Customers */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">All Overdue Customers</h3>
        <div className="bg-white rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overdue Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Oldest Overdue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analysis.customerOverdueList.map((customerData: any) => (
                  <tr key={customerData.customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customerData.customer.name}</div>
                        <div className="text-sm text-gray-500">{customerData.customer.nic}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customerData.customer.phone}</div>
                      <div className="text-sm text-gray-500">{customerData.customer.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-red-600">
                        LKR {customerData.totalOverdue.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customerData.overdueRepayments.length}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customerData.oldestOverdue} days</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        customerData.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                        customerData.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {customerData.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recovery Action Plan */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recovery Action Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <h4 className="font-medium text-gray-800 mb-4">Immediate Actions (1-30 Days)</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Target Amount</span>
                <span className="font-medium text-green-600">
                  LKR {analysis.recoveryAnalysis.immediate.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-medium text-gray-900">85%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expected Recovery</span>
                <span className="font-medium text-blue-600">
                  LKR {Math.round(analysis.recoveryAnalysis.immediate * 0.85).toLocaleString()}
                </span>
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800 font-medium">Recommended Actions:</p>
                <ul className="text-sm text-green-700 mt-1 space-y-1">
                  <li>• Phone call reminders</li>
                  <li>• SMS notifications</li>
                  <li>• Payment plan offers</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h4 className="font-medium text-gray-800 mb-4">Long-term Recovery (90+ Days)</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Target Amount</span>
                <span className="font-medium text-red-600">
                  LKR {analysis.recoveryAnalysis.longTerm.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-medium text-gray-900">35%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expected Recovery</span>
                <span className="font-medium text-orange-600">
                  LKR {Math.round(analysis.recoveryAnalysis.longTerm * 0.35).toLocaleString()}
                </span>
              </div>
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800 font-medium">Recommended Actions:</p>
                <ul className="text-sm text-red-700 mt-1 space-y-1">
                  <li>• Legal notice</li>
                  <li>• Asset verification</li>
                  <li>• Settlement negotiations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Trend */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">6-Month Overdue Trend</h3>
        <div className="bg-white p-6 rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-gray-600">Month</th>
                  <th className="text-right py-2 text-gray-600">New Overdue</th>
                  <th className="text-right py-2 text-gray-600">Amount (LKR)</th>
                  <th className="text-right py-2 text-gray-600">Trend</th>
                </tr>
              </thead>
              <tbody>
                {overdueTrend.map((month, index, array) => {
                  const prevMonth = index > 0 ? array[index - 1] : null;
                  const trend = prevMonth ? 
                    ((month.count - prevMonth.count) / (prevMonth.count || 1)) * 100 : 0;
                  
                  return (
                    <tr key={month.month} className="border-b">
                      <td className="py-3 font-medium text-gray-900">{month.month}</td>
                      <td className="py-3 text-right text-gray-700">{month.count}</td>
                      <td className="py-3 text-right text-gray-700">{month.amount.toLocaleString()}</td>
                      <td className="py-3 text-right">
                        <span className={`flex items-center justify-end ${
                          trend > 0 ? 'text-red-600' : trend < 0 ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {trend > 0 ? <TrendingDown className="w-4 h-4 mr-1 rotate-180" /> : 
                           trend < 0 ? <TrendingDown className="w-4 h-4 mr-1" /> : null}
                          {Math.abs(trend).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}