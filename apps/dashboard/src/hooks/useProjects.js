'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/projects');
      setProjects(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = useCallback(async (data) => {
    const result = await api.post('/api/projects', data);
    setProjects((prev) => [result.project, ...prev]);
    return result.project;
  }, []);

  const updateProject = useCallback(async (id, data) => {
    const result = await api.put(`/api/projects/${id}`, data);
    setProjects((prev) => prev.map((p) => (p.id === id ? result.project : p)));
    return result.project;
  }, []);

  const deleteProject = useCallback(async (id) => {
    await api.delete(`/api/projects/${id}`);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const regenerateKey = useCallback(async (id) => {
    const result = await api.post(`/api/projects/${id}/regenerate-key`);
    setProjects((prev) => prev.map((p) => (p.id === id ? result.project : p)));
    return result.project;
  }, []);

  return { projects, loading, error, createProject, updateProject, deleteProject, regenerateKey, refetch: fetchProjects };
}
