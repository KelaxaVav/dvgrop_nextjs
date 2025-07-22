import { useState } from 'react';
import { MessageSquare, Send, Settings, Bell, CheckCircle, AlertTriangle, Clock, Eye } from 'lucide-react';
import SMSTemplateForm from './SMSTemplateForm';
import SMSSettings from './SMSSettings';
import SMSLogs from './SMSLogs';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../types/redux_state';

export default function SMSManager() {
  const { loans } = useSelector((state: ReduxState) => state.loan);
  const { customers } = useSelector((state: ReduxState) => state.customer);
  const { payments } = useSelector((state: ReduxState) => state.payment);

  const [currentView, setCurrentView] = useState<'dashboard' | 'templates' | 'settings' | 'logs'>('dashboard');
  const [smsSettings, setSmsSettings] = useState({
    provider: 'twilio',
    accountSid: 'AC123456789',
    authToken: '******',
    fromNumber: '+15551234567',
    enabled: true,
    autoSendEnabled: true,
    sendOnLoanApplication: true,
    sendOnLoanApproval: true,
    sendOnDisbursement: true,
    sendOnPaymentReceipt: true,
    sendOnOverdue: true,
    sendPreDueReminder: true,
    language: 'english'
  });
  
  const [smsTemplates, setSmsTemplates] = useState({
    loanApplication: {
      english: 'Dear [Name], your loan application for Rs.[amount] has been received. Ref No: [LoanID].',
      tamil: 'அன்புள்ள [Name], உங்கள் Rs.[amount] கடன் விண்ணப்பம் பெறப்பட்டது. குறிப்பு எண்: [LoanID].'
    },
    loanApproval: {
      english: 'Congratulations [Name], your loan of Rs.[amount] has been approved and disbursed. EMI starts from [date].',
      tamil: 'வாழ்த்துக்கள் [Name], உங்கள் Rs.[amount] கடன் அங்கீகரிக்கப்பட்டு வழங்கப்பட்டுள்ளது. EMI [date] முதல் தொடங்குகிறது.'
    },
    paymentReceipt: {
      english: 'Payment of Rs.[amount] received on [date]. Remaining balance: Rs.[balance]. Thank you.',
      tamil: 'Rs.[amount] கட்டணம் [date] அன்று பெறப்பட்டது. மீதமுள்ள இருப்பு: Rs.[balance]. நன்றி.'
    },
    latePayment: {
      english: 'Reminder: Your EMI of Rs.[amount] is overdue since [date]. Please pay to avoid penalties.',
      tamil: 'நினைவூட்டல்: உங்கள் Rs.[amount] EMI [date] முதல் தாமதமாகிவிட்டது. அபராதங்களைத் தவிர்க்க தயவுசெய்து செலுத்துங்கள்.'
    },
    preDueReminder: {
      english: 'Reminder: Your EMI of Rs.[amount] is due on [date]. Please keep funds ready.',
      tamil: 'நினைவூட்டல்: உங்கள் Rs.[amount] EMI [date] அன்று செலுத்த வேண்டும். தயவுசெய்து நிதிகளை தயாராக வைத்திருங்கள்.'
    },
    loanRejection: {
      english: 'We regret to inform you that your loan application Ref No: [LoanID] was not approved.',
      tamil: 'உங்கள் கடன் விண்ணப்பம் குறிப்பு எண்: [LoanID] அங்கீகரிக்கப்படவில்லை என்பதை தெரிவிக்க வருந்துகிறோம்.'
    }
  });

  const [smsLogs, setSmsLogs] = useState([
    {
      id: 'sms1',
      customerId: '1',
      customerName: 'Kamal Perera',
      phoneNumber: '+94771234567',
      message: 'Dear Kamal Perera, your loan application for Rs.500000 has been received. Ref No: L001.',
      type: 'loanApplication',
      status: 'delivered',
      sentAt: '2024-05-01T10:30:00Z',
      deliveredAt: '2024-05-01T10:31:00Z'
    },
    {
      id: 'sms2',
      customerId: '1',
      customerName: 'Kamal Perera',
      phoneNumber: '+94771234567',
      message: 'Congratulations Kamal Perera, your loan of Rs.450000 has been approved and disbursed. EMI starts from 2024-06-01.',
      type: 'loanApproval',
      status: 'delivered',
      sentAt: '2024-05-15T14:20:00Z',
      deliveredAt: '2024-05-15T14:21:00Z'
    },
    {
      id: 'sms3',
      customerId: '2',
      customerName: 'Nimal Silva',
      phoneNumber: '+94779876543',
      message: 'Dear Nimal Silva, your loan application for Rs.200000 has been received. Ref No: L002.',
      type: 'loanApplication',
      status: 'delivered',
      sentAt: '2024-05-10T09:15:00Z',
      deliveredAt: '2024-05-10T09:16:00Z'
    },
    {
      id: 'sms4',
      customerId: '1',
      customerName: 'Kamal Perera',
      phoneNumber: '+94771234567',
      message: 'Payment of Rs.22500 received on 2024-06-01. Remaining balance: Rs.427500. Thank you.',
      type: 'paymentReceipt',
      status: 'delivered',
      sentAt: '2024-06-01T16:45:00Z',
      deliveredAt: '2024-06-01T16:46:00Z'
    },
    {
      id: 'sms5',
      customerId: '2',
      customerName: 'Nimal Silva',
      phoneNumber: '+94779876543',
      message: 'Reminder: Your EMI of Rs.16500 is due on 2024-06-15. Please keep funds ready.',
      type: 'preDueReminder',
      status: 'failed',
      sentAt: '2024-06-14T10:00:00Z',
      error: 'Invalid phone number format'
    }
  ]);

  // Get pending notifications that need to be sent
  const getPendingNotifications = () => {
    const today = new Date();
    const notifications = [];

    // Check for overdue payments
    const overduePayments = payments.filter(r => 
      r.status === 'pending' && new Date(r.dueDate) < today
    );

    for (const payment of overduePayments) {
      const loan = loans.find(l => l._id === payment.loanId?._id);
      if (loan) {
        const customer = customers.find(c => c._id === loan.customerId?._id);
        if (customer) {
          // Check if we've already sent an overdue notification for this payment in the last 3 days
          const recentNotification = smsLogs.find(log => 
            log.customerId === customer._id && 
            log.type === 'latePayment' && 
            log.message.includes(payment._id) &&
            new Date(log.sentAt) > new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
          );

          if (!recentNotification) {
            notifications.push({
              type: 'latePayment',
              customer,
              payment,
              loan,
              daysOverdue: Math.floor((today.getTime() - new Date(payment.dueDate).getTime()) / (1000 * 60 * 60 * 24))
            });
          }
        }
      }
    }

    // Check for upcoming payments (due tomorrow)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const upcomingPayments = payments.filter(r => 
      r.status === 'pending' && 
      new Date(r.dueDate).toDateString() === tomorrow.toDateString()
    );

    for (const payment of upcomingPayments) {
      const loan = loans.find(l => l._id === payment.loanId?._id);
      if (loan) {
        const customer = customers.find(c => c._id === loan.customerId?._id);
        if (customer) {
          // Check if we've already sent a pre-due reminder
          const recentNotification = smsLogs.find(log => 
            log.customerId === customer._id && 
            log.type === 'preDueReminder' && 
            log.message.includes(payment._id)
          );

          if (!recentNotification) {
            notifications.push({
              type: 'preDueReminder',
              customer,
              payment,
              loan
            });
          }
        }
      }
    }

    return notifications;
  };

  const pendingNotifications = getPendingNotifications();

  // Get SMS statistics
  const getSmsStats = () => {
    const totalSent = smsLogs.length;
    const delivered = smsLogs.filter(log => log.status === 'delivered').length;
    const failed = smsLogs.filter(log => log.status === 'failed').length;
    const deliveryRate = totalSent > 0 ? (delivered / totalSent) * 100 : 0;

    // Count by type
    const byType = smsLogs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSent,
      delivered,
      failed,
      deliveryRate,
      byType
    };
  };

  const smsStats = getSmsStats();

  // Function to send SMS (mock implementation)
  const sendSMS = (to: string, message: string, type: string, customerId: string, customerName: string) => {
    // In a real implementation, this would call the Twilio API
    console.log(`Sending SMS to ${to}: ${message}`);
    
    // Create a new SMS log entry
    const newLog = {
      id: `sms${Date.now()}`,
      customerId,
      customerName,
      phoneNumber: to,
      message,
      type,
      status: Math.random() > 0.1 ? 'delivered' : 'failed', // 90% success rate for demo
      sentAt: new Date().toISOString(),
      deliveredAt: Math.random() > 0.1 ? new Date().toISOString() : undefined,
      error: Math.random() > 0.1 ? undefined : 'Network error'
    };
    
    // setSmsLogs(prev => [newLog, ...prev]);
    
    return newLog;
  };

  // Function to send a manual notification
  const sendManualNotification = (notification: any) => {
    const { type, customer, payment, loan } = notification;
    
    let template = smsTemplates[type as keyof typeof smsTemplates][smsSettings.language as keyof typeof smsTemplates.loanApplication];
    
    // Replace placeholders
    let message = template
      .replace('[Name]', customer.name)
      .replace('[amount]', payment.amount.toString())
      .replace('[date]', new Date(payment.dueDate).toLocaleDateString())
      .replace('[LoanID]', loan.id)
      .replace('[balance]', payment.balance.toString());
    
    return sendSMS(customer.phone, message, type, customer.id, customer.name);
  };

  // Function to send all pending notifications
  const sendAllPendingNotifications = () => {
    for (const notification of pendingNotifications) {
      sendManualNotification(notification);
    }
  };

  // Function to update SMS template
  const updateSmsTemplate = (type: string, language: string, template: string) => {
    setSmsTemplates(prev => ({
      ...prev,
      [type]: {
        ...prev[type as keyof typeof prev],
        [language]: template
      }
    }));
  };

  // Function to update SMS settings
  const updateSmsSettings = (newSettings: any) => {
    setSmsSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  // Render the appropriate view
  const renderView = () => {
    switch (currentView) {
      case 'templates':
        return (
          <SMSTemplateForm 
            templates={smsTemplates} 
            updateTemplate={updateSmsTemplate} 
            language={smsSettings.language}
            onLanguageChange={(lang) => updateSmsSettings({ language: lang })}
          />
        );
      case 'settings':
        return (
          <SMSSettings 
            settings={smsSettings} 
            updateSettings={updateSmsSettings} 
          />
        );
      case 'logs':
        return (
          <SMSLogs 
            logs={smsLogs} 
            customers={customers}
          />
        );
      default:
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total SMS Sent</p>
                    <p className="text-2xl font-bold text-gray-900">{smsStats.totalSent}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Delivered</p>
                    <p className="text-2xl font-bold text-gray-900">{smsStats.delivered}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-gray-900">{smsStats.failed}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Bell className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{smsStats.deliveryRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Notifications */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Pending Notifications</h3>
                  <button
                    onClick={sendAllPendingNotifications}
                    disabled={pendingNotifications.length === 0}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send All
                  </button>
                </div>
              </div>

              <div className="p-6">
                {pendingNotifications.length > 0 ? (
                  <div className="space-y-4">
                    {pendingNotifications.map((notification, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg ${
                            notification.type === 'latePayment' ? 'bg-red-100' : 'bg-yellow-100'
                          }`}>
                            {notification.type === 'latePayment' ? (
                              <AlertTriangle className={`w-5 h-5 text-red-600`} />
                            ) : (
                              <Clock className={`w-5 h-5 text-yellow-600`} />
                            )}
                          </div>
                          <div className="ml-4">
                            <p className="font-medium text-gray-800">{notification.customer.name}</p>
                            <p className="text-sm text-gray-600">
                              {notification.type === 'latePayment' ? (
                                `Overdue payment (${notification.daysOverdue} days) - EMI #${notification.payment.emiNo}`
                              ) : (
                                `Payment due tomorrow - EMI #${notification.payment.emiNo}`
                              )}
                            </p>
                            <p className="text-sm text-gray-600">
                              Amount: LKR {notification.payment.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <p className="text-sm text-gray-600 mr-4">{notification.customer.phone}</p>
                          <button
                            onClick={() => sendManualNotification(notification)}
                            className={`px-3 py-2 rounded-lg flex items-center ${
                              notification.type === 'latePayment' 
                                ? 'bg-red-600 text-white hover:bg-red-700' 
                                : 'bg-yellow-600 text-white hover:bg-yellow-700'
                            }`}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Send
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No pending notifications</h3>
                    <p className="text-gray-500">All notifications have been sent</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent SMS Logs */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Recent SMS Logs</h3>
                  <button
                    onClick={() => setCurrentView('logs')}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sent At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {smsLogs.slice(0, 5).map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{log.customerName}</div>
                              <div className="text-sm text-gray-500">{log.phoneNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            log.type === 'loanApplication' ? 'bg-blue-100 text-blue-800' :
                            log.type === 'loanApproval' ? 'bg-green-100 text-green-800' :
                            log.type === 'paymentReceipt' ? 'bg-purple-100 text-purple-800' :
                            log.type === 'latePayment' ? 'bg-red-100 text-red-800' :
                            log.type === 'preDueReminder' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {log.type === 'loanApplication' ? 'Application' :
                             log.type === 'loanApproval' ? 'Approval' :
                             log.type === 'paymentReceipt' ? 'Payment' :
                             log.type === 'latePayment' ? 'Overdue' :
                             log.type === 'preDueReminder' ? 'Reminder' :
                             log.type === 'loanRejection' ? 'Rejection' : log.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(log.sentAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            log.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{log.message}</div>
                          {log.error && <div className="text-xs text-red-600">{log.error}</div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SMS Type Distribution */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">SMS Type Distribution</h3>
              <div className="bg-white p-6 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(smsStats.byType).map(([type, count]) => (
                    <div key={type} className="text-center">
                      <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                        type === 'loanApplication' ? 'bg-blue-100' :
                        type === 'loanApproval' ? 'bg-green-100' :
                        type === 'paymentReceipt' ? 'bg-purple-100' :
                        type === 'latePayment' ? 'bg-red-100' :
                        type === 'preDueReminder' ? 'bg-yellow-100' :
                        'bg-gray-100'
                      }`}>
                        <MessageSquare className={`w-6 h-6 ${
                          type === 'loanApplication' ? 'text-blue-600' :
                          type === 'loanApproval' ? 'text-green-600' :
                          type === 'paymentReceipt' ? 'text-purple-600' :
                          type === 'latePayment' ? 'text-red-600' :
                          type === 'preDueReminder' ? 'text-yellow-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      <p className="mt-2 font-medium text-gray-800 capitalize">
                        {type === 'loanApplication' ? 'Application' :
                         type === 'loanApproval' ? 'Approval' :
                         type === 'paymentReceipt' ? 'Payment' :
                         type === 'latePayment' ? 'Overdue' :
                         type === 'preDueReminder' ? 'Reminder' :
                         type === 'loanRejection' ? 'Rejection' : type}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">{count}</p>
                      <p className="text-sm text-gray-600">
                        {((count / smsStats.totalSent) * 100).toFixed(1)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">SMS Notification System</h2>
          <p className="text-gray-600">Manage automated SMS notifications and messaging</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-4 py-2 rounded-lg flex items-center ${
              currentView === 'dashboard' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Bell className="w-4 h-4 mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView('templates')}
            className={`px-4 py-2 rounded-lg flex items-center ${
              currentView === 'templates' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Templates
          </button>
          <button
            onClick={() => setCurrentView('logs')}
            className={`px-4 py-2 rounded-lg flex items-center ${
              currentView === 'logs' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Clock className="w-4 h-4 mr-2" />
            Logs
          </button>
          <button
            onClick={() => setCurrentView('settings')}
            className={`px-4 py-2 rounded-lg flex items-center ${
              currentView === 'settings' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-lg border-2 ${smsSettings.enabled ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {smsSettings.enabled ? (
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
            )}
            <div>
              <h3 className={`font-semibold ${smsSettings.enabled ? 'text-green-800' : 'text-red-800'}`}>
                {smsSettings.enabled ? 'SMS Notifications Active' : 'SMS Notifications Disabled'}
              </h3>
              <p className={`text-sm ${smsSettings.enabled ? 'text-green-600' : 'text-red-600'}`}>
                {smsSettings.enabled 
                  ? `Using ${smsSettings.provider} as provider • ${smsSettings.autoSendEnabled ? 'Auto-send enabled' : 'Manual sending only'}`
                  : 'Enable notifications in settings to start sending SMS alerts'
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => updateSmsSettings({ enabled: !smsSettings.enabled })}
            className={`px-4 py-2 rounded-lg ${
              smsSettings.enabled 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {smsSettings.enabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      {renderView()}
    </div>
  );
}