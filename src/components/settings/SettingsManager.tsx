import React, { useState } from 'react';
import { 
  Settings, 
  Bell, 
  Shield, 
  Code, 
  Save, 
  RefreshCw, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Building, 
  Phone, 
  Mail, 
  Key, 
  Lock, 
  FileText,
  Database,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import GeneralSettings from './GeneralSettings';
import NotificationSettings from './NotificationSettings';
import SecuritySettings from './SecuritySettings';
import AdvancedSettings from './AdvancedSettings';
import CollectionDaysCounter from './CollectionDaysCounter';

export default function SettingsManager() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'advanced' | 'collection-days'>('general');
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Only admins can access settings
  if (user?.role !== 'admin' && !(user?.role === 'officer' && activeTab === 'collection-days')) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-600 mb-2">Access Denied</h3>
        <p className="text-gray-500">You don't have permission to access system settings.</p>
      </div>
    );
  }

  const handleSaveSettings = (message: string = 'Settings saved successfully') => {
    setSaveStatus({ success: true, message });
    
    // Clear the message after 3 seconds
    setTimeout(() => {
      setSaveStatus(null);
    }, 3000);
  };

  const handleSaveError = (message: string = 'Error saving settings') => {
    setSaveStatus({ success: false, message });
    
    // Clear the message after 3 seconds
    setTimeout(() => {
      setSaveStatus(null);
    }, 3000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings onSave={handleSaveSettings} onError={handleSaveError} />;
      case 'notifications':
        return <NotificationSettings onSave={handleSaveSettings} onError={handleSaveError} />;
      case 'security':
        return <SecuritySettings onSave={handleSaveSettings} onError={handleSaveError} />;
      case 'advanced':
        return <AdvancedSettings onSave={handleSaveSettings} onError={handleSaveError} />;
      case 'collection-days':
        return <CollectionDaysCounter onSave={handleSaveSettings} onError={handleSaveError} />;
      default:
        return <GeneralSettings onSave={handleSaveSettings} onError={handleSaveError} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
          <p className="text-gray-600">Configure application settings and preferences</p>
        </div>
      </div>

      {/* Save Status Toast */}
      {saveStatus && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center ${
          saveStatus.success ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'
        }`}>
          {saveStatus.success ? (
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
          )}
          <p className={saveStatus.success ? 'text-green-800' : 'text-red-800'}>
            {saveStatus.message}
          </p>
        </div>
      )}

      {/* Settings Tabs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b">
          <div className="flex flex-wrap">
            {[
              { key: 'general', label: 'General', icon: Settings, roles: ['admin'] },
              { key: 'notifications', label: 'Notifications', icon: Bell, roles: ['admin'] },
              { key: 'security', label: 'Security', icon: Shield, roles: ['admin'] },
              { key: 'advanced', label: 'Advanced', icon: Code, roles: ['admin'] },
              { key: 'collection-days', label: 'Collection Days', icon: Calendar, roles: ['admin', 'officer'] }
            ].map((tab) => {
              const Icon = tab.icon;
              // Only show tabs the user has access to
              if (!tab.roles.includes(user?.role || '')) {
                return null;
              }
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center py-4 px-6 border-b-2 font-medium ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}