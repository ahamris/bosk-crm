import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import type { AxiosError } from 'axios';
import type { ApiError } from '../../types';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { t } = useTranslation();
  const { login, isLoggingIn, loginError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => {
    login(data);
  };

  const apiError = loginError as AxiosError<ApiError> | null;

  return (
    <div>
      <h2 className="mb-1 text-xl font-semibold text-slate-900">{t('auth.login')}</h2>
      <p className="mb-6 text-sm text-slate-500">{t('auth.login_subtitle')}</p>

      {apiError?.response?.data?.message && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {apiError.response.data.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('auth.email')}
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label={t('auth.password')}
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" loading={isLoggingIn} className="w-full">
          {t('auth.login')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        {t('auth.no_account')}{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
          {t('auth.register')}
        </Link>
      </p>
    </div>
  );
}
