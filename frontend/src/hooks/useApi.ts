import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../services/api';
import { useLocationStore } from '../stores/locationStore';
import type { Service, Client, Appointment } from '../types';

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
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => api.getClient(id),
    enabled: !!id,
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

// Employees
export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: api.getEmployees,
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
