import {
  Users,
  FileText,
  DollarSign,
  Calendar,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchLoans } from '../utils/fetch';
import { ReduxState } from '../types/redux_state';

export default function Dashboard() {
  // const { customers, loans, repayments } = useData();
  const dispatch = useDispatch();
  const { loans, total: totalLoans } = useSelector((state: ReduxState) => state.loan);
  const { customers, total: totalCustomers } = useSelector((state: ReduxState) => state.customer);

  console.log({ 'loans': loans });
  const stats = {
    totalCustomers: totalCustomers,
    totalLoans: totalLoans,
    activeLoans: loans.filter(l => l.status === 'approved').length,
    // pendingApprovals: loans.filter(l => l.status === 'pending').length,
    // totalDisbursed: loans.reduce((sum, loan) => sum + (loan.approvedAmount || 0), 0),
    // overduePayments: repayments.filter(r => r.status === 'overdue').length,
    // monthlyCollection: repayments
    //   .filter(r => r.status === 'paid' && r.paymentDate && 
    //     new Date(r.paymentDate).getMonth() === new Date().getMonth())
    //   .reduce((sum, r) => sum + (r.paidAmount || 0), 0)
  };

  // const recentLoans = loans.slice(-5).reverse();
  // const upcomingPayments = repayments
  //   .filter(r => r.status === 'pending')
  //   .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  //   .slice(0, 5);



  useEffect(() => {
    fetchLoans(dispatch);
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to LoanManager Pro</h1>
        <p className="text-blue-100">Your comprehensive loan management solution</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Loans</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeLoans}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              {/* <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p> */}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Disbursed</p>
              {/* <p className="text-2xl font-bold text-gray-900">LKR {stats.totalDisbursed.toLocaleString()}</p> */}
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Loans */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Recent Loan Applications</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* {recentLoans.map((loan) => {
                const customer = customers.find(c => c._id === loan.customerId._id);
                return (
                  <div key={loan._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{customer?.name}</p>
                      <p className="text-sm text-gray-600">LKR {loan.requestedAmount.toLocaleString()}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      loan.status === 'approved' ? 'bg-green-100 text-green-800' :
                      loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      loan.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {loan.status}
                    </span>
                  </div>
                );
              })} */}
            </div>
          </div>
        </div>

        {/* Upcoming Payments */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Upcoming Payments</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* {upcomingPayments.map((payment) => {
                const loan = loans.find(l => l._id === payment.loanId);
                const customer = customers.find(c => c._id === loan?.customerId._id);
                const isOverdue = new Date(payment.dueDate) < new Date();
                
                return (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{customer?.name}</p>
                      <p className="text-sm text-gray-600">EMI #{payment.emiNo} - {payment.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">LKR {payment.amount.toLocaleString()}</p>
                      {isOverdue && (
                        <span className="text-xs text-red-600 flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>
                );
              })} */}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-center">
            <div className="p-3 bg-blue-100 rounded-full w-12 h-12 mx-auto mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Add New Customer</h4>
            <p className="text-sm text-gray-600 mb-4">Register a new customer to the system</p>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Add Customer
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-center">
            <div className="p-3 bg-emerald-100 rounded-full w-12 h-12 mx-auto mb-4">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">New Loan Application</h4>
            <p className="text-sm text-gray-600 mb-4">Process a new loan application</p>
            <button className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors">
              New Loan
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-center">
            <div className="p-3 bg-orange-100 rounded-full w-12 h-12 mx-auto mb-4">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Record Payment</h4>
            <p className="text-sm text-gray-600 mb-4">Record a new loan repayment</p>
            <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
              Record Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}