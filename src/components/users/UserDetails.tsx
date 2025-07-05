import React from 'react';
import { X, Shield, Mail, Phone, Calendar, Clock, AlertTriangle, CheckCircle, User as UserIcon, Building } from 'lucide-react';
import { User } from '../../types';

interface UserDetailsProps {
  user: User;
  onClose: () => void;
  onEdit: () => void;
}

export default function UserDetails({ user, onClose, onEdit }: UserDetailsProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'officer': return 'bg-blue-100 text-blue-800';
      case 'clerk': return 'bg-green-100 text-green-800';
      case 'customer': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (user: User) => {
    if (user.isLocked) return 'bg-red-100 text-red-800';
    if (!user.isActive) return 'bg-gray-100 text-gray-800';
    if (user.isOnline) return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (user: User) => {
    if (user.isLocked) return 'Locked';
    if (!user.isActive) return 'Inactive';
    if (user.isOnline) return 'Online';
    return 'Offline';
  };

  const rolePermissions = {
    admin: ['User Management', 'Loan Management', 'Customer Management', 'Reports', 'System Settings'],
    officer: ['Loan Management', 'Customer Management', 'Loan Approval', 'Disbursement', 'Reports'],
    clerk: ['Customer Management', 'Data Entry', 'Basic Reports'],
    customer: ['View Loans', 'Apply Loan', 'Make Payment']
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Details</h2>
          <p className="text-gray-600">Complete user profile and system information</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* User Profile Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-6">
              <h3 className="text-2xl font-bold text-gray-800">{user.name}</h3>
              <p className="text-gray-600">@{user.username}</p>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center space-x-3 mt-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(user)}`}>
                  {getStatusText(user)}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">User ID</p>
            <p className="font-mono text-gray-800">{user.id}</p>
            <p className="text-sm text-gray-600 mt-2">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Personal Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Email Address</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
              {user.department && (
                <div className="flex items-center">
                  <Building className="w-4 h-4 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="font-medium">{user.department}</p>
                  </div>
                </div>
              )}
              {user.employeeId && (
                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Employee ID</p>
                    <p className="font-medium">{user.employeeId}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Account Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="font-medium">Account Status</span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${user.isLocked ? 'bg-red-500' : 'bg-green-500'}`} />
                  <span className="font-medium">Account Lock</span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.isLocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {user.isLocked ? 'Locked' : 'Unlocked'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="font-medium">Online Status</span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {user.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {user.failedLoginAttempts && user.failedLoginAttempts > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-red-500 mr-3" />
                    <span className="font-medium text-red-800">Failed Login Attempts</span>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                    {user.failedLoginAttempts}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Activity Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Account Created</p>
                  <p className="font-medium">{new Date(user.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium">
                    {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Last Login</p>
                  <p className="font-medium">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
              {user.lastLogout && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Last Logout</p>
                    <p className="font-medium">{new Date(user.lastLogout).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-gray-500 mr-3" />
                  <span className="font-medium">Two-Factor Authentication</span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 text-gray-500 mr-3" />
                  <span className="font-medium">Password Change Required</span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.requirePasswordChange ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                  {user.requirePasswordChange ? 'Required' : 'Not Required'}
                </span>
              </div>

              {user.passwordLastChanged && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Password Last Changed</p>
                    <p className="font-medium">{new Date(user.passwordLastChanged).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Role Permissions */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Role Permissions
            </h3>
            <div className="space-y-2">
              {rolePermissions[user.role as keyof typeof rolePermissions]?.map((permission) => (
                <div key={permission} className="flex items-center p-2 bg-blue-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-blue-600 mr-3" />
                  <span className="text-blue-800 font-medium">{permission}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
        <button
          onClick={onEdit}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Edit User
        </button>
      </div>
    </div>
  );
}