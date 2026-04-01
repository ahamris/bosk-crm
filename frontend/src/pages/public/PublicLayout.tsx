import { Leaf } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';

interface PublicLayoutProps {
  children: React.ReactNode;
  locationId: number;
}

export function PublicLayout({ children, locationId }: PublicLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            to={`/salon/${locationId}` as string}
            className="flex items-center gap-2"
          >
            <Leaf className="h-7 w-7 text-emerald-600" />
            <span className="text-xl font-bold tracking-tight text-slate-900">BOSK</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              to={`/booking/${locationId}` as string}
              className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              {t('public.book_now')}
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="h-6 w-6 text-emerald-600" />
                <span className="text-lg font-bold text-slate-900">BOSK</span>
              </div>
              <p className="text-sm text-slate-500">
                Schoonheidssalon & Huidkliniek
              </p>
              <p className="mt-2 text-sm text-slate-500">Markt 15, 2801 JJ Gouda</p>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-slate-900">Links</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>
                  <a href={`#services`} className="hover:text-emerald-600 transition-colors">
                    {t('public.our_services')}
                  </a>
                </li>
                <li>
                  <a href={`#team`} className="hover:text-emerald-600 transition-colors">
                    {t('public.our_team')}
                  </a>
                </li>
                <li>
                  <a href={`#reviews`} className="hover:text-emerald-600 transition-colors">
                    {t('public.benefits_reviews')}
                  </a>
                </li>
                <li>
                  <Link
                    to={`/booking/${locationId}` as string}
                    className="hover:text-emerald-600 transition-colors"
                  >
                    {t('public.book_now')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-slate-900">{t('public.contact')}</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>
                  <a href="tel:+31182000000" className="hover:text-emerald-600 transition-colors">
                    +31 (0)182 000 000
                  </a>
                </li>
                <li>
                  <a href="mailto:info@bosk-gouda.nl" className="hover:text-emerald-600 transition-colors">
                    info@bosk-gouda.nl
                  </a>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-slate-900">Social</h4>
              <div className="flex gap-3">
                <a
                  href="https://instagram.com/bosk.gouda"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                <a
                  href="https://facebook.com/bosk.gouda"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row">
            <p className="text-sm text-slate-400">
              &copy; {new Date().getFullYear()} BOSK. All rights reserved.
            </p>
            <a href="#cancellation" className="text-sm text-slate-400 hover:text-emerald-600 transition-colors">
              {t('public.cancellation_policy')}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
