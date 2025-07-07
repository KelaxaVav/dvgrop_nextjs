import React, { useState } from 'react';
import {
  Users,
  FileText,
  CheckCircle,
  DollarSign,
  Calendar,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Shield,
  Home,
  CreditCard,
  MessageSquare,
  Mail
} from 'lucide-react';
import { ReduxState } from '../types/redux_state';
import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutAction } from '../redux/auth_slice';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'loans', label: 'Loan Applications', icon: FileText },
  { id: 'approvals', label: 'Approvals', icon: CheckCircle },
  { id: 'disbursements', label: 'Disbursements', icon: DollarSign },
  { id: 'repayments', label: 'Repayments', icon: Calendar },
  { id: 'payments', label: 'Loan Payments', icon: CreditCard },
  { id: 'daily-payments', label: 'Daily Payments', icon: Calendar },
  { id: 'notifications', label: 'SMS Notifications', icon: MessageSquare },
  { id: 'contacts', label: 'Email Contacts', icon: Mail },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'users', label: 'User Management', icon: Shield },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Layout({ children, currentPage }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = useSelector((state: ReduxState) => state.auth.user);
   const toggleSidebar = () => {
        setSidebarOpen(prev => !prev);
    };
  console.log({'user':user});
  
  const canAccess = (menuId: string) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'officer' && ['dashboard', 'customers', 'loans', 'approvals', 'disbursements', 'repayments', 'payments', 'daily-payments', 'notifications', 'contacts', 'reports', 'settings'].includes(menuId)) return true;
    if (user?.role === 'clerk' && ['dashboard', 'customers', 'loans', 'repayments', 'payments', 'daily-payments', 'notifications', 'contacts'].includes(menuId)) return true;
    return false;
  };

  const filteredMenuItems = menuItems.filter(item => canAccess(item.id));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    dispatch(logoutAction());
    navigate('/login');
  };
  console.log({'filteredMenuItems':filteredMenuItems});
  
  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={toggleSidebar} />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex items-center justify-between p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">LoanManager Pro</h1>
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                    navigate(item.id === 'dashboard' ? '/' : `/${item.id}`);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-6 py-3 text-left transition-colors ${currentPage === item.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-gray-50">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name.charAt(0)}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>

            <h2 className="text-lg font-semibold text-gray-800 capitalize">
              {currentPage.replace('-', ' ')}
            </h2>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}