import { RouteObject } from 'react-router';
import HomePage from './pages/index';
import AboutPage from './pages/about';
import ProductsPage from './pages/products';
import BenefitsPage from './pages/benefits';
import FranchisePage from './pages/franchise';
import FranchiseProcessPage from './pages/franchise-process';
import FAQPage from './pages/faq';
import ContactPage from './pages/contact';
import ApplyPage from './pages/apply';
import ApplicationStatusPage from './pages/application-status';
import LoginPage from './pages/login';
import DashboardPage from './pages/dashboard/index';
import DashboardProgressPage from './pages/dashboard/progress';
import DashboardPaymentsPage from './pages/dashboard/payments';
import DashboardInvoicesPage from './pages/dashboard/invoices';
import DashboardDocumentsPage from './pages/dashboard/documents';
import DashboardNotificationsPage from './pages/dashboard/notifications';
import DashboardSupportPage from './pages/dashboard/support';
import DashboardProfilePage from './pages/dashboard/profile';
import DashboardPasswordPage from './pages/dashboard/password';
import DashboardStockPage from './pages/dashboard/stock';
import DashboardDeliveryPage from './pages/dashboard/delivery';
import AdminPage from './pages/admin/index';
// Eager import so renderToString doesn't hit a Suspense boundary on 404 routes
import ProdNotFoundPage from './pages/_404';

const NotFoundPage = ProdNotFoundPage;

export const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/products', element: <ProductsPage /> },
  { path: '/benefits', element: <BenefitsPage /> },
  { path: '/franchise', element: <FranchisePage /> },
  { path: '/franchise-process', element: <FranchiseProcessPage /> },
  { path: '/faq', element: <FAQPage /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '/apply', element: <ApplyPage /> },
  { path: '/application-status', element: <ApplicationStatusPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/dashboard/progress', element: <DashboardProgressPage /> },
  { path: '/dashboard/payments', element: <DashboardPaymentsPage /> },
  { path: '/dashboard/invoices', element: <DashboardInvoicesPage /> },
  { path: '/dashboard/documents', element: <DashboardDocumentsPage /> },
  { path: '/dashboard/notifications', element: <DashboardNotificationsPage /> },
  { path: '/dashboard/support', element: <DashboardSupportPage /> },
  { path: '/dashboard/profile', element: <DashboardProfilePage /> },
  { path: '/dashboard/password', element: <DashboardPasswordPage /> },
  { path: '/dashboard/stock', element: <DashboardStockPage /> },
  { path: '/dashboard/delivery', element: <DashboardDeliveryPage /> },
  { path: '/admin', element: <AdminPage /> },
  {
    id: 'airo-not-found',
    path: '*',
    element: <NotFoundPage />,
  },
];

export type Path = '/' | '/about' | '/products' | '/benefits' | '/franchise' | '/franchise-process' | '/faq' | '/contact' | '/apply' | '/application-status' | '/login' | '/dashboard';
export type Params = Record<string, string | undefined>;
