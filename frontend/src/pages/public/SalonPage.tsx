import { useState, useMemo, useRef } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Leaf,
  MapPin,
  Clock,
  Star,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Wifi,
  Coffee,
  Car,
  Accessibility,
  CreditCard,
} from 'lucide-react';
import { PublicLayout } from './PublicLayout';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { localizedName } from '../../utils/locale';
import * as api from '../../services/api';
import clsx from 'clsx';

function localizedText(
  obj: Record<string, unknown>,
  field: string,
  lang: string,
): string {
  const key = `${field}_${lang}`;
  return (
    (obj[key] as string) ||
    (obj[`${field}_nl`] as string) ||
    (obj[`${field}_en`] as string) ||
    ''
  );
}

function formatPrice(cents: number): string {
  return `\u20AC${(cents / 100).toFixed(2)}`;
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        className={clsx(
          size === 'lg' ? 'text-lg' : 'text-sm',
          i <= Math.round(rating) ? 'text-amber-400' : 'text-slate-200',
        )}
      >
        ★
      </span>,
    );
  }
  return <span className="inline-flex gap-0.5">{stars}</span>;
}

const amenityIcons: Record<string, React.ElementType> = {
  wifi: Wifi,
  coffee: Coffee,
  parking: Car,
  accessible: Accessibility,
  card_payment: CreditCard,
};

type TabId = 'services' | 'team' | 'reviews' | 'about' | 'hours';

export function SalonPage() {
  const { t, i18n } = useTranslation();
  const { locationId: locationIdParam } = useParams({ strict: false }) as {
    locationId: string;
  };
  const locationId = Number(locationIdParam) || 1;

  const [activeTab, setActiveTab] = useState<TabId>('services');
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const sectionRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-landing', locationId],
    queryFn: () => api.getPublicLanding(locationId),
  });

  // Group services by category
  const servicesByCategory = useMemo(() => {
    if (!data?.services || !data?.categories) return [];
    const groups: Array<{
      category: Record<string, unknown>;
      services: Array<Record<string, unknown>>;
    }> = [];

    for (const cat of data.categories) {
      const catServices = data.services.filter(
        (s: Record<string, unknown>) => s.category_id === cat.id || s.service_category_id === cat.id,
      );
      if (catServices.length > 0) {
        groups.push({ category: cat, services: catServices });
      }
    }

    // Also add uncategorized services
    const categorizedIds = new Set(
      data.categories.flatMap((c: Record<string, unknown>) =>
        data.services
          .filter(
            (s: Record<string, unknown>) =>
              s.category_id === c.id || s.service_category_id === c.id,
          )
          .map((s: Record<string, unknown>) => s.id),
      ),
    );
    const uncategorized = data.services.filter(
      (s: Record<string, unknown>) => !categorizedIds.has(s.id),
    );
    if (uncategorized.length > 0) {
      groups.push({
        category: { id: 0, name_nl: 'Overig', name_en: 'Other', name_ru: 'Другое' },
        services: uncategorized,
      });
    }

    return groups;
  }, [data]);

  const filteredReviews = useMemo(() => {
    if (!data?.reviews) return [];
    if (starFilter === null) return data.reviews;
    return data.reviews.filter((r: Record<string, unknown>) => r.rating === starFilter);
  }, [data?.reviews, starFilter]);

  const toggleCategory = (catId: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <PublicLayout locationId={locationId}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </PublicLayout>
    );
  }

  if (isError || !data) {
    return (
      <PublicLayout locationId={locationId}>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <p className="text-lg text-slate-500">{t('common.error')}</p>
        </div>
      </PublicLayout>
    );
  }

  const { location, team, review_stats } = data;

  const tabs: { id: TabId; label: string }[] = [
    { id: 'services', label: t('public.our_services') },
    { id: 'team', label: t('public.our_team') },
    { id: 'reviews', label: t('public.benefits_reviews') },
    { id: 'about', label: t('public.about') },
    { id: 'hours', label: t('public.opening_hours') },
  ];

  const openingHours = [
    { day: t('settings.days.monday'), hours: '09:00 - 18:00' },
    { day: t('settings.days.tuesday'), hours: '09:00 - 18:00' },
    { day: t('settings.days.wednesday'), hours: '09:00 - 18:00' },
    { day: t('settings.days.thursday'), hours: '09:00 - 21:00' },
    { day: t('settings.days.friday'), hours: '09:00 - 18:00' },
    { day: t('settings.days.saturday'), hours: '09:00 - 17:00' },
    { day: t('settings.days.sunday'), hours: t('public.closed') },
  ];

  return (
    <PublicLayout locationId={locationId}>
      {/* ========== Header / Breadcrumb ========== */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-2 text-sm text-slate-400">
            <Link to="/" className="hover:text-emerald-600 transition-colors">
              BOSK
            </Link>
            <span>/</span>
            <span className="text-slate-600">
              {location?.name || 'Gouda'}
            </span>
          </nav>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Leaf className="h-8 w-8 text-emerald-600" />
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  {location?.name || 'BOSK Gouda'}
                </h1>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {location?.address || 'Markt 15'}, {location?.city || 'Gouda'}
                </span>
                {review_stats && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-400" />
                    <span className="font-medium text-slate-700">
                      {Number(review_stats.average).toFixed(1)}
                    </span>
                    ({review_stats.count} {t('public.benefits_reviews').toLowerCase()})
                  </span>
                )}
              </div>
            </div>
            <Link
              to={`/booking/${locationId}` as string}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              {t('public.book_now')}
            </Link>
          </div>
        </div>
      </section>

      {/* ========== Photo Gallery placeholder ========== */}
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-2 py-4 sm:grid-cols-4">
            {[
              'from-emerald-100 to-teal-100',
              'from-teal-100 to-cyan-100',
              'from-cyan-100 to-emerald-100',
              'from-emerald-50 to-teal-50',
            ].map((gradient, i) => (
              <div
                key={i}
                className={clsx(
                  'flex h-32 items-center justify-center rounded-xl bg-gradient-to-br sm:h-40',
                  gradient,
                  i === 0 && 'col-span-2 row-span-1 sm:h-40',
                )}
              >
                <Leaf className="h-8 w-8 text-emerald-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== Tabs ========== */}
      <div className="sticky top-[57px] z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <nav className="-mb-px flex gap-6 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={clsx(
                  'whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ========== Tab Content ========== */}
      <div ref={sectionRef} className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:flex lg:gap-8">
        {/* Main content area */}
        <div className="flex-1 min-w-0">
          {/* --- Services Tab --- */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">{t('public.our_services')}</h2>
              {servicesByCategory.length === 0 ? (
                <p className="py-12 text-center text-slate-500">{t('common.no_results')}</p>
              ) : (
                servicesByCategory.map(({ category, services }) => {
                  const catId = category.id as number;
                  const isExpanded = expandedCategories.has(catId) || expandedCategories.size === 0;

                  return (
                    <div
                      key={catId}
                      className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                    >
                      <button
                        onClick={() => toggleCategory(catId)}
                        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                      >
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {localizedName(
                              category as { name_nl?: string; name_en?: string; name_ru?: string },
                              i18n.language,
                            )}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {services.length}{' '}
                            {services.length === 1
                              ? t('services.title').toLowerCase().slice(0, -1)
                              : t('services.title').toLowerCase()}
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="divide-y divide-slate-100 border-t border-slate-100">
                          {services.map((service) => (
                            <div
                              key={service.id as number}
                              className="flex items-center justify-between px-5 py-4"
                            >
                              <div className="flex-1 min-w-0 pr-4">
                                <p className="font-medium text-slate-900">
                                  {localizedName(
                                    service as {
                                      name_nl?: string;
                                      name_en?: string;
                                      name_ru?: string;
                                    },
                                    i18n.language,
                                  )}
                                </p>
                                <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {service.duration_minutes as number} {t('booking.minutes')}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-lg font-semibold text-emerald-600">
                                  {formatPrice(service.price_cents as number)}
                                </span>
                                <Link
                                  to={`/booking/${locationId}` as string}
                                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                                >
                                  {t('public.select')}
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* --- Team Tab --- */}
          {activeTab === 'team' && (
            <div>
              <h2 className="mb-6 text-xl font-bold text-slate-900">{t('public.our_team')}</h2>
              {!team || team.length === 0 ? (
                <p className="py-12 text-center text-slate-500">{t('common.no_results')}</p>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {team.map((member: Record<string, unknown>) => (
                    <div
                      key={member.id as number}
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                          <span className="text-xl font-bold">
                            {(member.name as string)?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900">
                            {member.name as string}
                          </h3>
                          <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            {member.type as string}
                          </span>
                          {(member.reviews_avg_rating as number) > 0 && (
                            <div className="mt-2 flex items-center gap-2">
                              <StarRating rating={member.reviews_avg_rating as number} />
                              <span className="text-xs text-slate-400">
                                ({member.reviews_count as number})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {localizedText(member, 'bio', i18n.language) && (
                        <p className="mt-4 text-sm text-slate-600">
                          {localizedText(member, 'bio', i18n.language)}
                        </p>
                      )}

                      {(member.specializations as string[])?.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {(member.specializations as string[]).map((spec) => (
                            <span
                              key={spec}
                              className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- Reviews Tab --- */}
          {activeTab === 'reviews' && (
            <div>
              <h2 className="mb-6 text-xl font-bold text-slate-900">
                {t('public.benefits_reviews')}
              </h2>

              {/* Rating overview */}
              {review_stats && (
                <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col items-center gap-6 sm:flex-row">
                    <div className="text-center">
                      <span className="text-5xl font-bold text-slate-900">
                        {Number(review_stats.average).toFixed(1)}
                      </span>
                      <div className="mt-1">
                        <StarRating rating={review_stats.average} size="lg" />
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {review_stats.count} {t('public.benefits_reviews').toLowerCase()}
                      </p>
                    </div>
                    {review_stats.distribution && (
                      <div className="flex-1 w-full space-y-1.5">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count =
                            (review_stats.distribution as Record<string, number>)[String(star)] ||
                            0;
                          const pct =
                            review_stats.count > 0 ? (count / review_stats.count) * 100 : 0;
                          return (
                            <button
                              key={star}
                              onClick={() =>
                                setStarFilter(starFilter === star ? null : star)
                              }
                              className={clsx(
                                'flex w-full items-center gap-2 rounded-lg px-2 py-1 text-sm transition-colors',
                                starFilter === star
                                  ? 'bg-amber-50'
                                  : 'hover:bg-slate-50',
                              )}
                            >
                              <span className="w-3 text-right text-slate-500">{star}</span>
                              <span className="text-amber-400">★</span>
                              <div className="h-2 flex-1 rounded-full bg-slate-100">
                                <div
                                  className="h-2 rounded-full bg-amber-400 transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="w-8 text-right text-xs text-slate-400">
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Star filter indicator */}
              {starFilter !== null && (
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-sm text-slate-500">
                    {starFilter} ★ filter
                  </span>
                  <button
                    onClick={() => setStarFilter(null)}
                    className="text-sm text-emerald-600 hover:text-emerald-700"
                  >
                    {t('common.close')}
                  </button>
                </div>
              )}

              {/* Review list */}
              {filteredReviews.length === 0 ? (
                <p className="py-12 text-center text-slate-500">{t('reviews.no_reviews')}</p>
              ) : (
                <div className="space-y-4">
                  {filteredReviews.map((review: Record<string, unknown>) => (
                    <div
                      key={review.id as number}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <StarRating rating={review.rating as number} />
                          <p className="mt-1 text-sm font-medium text-slate-900">
                            {review.client_name as string}
                          </p>
                        </div>
                        <span className="text-xs text-slate-400">
                          {new Date(review.created_at as string).toLocaleDateString(
                            i18n.language,
                          )}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">
                        {review.comment as string}
                      </p>
                      {(review.employee_name as string) && (
                        <p className="mt-2 text-xs text-slate-400">
                          {String(review.employee_name)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- About Tab --- */}
          {activeTab === 'about' && (
            <div>
              <h2 className="mb-6 text-xl font-bold text-slate-900">{t('public.about')}</h2>

              {location && localizedText(location, 'about', i18n.language) && (
                <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                    {localizedText(location, 'about', i18n.language)}
                  </p>
                </div>
              )}

              {/* Amenities */}
              {location?.amenities && (location.amenities as string[]).length > 0 && (
                <div className="mb-8">
                  <h3 className="mb-4 font-semibold text-slate-900">{t('public.amenities')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {(location.amenities as string[]).map((amenity: string) => {
                      const Icon = amenityIcons[amenity] || Leaf;
                      return (
                        <span
                          key={amenity}
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700"
                        >
                          <Icon className="h-4 w-4" />
                          {amenity.replace(/_/g, ' ')}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cancellation policy */}
              {location && localizedText(location, 'cancellation_policy', i18n.language) && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-3 font-semibold text-slate-900">
                    {t('public.cancellation_policy')}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {localizedText(location, 'cancellation_policy', i18n.language)}
                  </p>
                  {location.cancellation_window_hours && (
                    <p className="mt-2 text-sm text-slate-500">
                      {location.cancellation_window_hours}h
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* --- Hours Tab --- */}
          {activeTab === 'hours' && (
            <div>
              <h2 className="mb-6 text-xl font-bold text-slate-900">
                {t('public.opening_hours')}
              </h2>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="divide-y divide-slate-100">
                    {openingHours.map((item) => (
                      <div
                        key={item.day}
                        className="flex items-center justify-between py-3 text-sm"
                      >
                        <span className="font-medium text-slate-700">{item.day}</span>
                        <span
                          className={clsx(
                            'text-slate-500',
                            item.hours === t('public.closed') && 'text-slate-400 italic',
                          )}
                        >
                          {item.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 font-semibold text-slate-900">{t('public.location')}</h3>
                  {/* Map placeholder */}
                  <div className="mb-4 flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                    <div className="text-center">
                      <MapPin className="mx-auto mb-2 h-8 w-8 text-emerald-400" />
                      <p className="text-sm font-medium text-emerald-600">
                        {location?.address || 'Markt 15'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-700">
                        {location?.address || 'Markt 15'},{' '}
                        {location?.city || '2801 JJ Gouda'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <a
                        href={`tel:${location?.phone || '+31182000000'}`}
                        className="text-slate-700 hover:text-emerald-600 transition-colors"
                      >
                        {location?.phone || '+31 (0)182 000 000'}
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <a
                        href={`mailto:${location?.email || 'info@bosk-gouda.nl'}`}
                        className="text-slate-700 hover:text-emerald-600 transition-colors"
                      >
                        {location?.email || 'info@bosk-gouda.nl'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========== Desktop Sticky Sidebar ========== */}
        <aside className="hidden lg:block lg:w-72 lg:shrink-0">
          <div className="sticky top-32">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Leaf className="h-6 w-6 text-emerald-600" />
                <span className="font-bold text-slate-900">BOSK</span>
              </div>
              {review_stats && (
                <div className="mb-4 flex items-center gap-2">
                  <StarRating rating={review_stats.average} />
                  <span className="text-sm text-slate-500">
                    {Number(review_stats.average).toFixed(1)} ({review_stats.count})
                  </span>
                </div>
              )}
              <div className="mb-4 space-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {location?.address || 'Markt 15'}, {location?.city || 'Gouda'}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {location?.phone || '+31 (0)182 000 000'}
                </div>
              </div>
              <Link
                to={`/booking/${locationId}` as string}
                className="flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                {t('public.book_now')}
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* ========== Mobile sticky CTA ========== */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white p-3 lg:hidden">
        <Link
          to={`/booking/${locationId}` as string}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-colors hover:bg-emerald-700"
        >
          {t('public.book_now')}
        </Link>
      </div>
    </PublicLayout>
  );
}
