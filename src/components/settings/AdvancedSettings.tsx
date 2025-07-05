import React, { useState, useEffect } from 'react';
import { Code, Database, Download, Upload, Save, RefreshCw, AlertTriangle, CheckCircle, FileText, Eye, EyeOff, DollarSign, Clock } from 'lucide-react';

interface AdvancedSettingsProps {
  onSave: (message?: string) => void;
  onError: (message?: string) => void;
}

interface AdvancedSettingsData {
  automationRules: {
    autoApproveSmallLoans: boolean;
    smallLoanThreshold: number;
    autoSendReminders: boolean;
    reminderFrequency: number;
    autoDisableInactiveAccounts: boolean;
    inactivityThreshold: number;
  };
  backupSettings: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    backupTime: string;
    retentionPeriod: number;
    lastBackupDate?: string;
  };
  developerSettings: {
    developerMode: boolean;
    apiEnabled: boolean;
    apiKey?: string;
    webhookUrl?: string;
    debugLogging: boolean;
  };
  penaltySettings: {
    penaltyRate: number;
    penaltyType: 'per_day' | 'per_week' | 'fixed_total';
    effectiveFrom: string;
    lastUpdated?: string;
    updatedBy?: string;
  };
}

interface PenaltyHistoryEntry {
  id: string;
  penaltyRate: number;
  penaltyType: 'per_day' | 'per_week' | 'fixed_total';
  effectiveFrom: string;
  updatedAt: string;
  updatedBy: string;
}

// Default settings object to ensure all properties are always defined
const defaultAdvancedSettings: AdvancedSettingsData = {
  automationRules: {
    autoApproveSmallLoans: false,
    smallLoanThreshold: 10000,
    autoSendReminders: true,
    reminderFrequency: 3,
    autoDisableInactiveAccounts: false,
    inactivityThreshold: 90
  },
  backupSettings: {
    autoBackup: false,
    backupFrequency: 'daily',
    backupTime: '00:00',
    retentionPeriod: 30
  },
  developerSettings: {
    developerMode: false,
    apiEnabled: false,
    apiKey: '',
    webhookUrl: '',
    debugLogging: false
  },
  penaltySettings: {
    penaltyRate: 2.0,
    penaltyType: 'per_day',
    effectiveFrom: new Date().toISOString().split('T')[0],
    lastUpdated: new Date().toISOString(),
    updatedBy: 'admin'
  }
};

// Default penalty history to ensure it's always an array
const defaultPenaltyHistory: PenaltyHistoryEntry[] = [{
  id: '1',
  penaltyRate: 2.0,
  penaltyType: 'per_day',
  effectiveFrom: new Date().toISOString().split('T')[0],
  updatedAt: new Date().toISOString(),
  updatedBy: 'admin'
}];

// Deep merge function to combine default settings with saved settings
function deepMerge(target: any, source: any): any {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  
  return result;
}

export default function AdvancedSettings({ onSave, onError }: AdvancedSettingsProps) {
  // Load settings from localStorage or use defaults
  const loadSettings = (): AdvancedSettingsData => {
    const savedSettings = localStorage.getItem('lms_advanced_settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        // Deep merge with defaults to ensure all properties exist
        return deepMerge(defaultAdvancedSettings, parsedSettings);
      } catch (e) {
        console.error('Error parsing advanced settings:', e);
      }
    }
    
    // Return default settings if no saved settings or parsing failed
    return { ...defaultAdvancedSettings };
  };

  // Load penalty history from localStorage or use defaults
  const loadPenaltyHistory = (): PenaltyHistoryEntry[] => {
    const savedHistory = localStorage.getItem('lms_penalty_history');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        return Array.isArray(parsedHistory) ? parsedHistory : [...defaultPenaltyHistory];
      } catch (e) {
        console.error('Error parsing penalty history:', e);
      }
    }
    
    // Return default history
    return [...defaultPenaltyHistory];
  };

  const [settings, setSettings] = useState<AdvancedSettingsData>(loadSettings());
  const [penaltyHistory, setPenaltyHistory] = useState<PenaltyHistoryEntry[]>(loadPenaltyHistory());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [restoreInProgress, setRestoreInProgress] = useState(false);
  const [penaltyRateError, setPenaltyRateError] = useState('');

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('lms_advanced_settings', JSON.stringify(settings));
  }, [settings]);

  // Save penalty history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('lms_penalty_history', JSON.stringify(penaltyHistory));
  }, [penaltyHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate penalty rate
      if (settings.penaltySettings.penaltyRate < 0 || settings.penaltySettings.penaltyRate > 100) {
        setPenaltyRateError('Penalty rate must be between 0% and 100%');
        setIsSubmitting(false);
        return;
      }
      
      // Clear any previous errors
      setPenaltyRateError('');
      
      // Check if penalty settings have changed
      const currentSettings = loadSettings();
      if (
        currentSettings.penaltySettings.penaltyRate !== settings.penaltySettings.penaltyRate ||
        currentSettings.penaltySettings.penaltyType !== settings.penaltySettings.penaltyType ||
        currentSettings.penaltySettings.effectiveFrom !== settings.penaltySettings.effectiveFrom
      ) {
        // Add to history
        const newHistoryEntry: PenaltyHistoryEntry = {
          id: Date.now().toString(),
          penaltyRate: settings.penaltySettings.penaltyRate,
          penaltyType: settings.penaltySettings.penaltyType,
          effectiveFrom: settings.penaltySettings.effectiveFrom,
          updatedAt: new Date().toISOString(),
          updatedBy: 'admin' // This would come from the auth context in a real app
        };
        
        setPenaltyHistory([newHistoryEntry, ...penaltyHistory]);
        
        // Update last updated info
        setSettings({
          ...settings,
          penaltySettings: {
            ...settings.penaltySettings,
            lastUpdated: new Date().toISOString(),
            updatedBy: 'admin' // This would come from the auth context in a real app
          }
        });
      }
      
      // Save settings to localStorage
      localStorage.setItem('lms_advanced_settings', JSON.stringify({
        ...settings,
        penaltySettings: {
          ...settings.penaltySettings,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'admin' // This would come from the auth context in a real app
        }
      }));
      
      // Log the change for audit
      const auditLog = {
        action: 'update_advanced_settings',
        timestamp: new Date().toISOString(),
        user: 'admin', // This would come from the auth context in a real app
        changes: settings
      };
      
      console.log('Settings updated:', auditLog);
      
      // Notify success
      onSave('Advanced settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      onError('Failed to save advanced settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({ ...defaultAdvancedSettings });
    onSave('Settings reset to defaults');
  };

  const generateApiKey = () => {
    // Generate a random API key
    const apiKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    setSettings({
      ...settings,
      developerSettings: {
        ...settings.developerSettings,
        apiKey
      }
    });
  };

  const handleBackupNow = () => {
    setBackupInProgress(true);
    
    // Simulate backup process
    setTimeout(() => {
      // Get all data from localStorage
      const data = {
        customers: localStorage.getItem('lms_customers'),
        loans: localStorage.getItem('lms_loans'),
        repayments: localStorage.getItem('lms_repayments'),
        users: localStorage.getItem('lms_users'),
        loginLogs: localStorage.getItem('lms_login_logs'),
        emailContacts: localStorage.getItem('lms_email_contacts'),
        emailSyncConfig: localStorage.getItem('lms_email_sync_config'),
        generalSettings: localStorage.getItem('lms_general_settings'),
        notificationSettings: localStorage.getItem('lms_notification_settings'),
        securitySettings: localStorage.getItem('lms_security_settings'),
        advancedSettings: localStorage.getItem('lms_advanced_settings'),
        penaltyHistory: localStorage.getItem('lms_penalty_history')
      };
      
      // Create a JSON blob and trigger download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `loanmanager_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Update last backup date
      setSettings({
        ...settings,
        backupSettings: {
          ...settings.backupSettings,
          lastBackupDate: new Date().toISOString()
        }
      });
      
      setBackupInProgress(false);
      onSave('Backup completed successfully');
    }, 2000);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setRestoreInProgress(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        // Restore data to localStorage
        Object.entries(data).forEach(([key, value]) => {
          if (value) {
            localStorage.setItem(key, value as string);
          }
        });
        
        onSave('Backup restored successfully. Please refresh the page.');
      } catch (error) {
        console.error('Error restoring backup:', error);
        onError('Failed to restore backup. Invalid backup file.');
      } finally {
        setRestoreInProgress(false);
      }
    };
    
    reader.readAsText(file);
  };

  const restorePenaltyRate = (historyEntry: PenaltyHistoryEntry) => {
    setSettings({
      ...settings,
      penaltySettings: {
        ...settings.penaltySettings,
        penaltyRate: historyEntry.penaltyRate,
        penaltyType: historyEntry.penaltyType,
        effectiveFrom: new Date().toISOString().split('T')[0] // Set to today
      }
    });
    
    onSave('Previous penalty rate restored');
  };

  const getPenaltyTypeLabel = (type: string) => {
    switch (type) {
      case 'per_day': return 'Per Day';
      case 'per_week': return 'Per Week';
      case 'fixed_total': return 'Fixed Total';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Advanced Settings</h3>
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
        {/* Penalty Configuration */}
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-medium text-gray-800 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Penalty Configuration
          </h4>
          
          <div className="space-y-6">
            {/* Current Penalty Rate Display */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h5 className="font-medium text-blue-800 mb-2">Current Penalty Rate</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-blue-600">Rate</p>
                  <p className="text-xl font-bold text-blue-900">{settings.penaltySettings.penaltyRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Type</p>
                  <p className="text-xl font-bold text-blue-900">{getPenaltyTypeLabel(settings.penaltySettings.penaltyType)}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Effective From</p>
                  <p className="text-xl font-bold text-blue-900">{new Date(settings.penaltySettings.effectiveFrom).toLocaleDateString()}</p>
                </div>
              </div>
              {settings.penaltySettings.lastUpdated && (
                <p className="text-sm text-blue-600 mt-2">
                  Last updated: {new Date(settings.penaltySettings.lastUpdated).toLocaleString()} by {settings.penaltySettings.updatedBy}
                </p>
              )}
            </div>

            {/* Penalty Rate Input */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Penalty Rate (%) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={settings.penaltySettings.penaltyRate}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (isNaN(value)) return;
                      
                      setPenaltyRateError('');
                      setSettings({
                        ...settings,
                        penaltySettings: {
                          ...settings.penaltySettings,
                          penaltyRate: value
                        }
                      });
                    }}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      penaltyRateError ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {penaltyRateError && <p className="text-red-500 text-sm mt-1">{penaltyRateError}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Enter a value between 0% and 100%
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Penalty Type *
                </label>
                <select
                  value={settings.penaltySettings.penaltyType}
                  onChange={(e) => setSettings({
                    ...settings,
                    penaltySettings: {
                      ...settings.penaltySettings,
                      penaltyType: e.target.value as 'per_day' | 'per_week' | 'fixed_total'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="per_day">Per Day</option>
                  <option value="per_week">Per Week</option>
                  <option value="fixed_total">Fixed Total</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  How the penalty is calculated
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effective From
                </label>
                <input
                  type="date"
                  value={settings.penaltySettings.effectiveFrom}
                  onChange={(e) => setSettings({
                    ...settings,
                    penaltySettings: {
                      ...settings.penaltySettings,
                      effectiveFrom: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Date from which the new rate applies
                </p>
              </div>
            </div>

            {/* Penalty Rate Description */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                {settings.penaltySettings.penaltyType === 'per_day' && (
                  <>This penalty of {settings.penaltySettings.penaltyRate}% is charged on overdue EMI per day.</>
                )}
                {settings.penaltySettings.penaltyType === 'per_week' && (
                  <>This penalty of {settings.penaltySettings.penaltyRate}% is charged on overdue EMI per week.</>
                )}
                {settings.penaltySettings.penaltyType === 'fixed_total' && (
                  <>This is a fixed penalty of {settings.penaltySettings.penaltyRate}% charged once on the overdue amount.</>
                )}
              </p>
            </div>

            {/* Penalty History */}
            <div>
              <h5 className="font-medium text-gray-800 mb-2">Penalty Rate History</h5>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effective From</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {penaltyHistory.slice(0, 5).map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(entry.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {entry.penaltyRate}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getPenaltyTypeLabel(entry.penaltyType)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(entry.effectiveFrom).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.updatedBy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => restorePenaltyRate(entry)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Restore
                          </button>
                        </td>
                      </tr>
                    ))}
                    {penaltyHistory.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          No history available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Automation Rules */}
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-medium text-gray-800 mb-4 flex items-center">
            <Code className="w-5 h-5 mr-2" />
            Automation Rules
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">Auto-approve Small Loans</p>
                <p className="text-sm text-gray-600">Automatically approve loans under threshold</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.automationRules.autoApproveSmallLoans}
                  onChange={(e) => setSettings({
                    ...settings,
                    automationRules: {
                      ...settings.automationRules,
                      autoApproveSmallLoans: e.target.checked
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {settings.automationRules.autoApproveSmallLoans && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Small Loan Threshold (LKR)
                </label>
                <input
                  type="number"
                  min="1000"
                  max="100000"
                  value={settings.automationRules.smallLoanThreshold}
                  onChange={(e) => setSettings({
                    ...settings,
                    automationRules: {
                      ...settings.automationRules,
                      smallLoanThreshold: Number(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Loans below this amount will be automatically approved
                </p>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">Auto-send Overdue Reminders</p>
                <p className="text-sm text-gray-600">Automatically send reminders for overdue loans</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.automationRules.autoSendReminders}
                  onChange={(e) => setSettings({
                    ...settings,
                    automationRules: {
                      ...settings.automationRules,
                      autoSendReminders: e.target.checked
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {settings.automationRules.autoSendReminders && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder Frequency (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.automationRules.reminderFrequency}
                  onChange={(e) => setSettings({
                    ...settings,
                    automationRules: {
                      ...settings.automationRules,
                      reminderFrequency: Number(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Send reminders every X days for overdue payments
                </p>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">Auto-disable Inactive Accounts</p>
                <p className="text-sm text-gray-600">Automatically disable accounts after period of inactivity</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.automationRules.autoDisableInactiveAccounts}
                  onChange={(e) => setSettings({
                    ...settings,
                    automationRules: {
                      ...settings.automationRules,
                      autoDisableInactiveAccounts: e.target.checked
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {settings.automationRules.autoDisableInactiveAccounts && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inactivity Threshold (days)
                </label>
                <input
                  type="number"
                  min="30"
                  max="365"
                  value={settings.automationRules.inactivityThreshold}
                  onChange={(e) => setSettings({
                    ...settings,
                    automationRules: {
                      ...settings.automationRules,
                      inactivityThreshold: Number(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Disable accounts after this many days of inactivity
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Backup & Data Export */}
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-medium text-gray-800 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Backup & Data Export
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">Automatic Backups</p>
                <p className="text-sm text-gray-600">Schedule regular database backups</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.backupSettings.autoBackup}
                  onChange={(e) => setSettings({
                    ...settings,
                    backupSettings: {
                      ...settings.backupSettings,
                      autoBackup: e.target.checked
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {settings.backupSettings.autoBackup && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Frequency
                  </label>
                  <select
                    value={settings.backupSettings.backupFrequency}
                    onChange={(e) => setSettings({
                      ...settings,
                      backupSettings: {
                        ...settings.backupSettings,
                        backupFrequency: e.target.value as 'daily' | 'weekly' | 'monthly'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Time
                  </label>
                  <input
                    type="time"
                    value={settings.backupSettings.backupTime}
                    onChange={(e) => setSettings({
                      ...settings,
                      backupSettings: {
                        ...settings.backupSettings,
                        backupTime: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retention Period (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={settings.backupSettings.retentionPeriod}
                    onChange={(e) => setSettings({
                      ...settings,
                      backupSettings: {
                        ...settings.backupSettings,
                        retentionPeriod: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <button
                type="button"
                onClick={handleBackupNow}
                disabled={backupInProgress}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {backupInProgress ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Backing up...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Backup Now
                  </>
                )}
              </button>
              
              <div className="relative">
                <input
                  type="file"
                  id="restore-backup"
                  accept=".json"
                  onChange={handleRestoreBackup}
                  className="hidden"
                  disabled={restoreInProgress}
                />
                <label
                  htmlFor="restore-backup"
                  className={`px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center cursor-pointer ${
                    restoreInProgress ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {restoreInProgress ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Restoring...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Restore Backup
                    </>
                  )}
                </label>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  // Export all logs
                  const logs = localStorage.getItem('lms_login_logs') || '[]';
                  const blob = new Blob([logs], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `system_logs_${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export Logs
              </button>
            </div>
            
            {settings.backupSettings.lastBackupDate && (
              <div className="mt-2 text-sm text-gray-600">
                Last backup: {new Date(settings.backupSettings.lastBackupDate).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Developer Settings */}
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-medium text-gray-800 mb-4 flex items-center">
            <Code className="w-5 h-5 mr-2" />
            Developer Settings
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">Developer Mode</p>
                <p className="text-sm text-gray-600">Enable advanced developer features</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.developerSettings.developerMode}
                  onChange={(e) => setSettings({
                    ...settings,
                    developerSettings: {
                      ...settings.developerSettings,
                      developerMode: e.target.checked
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {settings.developerSettings.developerMode && (
              <>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">API Access</p>
                    <p className="text-sm text-gray-600">Enable API access for external integrations</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.developerSettings.apiEnabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        developerSettings: {
                          ...settings.developerSettings,
                          apiEnabled: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {settings.developerSettings.apiEnabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key
                      </label>
                      <div className="flex space-x-2">
                        <div className="relative flex-1">
                          <input
                            type={showApiKey ? "text" : "password"}
                            value={settings.developerSettings.apiKey || ''}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={generateApiKey}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Generate
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Keep this key secret. Regenerate if compromised.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Webhook URL
                      </label>
                      <input
                        type="url"
                        value={settings.developerSettings.webhookUrl || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          developerSettings: {
                            ...settings.developerSettings,
                            webhookUrl: e.target.value
                          }
                        })}
                        placeholder="https://example.com/webhook"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        URL to receive webhook notifications for system events
                      </p>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Debug Logging</p>
                    <p className="text-sm text-gray-600">Enable detailed logging for troubleshooting</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.developerSettings.debugLogging}
                      onChange={(e) => setSettings({
                        ...settings,
                        developerSettings: {
                          ...settings.developerSettings,
                          debugLogging: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Warning for Developer Mode */}
        {settings.developerSettings.developerMode && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Developer Mode Warning</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Developer mode and API access should only be enabled in secure environments. 
                  These settings can expose sensitive data and functionality if not properly secured.
                </p>
              </div>
            </div>
          </div>
        )}

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