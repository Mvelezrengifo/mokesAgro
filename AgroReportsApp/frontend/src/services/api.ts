import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, User, Report, LoginData, RegisterData, CreateReportData } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  createEmployee: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/create-employee', data);
    return response.data;
  }
};

export const userAPI = {
  getEmployees: async (): Promise<{ employees: User[] }> => {
    const response = await api.get('/users/employees');
    return response.data;
  },

  toggleEmployeeStatus: async (employeeId: string): Promise<{ message: string; employee: User }> => {
    const response = await api.patch(`/users/employees/${employeeId}/toggle-status`);
    return response.data;
  },

  deleteEmployee: async (employeeId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/users/employees/${employeeId}`);
    return response.data;
  }
};

export const reportAPI = {
  createReport: async (data: CreateReportData, images?: any[]): Promise<{ message: string; report: Report }> => {
    const formData = new FormData();
    
    formData.append('title', data.title);
    formData.append('authorName', data.authorName);
    if (data.location) formData.append('location', data.location);
    formData.append('problems', JSON.stringify(data.problems));
    formData.append('materials', JSON.stringify(data.materials));
    if (data.observations) formData.append('observations', data.observations);
    if (data.recommendations) formData.append('recommendations', data.recommendations);

    if (images && images.length > 0) {
      images.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          type: image.type,
          name: image.fileName || `image_${index}.jpg`,
        } as any);
      });
    }

    const response = await api.post('/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getReports: async (): Promise<{ reports: Report[] }> => {
    const response = await api.get('/reports');
    return response.data;
  },

  getReport: async (reportId: string): Promise<{ report: Report }> => {
    const response = await api.get(`/reports/${reportId}`);
    return response.data;
  },

  generatePDF: async (reportId: string): Promise<{ message: string; pdfPath: string }> => {
    const response = await api.post(`/reports/${reportId}/generate-pdf`);
    return response.data;
  },

  deleteReport: async (reportId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/reports/${reportId}`);
    return response.data;
  },

  getWhatsAppShareLink: async (reportId: string): Promise<{ whatsappUrl: string }> => {
    const response = await api.get(`/share/whatsapp/${reportId}`);
    return response.data;
  }
};

export default api;