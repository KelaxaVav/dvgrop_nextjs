import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Eye, FileText, DollarSign } from 'lucide-react';
import ApprovalDetails from './ApprovalDetails';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../types/redux_state';
import { fetchLoans } from '../../services/fetch';
import { ILoan } from '../../types/loan';
import { capitalizeFirstLetter } from '../../utils/utils';
import { updateLoanStatus } from '../loans/services/loan_utils';
import { subscribeLoading } from '../../utils/loading';
import PageLoader from '../../custom_component/loading';

export default function ApprovalManager() {
  const { customers } = useSelector((state: ReduxState) => state.customer);
  const { loans } = useSelector((state: ReduxState) => state.loan);
  const { user } = useSelector((state: ReduxState) => state.auth);
  const dispatch = useDispatch();
 const [loading, setLoading] = useState(false);

  const [selectedLoan, setSelectedLoan] = useState<ILoan | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  
  const pendingLoans = loans.filter(loan => {
    if (filter === 'all') return true;
    return loan.status === filter;
  });
useEffect(() => {
    const unsubscribe = subscribeLoading(setLoading);
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    fetchLoans(dispatch);
  }, [dispatch]);

  const getApprovalStats = () => {
    const pending = loans.filter(l => l.status === 'pending').length;
    const approved = loans.filter(l => l.status === 'approved').length;
    const rejected = loans.filter(l => l.status === 'rejected').length;
    const totalAmount = loans
      .filter(l => l.status === 'approved')
      .reduce((sum, l) => sum + (l.approvedAmount || 0), 0);

    return { pending, approved, rejected, totalAmount };
  };

  const stats = getApprovalStats();

  const handleApprove = (loan: ILoan, approvedAmount: number, remarks?: string) => {
    updateLoanStatus(loan._id, {
      status: 'approved',
      remarks,
      approvedDate: new Date().toISOString(),
      approvedAmount:approvedAmount,
      approvedBy: user?._id,
    },dispatch);
    setShowDetails(false);
    setSelectedLoan(null);
  };

  const handleReject = (loan: ILoan, remarks: string) => {
    updateLoanStatus(loan._id, {
      status: 'rejected',
      approvedBy: user?._id,
      approvedDate: new Date().toISOString(),
      remarks
    },dispatch);
    setShowDetails(false);
    setSelectedLoan(null);
  };

  const getCustomerRiskLevel = (customerId: string) => {
    const customer = customers.find(c => c._id === customerId);
    const customerLoans = loans.filter(l => l.customerId._id === customerId);

    if (!customer) return 'unknown';

    const hasActiveLoans = customerLoans.some(l => l.status === 'active');
    const hasDefaultHistory = customerLoans.some(l => l.status === 'rejected');
    const incomeRatio = customer.income;

    if (hasDefaultHistory || incomeRatio < 30000) return 'high';
    if (hasActiveLoans || incomeRatio < 50000) return 'medium';
    return 'low';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  console.log({'selectedLoan':selectedLoan});
  
  return (
     <div style={{ position: 'relative' }}>
      {loading && (
        <PageLoader loading={true} />
      )}
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Loan Approvals</h2>
          <p className="text-gray-600">Review and approve loan applications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.rejected}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Approved</p>
              <p className="text-2xl font-bold text-gray-900">LKR {stats?.totalAmount?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'pending', label: 'Pending', count: stats?.pending },
              { key: 'approved', label: 'Approved', count: stats?.approved },
              { key: 'rejected', label: 'Rejected', count: stats?.rejected },
              { key: 'all', label: 'All Applications', count: loans?.length }
            ].map((tab) => (
              <button
                key={tab?.key}
                onClick={() => setFilter(tab?.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${filter === tab?.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab?.label} ({tab?.count})
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {pendingLoans?.map((loan) => {
              const customer = customers?.find(c => c?._id === loan?.customerId?._id);
              const riskLevel = getCustomerRiskLevel(loan?.customerId?._id);

              return (
                <div key={loan?._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">{capitalizeFirstLetter(customer?.name ??'')}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(loan?.status)}`}>
                          {loan?.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(riskLevel)}`}>
                          {riskLevel} risk
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Loan Details</p>
                          <p className="font-medium">LKR {loan?.requestedAmount?.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">{capitalizeFirstLetter(loan?.type)} loan • {loan?.period} months</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Customer Info</p>
                          <p className="font-medium">{customer?.nic}</p>
                          <p className="text-sm text-gray-500">Income: LKR {customer?.income?.toLocaleString()}/month</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Application Date</p>
                          <p className="font-medium">{new Date(loan?.createdAt)?.toLocaleDateString()}</p>
                          <p className="text-sm text-gray-500">EMI: LKR {loan?.emi?.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Purpose</p>
                        <p className="text-gray-800">{capitalizeFirstLetter(loan?.purpose)}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 className="font-medium text-gray-800 mb-2">Quick Assessment</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Income Ratio:</span>
                            <span className="ml-1 font-medium">
                              {customer ? Math.round((loan?.emi / customer?.income) * 100) : 0}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Loan-to-Income:</span>
                            <span className="ml-1 font-medium">
                              {customer ? Math.round((loan?.requestedAmount / (customer?.income * 12)) * 100) : 0}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Documents:</span>
                            <span className="ml-1 font-medium">{loan?.documents?.length} files</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Guarantor:</span>
                            <span className="ml-1 font-medium">{loan?.guarantor ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-6">
                      <button
                        onClick={() => {
                          setSelectedLoan(loan);
                          setShowDetails(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </button>

                      {loan?.status === 'pending' && user?.role !== 'clerk' && (
                        <>
                          <button
                            onClick={() => handleApprove(loan, loan?.requestedAmount)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Quick Approve
                          </button>
                          <button
                            onClick={() => handleReject(loan, 'Quick rejection')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {pendingLoans?.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No applications found</h3>
              <p className="text-gray-500">
                {filter === 'pending'
                  ? 'No pending loan applications to review'
                  : `No ${filter} loan applications found`}
              </p>
            </div>
          )}
        </div>
      </div>

      {showDetails && selectedLoan && (
        <ApprovalDetails
          loan={selectedLoan}
          customer={customers?.find(c => c?._id === selectedLoan?.customerId._id)}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => {
            setShowDetails(false);
            setSelectedLoan(null);
          }}
          canApprove={user?.role !== 'clerk'}
        />
      )}
    </div>
    </div>
  );
}