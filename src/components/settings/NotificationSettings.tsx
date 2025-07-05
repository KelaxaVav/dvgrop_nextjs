import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, Mail, Clock, Save, RefreshCw, Calendar, AlertTriangle } from 'lucide-react';

interface NotificationSettingsProps {
  onSave: (message?: string) => void;
  onError: (message?: string) => void;
}

interface NotificationSettingsData {
  smsEnabled: boolean;
  emailEnabled: boolean;
  reminderTime: number;
  smsTemplates: {
    loanApplication: string;
    loanApproval: string;
    loanRejection: string;
    paymentReminder: string;
    paymentReceipt: string;
    latePayment: string;
  };
  emailTemplates: {
    loanApplication: string;
    loanApproval: string;
    loanRejection: string;
    paymentReminder: string;
    paymentReceipt: string;
    latePayment: string;
  };
  notifyOnLoanApplication: boolean;
  notifyOnLoanApproval: boolean;
  notifyOnPaymentDue: boolean;
  notifyOnPaymentReceived: boolean;
  notifyOnLatePayment: boolean;
}

export default function NotificationSettings({ onSave, onError }: NotificationSettingsProps) {
  // Load settings from localStorage or use defaults
  const loadSettings = (): NotificationSettingsData => {
    const savedSettings = localStorage.getItem('lms_notification_settings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error('Error parsing notification settings:', e);
      }
    }
    
    // Default settings
    return {
      smsEnabled: true,
      emailEnabled: true,
      reminderTime: 1,
      smsTemplates: {
        loanApplication: 'Dear [Name], your loan application for [Amount] has been received. Reference: [LoanID]',
        loanApproval: 'Congratulations [Name], your loan of [Amount] has been approved. EMI starts from [Date].',
        loanRejection: 'Dear [Name], we regret to inform you that your loan application [LoanID] was not approved.',
        paymentReminder: 'Reminder: Your EMI payment of [Amount] is due on [Date]. Please ensure sufficient funds.',
        paymentReceipt: 'Payment of [Amount] received on [Date]. Remaining balance: [Balance]. Thank you.',
        latePayment: 'Your EMI payment of [Amount] was due on [Date] and is now overdue. Please pay immediately.'
      },
      emailTemplates: {
        loanApplication: '<p>Dear [Name],</p><p>Your loan application for [Amount] has been received.</p><p>Reference: [LoanID]</p>',
        loanApproval: '<p>Congratulations [Name],</p><p>Your loan of [Amount] has been approved. EMI starts from [Date].</p>',
        loanRejection: '<p>Dear [Name],</p><p>We regret to inform you that your loan application [LoanID] was not approved.</p>',
        paymentReminder: '<p>Reminder: Your EMI payment of [Amount] is due on [Date].</p><p>Please ensure sufficient funds.</p>',
        paymentReceipt: '<p>Payment of [Amount] received on [Date].</p><p>Remaining balance: [Balance].</p><p>Thank you.</p>',
        latePayment: '<p>Your EMI payment of [Amount] was due on [Date] and is now overdue.</p><p>Please pay immediately.</p>'
      },
      notifyOnLoanApplication: true,
      notifyOnLoanApproval: true,
      notifyOnPaymentDue: true,
      notifyOnPaymentReceived: true,
      notifyOnLatePayment: true
    };
  };

  const [settings, setSettings] = useState<NotificationSettingsData>(loadSettings());
  const [activeTemplate, setActiveTemplate] = useState<'sms' | 'email'>('sms');
  const [activeTemplateType, setActiveTemplateType] = useState<keyof NotificationSettingsData['smsTemplates']>('loanApplication');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('lms_notification_settings', JSON.stringify(settings));
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Save settings to localStorage
      localStorage.setItem('lms_notification_settings', JSON.stringify(settings));
      
      // Log the change for audit
      const auditLog = {
        action: 'update_notification_settings',
        timestamp: new Date().toISOString(),
        user: 'admin', // This would come from the auth context in a real app
        changes: settings
      };
      
      console.log('Settings updated:', auditLog);
      
      // Notify success
      onSave('Notification settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      onError('Failed to save notification settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      smsEnabled: true,
      emailEnabled: true,
      reminderTime: 1,
      smsTemplates: {
        loanApplication: 'Dear [Name], your loan application for [Amount] has been received. Reference: [LoanID]',
        loanApproval: 'Congratulations [Name], your loan of [Amount] has been approved. EMI starts from [Date].',
        loanRejection: 'Dear [Name], we regret to inform you that your loan application [LoanID] was not approved.',
        paymentReminder: 'Reminder: Your EMI payment of [Amount] is due on [Date]. Please ensure sufficient funds.',
        paymentReceipt: 'Payment of [Amount] received on [Date]. Remaining balance: [Balance]. Thank you.',
        latePayment: 'Your EMI payment of [Amount] was due on [Date] and is now overdue. Please pay immediately.'
      },
      emailTemplates: {
        loanApplication: '<p>Dear [Name],</p><p>Your loan application for [Amount] has been received.</p><p>Reference: [LoanID]</p>',
        loanApproval: '<p>Congratulations [Name],</p><p>Your loan of [Amount] has been approved. EMI starts from [Date].</p>',
        loanRejection: '<p>Dear [Name],</p><p>We regret to inform you that your loan application [LoanID] was not approved.</p>',
        paymentReminder: '<p>Reminder: Your EMI payment of [Amount] is due on [Date].</p><p>Please ensure sufficient funds.</p>',
        paymentReceipt: '<p>Payment of [Amount] received on [Date].</p><p>Remaining balance: [Balance].</p><p>Thank you.</p>',
        latePayment: '<p>Your EMI payment of [Amount] was due on [Date] and is now overdue.</p><p>Please pay immediately.</p>'
      },
      notifyOnLoanApplication: true,
      notifyOnLoanApproval: true,
      notifyOnPaymentDue: true,
      notifyOnPaymentReceived: true,
      notifyOnLatePayment: true
    };
    
    setSettings(defaultSettings);
    onSave('Settings reset to defaults');
  };

  const updateSmsTemplate = (type: keyof NotificationSettingsData['smsTemplates'], value: string) => {
    setSettings({
      ...settings,
      smsTemplates: {
        ...settings.smsTemplates,
        [type]: value
      }
    });
  };

  const updateEmailTemplate = (type: keyof NotificationSettingsData['emailTemplates'], value: string) => {
    setSettings({
      ...settings,
      emailTemplates: {
        ...settings.emailTemplates,
        [type]: value
      }
    });
  };

  const templateTypes = [
    { key: 'loanApplication', label: 'Loan Application' },
    { key: 'loanApproval', label: 'Loan Approval' },
    { key: 'loanRejection', label: 'Loan Rejection' },
    { key: 'paymentReminder', label: 'Payment Reminder' },
    { key: 'paymentReceipt', label: 'Payment Receipt' },
    { key: 'latePayment', label: 'Late Payment' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Notification Settings</h3>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={resetToDefaults}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Notification Channels */}
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-medium text-gray-800 mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notification Channels
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">SMS Notifications</p>
                <p className="text-sm text-gray-600">Send notifications via SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.smsEnabled}
                  onChange={(e) => setSettings({...settings, smsEnabled: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">Email Notifications</p>
                <p className="text-sm text-gray-600">Send notifications via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailEnabled}
                  onChange={(e) => setSettings({...settings, emailEnabled: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Reminder Time (days before due date)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.reminderTime}
                  onChange={(e) => setSettings({...settings, reminderTime: Number(e.target.value)})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Number of days before the due date to send payment reminders
              </p>
            </div>
          </div>
        </div>

        {/* Notification Events */}
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-medium text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Notification Events
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">Loan Application</p>
                <p className="text-sm text-gray-600">Notify when a new loan application is submitted</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifyOnLoanApplication}
                  onChange={(e) => setSettings({...settings, notifyOnLoanApplication: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">Loan Approval/Rejection</p>
                <p className="text-sm text-gray-600">Notify when a loan is approved or rejected</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifyOnLoanApproval}
                  onChange={(e) => setSettings({...settings, notifyOnLoanApproval: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">Payment Due</p>
                <p className="text-sm text-gray-600">Notify when a payment is due</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifyOnPaymentDue}
                  onChange={(e) => setSettings({...settings, notifyOnPaymentDue: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">Payment Received</p>
                <p className="text-sm text-gray-600">Notify when a payment is received</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifyOnPaymentReceived}
                  onChange={(e) => setSettings({...settings, notifyOnPaymentReceived: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">Late Payment</p>
                <p className="text-sm text-gray-600">Notify when a payment is overdue</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifyOnLatePayment}
                  onChange={(e) => setSettings({...settings, notifyOnLatePayment: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Templates */}
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-medium text-gray-800 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Notification Templates
          </h4>
          
          <div className="space-y-4">
            {/* Template Type Selector */}
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => setActiveTemplate('sms')}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  activeTemplate === 'sms' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                SMS Templates
              </button>
              <button
                type="button"
                onClick={() => setActiveTemplate('email')}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  activeTemplate === 'email' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Templates
              </button>
            </div>

            {/* Template Selection */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {templateTypes.map((type) => (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => setActiveTemplateType(type.key as any)}
                  className={`p-3 text-sm border rounded-lg ${
                    activeTemplateType === type.key
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Template Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {activeTemplate === 'sms' ? 'SMS' : 'Email'} Template for {
                  templateTypes.find(t => t.key === activeTemplateType)?.label
                }
              </label>
              <textarea
                value={
                  activeTemplate === 'sms' 
                    ? settings.smsTemplates[activeTemplateType] 
                    : settings.emailTemplates[activeTemplateType]
                }
                onChange={(e) => 
                  activeTemplate === 'sms' 
                    ? updateSmsTemplate(activeTemplateType, e.target.value)
                    : updateEmailTemplate(activeTemplateType, e.target.value)
                }
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="bg-blue-50 p-3 rounded-lg mt-2">
                <p className="text-sm text-blue-800 font-medium">Available placeholders:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">[Name]</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">[Amount]</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">[Date]</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">[LoanID]</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">[Balance]</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">[DueDate]</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}