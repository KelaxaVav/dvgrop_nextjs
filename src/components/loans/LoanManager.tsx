import { useEffect, useState } from 'react';
import { FileText, Plus, Search, Filter, Eye, Edit, Check, X } from 'lucide-react';
import LoanForm from './LoanForm';
import { fetchCustomers, fetchLoans } from '../../services/fetch';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../types/redux_state';
import { ILoan } from '../../types/loan';
import { subscribeLoading } from '../../utils/loading';
import PageLoader from '../../custom_component/loading';
import { capitalizeFirstLetter } from '../../utils/utils';
import { updateLoanStatus } from './services/loan_utils';

export default function LoanManager() {
  const dispatch = useDispatch();
  const { loans } = useSelector((state: ReduxState) => state.loan);
  const { customers } = useSelector((state: ReduxState) => state.customer);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLoan, setSelectedLoan] = useState<ILoan | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit' | 'view'>('list');
  const [loading, setLoading] = useState(false);

  const filteredLoans = loans.filter(loan => {
    const customer = customers.find(c => c._id === loan.customerId?._id);
    const matchesSearch = customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan._id.includes(searchTerm) ||
      loan.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });


  useEffect(() => {
    const unsubscribe = subscribeLoading(setLoading);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchLoans(dispatch);
    fetchCustomers(dispatch);
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'disbursed': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddLoan = () => {
    setSelectedLoan(null);
    setCurrentView('add');
  };

  const handleEditLoan = (loan: ILoan) => {
    setSelectedLoan(loan);
    setCurrentView('edit');
  };

  const handleViewLoan = (loan: ILoan) => {
    setSelectedLoan(loan);
    setCurrentView('view');
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedLoan(null);
  };

  if (currentView === 'add' || currentView === 'edit') {
    return (
      <LoanForm
        onCancel={handleCancel}
        isEditMode={currentView === 'edit'}
        loanId={selectedLoan?._id}
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
            <h2 className="text-2xl font-bold text-gray-800">Loan Management</h2>
            <p className="text-gray-600">Manage loan applications and approvals</p>
          </div>
          <button
            onClick={handleAddLoan}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Loan Application
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by customer name, loan ID, or purpose..."
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
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="disbursed">Disbursed</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loan Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLoans?.map((loan) => {
                  const customer = customers.find(c => c?._id === loan?.customerId?._id);
                  return (
                    <tr key={loan._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{capitalizeFirstLetter(customer?.name ?? '')}</div>
                          <div className="text-sm text-gray-500">ID: {loan?._id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 capitalize">{loan?.type} Loan</div>
                          <div className="text-sm text-gray-500">{loan?.purpose}</div>
                          <div className="text-sm text-gray-500">{loan?.period} months @ {loan?.interestRate}%</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            LKR {loan?.requestedAmount.toLocaleString()}
                          </div>
                          {loan?.approvedAmount && (
                            <div className="text-sm text-gray-500">
                              Approved: LKR {loan?.approvedAmount.toLocaleString()}
                            </div>
                          )}
                          <div className="text-sm text-gray-500">
                            EMI: LKR {loan?.emi.toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(loan?.status)}`}>
                          {loan?.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(loan?.createdAt).toLocaleDateString()}
                        <div className="text-xs text-gray-400">
                          {new Date(loan?.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewLoan(loan)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditLoan(loan)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit Loan"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {loan?.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateLoanStatus(loan?._id, {
                                  status: 'approved',
                                  approvedDate: new Date().toISOString(),
                                  approvedAmount: loan?.requestedAmount
                                },dispatch)}
                                className="text-green-600 hover:text-green-900"
                                title="Approve Loan"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  updateLoanStatus(loan?._id, {
                                    status: 'rejected',
                                    remarks: 'Rejected by system'
                                  },dispatch)
                                }
                                }
                                className="text-red-600 hover:text-red-900"
                                title="Reject Loan"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredLoans?.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No loans found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search criteria'
                  : 'No loan applications have been submitted yet'}
              </p>
            </div>
          )}
        </div>

        {/* Loan Details Modal */}
        {currentView === 'view' && selectedLoan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-800">Loan Details</h3>
                <button
                  onClick={() => setCurrentView('list')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Loan Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-600">Loan ID :</span> {selectedLoan?._id}</div>
                      <div><span className="text-gray-600">Type :</span> {capitalizeFirstLetter(selectedLoan?.type)}</div>
                      <div><span className="text-gray-600">Purpose :</span> {capitalizeFirstLetter(selectedLoan?.purpose)}</div>
                      <div><span className="text-gray-600">Requested Amount :</span> LKR {selectedLoan?.requestedAmount?.toLocaleString()}</div>
                      {selectedLoan?.approvedAmount && (
                        <div><span className="text-gray-600">Approved Amount :</span> LKR {selectedLoan?.approvedAmount?.toLocaleString()}</div>
                      )}
                      <div><span className="text-gray-600">Interest Rate :</span> {selectedLoan?.interestRate}% per month</div>
                      <div><span className="text-gray-600">Period :</span> {selectedLoan?.period} months</div>
                      <div><span className="text-gray-600">EMI :</span> LKR {selectedLoan?.emi.toLocaleString()}</div>
                      <div><span className="text-gray-600">Application Date :</span> {new Date(selectedLoan?.createdAt)?.toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Customer Information</h4>
                    {(() => {
                      const customer = customers?.find(c => c._id === selectedLoan?.customerId?._id);
                      return customer ? (
                        <div className="space-y-2 text-sm">
                          <div><span className="text-gray-600">Name :</span> {capitalizeFirstLetter(customer?.name)}</div>
                          <div><span className="text-gray-600">NIC :</span> {customer?.nic}</div>
                          <div><span className="text-gray-600">Phone :</span> {customer?.phone}</div>
                          <div><span className="text-gray-600">Income :</span> LKR {customer?.income?.toLocaleString()}/month</div>
                          <div><span className="text-gray-600">Occupation :</span> {capitalizeFirstLetter(customer?.occupation)}</div>
                        </div>
                      ) : <p className="text-gray-500">Customer information not available</p>;
                    })()}
                  </div>
                </div>

                {selectedLoan?.guarantor && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Guarantor Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-600">Name:</span> {capitalizeFirstLetter(selectedLoan?.guarantor?.name)}</div>
                      <div><span className="text-gray-600">NIC:</span> {selectedLoan?.guarantor?.nic}</div>
                      <div><span className="text-gray-600">Phone:</span> {selectedLoan?.guarantor?.phone}</div>
                      <div><span className="text-gray-600">Income:</span> LKR {selectedLoan?.guarantor?.income?.toLocaleString()}</div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
                  <button
                    onClick={() => setCurrentView('list')}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setCurrentView('edit')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit Loan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}