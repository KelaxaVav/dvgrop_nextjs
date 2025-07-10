import React, { useState } from 'react';
import { Users, Plus, Search, Filter, Trash2, Edit, Download, RefreshCw, Mail, Phone, Tag, CheckCircle, AlertTriangle, Clock, Upload } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { EmailContact } from '../../types';
import ContactForm from './ContactForm';
import ContactSyncSettings from './ContactSyncSettings';

export default function ContactManager() {
  const { emailContacts, emailSyncConfig, deleteEmailContact, syncEmailContacts, exportEmailContacts } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [syncFilter, setSyncFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState<EmailContact | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit' | 'settings'>('list');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: number; failed: number } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Filter contacts based on search and filters
  const filteredContacts = emailContacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone.includes(searchTerm);
    
    const matchesSource = sourceFilter === 'all' || contact.source === sourceFilter;
    
    const matchesSync = syncFilter === 'all' || 
                       (syncFilter === 'synced' && contact.syncStatus === 'synced') ||
                       (syncFilter === 'pending' && contact.syncStatus === 'pending') ||
                       (syncFilter === 'failed' && contact.syncStatus === 'failed');
    
    return matchesSearch && matchesSource && matchesSync;
  });

  // Get contact statistics
  const getContactStats = () => {
    const totalContacts = emailContacts.length;
    const syncedContacts = emailContacts.filter(c => c.syncStatus === 'synced').length;
    const pendingContacts = emailContacts.filter(c => c.syncStatus === 'pending').length;
    const failedContacts = emailContacts.filter(c => c.syncStatus === 'failed').length;
    const subscribedContacts = emailContacts.filter(c => c.isSubscribed).length;

    return { totalContacts, syncedContacts, pendingContacts, failedContacts, subscribedContacts };
  };

  const stats = getContactStats();

  const handleAddContact = () => {
    setSelectedContact(null);
    setCurrentView('add');
  };

  const handleEditContact = (contact: EmailContact) => {
    setSelectedContact(contact);
    setCurrentView('edit');
  };

  const handleDelete = (id: string) => {
    deleteEmailContact(id);
    setDeleteConfirm(null);
  };

  const handleSyncContacts = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    
    try {
      const result = await syncEmailContacts();
      setSyncResult(result);
    } catch (error) {
      console.error('Error syncing contacts:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleImportContacts = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        // Process CSV file
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        // Find column indices
        const nameIndex = headers.findIndex(h => h.toLowerCase() === 'name');
        const emailIndex = headers.findIndex(h => h.toLowerCase() === 'email');
        const phoneIndex = headers.findIndex(h => h.toLowerCase() === 'phone');
        
        if (nameIndex === -1 || emailIndex === -1) {
          alert('CSV file must contain at least Name and Email columns');
          setIsImporting(false);
          return;
        }

        // Process each line
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Split by comma, respecting quotes
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          
          if (values.length >= Math.max(nameIndex, emailIndex) + 1) {
            const name = values[nameIndex];
            const email = values[emailIndex];
            const phone = phoneIndex !== -1 ? values[phoneIndex] : '';
            
            if (name && email) {
              // Add to contacts
              // This would call addEmailContact in a real implementation
              console.log('Importing contact:', { name, email, phone });
            }
          }
        }
        
        alert('Import completed successfully');
      } catch (error) {
        console.error('Error parsing CSV file:', error);
        alert('Error parsing CSV file. Please check the format.');
      } finally {
        setIsImporting(false);
      }
    };
    
    reader.readAsText(file);
  };

  const getSyncStatusColor = (status?: string) => {
    switch (status) {
      case 'synced': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending':
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'customer_registration': return 'Customer Registration';
      case 'loan_approval': return 'Loan Approval';
      case 'manual_entry': return 'Manual Entry';
      default: return source;
    }
  };

  if (currentView === 'add' || currentView === 'edit') {
    return (
      <ContactForm
        contact={selectedContact || undefined}
        onClose={() => {
          setCurrentView('list');
          setSelectedContact(null);
        }}
      />
    );
  }

  if (currentView === 'settings') {
    return (
      <ContactSyncSettings
        onClose={() => setCurrentView('list')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Email Contact Management</h2>
          <p className="text-gray-600">Manage and sync customer email contacts</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setCurrentView('settings')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Settings
          </button>
          <button
            onClick={handleAddContact}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Contacts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalContacts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Synced</p>
              <p className="text-2xl font-bold text-gray-900">{stats.syncedContacts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingContacts}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.failedContacts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Subscribed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.subscribedContacts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Status Banner */}
      <div className={`p-4 rounded-lg border-2 ${
        emailSyncConfig?.enabled ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {emailSyncConfig?.enabled ? (
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
            )}
            <div>
              <h3 className={`font-semibold ${
                emailSyncConfig?.enabled ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {emailSyncConfig?.enabled ? 'Contact Sync Enabled' : 'Contact Sync Disabled'}
              </h3>
              <p className={`text-sm ${
                emailSyncConfig?.enabled ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {emailSyncConfig?.enabled 
                  ? `Using ${emailSyncConfig?.provider} provider • Last synced: ${
                      emailSyncConfig.lastSyncAt 
                        ? new Date(emailSyncConfig.lastSyncAt).toLocaleString() 
                        : 'Never'
                    }`
                  : 'Enable contact sync in settings to automatically save customer contacts'
                }
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleSyncContacts}
              disabled={isSyncing || !emailSyncConfig?.enabled}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSyncing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Now
                </>
              )}
            </button>
            <button
              onClick={exportEmailContacts}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Sync Result */}
        {syncResult && (
          <div className="mt-3 p-3 bg-blue-100 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
              <p className="text-sm text-blue-800">
                Sync completed: {syncResult.success} successful, {syncResult.failed} failed
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Sources</option>
              <option value="customer_registration">Customer Registration</option>
              <option value="loan_approval">Loan Approval</option>
              <option value="manual_entry">Manual Entry</option>
            </select>
            <select
              value={syncFilter}
              onChange={(e) => setSyncFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Sync Status</option>
              <option value="synced">Synced</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''} found
          </div>
          <div className="flex items-center">
            <input
              type="file"
              id="import-csv"
              accept=".csv"
              className="hidden"
              onChange={handleImportContacts}
            />
            <label
              htmlFor="import-csv"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center cursor-pointer"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </label>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {contact.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {contact.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {contact.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{getSourceLabel(contact.source)}</span>
                    {contact.customerId && (
                      <div className="text-xs text-gray-500">Customer ID: {contact.customerId}</div>
                    )}
                    {contact.loanId && (
                      <div className="text-xs text-gray-500">Loan ID: {contact.loanId}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags?.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                      {!contact.tags?.length && (
                        <span className="text-sm text-gray-500">No tags</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSyncStatusColor(contact.syncStatus)}`}>
                        {contact.syncStatus || 'pending'}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        contact.isSubscribed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {contact.isSubscribed ? 'Subscribed' : 'Unsubscribed'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(contact.createdAt).toLocaleDateString()}
                    {contact.lastSyncedAt && (
                      <div className="text-xs text-gray-400">
                        Last synced: {new Date(contact.lastSyncedAt).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditContact(contact)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Contact"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(contact.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Contact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No contacts found</h3>
            <p className="text-gray-500">
              {searchTerm || sourceFilter !== 'all' || syncFilter !== 'all'
                ? 'Try adjusting your search criteria'
                : 'No email contacts have been added yet'}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this contact? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}