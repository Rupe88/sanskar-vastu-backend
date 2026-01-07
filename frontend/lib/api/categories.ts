import { apiClient, handleApiResponse, handleApiError } from './axios';
import { API_ENDPOINTS } from '@/lib/utils/constants';
import { Category } from '@/lib/types/course';

export const getAllCategories = async (params?: {
  type?: string;
}): Promise<Category[]> => {
  try {
    const response = await apiClient.get<{ data: Category[] }>(API_ENDPOINTS.CATEGORIES.LIST, {
      params,
    });
    return handleApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getCategoryById = async (id: string): Promise<Category> => {
  try {
    const response = await apiClient.get<{ data: Category }>(API_ENDPOINTS.CATEGORIES.BY_ID(id));
    return handleApiResponse(response);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

