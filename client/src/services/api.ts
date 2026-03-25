import axios from 'axios';
import type { AnalysisResponse } from '@shared/types';

const api = axios.create({
  baseURL: '/api',
  timeout: 120000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      throw error;
    }
    if (error.response?.data?.error?.message) {
      throw new Error(error.response.data.error.message);
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('La solicitud tardo demasiado. Intenta nuevamente.');
    }
    if (!error.response) {
      throw new Error('Sin conexion al servidor. Verifica que el servidor este corriendo.');
    }
    throw new Error('Error inesperado. Intenta nuevamente.');
  }
);

export async function postAnalysis(
  text?: string,
  image?: File,
  signal?: AbortSignal
): Promise<AnalysisResponse> {
  const formData = new FormData();

  if (text?.trim()) {
    formData.append('text', text.trim());
  }

  if (image) {
    formData.append('image', image);
  }

  const response = await api.post<AnalysisResponse>('/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    signal,
  });

  return response.data;
}
