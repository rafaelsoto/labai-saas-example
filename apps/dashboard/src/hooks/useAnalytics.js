'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export function useAnalytics(projectId, period = '30d') {
  const [overview, setOverview] = useState(null);
  const [ratingsOverTime, setRatingsOverTime] = useState([]);
  const [feedbacksPerDay, setFeedbacksPerDay] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const overviewParams = `period=${period}`;
      const projectParams = projectId ? `?projectId=${projectId}&period=${period}` : `?period=${period}`;

      const [overviewData, ratingsData, feedbacksData] = await Promise.all([
        api.get(`/api/analytics/overview?${overviewParams}`),
        projectId
          ? api.get(`/api/analytics/ratings-over-time?projectId=${projectId}&period=${period}`)
          : Promise.resolve([]),
        projectId
          ? api.get(`/api/analytics/feedbacks-per-day?projectId=${projectId}&period=${period}`)
          : Promise.resolve([]),
      ]);

      setOverview(overviewData);
      setRatingsOverTime(Array.isArray(ratingsData) ? ratingsData : []);
      setFeedbacksPerDay(Array.isArray(feedbacksData) ? feedbacksData : []);

      if (projectId) {
        const pagesData = await api.get(`/api/analytics/top-pages?projectId=${projectId}`);
        setTopPages(Array.isArray(pagesData) ? pagesData : []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, period]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { overview, ratingsOverTime, feedbacksPerDay, topPages, loading, error, refetch: fetchAll };
}
