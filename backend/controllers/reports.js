import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import Loan from '../models/Loan.js';
import Customer from '../models/Customer.js';
import Repayment from '../models/Repayment.js';
import User from '../models/User.js';
import SmsLog from '../models/SmsLog.js';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns';

// @desc    Get dashboard report
// @route   GET /api/v1/reports/dashboard
// @access  Private
export const getDashboardReport = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  // Set default date range to last 30 days if not provided
  const start = startDate ? new Date(startDate) : subDays(new Date(), 30);
  const end = endDate ? new Date(endDate) : new Date();
  
  // Get all loans in date range
  const loans = await Loan.find({
    createdAt: { $gte: startOfDay(start), $lte: endOfDay(end) }
  });
  
  // Get all repayments in date range
  const repayments = await Repayment.find({
    paymentDate: { $gte: startOfDay(start), $lte: endOfDay(end) },
    status: 'paid'
  });
  
  // Calculate metrics
  const totalApplications = loans.length;
  const approvedLoans = loans.filter(l => ['approved', 'active', 'disbursed', 'completed'].includes(l.status)).length;
  const rejectedLoans = loans.filter(l => l.status === 'rejected').length;
  const pendingLoans = loans.filter(l => l.status === 'pending').length;
  const approvalRate = totalApplications > 0 ? (approvedLoans / totalApplications) * 100 : 0;
  
  // Financial metrics
  const totalDisbursed = loans
    .filter(l => ['active', 'disbursed', 'completed'].includes(l.status))
    .reduce((sum, l) => sum + (l.approvedAmount || 0), 0);
  
  const totalCollected = repayments.reduce((sum, r) => sum + (r.paidAmount || 0), 0);
  
  // Portfolio metrics
  const activeLoans = await Loan.countDocuments({ status: 'active' });
  const totalPortfolio = (await Loan.find({ status: 'active' }))
    .reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount), 0);
  
  const overduePayments = await Repayment.countDocuments({
    status: 'pending',
    dueDate: { $lt: new Date() }
  });
  
  // Customer metrics
  const newCustomers = await Customer.countDocuments({
    createdAt: { $gte: startOfDay(start), $lte: endOfDay(end) }
  });
  
  const totalCustomers = await Customer.countDocuments();
  
  // Monthly trends
  const monthlyTrends = [];
  let currentMonth = new Date(start);
  currentMonth.setDate(1); // Start from the 1st of the month
  
  while (currentMonth <= end) {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    const monthLoans = await Loan.find({
      createdAt: { $gte: monthStart, $lte: monthEnd }
    });
    
    const monthDisbursements = await Loan.find({
      disbursedDate: { $gte: monthStart, $lte: monthEnd }
    });
    
    const monthCollections = await Repayment.find({
      paymentDate: { $gte: monthStart, $lte: monthEnd },
      status: 'paid'
    });
    
    monthlyTrends.push({
      month: currentMonth.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      applications: monthLoans.length,
      disbursements: monthDisbursements.length,
      collections: monthCollections.reduce((sum, r) => sum + (r.paidAmount || 0), 0)
    });
    
    // Move to next month
    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }
  
  res.status(200).json({
    success: true,
    data: {
      loans: { totalApplications, approvedLoans, rejectedLoans, pendingLoans, approvalRate },
      financial: { totalDisbursed, totalCollected },
      portfolio: { activeLoans, totalPortfolio, overduePayments },
      customers: { newCustomers, total: totalCustomers },
      monthlyTrends
    }
  });
});

// @desc    Get collection report
// @route   GET /api/v1/reports/collection
// @access  Private
export const getCollectionReport = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  // Set default date range to current month if not provided
  const start = startDate ? new Date(startDate) : startOfMonth(new Date());
  const end = endDate ? new Date(endDate) : endOfMonth(new Date());
  
  // Get all repayments in date range
  const periodRepayments = await Repayment.find({
    paymentDate: { $gte: startOfDay(start), $lte: endOfDay(end) },
    status: 'paid'
  }).populate({
    path: 'loanId',
    select: 'customerId interestRate',
    populate: {
      path: 'customerId',
      select: 'name nic'
    }
  });
  
  // Get all repayments due in date range
  const dueRepayments = await Repayment.find({
    dueDate: { $gte: startOfDay(start), $lte: endOfDay(end) }
  });
  
  // Calculate collection metrics
  const totalCollected = periodRepayments.reduce((sum, r) => sum + (r.paidAmount || 0), 0);
  const totalDue = dueRepayments.reduce((sum, r) => sum + r.amount, 0);
  const collectionRate = totalDue > 0 ? (totalCollected / totalDue) * 100 : 0;
  
  // Overdue analysis
  const overdueRepayments = await Repayment.find({
    status: 'pending',
    dueDate: { $lt: new Date() }
  });
  
  const totalOverdue = overdueRepayments.reduce((sum, r) => sum + r.balance, 0);
  
  // Payment mode analysis
  const paymentModes = periodRepayments.reduce((acc, r) => {
    if (r.paymentMode) {
      acc[r.paymentMode] = (acc[r.paymentMode] || 0) + (r.paidAmount || 0);
    }
    return acc;
  }, {});
  
  // Daily collections
  const dailyCollections = [];
  let currentDate = new Date(start);
  
  while (currentDate <= end) {
    const dayStart = startOfDay(currentDate);
    const dayEnd = endOfDay(currentDate);
    
    const dayRepayments = periodRepayments.filter(r => {
      const paymentDate = new Date(r.paymentDate);
      return paymentDate >= dayStart && paymentDate <= dayEnd;
    });
    
    dailyCollections.push({
      date: currentDate.toISOString().split('T')[0],
      amount: dayRepayments.reduce((sum, r) => sum + (r.paidAmount || 0), 0),
      count: dayRepayments.length
    });
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Top collectors (customers who paid the most)
  const customerCollections = periodRepayments.reduce((acc, repayment) => {
    if (repayment.loanId && repayment.loanId.customerId) {
      const customerId = repayment.loanId.customerId._id.toString();
      
      if (!acc[customerId]) {
        acc[customerId] = {
          customer: repayment.loanId.customerId,
          totalPaid: 0,
          paymentCount: 0
        };
      }
      
      acc[customerId].totalPaid += repayment.paidAmount || 0;
      acc[customerId].paymentCount += 1;
    }
    return acc;
  }, {});
  
  const topCollectors = Object.values(customerCollections)
    .sort((a, b) => b.totalPaid - a.totalPaid)
    .slice(0, 10);
  
  res.status(200).json({
    success: true,
    data: {
      totalCollected,
      totalDue,
      collectionRate,
      overdueCount: overdueRepayments.length,
      totalOverdue,
      paymentModes,
      dailyCollections,
      topCollectors
    }
  });
});

// @desc    Get loan analytics report
// @route   GET /api/v1/reports/loan-analytics
// @access  Private
export const getLoanAnalyticsReport = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  // Set default date range to last 30 days if not provided
  const start = startDate ? new Date(startDate) : subDays(new Date(), 30);
  const end = endDate ? new Date(endDate) : new Date();
  
  // Get all loans in date range
  const filteredLoans = await Loan.find({
    createdAt: { $gte: startOfDay(start), $lte: endOfDay(end) }
  }).populate('customerId', 'income');
  
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
    
    if (['approved', 'active', 'disbursed', 'completed'].includes(loan.status)) {
      acc[loan.type].approvedCount += 1;
      acc[loan.type].approvedAmount += loan.approvedAmount || loan.requestedAmount;
    }
    
    return acc;
  }, {});
  
  // Calculate averages and rates
  Object.keys(loanTypeAnalysis).forEach(type => {
    const data = loanTypeAnalysis[type];
    data.avgAmount = data.count > 0 ? data.totalAmount / data.count : 0;
    data.approvalRate = data.count > 0 ? (data.approvedCount / data.count) * 100 : 0;
  });
  
  // Monthly trends
  const monthlyTrends = [];
  let currentMonth = new Date(start);
  currentMonth.setDate(1); // Start from the 1st of the month
  
  while (currentMonth <= end) {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    const monthLoans = await Loan.find({
      createdAt: { $gte: monthStart, $lte: monthEnd }
    });
    
    monthlyTrends.push({
      month: currentMonth.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      applications: monthLoans.length,
      approved: monthLoans.filter(l => ['approved', 'active', 'disbursed', 'completed'].includes(l.status)).length,
      rejected: monthLoans.filter(l => l.status === 'rejected').length,
      totalAmount: monthLoans.reduce((sum, l) => sum + l.requestedAmount, 0),
      approvedAmount: monthLoans
        .filter(l => ['approved', 'active', 'disbursed', 'completed'].includes(l.status))
        .reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount), 0)
    });
    
    // Move to next month
    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }
  
  // Risk analysis
  const riskAnalysis = {
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0
  };
  
  filteredLoans.forEach(loan => {
    if (loan.customerId && loan.customerId.income) {
      const loanToIncomeRatio = (loan.requestedAmount / (loan.customerId.income * 12)) * 100;
      if (loanToIncomeRatio > 300) riskAnalysis.highRisk++;
      else if (loanToIncomeRatio > 200) riskAnalysis.mediumRisk++;
      else riskAnalysis.lowRisk++;
    }
  });
  
  // Performance metrics
  const performanceMetrics = {
    totalApplications: filteredLoans.length,
    approvedLoans: filteredLoans.filter(l => ['approved', 'active', 'disbursed', 'completed'].includes(l.status)).length,
    rejectedLoans: filteredLoans.filter(l => l.status === 'rejected').length,
    pendingLoans: filteredLoans.filter(l => l.status === 'pending').length,
    avgProcessingTime: 3.2, // This would be calculated from actual data in a real implementation
    avgLoanAmount: filteredLoans.length > 0 ? 
      filteredLoans.reduce((sum, l) => sum + l.requestedAmount, 0) / filteredLoans.length : 0,
    totalDisbursed: filteredLoans
      .filter(l => ['active', 'disbursed', 'completed'].includes(l.status))
      .reduce((sum, l) => sum + (l.approvedAmount || 0), 0)
  };
  
  res.status(200).json({
    success: true,
    data: {
      loanTypeAnalysis,
      monthlyTrends,
      riskAnalysis,
      performanceMetrics
    }
  });
});

// @desc    Get customer report
// @route   GET /api/v1/reports/customer
// @access  Private
export const getCustomerReport = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  // Set default date range to last 30 days if not provided
  const start = startDate ? new Date(startDate) : subDays(new Date(), 30);
  const end = endDate ? new Date(endDate) : new Date();
  
  // Get all customers
  const customers = await Customer.find();
  
  // Get new customers in date range
  const newCustomers = customers.filter(c => 
    c.createdAt >= startOfDay(start) && c.createdAt <= endOfDay(end)
  );
  
  // Demographics analysis
  const demographics = {
    maritalStatus: { married: 0, single: 0 },
    ageGroups: { '18-30': 0, '31-45': 0, '46-60': 0, '60+': 0 },
    occupations: {},
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
  const loans = await Loan.find();
  const repayments = await Repayment.find();
  
  const customerBehavior = await Promise.all(customers.map(async (customer) => {
    const customerLoans = loans.filter(l => l.customerId.toString() === customer._id.toString());
    
    const customerRepayments = [];
    for (const loan of customerLoans) {
      const loanRepayments = repayments.filter(r => r.loanId.toString() === loan._id.toString());
      customerRepayments.push(...loanRepayments);
    }
    
    const totalBorrowed = customerLoans.reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount), 0);
    const totalPaid = customerRepayments
      .filter(r => r.status === 'paid')
      .reduce((sum, r) => sum + (r.paidAmount || 0), 0);
    
    const overduePayments = customerRepayments.filter(r => 
      r.status === 'pending' && new Date(r.dueDate) < new Date()
    ).length;
    
    return {
      customer: {
        _id: customer._id,
        name: customer.name,
        nic: customer.nic,
        phone: customer.phone,
        occupation: customer.occupation
      },
      loanCount: customerLoans.length,
      totalBorrowed,
      totalPaid,
      overduePayments,
      paymentHistory: customerRepayments.length > 0 ? 
        (customerRepayments.filter(r => r.status === 'paid').length / customerRepayments.length) * 100 : 0,
      riskScore: overduePayments > 0 ? 'High' : 
                customerLoans.length > 2 ? 'Medium' : 'Low'
    };
  }));
  
  // Top customers by value
  const topCustomers = [...customerBehavior]
    .sort((a, b) => b.totalBorrowed - a.totalBorrowed)
    .slice(0, 10);
  
  // Customer retention analysis
  const retentionAnalysis = {
    newCustomers: newCustomers.length,
    returningCustomers: customerBehavior.filter(cb => cb.loanCount > 1).length,
    activeCustomers: customerBehavior.filter(cb => cb.loanCount > 0).length,
    avgLoansPerCustomer: customers.length > 0 ? 
      loans.length / customers.length : 0
  };
  
  // Customer growth trend
  const growthTrend = [];
  let currentMonth = new Date(start);
  currentMonth.setDate(1); // Start from the 1st of the month
  
  while (currentMonth <= end) {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    const monthCustomers = customers.filter(c => 
      c.createdAt >= monthStart && c.createdAt <= monthEnd
    );
    
    const cumulativeCustomers = customers.filter(c => c.createdAt <= monthEnd).length;
    
    growthTrend.push({
      month: currentMonth.toLocaleDateString('en-US', { month: 'short' }),
      newCustomers: monthCustomers.length,
      cumulativeCustomers
    });
    
    // Move to next month
    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }
  
  res.status(200).json({
    success: true,
    data: {
      demographics,
      customerBehavior,
      topCustomers,
      retentionAnalysis,
      newCustomers: newCustomers.length,
      totalCustomers: customers.length,
      growthTrend
    }
  });
});

// @desc    Get overdue report
// @route   GET /api/v1/reports/overdue
// @access  Private
export const getOverdueReport = asyncHandler(async (req, res, next) => {
  const today = new Date();
  
  // Get all overdue repayments
  const overdueRepayments = await Repayment.find({
    status: 'pending',
    dueDate: { $lt: today }
  }).populate({
    path: 'loanId',
    select: 'customerId type',
    populate: {
      path: 'customerId',
      select: 'name nic phone email'
    }
  });
  
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
  const customerOverdueAnalysis = {};
  
  for (const repayment of overdueRepayments) {
    if (repayment.loanId && repayment.loanId.customerId) {
      const customerId = repayment.loanId.customerId._id.toString();
      
      if (!customerOverdueAnalysis[customerId]) {
        customerOverdueAnalysis[customerId] = {
          customer: repayment.loanId.customerId,
          overdueRepayments: [],
          totalOverdue: 0,
          oldestOverdue: 0,
          riskLevel: 'Low'
        };
      }
      
      const daysOverdue = Math.floor((today.getTime() - new Date(repayment.dueDate).getTime()) / (1000 * 60 * 60 * 24));
      
      customerOverdueAnalysis[customerId].overdueRepayments.push({
        ...repayment.toObject(),
        daysOverdue
      });
      
      customerOverdueAnalysis[customerId].totalOverdue += repayment.balance;
      customerOverdueAnalysis[customerId].oldestOverdue = Math.max(
        customerOverdueAnalysis[customerId].oldestOverdue,
        daysOverdue
      );
      
      // Determine risk level
      if (customerOverdueAnalysis[customerId].oldestOverdue > 90 || 
          customerOverdueAnalysis[customerId].overdueRepayments.length > 3) {
        customerOverdueAnalysis[customerId].riskLevel = 'High';
      } else if (customerOverdueAnalysis[customerId].oldestOverdue > 30 || 
                customerOverdueAnalysis[customerId].overdueRepayments.length > 1) {
        customerOverdueAnalysis[customerId].riskLevel = 'Medium';
      }
    }
  }
  
  const customerOverdueList = Object.values(customerOverdueAnalysis)
    .sort((a, b) => b.totalOverdue - a.totalOverdue);
  
  // Calculate recovery potential
  const recoveryAnalysis = {
    immediate: categoryTotals.find(c => c.period === '1-30')?.amount || 0,
    shortTerm: categoryTotals.find(c => c.period === '31-60')?.amount || 0,
    mediumTerm: categoryTotals.find(c => c.period === '61-90')?.amount || 0,
    longTerm: categoryTotals.find(c => c.period === '90+')?.amount || 0
  };
  
  const totalOverdue = overdueRepayments.reduce((sum, r) => sum + r.balance, 0);
  
  // Get overdue trend
  const overdueTrend = [];
  let currentMonth = new Date();
  currentMonth.setMonth(currentMonth.getMonth() - 5); // Last 6 months including current
  
  for (let i = 0; i < 6; i++) {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    // Count repayments that became overdue in this month
    const monthOverdue = await Repayment.find({
      dueDate: { $gte: monthStart, $lte: monthEnd },
      status: 'pending'
    });
    
    overdueTrend.push({
      month: currentMonth.toLocaleDateString('en-US', { month: 'short' }),
      count: monthOverdue.length,
      amount: monthOverdue.reduce((sum, r) => sum + r.balance, 0)
    });
    
    // Move to next month
    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }
  
  res.status(200).json({
    success: true,
    data: {
      overdueRepayments,
      categoryTotals,
      customerOverdueList,
      recoveryAnalysis,
      totalOverdue,
      totalOverdueCount: overdueRepayments.length,
      overdueTrend
    }
  });
});

// @desc    Get financial report
// @route   GET /api/v1/reports/financial
// @access  Private/Admin
export const getFinancialReport = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  // Set default date range to current month if not provided
  const start = startDate ? new Date(startDate) : startOfMonth(new Date());
  const end = endDate ? new Date(endDate) : endOfMonth(new Date());
  
  // Revenue calculations
  const periodRepayments = await Repayment.find({
    paymentDate: { $gte: startOfDay(start), $lte: endOfDay(end) },
    status: 'paid'
  }).populate({
    path: 'loanId',
    select: 'interestRate'
  });
  
  const totalRevenue = periodRepayments.reduce((sum, r) => sum + (r.paidAmount || 0), 0);
  
  // Calculate interest revenue (simplified calculation)
  const interestRevenue = await Promise.all(periodRepayments.map(async (r) => {
    const loan = await Loan.findById(r.loanId);
    if (loan) {
      // Approximate interest portion
      const interestPortion = (r.paidAmount || 0) * (loan.interestRate / 100) / (1 + (loan.interestRate / 100));
      return interestPortion;
    }
    return 0;
  }));
  
  const totalInterestRevenue = interestRevenue.reduce((sum, amount) => sum + amount, 0);
  const principalRevenue = totalRevenue - totalInterestRevenue;
  
  // Disbursement calculations
  const periodDisbursements = await Loan.find({
    disbursedDate: { $gte: startOfDay(start), $lte: endOfDay(end) }
  });
  
  const totalDisbursed = periodDisbursements.reduce((sum, l) => sum + (l.approvedAmount || 0), 0);
  
  // Portfolio metrics
  const activeLoans = await Loan.find({ status: 'active' });
  const totalPortfolioValue = activeLoans.reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount), 0);
  
  const totalOutstanding = (await Repayment.find({
    status: { $in: ['pending', 'partial'] }
  })).reduce((sum, r) => sum + r.balance, 0);
  
  // Risk metrics
  const overdueAmount = (await Repayment.find({
    status: 'pending',
    dueDate: { $lt: new Date() }
  })).reduce((sum, r) => sum + r.balance, 0);
  
  const nplRatio = totalOutstanding > 0 ? (overdueAmount / totalOutstanding) * 100 : 0;
  
  // Profitability metrics
  const netInterestIncome = totalInterestRevenue;
  const operatingExpenses = totalRevenue * 0.15; // Assumed 15% operating cost
  const netIncome = netInterestIncome - operatingExpenses;
  const roi = totalPortfolioValue > 0 ? (netIncome / totalPortfolioValue) * 100 : 0;
  
  // Monthly financials
  const monthlyFinancials = [];
  let currentMonth = new Date();
  currentMonth.setMonth(currentMonth.getMonth() - 11); // Last 12 months including current
  
  for (let i = 0; i < 12; i++) {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    const monthRepayments = await Repayment.find({
      paymentDate: { $gte: monthStart, $lte: monthEnd },
      status: 'paid'
    });
    
    const monthDisbursements = await Loan.find({
      disbursedDate: { $gte: monthStart, $lte: monthEnd }
    });
    
    const revenue = monthRepayments.reduce((sum, r) => sum + (r.paidAmount || 0), 0);
    const disbursed = monthDisbursements.reduce((sum, l) => sum + (l.approvedAmount || 0), 0);
    
    monthlyFinancials.push({
      month: currentMonth.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      revenue,
      disbursed,
      netFlow: revenue - disbursed
    });
    
    // Move to next month
    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }
  
  // Loan type financials
  const loanTypes = ['personal', 'business', 'agriculture', 'vehicle', 'housing'];
  
  const loanTypeFinancials = await Promise.all(loanTypes.map(async (type) => {
    const typeLoans = await Loan.find({ type });
    
    const disbursed = typeLoans.reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount), 0);
    
    const collected = await Repayment.aggregate([
      {
        $lookup: {
          from: 'loans',
          localField: 'loanId',
          foreignField: '_id',
          as: 'loan'
        }
      },
      {
        $unwind: '$loan'
      },
      {
        $match: {
          'loan.type': type,
          'status': 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$paidAmount' }
        }
      }
    ]);
    
    const collectedAmount = collected.length > 0 ? collected[0].total : 0;
    
    const outstanding = await Repayment.aggregate([
      {
        $lookup: {
          from: 'loans',
          localField: 'loanId',
          foreignField: '_id',
          as: 'loan'
        }
      },
      {
        $unwind: '$loan'
      },
      {
        $match: {
          'loan.type': type,
          'status': { $in: ['pending', 'partial'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$balance' }
        }
      }
    ]);
    
    const outstandingAmount = outstanding.length > 0 ? outstanding[0].total : 0;
    
    return {
      type: type.charAt(0).toUpperCase() + type.slice(1),
      disbursed,
      collected: collectedAmount,
      outstanding: outstandingAmount,
      yield: disbursed > 0 ? (collectedAmount / disbursed) * 100 : 0
    };
  }));
  
  res.status(200).json({
    success: true,
    data: {
      revenue: {
        total: totalRevenue,
        interest: totalInterestRevenue,
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
      },
      monthlyFinancials,
      loanTypeFinancials: loanTypeFinancials.filter(item => item.disbursed > 0)
    }
  });
});