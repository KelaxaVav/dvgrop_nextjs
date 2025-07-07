import Dashboard from './components/Dashboard';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProtectedRoute from './layout/protected_route';
import DefaultLayout from './layout/default_layout';
import Login from './components/login/Login';

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
      path: '/',
      element: <Dashboard />,

    },
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/',
      element: <ProtectedRoute><DefaultLayout /></ProtectedRoute>,
      children: [
        {
          index: true,
          element: <Dashboard />,
        },
       
        
      ],
    },
  ]);
  return (
    <RouterProvider router={router} />
  );
}