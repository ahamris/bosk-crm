import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Trash2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useReviews, useToggleReviewPublish, useDeleteReview } from '../../hooks/useApi';
import type { Review } from '../../types';

type FilterTab = 'all' | 'published' | 'unpublished';

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={i <= rating ? 'text-amber-400' : 'text-slate-200'}
        >
          &#9733;
        </span>
      ))}
    </span>
  );
}

export function ReviewListPage() {
  const { t } = useTranslation();
  const { data: reviewsData, isLoading } = useReviews();
  const togglePublish = useToggleReviewPublish();
  const deleteReview = useDeleteReview();

  const [filter, setFilter] = useState<FilterTab>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);

  const allReviews: Review[] = reviewsData ?? [];

  const filteredReviews = allReviews.filter((r) => {
    if (filter === 'published') return r.is_published;
    if (filter === 'unpublished') return !r.is_published;
    return true;
  });

  // Compute average
  const avgRating =
    allReviews.length > 0
      ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
      : '0.0';

  const handleTogglePublish = (review: Review) => {
    togglePublish.mutate(review.id);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteReview.mutate(deleteTarget.id, {
        onSuccess: () => setDeleteTarget(null),
      });
    }
  };

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: t('reviews.all'), count: allReviews.length },
    { key: 'published', label: t('reviews.published'), count: allReviews.filter((r) => r.is_published).length },
    { key: 'unpublished', label: t('reviews.unpublished'), count: allReviews.filter((r) => !r.is_published).length },
  ];

  const columns = [
    {
      key: 'client',
      header: t('appointments.select_client'),
      render: (row: Review) =>
        row.client
          ? row.client.full_name ?? `${row.client.first_name} ${row.client.last_name}`
          : '-',
    },
    {
      key: 'employee',
      header: t('appointments.select_employee'),
      render: (row: Review) => row.employee?.name ?? '-',
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (row: Review) => <StarRating rating={row.rating} />,
    },
    {
      key: 'comment',
      header: 'Comment',
      render: (row: Review) => (
        <span className="block max-w-xs truncate text-slate-600">
          {row.comment ?? '-'}
        </span>
      ),
    },
    {
      key: 'is_published',
      header: t('reviews.published'),
      render: (row: Review) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleTogglePublish(row);
          }}
          className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          style={{
            backgroundColor: row.is_published ? '#10b981' : '#cbd5e1',
          }}
          title={t('reviews.toggle_publish')}
        >
          <span
            className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
            style={{
              transform: row.is_published ? 'translateX(18px)' : 'translateX(2px)',
            }}
          />
        </button>
      ),
    },
    {
      key: 'created_at',
      header: t('appointments.date'),
      render: (row: Review) =>
        new Date(row.created_at).toLocaleDateString('nl-NL', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (row: Review) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setDeleteTarget(row);
          }}
        >
          <Trash2 className="h-3.5 w-3.5 text-red-500" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Star className="h-7 w-7 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('reviews.title')}</h1>
            {allReviews.length > 0 && (
              <p className="text-sm text-slate-500">
                {t('reviews.average')}: {avgRating} {t('reviews.stars')} ({allReviews.length})
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-primary-50 text-primary-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
            <Badge variant="default" className="ml-1">
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Table */}
      <Card padding={false}>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <EmptyState
            icon={<Star className="h-12 w-12" />}
            title={t('reviews.no_reviews')}
          />
        ) : (
          <>
            <Table
              columns={columns}
              data={filteredReviews}
              keyExtractor={(row) => row.id}
              onRowClick={(row) =>
                setExpandedId(expandedId === row.id ? null : row.id)
              }
            />

            {/* Expanded row detail */}
            {expandedId && (() => {
              const review = filteredReviews.find((r) => r.id === expandedId);
              if (!review) return null;
              return (
                <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <StarRating rating={review.rating} />
                        <span className="text-sm text-slate-500">
                          {review.rating}/5
                        </span>
                        <Badge variant={review.is_published ? 'success' : 'default'}>
                          {review.is_published ? t('reviews.published') : t('reviews.unpublished')}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {review.comment ?? t('reviews.no_reviews')}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                        <span>
                          {review.client
                            ? review.client.full_name ?? `${review.client.first_name} ${review.client.last_name}`
                            : '-'}
                        </span>
                        <span>{review.employee?.name ?? '-'}</span>
                        <span>
                          {new Date(review.created_at).toLocaleString('nl-NL')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </Card>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={t('common.delete')}
        message={t('notes.delete_confirm')}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={deleteReview.isPending}
        variant="danger"
      />
    </div>
  );
}
