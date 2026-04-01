import {
  createRouter,
  createRoute,
  createRootRoute,
  redirect,
  Outlet,
} from '@tanstack/react-router';
import { AppLayout } from './components/layout/AppLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { PlannerPage } from './pages/planner/PlannerPage';
import { ClientListPage } from './pages/clients/ClientListPage';
import { ClientCreatePage } from './pages/clients/ClientCreatePage';
import { ClientDetailPage } from './pages/clients/ClientDetailPage';
import { ClientEditPage } from './pages/clients/ClientEditPage';
import { ServiceListPage } from './pages/services/ServiceListPage';
import { ServiceCreatePage } from './pages/services/ServiceCreatePage';
import { ServiceDetailPage } from './pages/services/ServiceDetailPage';
import { ServiceEditPage } from './pages/services/ServiceEditPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { IntegrationsPage } from './pages/settings/IntegrationsPage';
import { InvoicesPage } from './pages/invoices/InvoicesPage';
import { EmployeeListPage } from './pages/employees/EmployeeListPage';
import { EmployeeCreatePage } from './pages/employees/EmployeeCreatePage';
import { EmployeeDetailPage } from './pages/employees/EmployeeDetailPage';
import { EmployeeEditPage } from './pages/employees/EmployeeEditPage';
import { AiAssistantPage } from './pages/ai/AiAssistantPage';
import { ReviewListPage } from './pages/reviews/ReviewListPage';
import { BookingPage } from './pages/booking/BookingPage';
import { LandingPage } from './pages/public/LandingPage';
import { SalonPage } from './pages/public/SalonPage';
import { PortalLayout } from './components/layout/PortalLayout';
import { PortalDashboard } from './pages/portal/PortalDashboard';
import { PortalAppointments } from './pages/portal/PortalAppointments';
import { PortalProfile } from './pages/portal/PortalProfile';
import { useAuthStore } from './stores/authStore';

// Root route
const rootRoute = createRootRoute({
  component: Outlet,
});

// Public landing page = root
const publicLandingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

// Auth layout route (redirects to /admin if already logged in)
const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'auth',
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: '/admin' });
    }
  },
  component: AuthLayout,
});

const loginRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/login',
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/register',
  component: RegisterPage,
});

// App layout route (redirects to /login if not authenticated)
const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app',
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
  component: AppLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/admin',
  component: DashboardPage,
});

const plannerRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/planner',
  component: PlannerPage,
});

const clientListRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/clients',
  component: ClientListPage,
});

const clientCreateRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/clients/new',
  component: ClientCreatePage,
});

const clientDetailRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/clients/$id',
  component: ClientDetailPage,
});

const clientEditRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/clients/$id/edit',
  component: ClientEditPage,
});

const serviceListRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/services',
  component: ServiceListPage,
});

const serviceCreateRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/services/new',
  component: ServiceCreatePage,
});

const serviceDetailRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/services/$id',
  component: ServiceDetailPage,
});

const serviceEditRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/services/$id/edit',
  component: ServiceEditPage,
});

const employeeListRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/employees',
  component: EmployeeListPage,
});

const employeeCreateRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/employees/new',
  component: EmployeeCreatePage,
});

const employeeDetailRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/employees/$id',
  component: EmployeeDetailPage,
});

const employeeEditRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/employees/$id/edit',
  component: EmployeeEditPage,
});

const reviewsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/reviews',
  component: ReviewListPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/settings',
  component: SettingsPage,
});

const integrationsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/integrations',
  component: IntegrationsPage,
});

const invoicesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/invoices',
  component: InvoicesPage,
});

const aiRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/ai',
  component: AiAssistantPage,
});

// Public routes (no auth, no layout)
const bookingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/booking/$locationId',
  component: BookingPage,
});

const salonLandingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/salon/$locationId',
  component: LandingPage,
});

const salonPageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/salon/$locationId/info',
  component: SalonPage,
});

const salonTeamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/salon/$locationId/team',
  component: SalonPage,
});

const salonReviewsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/salon/$locationId/reviews',
  component: SalonPage,
});

// Portal layout route (auth required, any role)
const portalLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'portal',
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
  component: PortalLayout,
});

const portalDashboardRoute = createRoute({
  getParentRoute: () => portalLayoutRoute,
  path: '/portal',
  component: PortalDashboard,
});

const portalAppointmentsRoute = createRoute({
  getParentRoute: () => portalLayoutRoute,
  path: '/portal/appointments',
  component: PortalAppointments,
});

const portalProfileRoute = createRoute({
  getParentRoute: () => portalLayoutRoute,
  path: '/portal/profile',
  component: PortalProfile,
});

// Build route tree
const routeTree = rootRoute.addChildren([
  publicLandingRoute,
  bookingRoute,
  salonLandingRoute,
  salonPageRoute,
  salonTeamRoute,
  salonReviewsRoute,
  authLayoutRoute.addChildren([loginRoute, registerRoute]),
  portalLayoutRoute.addChildren([
    portalDashboardRoute,
    portalAppointmentsRoute,
    portalProfileRoute,
  ]),
  appLayoutRoute.addChildren([
    dashboardRoute,
    plannerRoute,
    clientListRoute,
    clientCreateRoute,
    clientDetailRoute,
    clientEditRoute,
    serviceCreateRoute,
    serviceDetailRoute,
    serviceEditRoute,
    serviceListRoute,
    employeeListRoute,
    employeeCreateRoute,
    employeeDetailRoute,
    employeeEditRoute,
    reviewsRoute,
    settingsRoute,
    integrationsRoute,
    invoicesRoute,
    aiRoute,
  ]),
]);

export const router = createRouter({ routeTree });

// Type registration
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
