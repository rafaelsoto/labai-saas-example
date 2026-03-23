'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export function useFeedbacks(initialFilters = {}) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ page: 1, limit: 20, ...initialFilters });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v));
          } else {
            params.set(key, value);
          }
        }
      });

      const data = await api.get(`/api/feedbacks?${params.toString()}`);
      setFeedbacks(data.data || []);
      setPagination(data.pagination || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const setPage = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const clearFilters = useCallback((keepProjectId = null) => {
    setFilters({ page: 1, limit: 20, ...(keepProjectId ? { projectId: keepProjectId } : {}) });
  }, []);

  const markAsRead = useCallback(async (feedbackId) => {
    await api.patch(`/api/feedbacks/${feedbackId}/read`);
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === feedbackId ? { ...f, is_read: true } : f))
    );
  }, []);

  const markAllAsRead = useCallback(async (projectId) => {
    await api.patch('/api/feedbacks/read-all', { projectId });
    setFeedbacks((prev) => prev.map((f) => ({ ...f, is_read: true })));
  }, []);

  const deleteFeedback = useCallback(async (feedbackId) => {
    await api.delete(`/api/feedbacks/${feedbackId}`);
    setFeedbacks((prev) => prev.filter((f) => f.id !== feedbackId));
    setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
  }, []);

  return {
    feedbacks,
    pagination,
    filters,
    loading,
    error,
    updateFilter,
    setPage,
    clearFilters,
    markAsRead,
    markAllAsRead,
    deleteFeedback,
    refetch: fetchFeedbacks,
  };
}
