import React, { useState, useEffect } from 'react';
import { Shield, Lock, Key, User, Clock, Save, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface SecuritySettingsProps {
  onSave: (message?: string) => void;
  onError: (message?: string) => void;
}

interface SecuritySettingsData {
  minPasswordLength: number;
  passwordComplexity: 'low' | 'medium' | 'high';
  maxLoginAttempts: number;
  lockDuration: number;
  sessionTimeout: number;
  twoFactorEnabled: boolean;
  passwordExpiryDays: number;
  ipRestriction: boolean;
  allowedIPs: string[];
}

export default function SecuritySettings({ onSave, onError }: SecuritySettingsProps) {
  // Load settings from localStorage or use defaults
  const loadSettings = (): SecuritySettingsData => {
    const savedSettings = localStorage.getItem('lms_security_settings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error('Error parsing security settings:', e);
      }
    }
    
    // Default settings
    return {
      minPasswordLength: 8,
      passwordComplexity: 'medium',
      maxLoginAttempts: 3,
      lockDuration: 30,
      sessionTimeout: 60,
      twoFactorEnabled: false,
      passwordExpiryDays: 90,
      ipRestriction: false,
      allowedIPs: []
    };
  };

  const [settings, setSettings] = useState<SecuritySettingsData>(loadSettings());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newIP, setNewIP] = useState('');
  const [ipError, setIpError] = useState('');

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('lms_security_settings', JSON.stringify(settings));
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Save settings to localStorage
      localStorage.setItem('lms_security_settings', JSON.stringify(settings));
      
      // Log the change for audit
      const auditLog = {
        action: 'update_security_settings',
        timestamp: new Date().toISOString(),
        user: 'admin', // This would come from the auth context in a real app
        changes: settings
      };
      
      console.log('Settings updated:', auditLog);
      
      // Notify success
      onSave('Security settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      onError('Failed to save security settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      minPasswordLength: 8,
      passwordComplexity: 'medium',
      maxLoginAttempts: 3,
      lockDuration: 30,
      sessionTimeout: 60,
      twoFactorEnabled: false,
      passwordExpiryDays: 90,
      ipRestriction: false,
      allowedIPs: []
    };
    
    setSettings(defaultSettings as SecuritySettingsData);
    onSave('Settings reset to defaults');
  };

  const addIP = () => {
    // Validate IP address format
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    if (!ipRegex.test(newIP)) {
      setIpError('Please enter a valid IP address');
      return;
    }
    
    if (settings.allowedIPs.includes(newIP)) {
      setIpError('This IP address is already in the list');
      return;
    }
    
    setSettings({
      ...settings,
      allowedIPs: [...settings.allowedIPs, newIP]
    });
    setNewIP('');
    setIpError('');
  };

  const removeIP = (ip: string) => {
    setSettings({
      ...settings,
      allowedIPs: settings.allowedIPs.filter(item => item !== ip)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Security Settings</h3>
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
        {/* Password Settings */}
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-medium text-gray-800 mb-4 flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Password Settings
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Password Length
              </label>
              <input
                type="number"
                min="6"
                max="20"
                value={settings.minPasswordLength}
                onChange={(e) => setSettings({...settings, minPasswordLength: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum number of characters required for passwords
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Complexity
              </label>
              <select
                value={settings.passwordComplexity}
                onChange={(e) => setSettings({...settings, passwordComplexity: e.target.value as 'low' | 'medium' | 'high'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low (Letters and numbers)</option>
                <option value="medium">Medium (Letters, numbers, and at least one uppercase)</option>
                <option value="high">High (Letters, numbers, uppercase, and special characters)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Expiry (days)
              </label>
              <input
                type="number"
                min="0"
                max="365"
                value={settings.passwordExpiryDays}
                onChange={(e) => setSettings({...settings, passwordExpiryDays: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of days before passwords expire (0 = never)
              </p>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Require 2FA for all admin users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.twoFactorEnabled}
                  onChange={(e) => setSettings({...settings, twoFactorEnabled: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Login Security */}
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-medium text-gray-800 mb-4 flex items-center">
            <Lock className="w-5 h-5 mr-2" />
            Login Security
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Failed Login Attempts
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.maxLoginAttempts}
                onChange={(e) => setSettings({...settings, maxLoginAttempts: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of failed attempts before account is locked
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Lock Duration (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="1440"
                value={settings.lockDuration}
                onChange={(e) => setSettings({...settings, lockDuration: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Duration to lock account after max failed attempts
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="1440"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({...settings, sessionTimeout: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Automatically log out inactive users after this period
              </p>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">IP Restriction</p>
                <p className="text-sm text-gray-600">Restrict login to specific IP addresses</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.ipRestriction}
                  onChange={(e) => setSettings({...settings, ipRestriction: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* IP Whitelist (if IP restriction is enabled) */}
        {settings.ipRestriction && (
          <div className="bg-white p-6 rounded-lg border">
            <h4 className="font-medium text-gray-800 mb-4">IP Whitelist</h4>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newIP}
                  onChange={(e) => {
                    setNewIP(e.target.value);
                    setIpError('');
                  }}
                  placeholder="Enter IP address (e.g., 192.168.1.1)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addIP}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add IP
                </button>
              </div>
              
              {ipError && (
                <p className="text-sm text-red-600">{ipError}</p>
              )}
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {settings.allowedIPs.length > 0 ? (
                  settings.allowedIPs.map((ip) => (
                    <div key={ip} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm font-mono">{ip}</span>
                      <button
                        type="button"
                        onClick={() => removeIP(ip)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">No IP addresses added</p>
                )}
              </div>
              
              <p className="text-xs text-gray-500">
                Only users connecting from these IP addresses will be able to log in
              </p>
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