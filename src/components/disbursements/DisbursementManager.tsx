import React, { useState } from 'react';
import { DollarSign, Calendar, CheckCircle, Clock, AlertTriangle, Eye, Download, CreditCard, Banknote, Building } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Loan } from '../../types';
import DisbursementForm from './DisbursementForm';
import DisbursementDetails from './DisbursementDetails';

export default function DisbursementManager() {
  const { loans, customers, updateLoan, generateLoanSchedule } = useData();
  const { user } = useAuth();
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'disburse' | 'details'>('list');
  const [filter, setFilter] = useState<'ready' | 'disbursed' | 'all'>('ready');

  // Get loans ready for disbursement (approved but not disbursed)
  const readyForDisbursement = loans.filter(loan => loan.status === 'approved');
  const disbursedLoans = loans.filter(loan => loan.status === 'disbursed' || loan.status === 'active');
  
  const filteredLoans = filter === 'ready' ? readyForDisbursement : 
                      filter === 'disbursed' ? disbursedLoans : 
                      [...readyForDisbursement, ...disbursedLoans];

  const getDisbursementStats = () => {
    const readyCount = readyForDisbursement.length;
    const readyAmount = readyForDisbursement.reduce((sum, loan) => sum + (loan.approvedAmount || 0), 0);
    const disbursedCount = disbursedLoans.length;
    const disbursedAmount = disbursedLoans.reduce((sum, loan) => sum + (loan.approvedAmount || 0), 0);
    const todayDisbursed = disbursedLoans.filter(loan => 
      loan.disbursedDate && new Date(loan.disbursedDate).toDateString() === new Date().toDateString()
    ).length;

    return { readyCount, readyAmount, disbursedCount, disbursedAmount, todayDisbursed };
  };

  const stats = getDisbursementStats();

  const handleDisburse = (loan: Loan, disbursementData: any) => {
    const updatedLoan = {
      status: 'active' as const,
      disbursedDate: disbursementData.disbursementDate,
      disbursedAmount: disbursementData.amount,
      disbursementMethod: disbursementData.method,
      disbursementReference: disbursementData.reference,
      disbursedBy: user?.name,
      remarks: disbursementData.remarks
    };

    updateLoan(loan.id, updatedLoan);
    
    // Generate repayment schedule
    generateLoanSchedule(loan.id);
    
    setCurrentView('list');
    setSelectedLoan(null);
  };

  const handleViewDetails = (loan: Loan) => {
    setSelectedLoan(loan);
    setCurrentView('details');
  };

  const handleStartDisbursement = (loan: Loan) => {
    setSelectedLoan(loan);
    setCurrentView('disburse');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-yellow-100 text-yellow-800';
      case 'disbursed': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer': return <Building className="w-4 h-4" />;
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'cheque': return <CreditCard className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  if (currentView === 'disburse' && selectedLoan) {
    return (
      <DisbursementForm
        loan={selectedLoan}
        customer={customers.find(c => c.id === selectedLoan.customerId)}
        onDisburse={handleDisburse}
        onCancel={() => {
          setCurrentView('list');
          setSelectedLoan(null);
        }}
      />
    );
  }

  if (currentView === 'details' && selectedLoan) {
    return (
      <DisbursementDetails
        loan={selectedLoan}
        customer={customers.find(c => c.id === selectedLoan.customerId)}
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
          <h2 className="text-2xl font-bold text-gray-800">Loan Disbursements</h2>
          <p className="text-gray-600">Manage and track loan fund disbursements</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ready to Disburse</p>
              <p className="text-2xl font-bold text-gray-900">{stats.readyCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Amount</p>
              <p className="text-2xl font-bold text-gray-900">LKR {stats.readyAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Disbursed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.disbursedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Disbursed Amount</p>
              <p className="text-2xl font-bold text-gray-900">LKR {stats.disbursedAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Disbursements</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayDisbursed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'ready', label: 'Ready for Disbursement', count: stats.readyCount },
              { key: 'disbursed', label: 'Disbursed Loans', count: stats.disbursedCount },
              { key: 'all', label: 'All Loans', count: filteredLoans.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Loans List */}
        <div className="p-6">
          <div className="space-y-4">
            {filteredLoans.map((loan) => {
              const customer = customers.find(c => c.id === loan.customerId);
              const isReady = loan.status === 'approved';
              
              return (
                <div key={loan.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">{customer?.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(loan.status)}`}>
                          {loan.status}
                        </span>
                        {isReady && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Ready
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Loan Details</p>
                          <p className="font-medium">ID: {loan.id}</p>
                          <p className="text-sm text-gray-500">{loan.type} loan</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Approved Amount</p>
                          <p className="font-medium text-lg text-green-600">LKR {(loan.approvedAmount || 0).toLocaleString()}</p>
                          <p className="text-sm text-gray-500">EMI: LKR {loan.emi.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Customer Info</p>
                          <p className="font-medium">{customer?.phone}</p>
                          <p className="text-sm text-gray-500">{customer?.bankAccount || 'No bank account'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            {isReady ? 'Approved Date' : 'Disbursed Date'}
                          </p>
                          <p className="font-medium">
                            {isReady 
                              ? new Date(loan.approvedDate!).toLocaleDateString()
                              : loan.disbursedDate ? new Date(loan.disbursedDate).toLocaleDateString() : 'N/A'
                            }
                          </p>
                          {loan.disbursementMethod && (
                            <div className="flex items-center text-sm text-gray-500">
                              {getMethodIcon(loan.disbursementMethod)}
                              <span className="ml-1 capitalize">{loan.disbursementMethod.replace('_', ' ')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Disbursement Details for disbursed loans */}
                      {!isReady && (
                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                          <h4 className="font-medium text-blue-800 mb-2">Disbursement Details</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-blue-600">Amount:</span>
                              <span className="ml-1 font-medium">LKR {(loan.disbursedAmount || loan.approvedAmount || 0).toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-blue-600">Method:</span>
                              <span className="ml-1 font-medium capitalize">{loan.disbursementMethod?.replace('_', ' ') || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-blue-600">Reference:</span>
                              <span className="ml-1 font-medium">{loan.disbursementReference || 'N/A'}</span>
                            </div>
                            {loan.disbursedBy && (
                              <div>
                                <span className="text-blue-600">Disbursed By:</span>
                                <span className="ml-1 font-medium">{loan.disbursedBy}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Ready for disbursement info */}
                      {isReady && (
                        <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                          <h4 className="font-medium text-yellow-800 mb-2">Ready for Disbursement</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-yellow-600">Approved By:</span>
                              <span className="ml-1 font-medium">{loan.approvedBy || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-yellow-600">Period:</span>
                              <span className="ml-1 font-medium">{loan.period} months</span>
                            </div>
                            <div>
                              <span className="text-yellow-600">Interest Rate:</span>
                              <span className="ml-1 font-medium">{loan.interestRate}% per month</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-6">
                      <button
                        onClick={() => handleViewDetails(loan)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                      
                      {isReady && user?.role !== 'clerk' && (
                        <button
                          onClick={() => handleStartDisbursement(loan)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Disburse Funds
                        </button>
                      )}

                      {!isReady && loan.disbursementReference && (
                        <button
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Receipt
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredLoans.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No loans found</h3>
              <p className="text-gray-500">
                {filter === 'ready' 
                  ? 'No loans are ready for disbursement' 
                  : filter === 'disbursed'
                  ? 'No loans have been disbursed yet'
                  : 'No loan disbursement records found'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {stats.readyCount > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-800">Ready for Disbursement</h3>
              <p className="text-green-600">
                {stats.readyCount} loan{stats.readyCount > 1 ? 's' : ''} approved and ready for fund disbursement
              </p>
              <p className="text-sm text-green-600 mt-1">
                Total amount: LKR {stats.readyAmount.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-green-600" />
              <span className="text-green-600 font-medium">Action Required</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}