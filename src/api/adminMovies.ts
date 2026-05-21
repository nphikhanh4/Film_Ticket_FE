import { api } from './client';
import { MovieResponse } from '@/types/api';

export interface CreateMovieRequest {
  title: string;
  description?: string;
  durationMinutes: number;
  director?: string;
  genres?: string;
  coverImageUrl?: string;
}

export interface UpdateMovieRequest extends CreateMovieRequest {
  isActive: boolean;
}

export const adminMoviesApi = {
  create: (req: CreateMovieRequest): Promise<MovieResponse> =>
    api.post('/api/movies', req),

  update: (id: string, req: UpdateMovieRequest): Promise<MovieResponse> =>
    api.put(`/api/movies/${id}`, req),

  delete: (id: string): Promise<void> =>
    api.delete(`/api/movies/${id}`),

  activate: (id: string): Promise<MovieResponse> =>
    api.post(`/api/movies/${id}/activate`, {}),

  deactivate: (id: string): Promise<MovieResponse> =>
    api.post(`/api/movies/${id}/deactivate`, {}),
};
