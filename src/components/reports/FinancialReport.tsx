import React from 'react';
import { DollarSign, TrendingUp, PieChart, BarChart3, Target, AlertTriangle, Download } from 'lucide-react';

interface FinancialReportProps {
  dateRange: { startDate: string; endDate: string };
  loans: any[];
  customers: any[];
  repayments: any[];
}

export default function FinancialReport({ dateRange, loans, customers, repayments }: FinancialReportProps) {
  const getFinancialMetrics = () => {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    // Revenue calculations
    const periodRepayments = repayments.filter(r => {
      if (!r.paymentDate) return false;
      const paymentDate = new Date(r.paymentDate);
      return paymentDate >= startDate && paymentDate <= endDate && r.status === 'paid';
    });

    const totalRevenue = periodRepayments.reduce((sum, r) => sum + (r.paidAmount || 0), 0);
    
    // Calculate interest revenue (simplified calculation)
    const interestRevenue = periodRepayments.reduce((sum, r) => {
      const loan = loans.find(l => l.id === r.loanId);
      if (loan) {
        // Approximate interest portion (this would be more complex in real scenario)
        const interestPortion = (r.paidAmount || 0) * (loan.interestRate / 100) / (1 + (loan.interestRate / 100));
        return sum + interestPortion;
      }
      return sum;
    }, 0);

    const principalRevenue = totalRevenue - interestRevenue;

    // Disbursement calculations
    const periodDisbursements = loans.filter(l => {
      if (!l.disbursedDate) return false;
      const disbursedDate = new Date(l.disbursedDate);
      return disbursedDate >= startDate && disbursedDate <= endDate;
    });

    const totalDisbursed = periodDisbursements.reduce((sum, l) => sum + (l.approvedAmount || 0), 0);

    // Portfolio metrics
    const activeLoans = loans.filter(l => l.status === 'active');
    const totalPortfolioValue = activeLoans.reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount), 0);
    const totalOutstanding = repayments
      .filter(r => r.status === 'pending' || r.status === 'partial')
      .reduce((sum, r) => sum + r.balance, 0);

    // Risk metrics
    const overdueAmount = repayments
      .filter(r => r.status === 'pending' && new Date(r.dueDate) < new Date())
      .reduce((sum, r) => sum + r.balance, 0);

    const nplRatio = totalOutstanding > 0 ? (overdueAmount / totalOutstanding) * 100 : 0;

    // Profitability metrics
    const netInterestIncome = interestRevenue;
    const operatingExpenses = totalRevenue * 0.15; // Assumed 15% operating cost
    const netIncome = netInterestIncome - operatingExpenses;
    const roi = totalPortfolioValue > 0 ? (netIncome / totalPortfolioValue) * 100 : 0;

    return {
      revenue: {
        total: totalRevenue,
        interest: interestRevenue,
        principal: principalRevenue
      },
      disbursements: {
        total: totalDisbursed,
        count: periodDisbursements.length
      },
      portfolio: {
        value: totalPortfolioValue,
        outstanding: totalOutstanding,
        activeLoans: activeLoans.length
      },
      risk: {
        overdueAmount,
        nplRatio
      },
      profitability: {
        netInterestIncome,
        operatingExpenses,
        netIncome,
        roi
      }
    };
  };

  const metrics = getFinancialMetrics();

  const getMonthlyFinancials = () => {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthRepayments = repayments.filter(r => {
        if (!r.paymentDate) return false;
        const paymentDate = new Date(r.paymentDate);
        return paymentDate >= monthStart && paymentDate <= monthEnd && r.status === 'paid';
      });

      const monthDisbursements = loans.filter(l => {
        if (!l.disbursedDate) return false;
        const disbursedDate = new Date(l.disbursedDate);
        return disbursedDate >= monthStart && disbursedDate <= monthEnd;
      });

      const revenue = monthRepayments.reduce((sum, r) => sum + (r.paidAmount || 0), 0);
      const disbursed = monthDisbursements.reduce((sum, l) => sum + (l.approvedAmount || 0), 0);

      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        revenue,
        disbursed,
        netFlow: revenue - disbursed
      });
    }
    return months;
  };

  const monthlyFinancials = getMonthlyFinancials();

  const getLoanTypeFinancials = () => {
    const loanTypes = ['personal', 'business', 'agriculture', 'vehicle', 'housing'];
    
    return loanTypes.map(type => {
      const typeLoans = loans.filter(l => l.type === type);
      const typeRepayments = repayments.filter(r => {
        const loan = loans.find(l => l.id === r.loanId);
        return loan && loan.type === type && r.status === 'paid';
      });

      const disbursed = typeLoans.reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount), 0);
      const collected = typeRepayments.reduce((sum, r) => sum + (r.paidAmount || 0), 0);
      const outstanding = repayments
        .filter(r => {
          const loan = loans.find(l => l.id === r.loanId);
          return loan && loan.type === type && (r.status === 'pending' || r.status === 'partial');
        })
        .reduce((sum, r) => sum + r.balance, 0);

      return {
        type: type.charAt(0).toUpperCase() + type.slice(1),
        disbursed,
        collected,
        outstanding,
        yield: disbursed > 0 ? (collected / disbursed) * 100 : 0
      };
    }).filter(item => item.disbursed > 0);
  };

  const loanTypeFinancials = getLoanTypeFinancials();

  const exportFinancialReport = () => {
    const reportData = [
      ['Financial Report'],
      ['Period:', `${dateRange.startDate} to ${dateRange.endDate}`],
      ['Generated:', new Date().toLocaleString()],
      [],
      ['Revenue Summary'],
      ['Total Revenue', `LKR ${metrics.revenue.total.toLocaleString()}`],
      ['Interest Revenue', `LKR ${metrics.revenue.interest.toLocaleString()}`],
      ['Principal Revenue', `LKR ${metrics.revenue.principal.toLocaleString()}`],
      [],
      ['Portfolio Summary'],
      ['Total Portfolio Value', `LKR ${metrics.portfolio.value.toLocaleString()}`],
      ['Outstanding Amount', `LKR ${metrics.portfolio.outstanding.toLocaleString()}`],
      ['Active Loans', metrics.portfolio.activeLoans.toString()],
      [],
      ['Risk Metrics'],
      ['Overdue Amount', `LKR ${metrics.risk.overdueAmount.toLocaleString()}`],
      ['NPL Ratio', `${metrics.risk.nplRatio.toFixed(2)}%`],
      [],
      ['Profitability'],
      ['Net Interest Income', `LKR ${metrics.profitability.netInterestIncome.toLocaleString()}`],
      ['Operating Expenses', `LKR ${metrics.profitability.operatingExpenses.toLocaleString()}`],
      ['Net Income', `LKR ${metrics.profitability.netIncome.toLocaleString()}`],
      ['ROI', `${metrics.profitability.roi.toFixed(2)}%`]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([reportData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Financial Summary */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Financial Summary</h3>
          <button
            onClick={exportFinancialReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-900">LKR {(metrics.revenue.total / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-green-700">period collections</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Interest Revenue</p>
                <p className="text-3xl font-bold text-blue-900">LKR {(metrics.revenue.interest / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-blue-700">
                  {metrics.revenue.total > 0 ? ((metrics.revenue.interest / metrics.revenue.total) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Portfolio Value</p>
                <p className="text-3xl font-bold text-purple-900">LKR {(metrics.portfolio.value / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-purple-700">{metrics.portfolio.activeLoans} active loans</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Net Income</p>
                <p className="text-3xl font-bold text-orange-900">
                  LKR {(metrics.profitability.netIncome / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-orange-700">{metrics.profitability.roi.toFixed(1)}% ROI</p>
              </div>
              <Target className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <h4 className="font-medium text-gray-800 mb-4">Revenue Sources</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                  <span className="text-gray-700">Interest Revenue</span>
                </div>
                <span className="font-medium">LKR {metrics.revenue.interest.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                  <span className="text-gray-700">Principal Recovery</span>
                </div>
                <span className="font-medium">LKR {metrics.revenue.principal.toLocaleString()}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-gray-800">Total Revenue</span>
                  <span className="text-gray-900">LKR {metrics.revenue.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h4 className="font-medium text-gray-800 mb-4">Profitability Analysis</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Net Interest Income</span>
                <span className="font-medium text-green-600">
                  LKR {metrics.profitability.netInterestIncome.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Operating Expenses</span>
                <span className="font-medium text-red-600">
                  LKR {metrics.profitability.operatingExpenses.toLocaleString()}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-gray-800">Net Income</span>
                  <span className={`${metrics.profitability.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    LKR {metrics.profitability.netIncome.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h4 className="font-medium text-gray-800 mb-4">Key Ratios</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Return on Investment</span>
                <span className="font-medium">{metrics.profitability.roi.toFixed(2)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">NPL Ratio</span>
                <span className={`font-medium ${metrics.risk.nplRatio > 5 ? 'text-red-600' : 'text-green-600'}`}>
                  {metrics.risk.nplRatio.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Cost-to-Income</span>
                <span className="font-medium">
                  {metrics.revenue.total > 0 ? 
                    ((metrics.profitability.operatingExpenses / metrics.revenue.total) * 100).toFixed(1) : 0
                  }%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Financial Trends */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">12-Month Financial Trends</h3>
        <div className="bg-white p-6 rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-gray-600">Month</th>
                  <th className="text-right py-2 text-gray-600">Revenue (LKR)</th>
                  <th className="text-right py-2 text-gray-600">Disbursed (LKR)</th>
                  <th className="text-right py-2 text-gray-600">Net Flow (LKR)</th>
                  <th className="text-right py-2 text-gray-600">Growth</th>
                </tr>
              </thead>
              <tbody>
                {monthlyFinancials.slice(-6).map((month, index, array) => {
                  const prevMonth = index > 0 ? array[index - 1] : null;
                  const growth = prevMonth && prevMonth.revenue > 0 ? 
                    ((month.revenue - prevMonth.revenue) / prevMonth.revenue) * 100 : 0;
                  
                  return (
                    <tr key={month.month} className="border-b">
                      <td className="py-3 font-medium text-gray-900">{month.month}</td>
                      <td className="py-3 text-right text-gray-700">
                        {(month.revenue / 1000000).toFixed(1)}M
                      </td>
                      <td className="py-3 text-right text-gray-700">
                        {(month.disbursed / 1000000).toFixed(1)}M
                      </td>
                      <td className="py-3 text-right">
                        <span className={`font-medium ${
                          month.netFlow >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {month.netFlow >= 0 ? '+' : ''}{(month.netFlow / 1000000).toFixed(1)}M
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className={`font-medium ${
                          growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
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

      {/* Loan Type Performance */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Loan Type Financial Performance</h3>
        <div className="bg-white p-6 rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 text-gray-600">Loan Type</th>
                  <th className="text-right py-3 text-gray-600">Disbursed (LKR)</th>
                  <th className="text-right py-3 text-gray-600">Collected (LKR)</th>
                  <th className="text-right py-3 text-gray-600">Outstanding (LKR)</th>
                  <th className="text-right py-3 text-gray-600">Yield (%)</th>
                  <th className="text-right py-3 text-gray-600">Performance</th>
                </tr>
              </thead>
              <tbody>
                {loanTypeFinancials.map((type) => (
                  <tr key={type.type} className="border-b">
                    <td className="py-3 font-medium text-gray-900">{type.type}</td>
                    <td className="py-3 text-right text-gray-700">
                      {(type.disbursed / 1000000).toFixed(1)}M
                    </td>
                    <td className="py-3 text-right text-gray-700">
                      {(type.collected / 1000000).toFixed(1)}M
                    </td>
                    <td className="py-3 text-right text-gray-700">
                      {(type.outstanding / 1000000).toFixed(1)}M
                    </td>
                    <td className="py-3 text-right text-gray-700">
                      {type.yield.toFixed(1)}%
                    </td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        type.yield >= 80 ? 'bg-green-100 text-green-800' :
                        type.yield >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {type.yield >= 80 ? 'Excellent' :
                         type.yield >= 60 ? 'Good' : 'Poor'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Assessment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <h4 className="font-medium text-gray-800 mb-4">Credit Risk Metrics</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Total Outstanding</span>
                <span className="font-medium">LKR {metrics.portfolio.outstanding.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Overdue Amount</span>
                <span className="font-medium text-red-600">LKR {metrics.risk.overdueAmount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">NPL Ratio</span>
                <span className={`font-medium ${metrics.risk.nplRatio > 5 ? 'text-red-600' : 'text-green-600'}`}>
                  {metrics.risk.nplRatio.toFixed(2)}%
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Risk Rating</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    metrics.risk.nplRatio <= 2 ? 'bg-green-100 text-green-800' :
                    metrics.risk.nplRatio <= 5 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {metrics.risk.nplRatio <= 2 ? 'Low Risk' :
                     metrics.risk.nplRatio <= 5 ? 'Medium Risk' : 'High Risk'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h4 className="font-medium text-gray-800 mb-4">Liquidity Position</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Cash Inflow (Collections)</span>
                <span className="font-medium text-green-600">LKR {metrics.revenue.total.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Cash Outflow (Disbursements)</span>
                <span className="font-medium text-red-600">LKR {metrics.disbursements.total.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Net Cash Flow</span>
                <span className={`font-medium ${
                  (metrics.revenue.total - metrics.disbursements.total) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  LKR {(metrics.revenue.total - metrics.disbursements.total).toLocaleString()}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Liquidity Status</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    (metrics.revenue.total - metrics.disbursements.total) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {(metrics.revenue.total - metrics.disbursements.total) >= 0 ? 'Positive' : 'Negative'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Health Indicators */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Health Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-3">Strengths</h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li>• Strong interest revenue generation</li>
              <li>• Healthy portfolio diversification</li>
              <li>• Positive cash flow from operations</li>
              <li>• Growing customer base</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-3">Areas for Improvement</h4>
            <ul className="space-y-2 text-sm text-yellow-700">
              <li>• Monitor NPL ratio closely</li>
              <li>• Optimize operating expenses</li>
              <li>• Enhance collection efficiency</li>
              <li>• Diversify revenue streams</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-3">Recommendations</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Implement risk-based pricing</li>
              <li>• Strengthen collection processes</li>
              <li>• Expand high-yield loan products</li>
              <li>• Invest in digital infrastructure</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}