import React from 'react';
import { X, Phone, Mail, MapPin, Briefcase, DollarSign, Calendar, FileText, Download } from 'lucide-react';
import { Customer } from '../../types';

interface CustomerViewProps {
  customer: Customer;
  onClose: () => void;
  onEdit: () => void;
}

export default function CustomerView({ customer, onClose, onEdit }: CustomerViewProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Customer Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Customer Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{customer.name}</h3>
                <p className="text-gray-600">Customer ID: {customer.id}</p>
                <p className="text-gray-600">NIC: {customer.nic}</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  customer.maritalStatus === 'married' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {customer.maritalStatus}
                </span>
                <p className="text-sm text-gray-600 mt-2">
                  Member since {new Date(customer.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Personal Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-medium">{new Date(customer.dob).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 text-gray-500 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">{customer.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Contact Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Phone Number</p>
                      <p className="font-medium">{customer.phone}</p>
                    </div>
                  </div>
                  {customer.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Email Address</p>
                        <p className="font-medium">{customer.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Professional Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Briefcase className="w-4 h-4 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Occupation</p>
                      <p className="font-medium">{customer.occupation}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Monthly Income</p>
                      <p className="font-medium">LKR {customer.income.toLocaleString()}</p>
                    </div>
                  </div>
                  {customer.bankAccount && (
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-400 rounded mr-3"></div>
                      <div>
                        <p className="text-sm text-gray-600">Bank Account</p>
                        <p className="font-medium">{customer.bankAccount}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              {customer.documents.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Documents
                  </h4>
                  <div className="space-y-2">
                    {customer.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-gray-500 mr-3" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-gray-600">
                              Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}