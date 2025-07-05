import React, { useState } from 'react';
import { BarChart3, Download, Calendar, Filter, TrendingUp, DollarSign, Users, FileText, AlertTriangle, CheckCircle, Clock, Eye, RefreshCw } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import DashboardReport from './DashboardReport';
import CollectionReport from './CollectionReport';
import LoanAnalytics from './LoanAnalytics';
import CustomerReport from './CustomerReport';
import OverdueReport from './OverdueReport';
import FinancialReport from './FinancialReport';

export default function ReportsManager() {
  const { loans, customers, repayments, users } = useData();
  const { user } = useAuth();
  const [currentReport, setCurrentReport] = useState<'dashboard' | 'collection' | 'analytics' | 'customers' | 'overdue' | 'financial'>('dashboard');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Calculate key metrics for the overview
  const getOverviewMetrics = () => {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    // Current month metrics
    const currentMonthLoans = loans.filter(l => new Date(l.createdAt) >= thisMonth);
    const currentMonthDisbursed = loans.filter(l => 
      l.disbursedDate && new Date(l.disbursedDate) >= thisMonth
    );
    const currentMonthCollection = repayments.filter(r => 
      r.paymentDate && new Date(r.paymentDate) >= thisMonth && r.status === 'paid'
    ).reduce((sum, r) => sum + (r.paidAmount || 0), 0);

    // Last month metrics for comparison
    const lastMonthLoans = loans.filter(l => 
      new Date(l.createdAt) >= lastMonth && new Date(l.createdAt) <= lastMonthEnd
    );
    const lastMonthDisbursed = loans.filter(l => 
      l.disbursedDate && new Date(l.disbursedDate) >= lastMonth && new Date(l.disbursedDate) <= lastMonthEnd
    );
    const lastMonthCollection = repayments.filter(r => 
      r.paymentDate && new Date(r.paymentDate) >= lastMonth && 
      new Date(r.paymentDate) <= lastMonthEnd && r.status === 'paid'
    ).reduce((sum, r) => sum + (r.paidAmount || 0), 0);

    // Portfolio metrics
    const totalPortfolio = loans.reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount), 0);
    const activeLoans = loans.filter(l => l.status === 'active').length;
    const overduePayments = repayments.filter(r => 
      r.status === 'pending' && new Date(r.dueDate) < today
    ).length;
    const collectionRate = repayments.length > 0 ? 
      (repayments.filter(r => r.status === 'paid').length / repayments.length) * 100 : 0;

    return {
      currentMonth: {
        applications: currentMonthLoans.length,
        disbursements: currentMonthDisbursed.length,
        disbursedAmount: currentMonthDisbursed.reduce((sum, l) => sum + (l.approvedAmount || 0), 0),
        collection: currentMonthCollection
      },
      lastMonth: {
        applications: lastMonthLoans.length,
        disbursements: lastMonthDisbursed.length,
        disbursedAmount: lastMonthDisbursed.reduce((sum, l) => sum + (l.approvedAmount || 0), 0),
        collection: lastMonthCollection
      },
      portfolio: {
        totalValue: totalPortfolio,
        activeLoans,
        overduePayments,
        collectionRate
      }
    };
  };

  const metrics = getOverviewMetrics();

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const reportTypes = [
    {
      id: 'dashboard',
      title: 'Executive Dashboard',
      description: 'High-level overview and key performance indicators',
      icon: BarChart3,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'collection',
      title: 'Collection Report',
      description: 'Payment collections and recovery analysis',
      icon: DollarSign,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'analytics',
      title: 'Loan Analytics',
      description: 'Loan performance and trend analysis',
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'customers',
      title: 'Customer Report',
      description: 'Customer demographics and behavior analysis',
      icon: Users,
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      id: 'overdue',
      title: 'Overdue Analysis',
      description: 'Overdue payments and risk assessment',
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 'financial',
      title: 'Financial Report',
      description: 'Comprehensive financial statements and ratios',
      icon: FileText,
      color: 'bg-yellow-100 text-yellow-600'
    }
  ];

  const renderReport = () => {
    const commonProps = { dateRange, loans, customers, repayments, users };
    
    switch (currentReport) {
      case 'dashboard':
        return <DashboardReport {...commonProps} />;
      case 'collection':
        return <CollectionReport {...commonProps} />;
      case 'analytics':
        return <LoanAnalytics {...commonProps} />;
      case 'customers':
        return <CustomerReport {...commonProps} />;
      case 'overdue':
        return <OverdueReport {...commonProps} />;
      case 'financial':
        return <FinancialReport {...commonProps} />;
      default:
        return <DashboardReport {...commonProps} />;
    }
  };

  const exportAllReports = () => {
    // This would generate a comprehensive report package
    const reportData = {
      generatedAt: new Date().toISOString(),
      generatedBy: user?.name,
      dateRange,
      metrics,
      summary: 'Comprehensive loan management system report package'
    };

    const jsonContent = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loan-reports-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
          <p className="text-gray-600">Comprehensive business intelligence and reporting</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportAllReports}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export All
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month Applications</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.currentMonth.applications}</p>
              <div className="flex items-center mt-1">
                <span className={`text-sm ${
                  calculateGrowth(metrics.currentMonth.applications, metrics.lastMonth.applications) >= 0 
                    ? 'text-green-600' : 'text-red-600'
                }`}>
                  {calculateGrowth(metrics.currentMonth.applications, metrics.lastMonth.applications) >= 0 ? '+' : ''}
                  {calculateGrowth(metrics.currentMonth.applications, metrics.lastMonth.applications)}%
                </span>
                <span className="text-xs text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disbursements</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.currentMonth.disbursements}</p>
              <div className="flex items-center mt-1">
                <span className={`text-sm ${
                  calculateGrowth(metrics.currentMonth.disbursements, metrics.lastMonth.disbursements) >= 0 
                    ? 'text-green-600' : 'text-red-600'
                }`}>
                  {calculateGrowth(metrics.currentMonth.disbursements, metrics.lastMonth.disbursements) >= 0 ? '+' : ''}
                  {calculateGrowth(metrics.currentMonth.disbursements, metrics.lastMonth.disbursements)}%
                </span>
                <span className="text-xs text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Collection Rate</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.portfolio.collectionRate.toFixed(1)}%</p>
              <div className="flex items-center mt-1">
                <span className={`text-sm ${metrics.portfolio.collectionRate >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {metrics.portfolio.collectionRate >= 90 ? 'Excellent' : 'Good'}
                </span>
                <span className="text-xs text-gray-500 ml-1">performance</span>
              </div>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">LKR {(metrics.portfolio.totalValue / 1000000).toFixed(1)}M</p>
              <div className="flex items-center mt-1">
                <span className="text-sm text-blue-600">{metrics.portfolio.activeLoans} active loans</span>
              </div>
            </div>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-700">Report Period:</span>
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
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setDateRange({
                startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0]
              })}
              className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              This Month
            </button>
            <button
              onClick={() => setDateRange({
                startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
                endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0]
              })}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Last Month
            </button>
            <button
              onClick={() => setDateRange({
                startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0]
              })}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              This Year
            </button>
          </div>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <div
              key={report.id}
              onClick={() => setCurrentReport(report.id as any)}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                currentReport === report.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-lg ${report.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 ml-3">{report.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm">{report.description}</p>
                </div>
                {currentReport === report.id && (
                  <div className="ml-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Alert for Overdue Payments */}
      {metrics.portfolio.overduePayments > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h3 className="font-semibold text-red-800">Attention Required</h3>
                <p className="text-red-600">
                  {metrics.portfolio.overduePayments} overdue payment{metrics.portfolio.overduePayments > 1 ? 's' : ''} need immediate attention
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentReport('overdue')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              View Overdue Report
            </button>
          </div>
        </div>
      )}

      {/* Selected Report Content */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800">
              {reportTypes.find(r => r.id === currentReport)?.title}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {renderReport()}
        </div>
      </div>
    </div>
  );
}