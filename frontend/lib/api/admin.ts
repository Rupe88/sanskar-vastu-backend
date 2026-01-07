import { apiClient, handleApiResponse, handleApiError } from './axios';
import { API_ENDPOINTS } from '@/lib/utils/constants';
import { User } from '@/lib/types/auth';
import { PaginatedResponse } from '@/lib/types/api';

export const getAllUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResponse<User>> => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.USERS, {
      params,
    });
    return handleApiResponse<PaginatedResponse<User>>(response as any);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getUserById = async (id: string): Promise<User> => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.USER_BY_ID(id));
    const data = handleApiResponse<{ user: User }>(response as any);
    return data.user;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const blockUser = async (userId: string): Promise<void> => {
  try {
    await apiClient.post(API_ENDPOINTS.ADMIN.BLOCK_USER, { userId });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const unblockUser = async (userId: string): Promise<void> => {
  try {
    await apiClient.post(API_ENDPOINTS.ADMIN.UNBLOCK_USER, { userId });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

