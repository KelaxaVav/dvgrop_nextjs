import React from 'react';
import { TrendingUp, BarChart3, PieChart, Target, DollarSign, Users, Calendar, AlertTriangle } from 'lucide-react';

interface LoanAnalyticsProps {
  dateRange: { startDate: string; endDate: string };
  loans: any[];
  customers: any[];
  repayments: any[];
}

export default function LoanAnalytics({ dateRange, loans, customers, repayments }: LoanAnalyticsProps) {
  const getAnalyticsData = () => {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    const filteredLoans = loans.filter(loan => {
      const loanDate = new Date(loan.createdAt);
      return loanDate >= startDate && loanDate <= endDate;
    });

    // Loan type analysis
    const loanTypeAnalysis = filteredLoans.reduce((acc, loan) => {
      if (!acc[loan.type]) {
        acc[loan.type] = {
          count: 0,
          totalAmount: 0,
          approvedCount: 0,
          approvedAmount: 0,
          avgAmount: 0,
          approvalRate: 0
        };
      }
      
      acc[loan.type].count += 1;
      acc[loan.type].totalAmount += loan.requestedAmount;
      
      if (loan.status === 'approved' || loan.status === 'active' || loan.status === 'disbursed') {
        acc[loan.type].approvedCount += 1;
        acc[loan.type].approvedAmount += loan.approvedAmount || loan.requestedAmount;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Calculate averages and rates
    Object.keys(loanTypeAnalysis).forEach(type => {
      const data = loanTypeAnalysis[type];
      data.avgAmount = data.count > 0 ? data.totalAmount / data.count : 0;
      data.approvalRate = data.count > 0 ? (data.approvedCount / data.count) * 100 : 0;
    });

    // Monthly trends
    const monthlyTrends = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthLoans = loans.filter(l => {
        const loanDate = new Date(l.createdAt);
        return loanDate >= monthStart && loanDate <= monthEnd;
      });

      monthlyTrends.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        applications: monthLoans.length,
        approved: monthLoans.filter(l => l.status === 'approved' || l.status === 'active' || l.status === 'disbursed').length,
        rejected: monthLoans.filter(l => l.status === 'rejected').length,
        totalAmount: monthLoans.reduce((sum, l) => sum + l.requestedAmount, 0),
        approvedAmount: monthLoans
          .filter(l => l.status === 'approved' || l.status === 'active' || l.status === 'disbursed')
          .reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount), 0)
      });
    }

    // Risk analysis
    const riskAnalysis = {
      highRisk: 0,
      mediumRisk: 0,
      lowRisk: 0
    };

    filteredLoans.forEach(loan => {
      const customer = customers.find(c => c.id === loan.customerId);
      if (customer) {
        const loanToIncomeRatio = (loan.requestedAmount / (customer.income * 12)) * 100;
        if (loanToIncomeRatio > 300) riskAnalysis.highRisk++;
        else if (loanToIncomeRatio > 200) riskAnalysis.mediumRisk++;
        else riskAnalysis.lowRisk++;
      }
    });

    // Performance metrics
    const performanceMetrics = {
      totalApplications: filteredLoans.length,
      approvedLoans: filteredLoans.filter(l => l.status === 'approved' || l.status === 'active' || l.status === 'disbursed').length,
      rejectedLoans: filteredLoans.filter(l => l.status === 'rejected').length,
      pendingLoans: filteredLoans.filter(l => l.status === 'pending').length,
      avgProcessingTime: 3.2, // Mock data
      avgLoanAmount: filteredLoans.length > 0 ? 
        filteredLoans.reduce((sum, l) => sum + l.requestedAmount, 0) / filteredLoans.length : 0,
      totalDisbursed: filteredLoans
        .filter(l => l.status === 'active' || l.status === 'disbursed')
        .reduce((sum, l) => sum + (l.approvedAmount || 0), 0)
    };

    return {
      loanTypeAnalysis,
      monthlyTrends,
      riskAnalysis,
      performanceMetrics,
      filteredLoans
    };
  };

  const analytics = getAnalyticsData();

  const getLoanSizeDistribution = () => {
    const ranges = [
      { label: 'Under 100K', min: 0, max: 100000, count: 0, amount: 0 },
      { label: '100K - 500K', min: 100000, max: 500000, count: 0, amount: 0 },
      { label: '500K - 1M', min: 500000, max: 1000000, count: 0, amount: 0 },
      { label: '1M - 2M', min: 1000000, max: 2000000, count: 0, amount: 0 },
      { label: 'Over 2M', min: 2000000, max: Infinity, count: 0, amount: 0 }
    ];

    analytics.filteredLoans.forEach(loan => {
      const amount = loan.requestedAmount;
      const range = ranges.find(r => amount >= r.min && amount < r.max);
      if (range) {
        range.count++;
        range.amount += amount;
      }
    });

    return ranges.filter(r => r.count > 0);
  };

  const loanSizeDistribution = getLoanSizeDistribution();

  const getTopPerformingOfficers = () => {
    // Mock data for demonstration
    return [
      { name: 'Loan Officer 1', applications: 45, approvals: 38, rate: 84.4 },
      { name: 'Loan Officer 2', applications: 52, approvals: 41, rate: 78.8 },
      { name: 'System Admin', applications: 23, approvals: 20, rate: 87.0 }
    ].sort((a, b) => b.rate - a.rate);
  };

  const topOfficers = getTopPerformingOfficers();

  return (
    <div className="space-y-8">
      {/* Performance Overview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Applications</p>
                <p className="text-3xl font-bold text-blue-900">{analytics.performanceMetrics.totalApplications}</p>
                <p className="text-sm text-blue-700">in selected period</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Approval Rate</p>
                <p className="text-3xl font-bold text-green-900">
                  {analytics.performanceMetrics.totalApplications > 0 ? 
                    ((analytics.performanceMetrics.approvedLoans / analytics.performanceMetrics.totalApplications) * 100).toFixed(1) : 
                    '0'
                  }%
                </p>
                <p className="text-sm text-green-700">{analytics.performanceMetrics.approvedLoans} approved</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Loan Size</p>
                <p className="text-3xl font-bold text-purple-900">
                  LKR {Math.round(analytics.performanceMetrics.avgLoanAmount / 1000)}K
                </p>
                <p className="text-sm text-purple-700">per application</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Processing Time</p>
                <p className="text-3xl font-bold text-orange-900">{analytics.performanceMetrics.avgProcessingTime}</p>
                <p className="text-sm text-orange-700">days average</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Loan Type Analysis */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Loan Type Performance</h3>
        <div className="bg-white p-6 rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 text-gray-600">Loan Type</th>
                  <th className="text-right py-3 text-gray-600">Applications</th>
                  <th className="text-right py-3 text-gray-600">Approved</th>
                  <th className="text-right py-3 text-gray-600">Approval Rate</th>
                  <th className="text-right py-3 text-gray-600">Avg Amount</th>
                  <th className="text-right py-3 text-gray-600">Total Disbursed</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(analytics.loanTypeAnalysis).map(([type, data]: [string, any]) => (
                  <tr key={type} className="border-b">
                    <td className="py-3 font-medium text-gray-900 capitalize">{type}</td>
                    <td className="py-3 text-right text-gray-700">{data.count}</td>
                    <td className="py-3 text-right text-gray-700">{data.approvedCount}</td>
                    <td className="py-3 text-right">
                      <span className={`font-medium ${
                        data.approvalRate >= 80 ? 'text-green-600' :
                        data.approvalRate >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {data.approvalRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 text-right text-gray-700">
                      LKR {Math.round(data.avgAmount / 1000)}K
                    </td>
                    <td className="py-3 text-right text-gray-700">
                      LKR {(data.approvedAmount / 1000000).toFixed(1)}M
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">12-Month Application Trends</h3>
        <div className="bg-white p-6 rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-gray-600">Month</th>
                  <th className="text-right py-2 text-gray-600">Applications</th>
                  <th className="text-right py-2 text-gray-600">Approved</th>
                  <th className="text-right py-2 text-gray-600">Rejected</th>
                  <th className="text-right py-2 text-gray-600">Approval Rate</th>
                  <th className="text-right py-2 text-gray-600">Disbursed (LKR)</th>
                </tr>
              </thead>
              <tbody>
                {analytics.monthlyTrends.slice(-6).map((month) => (
                  <tr key={month.month} className="border-b">
                    <td className="py-3 font-medium text-gray-900">{month.month}</td>
                    <td className="py-3 text-right text-gray-700">{month.applications}</td>
                    <td className="py-3 text-right text-green-600">{month.approved}</td>
                    <td className="py-3 text-right text-red-600">{month.rejected}</td>
                    <td className="py-3 text-right">
                      <span className={`font-medium ${
                        month.applications > 0 ? 
                          (month.approved / month.applications) * 100 >= 80 ? 'text-green-600' :
                          (month.approved / month.applications) * 100 >= 60 ? 'text-yellow-600' : 'text-red-600'
                        : 'text-gray-500'
                      }`}>
                        {month.applications > 0 ? 
                          ((month.approved / month.applications) * 100).toFixed(1) : '0'
                        }%
                      </span>
                    </td>
                    <td className="py-3 text-right text-gray-700">
                      {(month.approvedAmount / 1000000).toFixed(1)}M
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Risk Analysis & Loan Size Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk Analysis */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Distribution</h3>
          <div className="bg-white p-6 rounded-lg border">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                  <span className="font-medium text-red-800">High Risk</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-red-900">{analytics.riskAnalysis.highRisk}</span>
                  <p className="text-sm text-red-700">loans</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                  <span className="font-medium text-yellow-800">Medium Risk</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-yellow-900">{analytics.riskAnalysis.mediumRisk}</span>
                  <p className="text-sm text-yellow-700">loans</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <Target className="w-5 h-5 text-green-600 mr-3" />
                  <span className="font-medium text-green-800">Low Risk</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-green-900">{analytics.riskAnalysis.lowRisk}</span>
                  <p className="text-sm text-green-700">loans</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loan Size Distribution */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Loan Size Distribution</h3>
          <div className="bg-white p-6 rounded-lg border">
            <div className="space-y-4">
              {loanSizeDistribution.map((range, index) => {
                const percentage = analytics.filteredLoans.length > 0 ? 
                  (range.count / analytics.filteredLoans.length) * 100 : 0;
                
                return (
                  <div key={range.label} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded mr-3 ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-purple-500' :
                        index === 3 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="font-medium text-gray-700">{range.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{range.count}</span>
                      <p className="text-sm text-gray-600">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Officers */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Officers</h3>
        <div className="bg-white p-6 rounded-lg border">
          <div className="space-y-4">
            {topOfficers.map((officer, index) => (
              <div key={officer.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{officer.name}</h4>
                    <p className="text-sm text-gray-600">{officer.applications} applications processed</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{officer.rate.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">{officer.approvals} approved</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-3">Growth Trends</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Application volume increased by 15% this quarter</li>
              <li>• Business loans show highest approval rates (85%)</li>
              <li>• Average loan size trending upward</li>
              <li>• Processing time improved by 0.8 days</li>
            </ul>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-3">Opportunities</h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li>• Focus on personal loan segment growth</li>
              <li>• Implement risk-based pricing</li>
              <li>• Enhance digital application process</li>
              <li>• Expand customer base in rural areas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}