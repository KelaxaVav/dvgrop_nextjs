import React, { useState } from 'react';
import { Send, X, MessageSquare, Users, Search, CheckCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface ManualSMSFormProps {
  onSend: (to: string, message: string, type: string, customerId: string, customerName: string) => any;
  onClose: () => void;
}

export default function ManualSMSForm({ onSend, onClose }: ManualSMSFormProps) {
  const { customers } = useData();
  const [selectedCustomers, setSelectedCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('custom');
  const [sending, setSending] = useState(false);
  const [sentStatus, setSentStatus] = useState<{success: number, failed: number} | null>(null);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.nic.includes(searchTerm)
  );

  const toggleCustomerSelection = (customer: any) => {
    if (selectedCustomers.find(c => c.id === customer.id)) {
      setSelectedCustomers(selectedCustomers.filter(c => c.id !== customer.id));
    } else {
      setSelectedCustomers([...selectedCustomers, customer]);
    }
  };

  const handleSendMessages = async () => {
    if (selectedCustomers.length === 0 || !message.trim()) return;
    
    setSending(true);
    setSentStatus(null);
    
    let success = 0;
    let failed = 0;
    
    for (const customer of selectedCustomers) {
      try {
        const result = await onSend(
          customer.phone, 
          message, 
          messageType, 
          customer.id, 
          customer.name
        );
        
        if (result.status === 'delivered') {
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
    }
    
    setSentStatus({ success, failed });
    setSending(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Send Manual SMS</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Select Recipients
            </h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search customers by name, phone, or NIC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
              {filteredCustomers.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredCustomers.map(customer => (
                    <div 
                      key={customer.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleCustomerSelection(customer)}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.some(c => c.id === customer.id)}
                          onChange={() => {}}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-500">{customer.phone}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{customer.nic}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No customers found matching your search
                </div>
              )}
            </div>

            <div className="mt-2 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {selectedCustomers.length} customer{selectedCustomers.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setSelectedCustomers([])}
                className="text-sm text-red-600 hover:text-red-800"
                disabled={selectedCustomers.length === 0}
              >
                Clear selection
              </button>
            </div>
          </div>

          {/* Message Composition */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Compose Message
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Type
              </label>
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="custom">Custom Message</option>
                <option value="latePayment">Overdue Payment Reminder</option>
                <option value="preDueReminder">Pre-Due Reminder</option>
                <option value="generalReminder">General Reminder</option>
                <option value="promotionalOffer">Promotional Offer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Content
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type your message here..."
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">
                  Available placeholders: [Name], [amount], [date], [LoanID], [balance]
                </p>
                <p className="text-xs text-gray-500">
                  {message.length} characters
                </p>
              </div>
            </div>
          </div>

          {/* Send Status */}
          {sentStatus && (
            <div className={`p-4 rounded-lg ${
              sentStatus.failed === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-center">
                {sentStatus.failed === 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-yellow-600 mr-3" />
                )}
                <div>
                  <h4 className={`font-medium ${sentStatus.failed === 0 ? 'text-green-800' : 'text-yellow-800'}`}>
                    Messages Sent
                  </h4>
                  <p className={`text-sm ${sentStatus.failed === 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {sentStatus.success} successful, {sentStatus.failed} failed
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSendMessages}
              disabled={selectedCustomers.length === 0 || !message.trim() || sending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send to {selectedCustomers.length} Recipient{selectedCustomers.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}