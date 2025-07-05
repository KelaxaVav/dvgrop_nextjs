import React, { useState } from 'react';
import { X, Save, RefreshCw, Settings, Mail, Key, AlertTriangle, CheckCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface ContactSyncSettingsProps {
  onClose: () => void;
}

export default function ContactSyncSettings({ onClose }: ContactSyncSettingsProps) {
  const { emailSyncConfig, updateEmailSyncConfig } = useData();
  const [formData, setFormData] = useState({...emailSyncConfig});
  const [showApiKey, setShowApiKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = () => {
    updateEmailSyncConfig(formData);
    setTestResult({ success: true, message: 'Settings saved successfully' });
  };

  const resetSettings = () => {
    setFormData({...emailSyncConfig});
    setTestResult(null);
  };

  const testConnection = () => {
    // This would be an actual API call in a real application
    setTestResult(null);
    
    setTimeout(() => {
      if (formData.provider === 'internal') {
        setTestResult({ success: true, message: 'Internal provider is ready' });
      } else if (!formData.apiKey) {
        setTestResult({ success: false, message: 'API key is required for external providers' });
      } else {
        // Simulate a 90% success rate
        const isSuccess = Math.random() > 0.1;
        setTestResult({ 
          success: isSuccess, 
          message: isSuccess 
            ? `Successfully connected to ${formData.provider}` 
            : `Failed to connect to ${formData.provider}. Please check your API key.`
        });
      }
    }, 1000);
  };

  const providers = [
    { id: 'internal', name: 'Internal Database' },
    { id: 'mailchimp', name: 'Mailchimp' },
    { id: 'sendinblue', name: 'Sendinblue' },
    { id: 'google', name: 'Google Contacts' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Contact Sync Settings</h2>
          <p className="text-gray-600">Configure how customer contacts are saved and synced</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Provider Settings */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Email Provider Settings</h3>
          <div className="flex space-x-3">
            <button
              onClick={resetSettings}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </button>
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Email Provider
            </label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {providers.map((provider) => (
                <label
                  key={provider.id}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.provider === provider.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="provider"
                    value={provider.id}
                    checked={formData.provider === provider.id}
                    onChange={(e) => handleChange('provider', e.target.value)}
                    className="sr-only"
                  />
                  <Mail className={`w-5 h-5 mr-3 ${
                    formData.provider === provider.id ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <span className={`font-medium ${
                    formData.provider === provider.id ? 'text-blue-900' : 'text-gray-700'
                  }`}>
                    {provider.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* API Credentials (for external providers) */}
          {formData.provider !== 'internal' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={formData.apiKey || ''}
                    onChange={(e) => handleChange('apiKey', e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Enter ${formData.provider} API key`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  List ID / Audience ID
                </label>
                <input
                  type="text"
                  value={formData.listId || ''}
                  onChange={(e) => handleChange('listId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Enter ${formData.provider} list or audience ID`}
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={testConnection}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Test Connection
                </button>
              </div>

              {testResult && (
                <div className={`p-4 rounded-lg ${
                  testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    {testResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    )}
                    <p className={`text-sm ${
                      testResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {testResult.message}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sync Settings */}
          <div className="pt-6 border-t">
            <h4 className="font-medium text-gray-800 mb-4 flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Sync Settings
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Enable Contact Sync</p>
                  <p className="text-sm text-gray-600">Turn on/off automatic contact syncing</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => handleChange('enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Sync on Customer Registration</p>
                  <p className="text-sm text-gray-600">Automatically add new customers to contact list</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.syncOnCustomerRegistration}
                    onChange={(e) => handleChange('syncOnCustomerRegistration', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Sync on Loan Approval</p>
                  <p className="text-sm text-gray-600">Add customers to contact list when their loan is approved</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.syncOnLoanApproval}
                    onChange={(e) => handleChange('syncOnLoanApproval', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Information */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Provider Information</h3>
        
        {formData.provider === 'internal' && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Internal Database Storage</h4>
            <p className="text-sm text-blue-700">
              Contacts will be stored in the application's database. This is suitable for small to medium-sized contact lists.
              You can export contacts at any time for use with external email marketing tools.
            </p>
          </div>
        )}

        {formData.provider === 'mailchimp' && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Mailchimp Integration</h4>
            <p className="text-sm text-blue-700 mb-2">
              Connect to Mailchimp to automatically sync your contacts for email marketing campaigns.
            </p>
            <p className="text-sm text-blue-700">
              To set up Mailchimp integration:
            </p>
            <ol className="list-decimal list-inside text-sm text-blue-700 mt-2 space-y-1">
              <li>Log in to your Mailchimp account</li>
              <li>Go to Account → API Keys</li>
              <li>Create a new API key with appropriate permissions</li>
              <li>Copy the API key and paste it above</li>
              <li>Find your audience ID in Audience settings</li>
            </ol>
          </div>
        )}

        {formData.provider === 'sendinblue' && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Sendinblue Integration</h4>
            <p className="text-sm text-blue-700 mb-2">
              Connect to Sendinblue to automatically sync your contacts for email marketing campaigns.
            </p>
            <p className="text-sm text-blue-700">
              To set up Sendinblue integration:
            </p>
            <ol className="list-decimal list-inside text-sm text-blue-700 mt-2 space-y-1">
              <li>Log in to your Sendinblue account</li>
              <li>Go to SMTP & API → API Keys</li>
              <li>Create a new API key with appropriate permissions</li>
              <li>Copy the API key and paste it above</li>
              <li>Find your list ID in Contacts → Lists</li>
            </ol>
          </div>
        )}

        {formData.provider === 'google' && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Google Contacts Integration</h4>
            <p className="text-sm text-blue-700 mb-2">
              Connect to Google Contacts to automatically sync your contacts.
            </p>
            <p className="text-sm text-blue-700">
              To set up Google Contacts integration:
            </p>
            <ol className="list-decimal list-inside text-sm text-blue-700 mt-2 space-y-1">
              <li>Go to Google Cloud Console</li>
              <li>Create a new project and enable the People API</li>
              <li>Create OAuth credentials</li>
              <li>Copy the API key and paste it above</li>
            </ol>
          </div>
        )}
      </div>

      {/* Data Privacy Notice */}
      <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Data Privacy Notice</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Ensure you have proper consent from customers before adding them to marketing lists. 
              Always provide an unsubscribe option in your communications and respect privacy regulations 
              such as GDPR or local data protection laws.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}