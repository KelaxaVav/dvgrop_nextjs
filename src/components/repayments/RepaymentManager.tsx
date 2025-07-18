import { useEffect, useState } from 'react';
import { Calendar, DollarSign, AlertTriangle, CheckCircle, Clock, TrendingUp, Search, Filter, Plus, Eye } from 'lucide-react';
import RepaymentForm from './RepaymentForm';
import RepaymentDetails from './RepaymentDetails';
import RepaymentSchedule from './RepaymentSchedule';
import BulkPaymentProcessor from './BulkPaymentProcessor';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomers, fetchLoans, fetchPayments } from '../../services/fetch';
import { ReduxState } from '../../types/redux_state';
import { IPayment } from '../../types/payment';
import { capitalizeFirstLetter } from '../../utils/utils';
import { createData } from '../../services/create';
import { API_ROUTES } from '../../utils/api_routes';
import { subscribeLoading } from '../../utils/loading';
import PageLoader from '../../custom_component/loading';

export default function RepaymentManager() {
  const dispatch = useDispatch();
  const { payments } = useSelector((state: ReduxState) => state.payment);
  const { loans } = useSelector((state: ReduxState) => state.loan);
  const { customers } = useSelector((state: ReduxState) => state.customer);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedRepayment, setSelectedRepayment] = useState<IPayment | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit' | 'details' | 'schedule' | 'bulk'>('list');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPayments(dispatch);
    fetchLoans(dispatch);
    fetchCustomers(dispatch)
  }, [dispatch]);

  useEffect(() => {
    const unsubscribe = subscribeLoading(setLoading);
    return () => unsubscribe();
  }, []);

  const getPenaltySettings = () => {
    try {
      const advancedSettings = localStorage.getItem('lms_advanced_settings');
      if (advancedSettings) {
        const settings = JSON.parse(advancedSettings);
        return settings.penaltySettings || { penaltyRate: 2.0, penaltyType: 'per_day' };
      }
    } catch (error) {
      console.error('Error loading penalty settings:', error);
    }
    return { penaltyRate: 2.0, penaltyType: 'per_day' };
  };

  const penaltySettings = getPenaltySettings();

  const getRepaymentStats = () => {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const totalRepayments = payments.length;
    const paidRepayments = payments.filter(r => r.status === 'paid');
    const overdueRepayments = payments.filter(r => {
      return r.status === 'pending' && new Date(r.dueDate) < today;
    });
    const dueToday = payments.filter(r => {
      return r.status === 'pending' && new Date(r.dueDate).toDateString() === today.toDateString();
    });
    const thisMonthCollection = paidRepayments
      .filter(r => r.paymentDate && new Date(r.paymentDate) >= thisMonth)
      .reduce((sum, r) => sum + (r.paidAmount || 0), 0);

    const totalExpected = payments.reduce((sum, r) => sum + r.amount, 0);
    const totalCollected = paidRepayments.reduce((sum, r) => sum + (r.paidAmount || 0), 0);
    const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

    return {
      totalRepayments,
      paidCount: paidRepayments.length,
      overdueCount: overdueRepayments.length,
      dueTodayCount: dueToday.length,
      thisMonthCollection,
      collectionRate,
      totalOutstanding: payments.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.balance, 0)
    };
  };

  const stats = getRepaymentStats();

  const filteredRepayments = payments.filter(repayment => {
    const loan = loans.find(l => l._id === repayment.loanId?._id);
    const customer = customers.find(c => c._id === loan?.customerId?._id);

    const matchesSearch = customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repayment?.loanId?._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repayment._id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || repayment.status === statusFilter;

    let matchesDate = true;
    if (dateFilter !== 'all') {
      const dueDate = new Date(repayment.dueDate);
      const today = new Date();

      switch (dateFilter) {
        case 'overdue':
          matchesDate = repayment.status === 'pending' && dueDate < today;
          break;
        case 'today':
          matchesDate = dueDate.toDateString() === today.toDateString();
          break;
        case 'week':
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          matchesDate = dueDate >= today && dueDate <= weekFromNow;
          break;
        case 'month':
          const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
          matchesDate = dueDate >= today && dueDate <= monthFromNow;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleRecordPayment = (repayment: IPayment) => {
    setSelectedRepayment(repayment);
    setCurrentView('add');
  };

  const handleViewDetails = (repayment: IPayment) => {
    setSelectedRepayment(repayment);
    setCurrentView('details');
  };

  const handleViewSchedule = (repayment: IPayment) => {
    setSelectedRepayment(repayment);
    setCurrentView('schedule');
  };

  const handleSavePayment = async (paymentData: any) => {
    if (selectedRepayment) {
      const formattedDueDate = selectedRepayment.dueDate.split('T')[0];
      const updatedRepayment: Partial<IPayment> = {
        amount: selectedRepayment?.amount,
        dueDate: formattedDueDate,
        emiNo: selectedRepayment.emiNo,
        paidAmount: paymentData.amount,
        paymentDate: paymentData.paymentDate,
        paymentMode: paymentData.paymentMode,
        status: paymentData.amount >= selectedRepayment.amount ? 'paid' : 'partial',
        balance: Math.max(0, selectedRepayment.amount - paymentData.amount),
        penalty: paymentData.penalty || 0,
        remarks: paymentData.remarks
      };

      console.log({ 'selectedRepayment?.dueDate': formattedDueDate });
      console.log({ 'selectedRepayment': selectedRepayment });
      console.log({ 'updatedRepayment': updatedRepayment });

      await createData(updatedRepayment, fetchPayments, handleCancel, 'Repayment updated', `${API_ROUTES.LOANS}/${selectedRepayment?.loanId?._id}/${API_ROUTES.PAYMENTS}`, dispatch);
    }
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedRepayment(null);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (repayment: IPayment) => {
    return repayment.status === 'pending' && new Date(repayment.dueDate) < new Date();
  };

  const calculatePenalty = (repayment: IPayment) => {
    if (!isOverdue(repayment)) return 0;

    const daysOverdue = Math.floor((new Date().getTime() - new Date(repayment.dueDate).getTime()) / (1000 * 60 * 60 * 24));

    switch (penaltySettings.penaltyType) {
      case 'per_day':
        return Math.round(repayment.amount * (penaltySettings.penaltyRate / 100) * daysOverdue);
      case 'per_week':
        const weeksOverdue = Math.ceil(daysOverdue / 7);
        return Math.round(repayment.amount * (penaltySettings.penaltyRate / 100) * weeksOverdue);
      case 'fixed_total':
        return Math.round(repayment.amount * (penaltySettings.penaltyRate / 100));
      default:
        return Math.round(repayment.amount * (penaltySettings.penaltyRate / 100) * daysOverdue);
    }
  };

  if (currentView === 'add' && selectedRepayment) {
    return (
      <RepaymentForm
        repayment={selectedRepayment}
        onSave={handleSavePayment}
        onCancel={() => {
          setCurrentView('list');
          setSelectedRepayment(null);
        }}
      />
    );
  }

  if (currentView === 'details' && selectedRepayment) {
    return (
      <RepaymentDetails
        repayment={selectedRepayment}
        onClose={() => {
          setCurrentView('list');
          setSelectedRepayment(null);
        }}
      />
    );
  }

  if (currentView === 'schedule' && selectedRepayment) {
    return (
      <RepaymentSchedule
        loanId={selectedRepayment?.loanId?._id}
        onClose={() => {
          setCurrentView('list');
          setSelectedRepayment(null);
        }}
      />
    );
  }

  if (currentView === 'bulk') {
    return (
      <BulkPaymentProcessor
        onClose={() => setCurrentView('list')}
      />
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {loading && (
        <PageLoader loading={true} />
      )}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Repayment Management</h2>
            <p className="text-gray-600">Track and manage loan repayments and collections</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setCurrentView('bulk')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Bulk Payment
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Due Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.dueTodayCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdueCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month Collection</p>
                <p className="text-2xl font-bold text-gray-900">LKR {stats.thisMonthCollection.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.collectionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-red-800">Overdue Payments</h3>
                <p className="text-red-600">{stats.overdueCount} payments overdue</p>
                <p className="text-sm text-red-600 mt-1">
                  Outstanding: LKR {stats.totalOutstanding.toLocaleString()}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">Due Today</h3>
                <p className="text-yellow-600">{stats.dueTodayCount} payments due</p>
                <p className="text-sm text-yellow-600 mt-1">Requires immediate attention</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-800">Collection Performance</h3>
                <p className="text-green-600">{stats.collectionRate.toFixed(1)}% success rate</p>
                <p className="text-sm text-green-600 mt-1">{stats.paidCount} payments collected</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by customer name, loan ID, or repayment ID..."
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
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="overdue">Overdue</option>
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Dates</option>
                <option value="overdue">Overdue</option>
                <option value="today">Due Today</option>
                <option value="week">Due This Week</option>
                <option value="month">Due This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Repayments List */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer & Loan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EMI Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRepayments?.map((repayment) => {
                  const loan = loans?.find(l => l?._id === repayment?.loanId?._id);
                  const customer = customers.find(c => c?._id === loan?.customerId?._id);
                  const overdue = isOverdue(repayment);
                  const penalty = calculatePenalty(repayment);

                  return (
                    <tr key={repayment?._id} className={`hover:bg-gray-50 ${overdue ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{capitalizeFirstLetter(customer?.name ?? "")}</div>
                          <div className="text-sm text-gray-500">Loan: {repayment?.loanId?._id}</div>
                          <div className="text-sm text-gray-500">{customer?.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">EMI #{repayment?.emiNo}</div>
                          <div className="text-sm text-gray-500">{capitalizeFirstLetter(loan?.type ?? '')} loan</div>
                          {repayment?.paymentDate && (
                            <div className="text-sm text-green-600">
                              Paid: {new Date(repayment?.paymentDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className={`text-sm font-medium ${overdue ? 'text-red-600' : 'text-gray-900'}`}>
                            {new Date(repayment?.dueDate).toLocaleDateString()}
                          </div>
                          {overdue && (
                            <div className="text-sm text-red-600">
                              {Math.floor((new Date().getTime() - new Date(repayment?.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            LKR {repayment?.amount.toLocaleString()}
                          </div>
                          {repayment?.paidAmount && (
                            <div className="text-sm text-green-600">
                              Paid: LKR {repayment?.paidAmount.toLocaleString()}
                            </div>
                          )}
                          {repayment?.balance > 0 && (
                            <div className="text-sm text-red-600">
                              Balance: LKR {repayment?.balance.toLocaleString()}
                            </div>
                          )}
                          {penalty > 0 && (
                            <div className="text-sm text-red-600">
                              Penalty: LKR {penalty?.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${overdue && repayment?.status === 'pending'
                          ? 'bg-red-100 text-red-800'
                          : getStatusColor(repayment?.status)
                          }`}>
                          {overdue && repayment?.status === 'pending' ? 'overdue' : repayment?.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(repayment)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {repayment?.status !== 'paid' && (
                            <button
                              onClick={() => handleRecordPayment(repayment)}
                              className="text-green-600 hover:text-green-900"
                              title="Record Payment"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleViewSchedule(repayment)}
                            className="text-purple-600 hover:text-purple-900"
                            title="View Schedule"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredRepayments?.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No repayments found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your search criteria'
                  : 'No repayment records available'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}