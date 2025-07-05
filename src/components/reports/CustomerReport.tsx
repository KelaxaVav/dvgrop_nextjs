import React from 'react';
import { Users, TrendingUp, MapPin, Briefcase, DollarSign, Calendar, Phone, Mail } from 'lucide-react';

interface CustomerReportProps {
  dateRange: { startDate: string; endDate: string };
  loans: any[];
  customers: any[];
  repayments: any[];
}

export default function CustomerReport({ dateRange, loans, customers, repayments }: CustomerReportProps) {
  const getCustomerAnalytics = () => {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    const newCustomers = customers.filter(c => {
      const customerDate = new Date(c.createdAt);
      return customerDate >= startDate && customerDate <= endDate;
    });

    // Demographics analysis
    const demographics = {
      maritalStatus: { married: 0, single: 0 },
      ageGroups: { '18-30': 0, '31-45': 0, '46-60': 0, '60+': 0 },
      occupations: {} as Record<string, number>,
      incomeRanges: {
        'Under 25K': 0,
        '25K-50K': 0,
        '50K-100K': 0,
        'Over 100K': 0
      }
    };

    customers.forEach(customer => {
      // Marital status
      demographics.maritalStatus[customer.maritalStatus]++;
      
      // Age groups (calculated from DOB)
      const age = new Date().getFullYear() - new Date(customer.dob).getFullYear();
      if (age <= 30) demographics.ageGroups['18-30']++;
      else if (age <= 45) demographics.ageGroups['31-45']++;
      else if (age <= 60) demographics.ageGroups['46-60']++;
      else demographics.ageGroups['60+']++;
      
      // Occupations
      demographics.occupations[customer.occupation] = (demographics.occupations[customer.occupation] || 0) + 1;
      
      // Income ranges
      if (customer.income < 25000) demographics.incomeRanges['Under 25K']++;
      else if (customer.income < 50000) demographics.incomeRanges['25K-50K']++;
      else if (customer.income < 100000) demographics.incomeRanges['50K-100K']++;
      else demographics.incomeRanges['Over 100K']++;
    });

    // Customer behavior analysis
    const customerBehavior = customers.map(customer => {
      const customerLoans = loans.filter(l => l.customerId === customer.id);
      const customerRepayments = repayments.filter(r => {
        const loan = loans.find(l => l.id === r.loanId);
        return loan && loan.customerId === customer.id;
      });
      
      const totalBorrowed = customerLoans.reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount), 0);
      const totalPaid = customerRepayments
        .filter(r => r.status === 'paid')
        .reduce((sum, r) => sum + (r.paidAmount || 0), 0);
      const overduePayments = customerRepayments.filter(r => 
        r.status === 'pending' && new Date(r.dueDate) < new Date()
      ).length;
      
      return {
        customer,
        loanCount: customerLoans.length,
        totalBorrowed,
        totalPaid,
        overduePayments,
        paymentHistory: customerRepayments.length > 0 ? 
          (customerRepayments.filter(r => r.status === 'paid').length / customerRepayments.length) * 100 : 0,
        riskScore: overduePayments > 0 ? 'High' : 
                  customerLoans.length > 2 ? 'Medium' : 'Low'
      };
    });

    // Top customers by value
    const topCustomers = customerBehavior
      .sort((a, b) => b.totalBorrowed - a.totalBorrowed)
      .slice(0, 10);

    // Customer retention analysis
    const retentionAnalysis = {
      newCustomers: newCustomers.length,
      returningCustomers: customerBehavior.filter(cb => cb.loanCount > 1).length,
      activeCustomers: customerBehavior.filter(cb => cb.loanCount > 0).length,
      avgLoansPerCustomer: customerBehavior.length > 0 ? 
        customerBehavior.reduce((sum, cb) => sum + cb.loanCount, 0) / customerBehavior.length : 0
    };

    return {
      demographics,
      customerBehavior,
      topCustomers,
      retentionAnalysis,
      newCustomers,
      totalCustomers: customers.length
    };
  };

  const analytics = getCustomerAnalytics();

  const getCustomerGrowthTrend = () => {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthCustomers = customers.filter(c => {
        const customerDate = new Date(c.createdAt);
        return customerDate >= monthStart && customerDate <= monthEnd;
      });

      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        newCustomers: monthCustomers.length,
        cumulativeCustomers: customers.filter(c => new Date(c.customerDate) <= monthEnd).length
      });
    }
    return months;
  };

  const growthTrend = getCustomerGrowthTrend();

  return (
    <div className="space-y-8">
      {/* Customer Overview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Customers</p>
                <p className="text-3xl font-bold text-blue-900">{analytics.totalCustomers}</p>
                <p className="text-sm text-blue-700">registered customers</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">New Customers</p>
                <p className="text-3xl font-bold text-green-900">{analytics.retentionAnalysis.newCustomers}</p>
                <p className="text-sm text-green-700">this period</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Active Customers</p>
                <p className="text-3xl font-bold text-purple-900">{analytics.retentionAnalysis.activeCustomers}</p>
                <p className="text-sm text-purple-700">with active loans</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Avg Loans/Customer</p>
                <p className="text-3xl font-bold text-orange-900">{analytics.retentionAnalysis.avgLoansPerCustomer.toFixed(1)}</p>
                <p className="text-sm text-orange-700">loan utilization</p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Demographics Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Age Distribution */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Age Distribution</h3>
          <div className="bg-white p-6 rounded-lg border">
            <div className="space-y-4">
              {Object.entries(analytics.demographics.ageGroups).map(([ageGroup, count]) => {
                const percentage = analytics.totalCustomers > 0 ? (count / analytics.totalCustomers) * 100 : 0;
                return (
                  <div key={ageGroup} className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">{ageGroup} years</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12">{count}</span>
                      <span className="text-sm text-gray-600 w-12">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Income Distribution */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Income Distribution</h3>
          <div className="bg-white p-6 rounded-lg border">
            <div className="space-y-4">
              {Object.entries(analytics.demographics.incomeRanges).map(([range, count]) => {
                const percentage = analytics.totalCustomers > 0 ? (count / analytics.totalCustomers) * 100 : 0;
                return (
                  <div key={range} className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">LKR {range}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12">{count}</span>
                      <span className="text-sm text-gray-600 w-12">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Top Occupations */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Occupations</h3>
        <div className="bg-white p-6 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analytics.demographics.occupations)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 6)
              .map(([occupation, count]) => (
              <div key={occupation} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Briefcase className="w-5 h-5 text-gray-500 mr-3" />
                  <span className="font-medium text-gray-800">{occupation}</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Customers by Value */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Customers by Loan Value</h3>
        <div className="bg-white p-6 rounded-lg border">
          <div className="space-y-4">
            {analytics.topCustomers.map((customerData, index) => (
              <div key={customerData.customer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{customerData.customer.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {customerData.customer.phone}
                      </span>
                      <span className="flex items-center">
                        <Briefcase className="w-3 h-3 mr-1" />
                        {customerData.customer.occupation}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">LKR {customerData.totalBorrowed.toLocaleString()}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{customerData.loanCount} loans</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      customerData.riskScore === 'Low' ? 'bg-green-100 text-green-800' :
                      customerData.riskScore === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {customerData.riskScore} Risk
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Growth Trend */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Growth Trend</h3>
        <div className="bg-white p-6 rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-gray-600">Month</th>
                  <th className="text-right py-2 text-gray-600">New Customers</th>
                  <th className="text-right py-2 text-gray-600">Growth Rate</th>
                  <th className="text-right py-2 text-gray-600">Cumulative</th>
                </tr>
              </thead>
              <tbody>
                {growthTrend.slice(-6).map((month, index, array) => {
                  const prevMonth = index > 0 ? array[index - 1] : null;
                  const growthRate = prevMonth && prevMonth.newCustomers > 0 ? 
                    ((month.newCustomers - prevMonth.newCustomers) / prevMonth.newCustomers) * 100 : 0;
                  
                  return (
                    <tr key={month.month} className="border-b">
                      <td className="py-3 font-medium text-gray-900">{month.month}</td>
                      <td className="py-3 text-right text-gray-700">{month.newCustomers}</td>
                      <td className="py-3 text-right">
                        <span className={`font-medium ${
                          growthRate > 0 ? 'text-green-600' : 
                          growthRate < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 text-right text-gray-700">{month.cumulativeCustomers}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Customer Behavior Insights */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Behavior Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <h4 className="font-medium text-gray-800 mb-4">Loyalty Metrics</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Returning Customers</span>
                <span className="font-medium text-gray-900">{analytics.retentionAnalysis.returningCustomers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Retention Rate</span>
                <span className="font-medium text-green-600">
                  {analytics.totalCustomers > 0 ? 
                    ((analytics.retentionAnalysis.returningCustomers / analytics.totalCustomers) * 100).toFixed(1) : 0
                  }%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Loans per Customer</span>
                <span className="font-medium text-gray-900">{analytics.retentionAnalysis.avgLoansPerCustomer.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h4 className="font-medium text-gray-800 mb-4">Payment Behavior</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">On-time Payers</span>
                <span className="font-medium text-green-600">
                  {analytics.customerBehavior.filter(cb => cb.overduePayments === 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Late Payers</span>
                <span className="font-medium text-yellow-600">
                  {analytics.customerBehavior.filter(cb => cb.overduePayments > 0 && cb.overduePayments <= 2).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">High Risk</span>
                <span className="font-medium text-red-600">
                  {analytics.customerBehavior.filter(cb => cb.overduePayments > 2).length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h4 className="font-medium text-gray-800 mb-4">Demographics</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Married</span>
                <span className="font-medium text-gray-900">{analytics.demographics.maritalStatus.married}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Single</span>
                <span className="font-medium text-gray-900">{analytics.demographics.maritalStatus.single}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Age Group</span>
                <span className="font-medium text-gray-900">31-45 years</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}