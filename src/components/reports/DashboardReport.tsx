import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, FileText, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface DashboardReportProps {
  dateRange: { startDate: string; endDate: string };
  loans: any[];
  customers: any[];
  repayments: any[];
  users: any[];
}

export default function DashboardReport({ dateRange, loans, customers, repayments }: DashboardReportProps) {
  const getFilteredData = () => {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    const filteredLoans = loans.filter(loan => {
      const loanDate = new Date(loan.createdAt);
      return loanDate >= startDate && loanDate <= endDate;
    });

    const filteredRepayments = repayments.filter(repayment => {
      if (!repayment.paymentDate) return false;
      const paymentDate = new Date(repayment.paymentDate);
      return paymentDate >= startDate && paymentDate <= endDate;
    });

    return { filteredLoans, filteredRepayments };
  };

  const { filteredLoans, filteredRepayments } = getFilteredData();

  const calculateMetrics = () => {
    // Loan metrics
    const totalApplications = filteredLoans.length;
    const approvedLoans = filteredLoans.filter(l => l.status === 'approved' || l.status === 'active' || l.status === 'disbursed').length;
    const rejectedLoans = filteredLoans.filter(l => l.status === 'rejected').length;
    const pendingLoans = filteredLoans.filter(l => l.status === 'pending').length;
    const approvalRate = totalApplications > 0 ? (approvedLoans / totalApplications) * 100 : 0;

    // Financial metrics
    const totalDisbursed = filteredLoans
      .filter(l => l.status === 'active' || l.status === 'disbursed')
      .reduce((sum, l) => sum + (l.approvedAmount || 0), 0);
    
    const totalCollected = filteredRepayments
      .filter(r => r.status === 'paid')
      .reduce((sum, r) => sum + (r.paidAmount || 0), 0);

    // Portfolio metrics
    const activeLoans = loans.filter(l => l.status === 'active').length;
    const totalPortfolio = loans.reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount), 0);
    const overduePayments = repayments.filter(r => 
      r.status === 'pending' && new Date(r.dueDate) < new Date()
    ).length;

    // Customer metrics
    const newCustomers = customers.filter(c => {
      const customerDate = new Date(c.createdAt);
      return customerDate >= new Date(dateRange.startDate) && customerDate <= new Date(dateRange.endDate);
    }).length;

    return {
      loans: { totalApplications, approvedLoans, rejectedLoans, pendingLoans, approvalRate },
      financial: { totalDisbursed, totalCollected },
      portfolio: { activeLoans, totalPortfolio, overduePayments },
      customers: { newCustomers, total: customers.length }
    };
  };

  const metrics = calculateMetrics();

  const getLoanTypeDistribution = () => {
    const distribution = filteredLoans.reduce((acc, loan) => {
      acc[loan.type] = (acc[loan.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
      percentage: filteredLoans.length > 0 ? (count / filteredLoans.length) * 100 : 0
    }));
  };

  const loanTypeDistribution = getLoanTypeDistribution();

  const getMonthlyTrends = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthLoans = loans.filter(l => {
        const loanDate = new Date(l.createdAt);
        return loanDate >= monthStart && loanDate <= monthEnd;
      });

      const monthRepayments = repayments.filter(r => {
        if (!r.paymentDate) return false;
        const paymentDate = new Date(r.paymentDate);
        return paymentDate >= monthStart && paymentDate <= monthEnd && r.status === 'paid';
      });

      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        applications: monthLoans.length,
        disbursements: monthLoans.filter(l => l.status === 'active' || l.status === 'disbursed').length,
        collections: monthRepayments.reduce((sum, r) => sum + (r.paidAmount || 0), 0)
      });
    }
    
    return months;
  };

  const monthlyTrends = getMonthlyTrends();

  return (
    <div className="space-y-8">
      {/* Executive Summary */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Executive Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Applications</p>
                <p className="text-3xl font-bold text-blue-900">{metrics.loans.totalApplications}</p>
                <p className="text-sm text-blue-700">
                  {metrics.loans.approvalRate.toFixed(1)}% approval rate
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Disbursed</p>
                <p className="text-3xl font-bold text-green-900">LKR {(metrics.financial.totalDisbursed / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-green-700">
                  {metrics.loans.approvedLoans} loans approved
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Collections</p>
                <p className="text-3xl font-bold text-purple-900">LKR {(metrics.financial.totalCollected / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-purple-700">
                  Period collections
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Active Portfolio</p>
                <p className="text-3xl font-bold text-orange-900">{metrics.portfolio.activeLoans}</p>
                <p className="text-sm text-orange-700">
                  LKR {(metrics.portfolio.totalPortfolio / 1000000).toFixed(1)}M value
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Loan Status Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Loan Status Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{metrics.loans.approvedLoans}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.loans.pendingLoans}</p>
              </div>
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{metrics.loans.rejectedLoans}</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.portfolio.overduePayments}</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Loan Type Distribution */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Loan Type Distribution</h3>
        <div className="bg-white p-6 rounded-lg border">
          <div className="space-y-4">
            {loanTypeDistribution.map((item, index) => (
              <div key={item.type} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded mr-3 ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-purple-500' :
                    index === 3 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="font-medium text-gray-700">{item.type}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">{item.count} loans</span>
                  <span className="font-medium text-gray-900">{item.percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">6-Month Trends</h3>
        <div className="bg-white p-6 rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-gray-600">Month</th>
                  <th className="text-right py-2 text-gray-600">Applications</th>
                  <th className="text-right py-2 text-gray-600">Disbursements</th>
                  <th className="text-right py-2 text-gray-600">Collections (LKR)</th>
                </tr>
              </thead>
              <tbody>
                {monthlyTrends.map((month, index) => (
                  <tr key={month.month} className="border-b">
                    <td className="py-3 font-medium text-gray-900">{month.month}</td>
                    <td className="py-3 text-right text-gray-700">{month.applications}</td>
                    <td className="py-3 text-right text-gray-700">{month.disbursements}</td>
                    <td className="py-3 text-right text-gray-700">{month.collections.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-800">Approval Rate</h4>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{metrics.loans.approvalRate.toFixed(1)}%</div>
            <p className="text-sm text-gray-600">
              {metrics.loans.approvedLoans} of {metrics.loans.totalApplications} applications approved
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-800">Average Loan Size</h4>
              <DollarSign className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              LKR {metrics.loans.approvedLoans > 0 ? 
                Math.round(metrics.financial.totalDisbursed / metrics.loans.approvedLoans).toLocaleString() : 
                '0'
              }
            </div>
            <p className="text-sm text-gray-600">Average disbursed amount</p>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-800">Customer Growth</h4>
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{metrics.customers.newCustomers}</div>
            <p className="text-sm text-gray-600">
              New customers this period (Total: {metrics.customers.total})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}