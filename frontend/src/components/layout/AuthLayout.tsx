import { Outlet } from '@tanstack/react-router';
import { Leaf } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex items-center gap-2">
            <Leaf className="h-10 w-10 text-primary-600" />
            <span className="text-3xl font-bold tracking-tight text-slate-900">BOSK</span>
          </div>
          <p className="text-sm text-slate-500">Beauty & Skin Clinic Management</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
