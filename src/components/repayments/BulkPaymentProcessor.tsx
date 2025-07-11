import React, { useState } from 'react';
import { X, Upload, Download, CheckCircle, AlertTriangle, DollarSign, FileText, Users } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../types/redux_state';

interface BulkPaymentProcessorProps {
  onClose: () => void;
}

interface BulkPaymentRecord {
  loanId: string;
  emiNo: number;
  amount: number;
  paymentDate: string;
  paymentMode: 'cash' | 'online' | 'cheque';
  remarks?: string;
  status: 'pending' | 'processed' | 'error';
  error?: string;
}

export default function BulkPaymentProcessor({ onClose }: BulkPaymentProcessorProps) {
  // const { repayments, loans, customers, updateRepayment } = useData();
    const { loans } = useSelector((state: ReduxState) => state.loan);
  const { customers } = useSelector((state: ReduxState) => state.customer);
  const { user } = useSelector((state: ReduxState) => state.auth);
  const [bulkPayments, setBulkPayments] = useState<BulkPaymentRecord[]>([]);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'review' | 'process' | 'complete'>('upload');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        const payments: BulkPaymentRecord[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          
          if (values.length >= 5) {
            payments.push({
              loanId: values[0],
              emiNo: parseInt(values[1]),
              amount: parseFloat(values[2]),
              paymentDate: values[3],
              paymentMode: values[4] as any,
              remarks: values[5] || '',
              status: 'pending'
            });
          }
        }
        
        setBulkPayments(payments);
        setCurrentStep('review');
      } catch (error) {
        alert('Error parsing CSV file. Please check the format.');
      }
    };
    
    reader.readAsText(file);
  };

  const validatePayments = () => {
    const validatedPayments = bulkPayments.map(payment => {
      const errors = [];
      
      // Find the repayment record
      const repayment = repayments.find((r:any) => 
        r.loanId === payment.loanId && r.emiNo === payment.emiNo
      );
      
      if (!repayment) {
        errors.push('Repayment record not found');
      } else if (repayment.status === 'paid') {
        errors.push('EMI already paid');
      } else if (payment.amount > repayment.balance) {
        errors.push('Amount exceeds outstanding balance');
      }
      
      if (!payment.amount || payment.amount <= 0) {
        errors.push('Invalid amount');
      }
      
      if (!payment.paymentDate) {
        errors.push('Payment date required');
      }
      
      if (!['cash', 'online', 'cheque'].includes(payment.paymentMode)) {
        errors.push('Invalid payment mode');
      }
      
      return {
        ...payment,
        status: errors.length > 0 ? 'error' as const : 'pending' as const,
        error: errors.join(', ')
      };
    });
    
    setBulkPayments(validatedPayments);
  };

  const processBulkPayments = async () => {
    setProcessing(true);
    setCurrentStep('process');
    
    const processedPayments = [...bulkPayments];
    
    for (let i = 0; i < processedPayments.length; i++) {
      const payment = processedPayments[i];
      
      if (payment.status === 'error') continue;
      
      try {
        const repayment = repayments.find(r => 
          r.loanId === payment.loanId && r.emiNo === payment.emiNo
        );
        
        if (repayment) {
          const updatedRepayment = {
            paidAmount: payment.amount,
            paymentDate: payment.paymentDate,
            paymentMode: payment.paymentMode,
            status: payment.amount >= repayment.amount ? 'paid' as const : 'partial' as const,
            balance: Math.max(0, repayment.amount - payment.amount),
            remarks: payment.remarks
          };
          
          updateRepayment(repayment.id, updatedRepayment);
          
          processedPayments[i] = {
            ...payment,
            status: 'processed'
          };
        }
      } catch (error) {
        processedPayments[i] = {
          ...payment,
          status: 'error',
          error: 'Processing failed'
        };
      }
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 100));
      setBulkPayments([...processedPayments]);
    }
    
    setProcessing(false);
    setCurrentStep('complete');
  };

  const downloadTemplate = () => {
    const template = [
      ['Loan ID', 'EMI No', 'Amount', 'Payment Date (YYYY-MM-DD)', 'Payment Mode (cash/online/cheque)', 'Remarks'],
      ['L001', '1', '25000', '2024-01-15', 'cash', 'Regular payment'],
      ['L002', '2', '18000', '2024-01-15', 'online', 'Bank transfer']
    ];
    
    const csvContent = template
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-payment-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportResults = () => {
    const headers = ['Loan ID', 'EMI No', 'Amount', 'Payment Date', 'Payment Mode', 'Status', 'Error'];
    const csvData = bulkPayments.map(payment => [
      payment.loanId,
      payment.emiNo,
      payment.amount,
      payment.paymentDate,
      payment.paymentMode,
      payment.status,
      payment.error || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-payment-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStepColor = (step: string) => {
    const steps = ['upload', 'review', 'process', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);
    
    if (stepIndex < currentIndex) return 'bg-green-600 text-white';
    if (stepIndex === currentIndex) return 'bg-blue-600 text-white';
    return 'bg-gray-200 text-gray-600';
  };

  const getStats = () => {
    const total = bulkPayments.length;
    const processed = bulkPayments.filter(p => p.status === 'processed').length;
    const errors = bulkPayments.filter(p => p.status === 'error').length;
    const totalAmount = bulkPayments
      .filter(p => p.status === 'processed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    return { total, processed, errors, totalAmount };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Bulk Payment Processor</h2>
          <p className="text-gray-600">Process multiple loan repayments at once</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Steps */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between">
          {[
            { key: 'upload', label: 'Upload File', icon: Upload },
            { key: 'review', label: 'Review Data', icon: FileText },
            { key: 'process', label: 'Process Payments', icon: DollarSign },
            { key: 'complete', label: 'Complete', icon: CheckCircle }
          ].map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.key} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStepColor(step.key)}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="ml-2 font-medium text-gray-700">{step.label}</span>
                {index < 3 && <div className="w-16 h-1 bg-gray-200 mx-4" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 'upload' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Payment File</h3>
          
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">File Format Requirements</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• CSV file format</li>
                <li>• Columns: Loan ID, EMI No, Amount, Payment Date, Payment Mode, Remarks</li>
                <li>• Payment Mode: cash, online, or cheque</li>
                <li>• Date format: YYYY-MM-DD</li>
              </ul>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={downloadTemplate}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="bulk-file-upload"
              />
              <label
                htmlFor="bulk-file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <span className="text-lg font-medium text-gray-700">Click to upload CSV file</span>
                <span className="text-sm text-gray-500">or drag and drop your file here</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'review' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Review Payment Data</h3>
              <div className="flex space-x-3">
                <button
                  onClick={validatePayments}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Validate Data
                </button>
                <button
                  onClick={() => setCurrentStep('process')}
                  disabled={bulkPayments.some(p => p.status === 'error')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Process Payments
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Loan ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">EMI No</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Payment Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bulkPayments.map((payment, index) => (
                    <tr key={index} className={payment.status === 'error' ? 'bg-red-50' : ''}>
                      <td className="px-4 py-2 text-sm">{payment.loanId}</td>
                      <td className="px-4 py-2 text-sm">#{payment.emiNo}</td>
                      <td className="px-4 py-2 text-sm">LKR {payment.amount.toLocaleString()}</td>
                      <td className="px-4 py-2 text-sm">{payment.paymentDate}</td>
                      <td className="px-4 py-2 text-sm capitalize">{payment.paymentMode}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          payment.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {payment.status}
                        </span>
                        {payment.error && (
                          <div className="text-xs text-red-600 mt-1">{payment.error}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'process' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Processing Payments</h3>
          
          {!processing && (
            <div className="text-center py-8">
              <button
                onClick={processBulkPayments}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center mx-auto"
              >
                <DollarSign className="w-5 h-5 mr-2" />
                Start Processing
              </button>
            </div>
          )}

          {processing && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Processing payments...</span>
              </div>
              
              <div className="space-y-2">
                {bulkPayments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">{payment.loanId} - EMI #{payment.emiNo}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      payment.status === 'processed' ? 'bg-green-100 text-green-800' :
                      payment.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {currentStep === 'complete' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Processing Complete</h3>
              <p className="text-gray-600">Bulk payment processing has been completed</p>
            </div>
          </div>

          {/* Results Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center">
                <Users className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Processed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.processed}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Errors</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.errors}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center">
                <DollarSign className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">LKR {stats.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Processing Results</h3>
              <button
                onClick={exportResults}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}