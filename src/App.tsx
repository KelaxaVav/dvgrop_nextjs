import Dashboard from './components/Dashboard';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProtectedRoute from './layout/protected_route';
import DefaultLayout from './layout/default_layout';
import Login from './components/login/login';
import CustomerManager from './components/customers/CustomerManager';
import LoanManager from './components/loans/LoanManager';
import ApprovalManager from './components/approvals/ApprovalManager';
import DisbursementManager from './components/disbursements/DisbursementManager';
import RepaymentManager from './components/repayments/RepaymentManager';
import LoanPaymentManager from './components/payments/LoanPaymentManager';
import DailyPaymentView from './components/payments/DailyPaymentView';
import ReportsManager from './components/reports/ReportsManager';
import UserManager from './components/users/UserManager';
import SMSManager from './components/notifications/SMSManager';
import ContactManager from './components/contacts/ContactManager';
import SettingsManager from './components/settings/SettingsManager';

// function AppContent() {
//   const [currentPage, setCurrentPage] = useState('dashboard');

//   if (!isAuthenticated) {
//     return <Login />;
//   }

//   const renderPage = () => {
//     switch (currentPage) {
//       case 'dashboard':
//         return <Dashboard />;
//       case 'customers':
//         return <CustomerManager />;
//       case 'loans':
//         return <LoanManager />;
//       case 'approvals':
//         return <ApprovalManager />;
//       case 'disbursements':
//         return <DisbursementManager />;
//       case 'repayments':
//         return <RepaymentManager />;
//       case 'payments':
//         return <LoanPaymentManager />;
//       case 'daily-payments':
//         return <DailyPaymentView />;
//       case 'reports':
//         return <ReportsManager />;
//       case 'users':
//         return <UserManager />;
//       case 'notifications':
//         return <SMSManager />;
//       case 'contacts':
//         return <ContactManager />;
//       case 'settings':
//         return <SettingsManager />;
//       default:
//         return <Dashboard />;
//     }
//   };

//   return (
//     <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
//       {renderPage()}
//     </Layout>
//   );
// }

export default function App() {

 const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <ProtectedRoute><DefaultLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'customers', element: <CustomerManager /> },
      { path: 'loans', element: <LoanManager /> },
      { path: 'approvals', element: <ApprovalManager /> },
      { path: 'disbursements', element: <DisbursementManager /> },
      { path: 'repayments', element: <RepaymentManager /> },
      { path: 'payments', element: <LoanPaymentManager /> },
      { path: 'daily-payments', element: <DailyPaymentView /> },
      { path: 'reports', element: <ReportsManager /> },
      { path: 'users', element: <UserManager /> },
      { path: 'notifications', element: <SMSManager /> },
      { path: 'contacts', element: <ContactManager /> },
      { path: 'settings', element: <SettingsManager /> },
    ],
  },
]);


  return (
    <RouterProvider router={router} />
  );
}