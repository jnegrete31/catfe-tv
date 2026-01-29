import axios from 'axios';

// Configure this to your deployed backend URL
// During development, use your local network IP or tunnel URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-catfe-tv-app.manus.space';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types matching the backend schema
export type ScreenType = 
  | 'SNAP_AND_PURR'
  | 'EVENT'
  | 'TODAY_AT_CATFE'
  | 'MEMBERSHIP'
  | 'REMINDER'
  | 'ADOPTION'
  | 'THANK_YOU';

export interface Screen {
  id: number;
  screenType: ScreenType;
  title: string;
  subtitle: string | null;
  body: string | null;
  imagePath: string | null;
  qrUrl: string | null;
  startAt: string | null;
  endAt: string | null;
  daysOfWeek: number[] | null;
  timeStart: string | null;
  timeEnd: string | null;
  priority: number;
  durationSeconds: number;
  sortOrder: number;
  isActive: boolean;
  isProtected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  id: number;
  locationName: string;
  defaultDurationSeconds: number;
  fallbackMode: 'AMBIENT' | 'LOOP_DEFAULT';
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  } | null;
  snapAndPurrFrequency: number;
  githubRepo: string | null;
  githubBranch: string | null;
  refreshIntervalSeconds: number;
  weatherLat: number | null;
  weatherLon: number | null;
}

// API functions using tRPC-style endpoints
export const screensApi = {
  list: async (): Promise<Screen[]> => {
    const response = await api.get('/api/trpc/screens.list');
    return response.data.result.data;
  },
  
  getActive: async (): Promise<Screen[]> => {
    const response = await api.get('/api/trpc/screens.getActive');
    return response.data.result.data;
  },
  
  getById: async (id: number): Promise<Screen> => {
    const response = await api.get(`/api/trpc/screens.getById?input=${JSON.stringify({ id })}`);
    return response.data.result.data;
  },
  
  create: async (data: Partial<Screen>): Promise<Screen> => {
    const response = await api.post('/api/trpc/screens.create', data);
    return response.data.result.data;
  },
  
  update: async (id: number, data: Partial<Screen>): Promise<Screen> => {
    const response = await api.post('/api/trpc/screens.update', { id, ...data });
    return response.data.result.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.post('/api/trpc/screens.delete', { id });
  },
  
  reorder: async (ids: number[]): Promise<void> => {
    await api.post('/api/trpc/screens.reorder', { ids });
  },
};

export const settingsApi = {
  get: async (): Promise<Settings> => {
    const response = await api.get('/api/trpc/settings.get');
    return response.data.result.data;
  },
  
  update: async (data: Partial<Settings>): Promise<Settings> => {
    const response = await api.post('/api/trpc/settings.update', data);
    return response.data.result.data;
  },
};

export default api;
