import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../services/api';
import { useLocationStore } from '../stores/locationStore';
import type { Service, Client, Appointment, Integration, AvailableIntegration } from '../types';

function useActiveLocationId(): number | null {
  return useLocationStore((s) => s.activeLocationId);
}

// Dashboard
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: api.getDashboard,
    refetchInterval: 60000,
  });
}

// Clients
export function useClients(params?: { search?: string; page?: number }) {
  const locationId = useActiveLocationId();
  return useQuery({
    queryKey: ['clients', locationId, params],
    queryFn: () => api.getClients(locationId!, params),
    enabled: !!locationId,
  });
}

export function useClient(id: number) {
  const locationId = useActiveLocationId();
  return useQuery({
    queryKey: ['clients', locationId, id],
    queryFn: () => api.getClient(locationId!, id),
    enabled: !!locationId && !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const locationId = useActiveLocationId();
  return useMutation({
    mutationFn: (data: Partial<Client>) => api.createClient(locationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  const locationId = useActiveLocationId();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Client> & { id: number }) =>
      api.updateClient(locationId!, id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients', variables.id] });
    },
  });
}

// Client Notes
export function useClientNotes(clientId: number) {
  const locationId = useLocationStore.getState().activeLocationId;
  return useQuery({
    queryKey: ['client-notes', locationId, clientId],
    queryFn: () => api.getClientNotes(locationId!, clientId),
    enabled: !!locationId && !!clientId,
  });
}

export function useCreateClientNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ locationId, clientId, ...data }: { locationId: number; clientId: number; note: string; is_private?: boolean }) =>
      api.createClientNote(locationId, clientId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client-notes', variables.locationId, variables.clientId] });
    },
  });
}

export function useDeleteClientNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ locationId, clientId, noteId }: { locationId: number; clientId: number; noteId: number }) =>
      api.deleteClientNote(locationId, clientId, noteId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client-notes', variables.locationId, variables.clientId] });
    },
  });
}

// Communication Logs
export function useCommunicationLogs(clientId: number) {
  const locationId = useActiveLocationId();
  return useQuery({
    queryKey: ['communication-logs', locationId, clientId],
    queryFn: () => api.getCommunicationLogs(locationId!, clientId),
    enabled: !!locationId && !!clientId,
  });
}

export function useCreateCommunicationLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      locationId,
      clientId,
      ...data
    }: {
      locationId: number;
      clientId: number;
      type: string;
      direction: string;
      subject?: string | null;
      content?: string | null;
      duration_seconds?: number | null;
    }) => api.createCommunicationLog(locationId, clientId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['communication-logs', variables.locationId, variables.clientId],
      });
    },
  });
}

// Services
export function useServices() {
  const locationId = useActiveLocationId();
  return useQuery({
    queryKey: ['services', locationId],
    queryFn: () => api.getServices(locationId!),
    enabled: !!locationId,
  });
}

export function useServiceCategories() {
  return useQuery({
    queryKey: ['service-categories'],
    queryFn: api.getServiceCategories,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  const locationId = useActiveLocationId();
  return useMutation({
    mutationFn: (data: Partial<Service>) => api.createService(locationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  const locationId = useActiveLocationId();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Service> & { id: number }) =>
      api.updateService(locationId!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  const locationId = useActiveLocationId();
  return useMutation({
    mutationFn: (id: number) => api.deleteService(locationId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
    },
  });
}

// Appointments
export function useAppointments(params?: {
  date?: string;
  employee_id?: number;
  status?: string;
}) {
  const locationId = useActiveLocationId();
  return useQuery({
    queryKey: ['appointments', locationId, params],
    queryFn: () => api.getAppointments(locationId!, params),
    enabled: !!locationId,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  const locationId = useActiveLocationId();
  return useMutation({
    mutationFn: (data: Partial<Appointment>) => api.createAppointment(locationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  const locationId = useActiveLocationId();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Appointment> & { id: number }) =>
      api.updateAppointment(locationId!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  const locationId = useActiveLocationId();
  return useMutation({
    mutationFn: (id: number) => api.cancelAppointment(locationId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useTransitionAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ locationId, appointmentId, ...data }: { locationId: number; appointmentId: number; status: string; cancellation_reason?: string }) =>
      api.transitionAppointment(locationId, appointmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Integrations
export function useIntegrations() {
  return useQuery<{ configured: Integration[]; available: AvailableIntegration[] }>({
    queryKey: ['integrations'],
    queryFn: api.getIntegrations,
  });
}

export function useUpdateIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ provider, payload }: { provider: string; payload: { settings: Record<string, string>; is_active?: boolean } }) =>
      api.updateIntegration(provider, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}

export function useTestIntegration() {
  return useMutation({
    mutationFn: (provider: string) => api.testIntegration(provider),
  });
}

export function useSyncMoneybirdContacts() {
  return useMutation({
    mutationFn: () => api.syncMoneybirdContacts(),
  });
}

export function useSyncMoneybirdProducts() {
  return useMutation({
    mutationFn: () => api.syncMoneybirdProducts(),
  });
}

// Invoices
export function useInvoices() {
  const locationId = useActiveLocationId();
  return useQuery({
    queryKey: ['invoices', locationId],
    queryFn: () => api.getInvoices(locationId!),
    enabled: !!locationId,
  });
}

export function useCreateInvoiceFromAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ locationId, appointmentId }: { locationId: number; appointmentId: number }) =>
      api.createInvoiceFromAppointment(locationId, appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useSendInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ locationId, invoiceId }: { locationId: number; invoiceId: number }) =>
      api.sendInvoice(locationId, invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useMarkInvoicePaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ locationId, invoiceId }: { locationId: number; invoiceId: number }) =>
      api.markInvoicePaid(locationId, invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

// Employees
export function useEmployees(params?: { type?: string }) {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => api.getEmployees(params),
  });
}

export function useEmployee(id: number) {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => api.getEmployee(id),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      api.updateEmployee(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employees', variables.id] });
    },
  });
}

export function useEmployeeWorkingHours(employeeId: number) {
  return useQuery({
    queryKey: ['employees', employeeId, 'working-hours'],
    queryFn: () => api.getEmployeeWorkingHours(employeeId),
    enabled: !!employeeId,
  });
}

export function useBulkUpdateWorkingHours() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, hours }: { employeeId: number; hours: Record<string, unknown>[] }) =>
      api.bulkUpdateWorkingHours(employeeId, hours),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees', variables.employeeId, 'working-hours'] });
    },
  });
}

// Locations
export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: api.getLocations,
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      api.updateLocation(id, data as Partial<import('../types').Location>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}

// Reviews (location-scoped)
export function useReviews() {
  const locationId = useActiveLocationId();
  return useQuery({
    queryKey: ['reviews', locationId],
    queryFn: () => api.getReviews(locationId!),
    enabled: !!locationId,
  });
}

export function useToggleReviewPublish() {
  const queryClient = useQueryClient();
  const locationId = useActiveLocationId();
  return useMutation({
    mutationFn: (reviewId: number) => api.toggleReviewPublish(locationId!, reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  const locationId = useActiveLocationId();
  return useMutation({
    mutationFn: (reviewId: number) => api.deleteReview(locationId!, reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

// Notifications
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: api.getNotifications,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: api.getUnreadCount,
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// ── Portal (Client self-service) ────────────────────────────

export function usePortalProfile() {
  return useQuery<Client>({
    queryKey: ['portal', 'profile'],
    queryFn: api.getPortalProfile,
  });
}

export function useUpdatePortalProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Client>) => api.updatePortalProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'profile'] });
    },
  });
}

export function usePortalAppointments() {
  return useQuery({
    queryKey: ['portal', 'appointments'],
    queryFn: api.getPortalAppointments,
  });
}

export function usePortalUpcoming() {
  return useQuery<Appointment[]>({
    queryKey: ['portal', 'upcoming'],
    queryFn: api.getPortalUpcoming,
  });
}

export function useSubmitPortalReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { appointment_id: number; rating: number; comment?: string }) =>
      api.submitPortalReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'appointments'] });
    },
  });
}

export function useCancelPortalAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: number) => api.cancelPortalAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'appointments'] });
      queryClient.invalidateQueries({ queryKey: ['portal', 'upcoming'] });
    },
  });
}
