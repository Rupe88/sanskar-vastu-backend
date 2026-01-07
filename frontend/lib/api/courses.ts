import { apiClient, handleApiResponse, handleApiError } from './axios';
import { API_ENDPOINTS } from '@/lib/utils/constants';
import { Course } from '@/lib/types/course';
import { PaginatedResponse } from '@/lib/types/api';

export const getAllCourses = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  instructorId?: string;
  level?: string;
  status?: string;
}): Promise<PaginatedResponse<Course>> => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.COURSES.LIST, {
      params,
    });
    
    // Backend returns: { success: true, data: Course[], pagination: {...} }
    const payload = response.data as { success: boolean; data: Course[]; pagination: any };
    if (payload.success && payload.data) {
      return {
        data: payload.data,
        pagination: payload.pagination || {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: payload.data.length,
          pages: 1,
        },
      };
    }
    throw new Error(payload.message || 'Failed to fetch courses');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const filterCourses = async (filters: {
  categoryId?: string;
  instructorId?: string;
  level?: string;
  priceMin?: number;
  priceMax?: number;
  isFree?: boolean;
  featured?: boolean;
  isOngoing?: boolean;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Course>> => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.COURSES.FILTER, {
      params: filters,
    });
    
    // Backend returns: { success: true, data: Course[], pagination: {...} }
    const payload = response.data as { success: boolean; data: Course[]; pagination: any };
    if (payload.success && payload.data) {
      return {
        data: payload.data,
        pagination: payload.pagination || {
          page: filters?.page || 1,
          limit: filters?.limit || 10,
          total: payload.data.length,
          pages: 1,
        },
      };
    }
    throw new Error(payload.message || 'Failed to filter courses');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getOngoingCourses = async (): Promise<Course[]> => {
  try {
    const response = await apiClient.get<{ data: Course[] }>(API_ENDPOINTS.COURSES.ONGOING);
    return handleApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getCourseById = async (id: string): Promise<Course> => {
  try {
    const response = await apiClient.get<{ data: Course }>(API_ENDPOINTS.COURSES.BY_ID(id));
    return handleApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const createCourse = async (data: Partial<Course>): Promise<Course> => {
  try {
    const response = await apiClient.post<{ data: Course }>(API_ENDPOINTS.COURSES.LIST, data);
    return handleApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const updateCourse = async (id: string, data: Partial<Course>): Promise<Course> => {
  try {
    const response = await apiClient.put<{ data: Course }>(API_ENDPOINTS.COURSES.BY_ID(id), data);
    return handleApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const deleteCourse = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(API_ENDPOINTS.COURSES.BY_ID(id));
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

