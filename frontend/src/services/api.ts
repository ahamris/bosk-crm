import axios from 'axios';
import type {
  User,
  Location,
  Service,
  ServiceCategory,
  Client,
  Appointment,
  Employee,
  WorkingHour,
  DashboardStats,
  PaginatedResponse,
  LoginCredentials,
  RegisterData,
} from '../types';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export async function login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
  const { data } = await api.post('/auth/login', credentials);
  return data;
}

export async function register(payload: RegisterData): Promise<{ user: User; token: string }> {
  const { data } = await api.post('/auth/register', payload);
  return data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function getMe(): Promise<User> {
  const { data } = await api.get('/auth/me');
  return data.data ?? data;
}

// Locations
export async function getLocations(): Promise<Location[]> {
  const { data } = await api.get('/locations');
  return data.data ?? data;
}

export async function createLocation(payload: Partial<Location>): Promise<Location> {
  const { data } = await api.post('/locations', payload);
  return data.data ?? data;
}

export async function updateLocation(id: number, payload: Partial<Location>): Promise<Location> {
  const { data } = await api.put(`/locations/${id}`, payload);
  return data.data ?? data;
}

// Services
export async function getServices(): Promise<Service[]> {
  const { data } = await api.get('/services');
  return data.data ?? data;
}

export async function createService(payload: Partial<Service>): Promise<Service> {
  const { data } = await api.post('/services', payload);
  return data.data ?? data;
}

export async function updateService(id: number, payload: Partial<Service>): Promise<Service> {
  const { data } = await api.put(`/services/${id}`, payload);
  return data.data ?? data;
}

export async function deleteService(id: number): Promise<void> {
  await api.delete(`/services/${id}`);
}

// Service Categories
export async function getServiceCategories(): Promise<ServiceCategory[]> {
  const { data } = await api.get('/service-categories');
  return data.data ?? data;
}

export async function createServiceCategory(payload: Partial<ServiceCategory>): Promise<ServiceCategory> {
  const { data } = await api.post('/service-categories', payload);
  return data.data ?? data;
}

// Clients
export async function getClients(params?: { search?: string; page?: number }): Promise<PaginatedResponse<Client>> {
  const { data } = await api.get('/clients', { params });
  return data;
}

export async function getClient(id: number): Promise<Client> {
  const { data } = await api.get(`/clients/${id}`);
  return data.data ?? data;
}

export async function createClient(payload: Partial<Client>): Promise<Client> {
  const { data } = await api.post('/clients', payload);
  return data.data ?? data;
}

export async function updateClient(id: number, payload: Partial<Client>): Promise<Client> {
  const { data } = await api.put(`/clients/${id}`, payload);
  return data.data ?? data;
}

// Appointments
export async function getAppointments(params?: {
  date?: string;
  employee_id?: number;
  status?: string;
}): Promise<Appointment[]> {
  const { data } = await api.get('/appointments', { params });
  return data.data ?? data;
}

export async function createAppointment(payload: Partial<Appointment>): Promise<Appointment> {
  const { data } = await api.post('/appointments', payload);
  return data.data ?? data;
}

export async function updateAppointment(id: number, payload: Partial<Appointment>): Promise<Appointment> {
  const { data } = await api.put(`/appointments/${id}`, payload);
  return data.data ?? data;
}

export async function cancelAppointment(id: number): Promise<Appointment> {
  const { data } = await api.patch(`/appointments/${id}/cancel`);
  return data.data ?? data;
}

// Dashboard
export async function getDashboard(): Promise<DashboardStats> {
  const { data } = await api.get('/dashboard');
  return data.data ?? data;
}

// Employees
export async function getEmployees(): Promise<Employee[]> {
  const { data } = await api.get('/employees');
  return data.data ?? data;
}

export async function getEmployeeWorkingHours(employeeId: number): Promise<WorkingHour[]> {
  const { data } = await api.get(`/employees/${employeeId}/working-hours`);
  return data.data ?? data;
}

export default api;
