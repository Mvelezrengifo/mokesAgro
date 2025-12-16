export interface User {
  id: string;
  name: string;
  email: string;
  role: 'engineer' | 'employee';
  isActive?: boolean;
  createdAt?: string;
}

export interface Report {
  id: string;
  title: string;
  authorName: string;
  location?: string;
  date: string;
  problems: string[];
  materials: string[];
  observations?: string;
  recommendations?: string;
  images: string[];
  pdfPath?: string;
  userId: string;
  status: 'draft' | 'completed' | 'reviewed';
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}

export interface CreateReportData {
  title: string;
  authorName: string;
  location?: string;
  problems: string[];
  materials: string[];
  observations?: string;
  recommendations?: string;
  images?: any[];
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'engineer' | 'employee';
}