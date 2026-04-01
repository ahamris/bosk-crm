import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../stores/authStore';
import * as api from '../services/api';
import type { LoginCredentials, RegisterData } from '../types';

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, isAuthenticated, login: setAuth, logout: clearAuth, setUser } = useAuthStore();

  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: api.getMe,
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  if (meQuery.data && (!user || user.id !== meQuery.data.id)) {
    setUser(meQuery.data);
  }

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => api.login(credentials),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      navigate({ to: '/admin' });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterData) => api.register(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      navigate({ to: '/admin' });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      navigate({ to: '/login' });
    },
    onError: () => {
      clearAuth();
      queryClient.clear();
      navigate({ to: '/login' });
    },
  });

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}
