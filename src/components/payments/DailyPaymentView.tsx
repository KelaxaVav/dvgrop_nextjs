import React, { useState } from 'react';
import { Calendar, Search, Filter, Download, Printer, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, DollarSign, Users,FileText,ArrowUpDown} from 'lucide-react';
import { Customer } from '../../types';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../types/redux_state';

export default function DailyPaymentView() {
  // const { loans, customers, repayments, updateRepayment } = useData();
   const { user } = useSelector((state: ReduxState) => state.auth);
   const { loans } = useSelector((state: ReduxState) => state.loan);
   const { customers } = useSelector((state: ReduxState) => state.customer);
   const { payments } = useSelector((state: ReduxState) => state.payment);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [groupBy, setGroupBy] = useState<'customer' | 'date'>('customer');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [sortField, setSortField] = useState<'customer' | 'amount' | 'status'>('customer');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Check if user has permission to edit
  const canEdit = user?.role === 'admin' || user?.role === 'clerk';

  // Get all payments due on the selected date
  const getDailyPayments = () => {
    // Get all active loans
    const activeLoans = loans.filter(loan => 
      loan.status === 'active' || loan.status === 'disbursed'
    );

    // Get all repayments for the selected date
    const dailyRepayments = payments.filter(repayment => {
      const dueDate = new Date(repayment.dueDate).toISOString().split('T')[0];
      return dueDate === selectedDate;
    });

    // Map repayments to include customer and loan details
    const paymentsWithDetails = dailyRepayments.map(repayment => {
      const loan = loans.find(l => l._id === repayment.loanId._id);
      const customer = customers.find(c => c._id === loan?.customerId);
      
      const isOverdue = new Date(repayment.dueDate) < new Date() && repayment.status !== 'paid';
      
      return {
        _id: repayment._id,
        repayment,
        loan,
        customer,
        isOverdue,
        nextPaymentDate: getNextPaymentDate(repayment.loanId._id, repayment.emiNo)
      };
    });

    return paymentsWithDetails;
  };

  // Get the next payment date for a loan
  const getNextPaymentDate = (loanId: string, currentEmiNo: number) => {
    const nextRepayment = payments.find(r => 
      r.loanId._id === loanId && r.emiNo === currentEmiNo + 1
    );
    
    return nextRepayment ? nextRepayment.dueDate : null;
  };

  // Filter and sort payments
  const getFilteredPayments = () => {
    const allPayments = getDailyPayments();
    
    // Filter by search term
    const filtered = allPayments.filter(payment => {
      if (!payment.customer) return false;
      
      return (
        payment.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.loan?._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.repayment._id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    
    // Sort payments
    const sorted = [...filtered].sort((a, b) => {
      if (sortField === 'customer') {
        const nameA = a.customer?.name.toLowerCase() || '';
        const nameB = b.customer?.name.toLowerCase() || '';
        return sortDirection === 'asc' 
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      } else if (sortField === 'amount') {
        return sortDirection === 'asc'
          ? a.repayment.amount - b.repayment.amount
          : b.repayment.amount - a.repayment.amount;
      } else if (sortField === 'status') {
        const statusA = a.repayment.status === 'paid' ? 2 : (a.isOverdue ? 0 : 1);
        const statusB = b.repayment.status === 'paid' ? 2 : (b.isOverdue ? 0 : 1);
        return sortDirection === 'asc'
          ? statusA - statusB
          : statusB - statusA;
      }
      return 0;
    });
    
    return sorted;
  };

  // Group payments by customer or date
  const getGroupedPayments = () => {
    const filteredPayments = getFilteredPayments();
    
    if (groupBy === 'customer') {
      const grouped = filteredPayments.reduce((acc, payment) => {
        const customerId = payment.customer?._id || 'unknown';
        if (!acc[customerId]) {
          acc[customerId] = {
            customer: payment.customer,
            payments: []
          };
        }
        acc[customerId].payments.push(payment);
        return acc;
      }, {} as Record<string, { customer: Customer | undefined, payments: any[] }>);
      
      return Object.values(grouped);
    } else {
      // When grouping by date, we're already filtered by the selected date
      return [{ date: selectedDate, payments: filteredPayments }];
    }
  };

  // Get payments for the current page
  const getCurrentPageItems = () => {

    const groupedPayments = getGroupedPayments();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return groupedPayments.slice(startIndex, endIndex);
  };

  // Calculate total pages
  const totalPages = Math.ceil(getGroupedPayments().length / itemsPerPage);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle sort change
  const handleSortChange = (field: 'customer' | 'amount' | 'status') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setCurrentPage(1); // Reset to first page when date changes
  };

  // Navigate to previous/next day
  const navigateDay = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    if (direction === 'prev') {
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setSelectedDate(currentDate.toISOString().split('T')[0]);
    setCurrentPage(1); // Reset to first page when date changes
  };

  // Mark payment as paid
  const markAsPaid = (repaymentId: string, amount: number) => {
    if (!canEdit) return;
    
    // updateRepayment(repaymentId, {
    //   status: 'paid',
    //   paidAmount: amount,
    //   balance: 0,
    //   paymentDate: new Date().toISOString().split('T')[0],
    //   paymentMode: 'cash'
    // });
    await createData(updatedRepayment, fetchPayments, handleCancel, 'Repayment updated', `${API_ROUTES.LOANS}/${selectedRepayment?.loanId?._id}/${API_ROUTES.PAYMENTS}`, dispatch);
  };

  // Export to Excel
  const exportToExcel = () => {
    setIsExporting(true);
    
    try {
      const payments = getFilteredPayments();
      const headers = ['Serial No.', 'Customer', 'Loan ID', 'Payment Date', 'Next Payment Date', 'Amount', 'Status'];
      
      const csvData = payments.map((payment, index) => [
        (index + 1).toString(),
        payment.customer?.name || 'Unknown',
        payment.loan?._id || 'Unknown',
        payment.repayment.dueDate,
        payment.nextPaymentDate || 'N/A',
        payment.repayment.amount.toString(),
        payment.repayment.status === 'paid' ? 'Paid' : (payment.isOverdue ? 'Overdue' : 'Not Paid')
      ]);
      
      const csvContent = [headers, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daily_payments_${selectedDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Print view
  const printPayments = () => {
    setIsPrinting(true);
    
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  // Calculate statistics
  const getPaymentStats = () => {
    const payments = getFilteredPayments();
    const totalDue = payments.reduce((sum, p) => sum + p.repayment.amount, 0);
    const totalPaid = payments.filter(p => p.repayment.status === 'paid')
      .reduce((sum, p) => sum + (p.repayment.paidAmount || 0), 0);
    const paidCount = payments.filter(p => p.repayment.status === 'paid').length;
    const overdueCount = payments.filter(p => p.isOverdue).length;
    const pendingCount = payments.filter(p => p.repayment.status === 'pending' && !p.isOverdue).length;
    
    return {
      totalDue,
      totalPaid,
      paidCount,
      overdueCount,
      pendingCount,
      paidPercentage: totalDue > 0 ? (totalPaid / totalDue) * 100 : 0
    };
  };

  const stats = getPaymentStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Daily Loan Payment View</h2>
          <p className="text-gray-600">View and manage daily loan payments</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={printPayments}
            disabled={isPrinting}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>
          <button
            onClick={exportToExcel}
            disabled={isExporting}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs text-gray-600">Total Due</p>
              <p className="text-lg font-bold text-gray-900">LKR {stats.totalDue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs text-gray-600">Total Paid</p>
              <p className="text-lg font-bold text-green-600">LKR {stats.totalPaid.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs text-gray-600">Paid Today</p>
              <p className="text-lg font-bold text-gray-900">{stats.paidCount} / {getFilteredPayments().length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs text-gray-600">Overdue</p>
              <p className="text-lg font-bold text-red-600">{stats.overdueCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs text-gray-600">Collection Rate</p>
              <p className="text-lg font-bold text-gray-900">{stats.paidPercentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by customer name or loan ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateDay('prev')}
              className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => navigateDay('next')}
              className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as 'customer' | 'date')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="customer">Group by Customer</option>
              <option value="date">Group by Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serial No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('customer')}>
                  <div className="flex items-center">
                    Customer
                    {sortField === 'customer' && (
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loan ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Payment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('amount')}>
                  <div className="flex items-center">
                    Amount
                    {sortField === 'amount' && (
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('status')}>
                  <div className="flex items-center">
                    Status
                    {sortField === 'status' && (
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                {canEdit && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getCurrentPageItems().map((group, groupIndex) => (
                <React.Fragment key={groupIndex}>
                  {/* Group Header */}
                  {groupBy === 'customer' && group.customer && (
                    <tr className="bg-gray-50">
                      <td colSpan={canEdit ? 8 : 7} className="px-6 py-3">
                        <div className="font-medium text-gray-900">
                          {group?.customer?.name} - {group.customer.phone}
                        </div>
                      </td>
                    </tr>
                  )}
                  
                  {/* Group Items */}
                  {group.payments.map((payment, index) => (
                    <tr key={payment.id} className={`hover:bg-gray-50 ${payment.isOverdue ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(currentPage - 1) * itemsPerPage + groupIndex + 1}.{index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.customer?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{payment.customer?.phone || 'No phone'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.loan?.id || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">EMI #{payment.repayment.emiNo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(payment.repayment.dueDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.nextPaymentDate 
                            ? new Date(payment.nextPaymentDate).toLocaleDateString() 
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          LKR {payment.repayment.amount.toLocaleString()}
                        </div>
                        {payment.repayment.status === 'paid' && (
                          <div className="text-xs text-green-600">
                            Paid: LKR {(payment.repayment.paidAmount || 0).toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payment.repayment.status === 'paid' ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Paid
                          </span>
                        ) : payment.isOverdue ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Overdue
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Not Paid
                          </span>
                        )}
                      </td>
                      {canEdit && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {payment.repayment.status !== 'paid' && (
                            <button
                              onClick={() => markAsPaid(payment.repayment.id, payment.repayment.amount)}
                              className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-lg"
                            >
                              Mark as Paid
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {getFilteredPayments().length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No payments found</h3>
            <p className="text-gray-500">
              No payments are scheduled for {new Date(selectedDate).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, getGroupedPayments().length)}
              </span>{' '}
              of <span className="font-medium">{getGroupedPayments().length}</span> results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border rounded-md text-sm font-medium ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="bg-white p-4 rounded-xl shadow-sm border sticky bottom-0">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex space-x-8">
            <div>
              <span className="text-sm text-gray-600">Total Due:</span>
              <span className="ml-2 font-bold">LKR {stats.totalDue.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Total Paid:</span>
              <span className="ml-2 font-bold text-green-600">LKR {stats.totalPaid.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Paid Today:</span>
              <span className="ml-2 font-bold">{stats.paidCount} of {getFilteredPayments().length}</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-32 bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: `${stats.paidPercentage}%` }}
              ></div>
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">{stats.paidPercentage.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}