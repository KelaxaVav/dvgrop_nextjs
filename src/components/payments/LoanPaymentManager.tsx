import React, { useState } from 'react';
import { DollarSign, Search, Filter, Calendar, AlertTriangle, CheckCircle, Clock, CreditCard, Banknote, Building, Eye, Plus, Download } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Loan } from '../../types';
import LoanPaymentForm from './LoanPaymentForm';
import PaymentDetails from './PaymentDetails';
import PaymentHistory from './PaymentHistory';

export default function LoanPaymentManager() {
  const { loans, customers, repayments, updateRepayment } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const [selectedRepayment, setSelectedRepayment] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'list' | 'payment' | 'details' | 'history'>('list');

  // Get all active loans with their current payment status
  const getPaymentData = () => {
    // Get all active and disbursed loans
    const activeLoans = loans.filter(loan => 
      loan.status === 'active' || loan.status === 'disbursed'
    );

    return activeLoans.map(loan => {
      const customer = customers.find(c => c.id === loan.customerId);
      
      // Get all repayments for this loan
      const loanRepayments = repayments.filter(r => r.loanId === loan.id);
      
      // Find the next pending or overdue payment
      const pendingPayments = loanRepayments
        .filter(r => r.status === 'pending' || r.status === 'partial')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      
      const nextPayment = pendingPayments[0];
      
      // Calculate loan statistics
      const totalPaid = loanRepayments
        .filter(r => r.status === 'paid')
        .reduce((sum, r) => sum + (r.paidAmount || 0), 0);
      
      const totalOutstanding = loanRepayments
        .filter(r => r.status === 'pending' || r.status === 'partial')
        .reduce((sum, r) => sum + r.balance, 0);
      
      const paidEMIs = loanRepayments.filter(r => r.status === 'paid').length;
      const totalEMIs = loanRepayments.length;
      
      // Determine overall loan payment status
      let loanPaymentStatus = 'current';
      let isOverdue = false;
      let daysOverdue = 0;
      let penalty = 0;
      
      if (nextPayment) {
        isOverdue = new Date(nextPayment.dueDate) < new Date();
        if (isOverdue) {
          daysOverdue = Math.floor((new Date().getTime() - new Date(nextPayment.dueDate).getTime()) / (1000 * 60 * 60 * 24));
          penalty = Math.round(nextPayment.amount * 0.02 * daysOverdue);
          loanPaymentStatus = 'overdue';
        } else if (new Date(nextPayment.dueDate).toDateString() === new Date().toDateString()) {
          loanPaymentStatus = 'due_today';
        }
      } else if (totalEMIs > 0 && paidEMIs === totalEMIs) {
        loanPaymentStatus = 'completed';
      }
      
      return {
        loan,
        customer,
        nextPayment,
        loanPaymentStatus,
        isOverdue,
        daysOverdue,
        penalty,
        totalPaid,
        totalOutstanding,
        paidEMIs,
        totalEMIs,
        completionPercentage: totalEMIs > 0 ? Math.round((paidEMIs / totalEMIs) * 100) : 0
      };
    }).sort((a, b) => {
      // Sort by priority: overdue first, then due today, then by due date
      if (a.loanPaymentStatus === 'overdue' && b.loanPaymentStatus !== 'overdue') return -1;
      if (a.loanPaymentStatus !== 'overdue' && b.loanPaymentStatus === 'overdue') return 1;
      if (a.loanPaymentStatus === 'due_today' && b.loanPaymentStatus !== 'due_today') return -1;
      if (a.loanPaymentStatus !== 'due_today' && b.loanPaymentStatus === 'due_today') return 1;
      
      // If both have next payments, sort by due date
      if (a.nextPayment && b.nextPayment) {
        return new Date(a.nextPayment.dueDate).getTime() - new Date(b.nextPayment.dueDate).getTime();
      }
      
      return 0;
    });
  };

  const paymentData = getPaymentData();

  // Filter payments based on search and filters
  const filteredPayments = paymentData.filter(payment => {
    const matchesSearch = payment.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.customer?.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'overdue' && payment.loanPaymentStatus === 'overdue') ||
                         (statusFilter === 'due_today' && payment.loanPaymentStatus === 'due_today') ||
                         (statusFilter === 'current' && payment.loanPaymentStatus === 'current') ||
                         (statusFilter === 'completed' && payment.loanPaymentStatus === 'completed');
    
    const nextPaymentAmount = payment.nextPayment?.amount || 0;
    const matchesAmount = amountFilter === 'all' ||
                         (amountFilter === 'small' && nextPaymentAmount <= 10000) ||
                         (amountFilter === 'medium' && nextPaymentAmount > 10000 && nextPaymentAmount <= 50000) ||
                         (amountFilter === 'large' && nextPaymentAmount > 50000);
    
    return matchesSearch && matchesStatus && matchesAmount;
  });

  // Calculate statistics
  const getStats = () => {
    const totalLoans = paymentData.length;
    const overdueCount = paymentData.filter(p => p.loanPaymentStatus === 'overdue').length;
    const dueTodayCount = paymentData.filter(p => p.loanPaymentStatus === 'due_today').length;
    const currentCount = paymentData.filter(p => p.loanPaymentStatus === 'current').length;
    const completedCount = paymentData.filter(p => p.loanPaymentStatus === 'completed').length;
    const totalOutstanding = paymentData.reduce((sum, p) => sum + p.totalOutstanding, 0);
    const penaltyAmount = paymentData.reduce((sum, p) => sum + p.penalty, 0);

    return {
      totalLoans,
      overdueCount,
      dueTodayCount,
      currentCount,
      completedCount,
      totalOutstanding,
      penaltyAmount
    };
  };

  const stats = getStats();

  const handleMakePayment = (payment: any) => {
    if (payment.nextPayment) {
      setSelectedRepayment({
        ...payment.nextPayment,
        customer: payment.customer,
        loan: payment.loan,
        isOverdue: payment.isOverdue,
        daysOverdue: payment.daysOverdue,
        penalty: payment.penalty
      });
      setCurrentView('payment');
    }
  };

  const handleViewDetails = (payment: any) => {
    if (payment.nextPayment) {
      setSelectedRepayment({
        ...payment.nextPayment,
        customer: payment.customer,
        loan: payment.loan,
        isOverdue: payment.isOverdue,
        daysOverdue: payment.daysOverdue,
        penalty: payment.penalty
      });
      setCurrentView('details');
    }
  };

  const handleViewHistory = (loanId: string) => {
    setSelectedLoan(loanId);
    setCurrentView('history');
  };

  const handlePaymentSubmit = (paymentData: any) => {
    if (selectedRepayment) {
      const updatedRepayment = {
        paidAmount: paymentData.amount,
        paymentDate: paymentData.paymentDate,
        paymentMode: paymentData.paymentMode,
        status: paymentData.amount >= selectedRepayment.balance ? 'paid' : 'partial',
        balance: Math.max(0, selectedRepayment.balance - paymentData.amount),
        penalty: paymentData.penalty || 0,
        remarks: paymentData.remarks
      };

      updateRepayment(selectedRepayment.id, updatedRepayment);
    }
    
    setCurrentView('list');
    setSelectedRepayment(null);
  };

  const getPaymentModeIcon = (mode: string) => {
    switch (mode) {
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'online': return <Building className="w-4 h-4" />;
      case 'cheque': return <CreditCard className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (payment: any) => {
    switch (payment.loanPaymentStatus) {
      case 'overdue':
        if (payment.daysOverdue > 30) return 'border-l-4 border-red-600 bg-red-50';
        return 'border-l-4 border-orange-500 bg-orange-50';
      case 'due_today': return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'completed': return 'border-l-4 border-green-500 bg-green-50';
      default: return 'border-l-4 border-blue-500 bg-blue-50';
    }
  };

  const getStatusBadge = (payment: any) => {
    switch (payment.loanPaymentStatus) {
      case 'overdue':
        return (
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
            {payment.daysOverdue} days overdue
          </div>
        );
      case 'due_today':
        return (
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
            Due Today
          </div>
        );
      case 'completed':
        return (
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
            Completed
          </div>
        );
      default:
        return (
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
            Current
          </div>
        );
    }
  };

  if (currentView === 'payment' && selectedRepayment) {
    return (
      <LoanPaymentForm
        repayment={selectedRepayment}
        onSubmit={handlePaymentSubmit}
        onCancel={() => {
          setCurrentView('list');
          setSelectedRepayment(null);
        }}
      />
    );
  }

  if (currentView === 'details' && selectedRepayment) {
    return (
      <PaymentDetails
        payment={selectedRepayment}
        onClose={() => {
          setCurrentView('list');
          setSelectedRepayment(null);
        }}
        onMakePayment={() => setCurrentView('payment')}
      />
    );
  }

  if (currentView === 'history' && selectedLoan) {
    return (
      <PaymentHistory
        loanId={selectedLoan}
        onClose={() => {
          setCurrentView('list');
          setSelectedLoan(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Loan Payment Center</h2>
          <p className="text-gray-600">Manage all active loan payments and collections</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            {filteredPayments.length} loan{filteredPayments.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Total Loans</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalLoans}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Overdue</p>
              <p className="text-lg font-bold text-red-600">{stats.overdueCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Due Today</p>
              <p className="text-lg font-bold text-yellow-600">{stats.dueTodayCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Current</p>
              <p className="text-lg font-bold text-green-600">{stats.currentCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Outstanding</p>
              <p className="text-lg font-bold text-gray-900">LKR {stats.totalOutstanding.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Penalties</p>
              <p className="text-lg font-bold text-purple-600">LKR {stats.penaltyAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Alerts */}
      {stats.overdueCount > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h3 className="font-semibold text-red-800">Urgent: {stats.overdueCount} Overdue Loan{stats.overdueCount > 1 ? 's' : ''}</h3>
                <p className="text-red-600">
                  Immediate attention required for overdue payments
                  {stats.penaltyAmount > 0 && ` (LKR ${stats.penaltyAmount.toLocaleString()} in penalties)`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setStatusFilter('overdue')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              View Overdue
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by customer name, loan ID, or phone number..."
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
              <option value="all">All Loans</option>
              <option value="overdue">Overdue</option>
              <option value="due_today">Due Today</option>
              <option value="current">Current</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={amountFilter}
              onChange={(e) => setAmountFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Amounts</option>
              <option value="small">≤ LKR 10,000</option>
              <option value="medium">LKR 10,001 - 50,000</option>
              <option value="large">{'>'} LKR 50,000</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loan List */}
      <div className="space-y-4">
        {filteredPayments.map((payment) => (
          <div key={payment.loan.id} className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${getPriorityColor(payment)}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{payment.customer?.name}</h3>
                    <p className="text-sm text-gray-600">Loan: {payment.loan.id} • {payment.loan.type} loan</p>
                  </div>
                  {getStatusBadge(payment)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Next Payment</p>
                    {payment.nextPayment ? (
                      <>
                        <p className={`font-medium ${payment.isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                          {new Date(payment.nextPayment.dueDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">EMI #{payment.nextPayment.emiNo}</p>
                      </>
                    ) : (
                      <p className="font-medium text-green-600">All payments complete</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">EMI Amount</p>
                    {payment.nextPayment ? (
                      <p className="font-medium text-gray-900">LKR {payment.nextPayment.amount.toLocaleString()}</p>
                    ) : (
                      <p className="font-medium text-gray-500">N/A</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Outstanding Balance</p>
                    <p className={`font-medium ${payment.totalOutstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      LKR {payment.totalOutstanding.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Progress</p>
                    <p className="font-medium text-gray-900">{payment.completionPercentage}% complete</p>
                    <p className="text-sm text-gray-500">{payment.paidEMIs}/{payment.totalEMIs} EMIs paid</p>
                  </div>
                </div>

                {payment.penalty > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                      <span className="text-red-800 font-medium">
                        Penalty: LKR {payment.penalty.toLocaleString()} ({payment.daysOverdue} days × 2% daily)
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Contact: {payment.customer?.phone}</span>
                  <span>•</span>
                  <span>Interest: {payment.loan.interestRate}%</span>
                  <span>•</span>
                  <span>Period: {payment.loan.period} months</span>
                  <span>•</span>
                  <span>Monthly EMI: LKR {payment.loan.emi.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col space-y-2 ml-6">
                {payment.nextPayment && payment.loanPaymentStatus !== 'completed' && (
                  <button
                    onClick={() => handleMakePayment(payment)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Make Payment
                  </button>
                )}
                {payment.nextPayment && (
                  <button
                    onClick={() => handleViewDetails(payment)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                )}
                <button
                  onClick={() => handleViewHistory(payment.loan.id)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Payment History
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No loans found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' || amountFilter !== 'all'
              ? 'Try adjusting your search criteria'
              : 'No active loans found in the system'}
          </p>
        </div>
      )}
    </div>
  );
}