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
import { CalendarPage } from './pages/calendar/CalendarPage';
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
import { AiAssistantPage } from './pages/ai/AiAssistantPage';
import { BookingPage } from './pages/booking/BookingPage';
import { useAuthStore } from './stores/authStore';

// Root route
const rootRoute = createRootRoute({
  component: Outlet,
});

// Auth layout route (redirects to / if already logged in)
const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'auth',
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: '/' });
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
  path: '/',
  component: DashboardPage,
});

const calendarRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/calendar',
  component: CalendarPage,
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

// Public booking route (no auth, no layout)
const bookingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/booking/$locationId',
  component: BookingPage,
});

// Build route tree
const routeTree = rootRoute.addChildren([
  bookingRoute,
  authLayoutRoute.addChildren([loginRoute, registerRoute]),
  appLayoutRoute.addChildren([
    dashboardRoute,
    calendarRoute,
    clientListRoute,
    clientCreateRoute,
    clientDetailRoute,
    clientEditRoute,
    serviceCreateRoute,
    serviceDetailRoute,
    serviceEditRoute,
    serviceListRoute,
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
