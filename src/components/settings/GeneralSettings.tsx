import React, { useState, useEffect } from 'react';
import { Building, Phone, Mail, DollarSign, FileText, Save, RefreshCw, Clock } from 'lucide-react';

interface GeneralSettingsProps {
  onSave: (message?: string) => void;
  onError: (message?: string) => void;
}

interface GeneralSettingsData {
  companyName: string;
  companyPhone: string;
  companyEmail: string;
  companyAddress: string;
  currencyFormat: string;
  defaultInterestRate: number;
  loanIdPrefix: string;
  dateFormat: string;
  timeZone: string;
  fiscalYearStart: string;
}

export default function GeneralSettings({ onSave, onError }: GeneralSettingsProps) {
  // Load settings from localStorage or use defaults
  const loadSettings = (): GeneralSettingsData => {
    const savedSettings = localStorage.getItem('lms_general_settings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error('Error parsing general settings:', e);
      }
    }
    
    // Default settings
    return {
      companyName: 'LoanManager Pro',
      companyPhone: '+94 77 123 4567',
      companyEmail: 'info@loanmanagerpro.com',
      companyAddress: 'No. 123, Main Street, Colombo 03, Sri Lanka',
      currencyFormat: 'LKR',
      defaultInterestRate: 10,
      loanIdPrefix: 'L',
      dateFormat: 'DD/MM/YYYY',
      timeZone: 'Asia/Colombo',
      fiscalYearStart: '01/04'
    };
  };

  const [settings, setSettings] = useState<GeneralSettingsData>(loadSettings());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('lms_general_settings', JSON.stringify(settings));
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Save settings to localStorage
      localStorage.setItem('lms_general_settings', JSON.stringify(settings));
      
      // Log the change for audit
      const auditLog = {
        action: 'update_general_settings',
        timestamp: new Date().toISOString(),
        user: 'admin', // This would come from the auth context in a real app
        changes: settings
      };
      
      console.log('Settings updated:', auditLog);
      
      // Notify success
      onSave('General settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      onError('Failed to save general settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      companyName: 'LoanManager Pro',
      companyPhone: '+94 77 123 4567',
      companyEmail: 'info@loanmanagerpro.com',
      companyAddress: 'No. 123, Main Street, Colombo 03, Sri Lanka',
      currencyFormat: 'LKR',
      defaultInterestRate: 10,
      loanIdPrefix: 'L',
      dateFormat: 'DD/MM/YYYY',
      timeZone: 'Asia/Colombo',
      fiscalYearStart: '01/04'
    };
    
    setSettings(defaultSettings);
    onSave('Settings reset to defaults');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">General Settings</h3>
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
        {/* Company Information */}
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-medium text-gray-800 mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Company Information
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={settings.companyPhone}
                  onChange={(e) => setSettings({...settings, companyPhone: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  value={settings.companyEmail}
                  onChange={(e) => setSettings({...settings, companyEmail: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Address
              </label>
              <textarea
                value={settings.companyAddress}
                onChange={(e) => setSettings({...settings, companyAddress: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Loan Settings */}
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-medium text-gray-800 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Loan Settings
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency Format
              </label>
              <select
                value={settings.currencyFormat}
                onChange={(e) => setSettings({...settings, currencyFormat: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="LKR">LKR (Sri Lankan Rupee)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="GBP">GBP (British Pound)</option>
                <option value="INR">INR (Indian Rupee)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Interest Rate (%)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={settings.defaultInterestRate}
                  onChange={(e) => setSettings({...settings, defaultInterestRate: Number(e.target.value)})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan ID Prefix
              </label>
              <input
                type="text"
                value={settings.loanIdPrefix}
                onChange={(e) => setSettings({...settings, loanIdPrefix: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: {settings.loanIdPrefix}001, {settings.loanIdPrefix}002, etc.
              </p>
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-medium text-gray-800 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Regional Settings
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Format
              </label>
              <select
                value={settings.dateFormat}
                onChange={(e) => setSettings({...settings, dateFormat: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="DD-MM-YYYY">DD-MM-YYYY</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Zone
              </label>
              <select
                value={settings.timeZone}
                onChange={(e) => setSettings({...settings, timeZone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Asia/Colombo">Asia/Colombo (GMT+5:30)</option>
                <option value="UTC">UTC (GMT+0)</option>
                <option value="America/New_York">America/New_York (GMT-5)</option>
                <option value="Europe/London">Europe/London (GMT+0)</option>
                <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fiscal Year Start
              </label>
              <select
                value={settings.fiscalYearStart}
                onChange={(e) => setSettings({...settings, fiscalYearStart: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="01/01">January 1st</option>
                <option value="01/04">April 1st</option>
                <option value="01/07">July 1st</option>
                <option value="01/10">October 1st</option>
              </select>
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