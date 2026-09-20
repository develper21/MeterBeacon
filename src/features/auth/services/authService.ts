import { apiClient, tokenStorage, ApiResponse } from "@/shared/services/api.client";
import type { User, AppRole } from "@/shared/types";

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    role: string;
  };
}

const normalizeUser = (backendUser: any): User => {
  let role: AppRole = "field_engineer";
  const r = (backendUser.role || "").toUpperCase();
  if (r === "ADMIN") role = "admin";
  else if (r === "MANAGER") role = "manager";
  else role = "field_engineer";

  return {
    id: backendUser.id,
    email: backendUser.email,
    full_name: backendUser.fullName || backendUser.full_name || "User",
    phone: backendUser.phone || null,
    avatar_url: backendUser.avatar_url || null,
    role,
    created_at: backendUser.createdAt || backendUser.created_at || new Date().toISOString(),
  };
};

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const res = await apiClient.post<ApiResponse<LoginResponseData>>("/auth/login", {
      email,
      password,
    });

    if (!res.data?.accessToken) {
      throw new Error(res.message || "Invalid login response from server");
    }

    tokenStorage.setToken(res.data.accessToken);
    if (res.data.refreshToken) {
      tokenStorage.setRefreshToken(res.data.refreshToken);
    }

    const normalized = normalizeUser(res.data.user);
    localStorage.setItem("smtrack_user", JSON.stringify(normalized));
    return normalized;
  },

  register: async (userData: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: string;
  }): Promise<User> => {
    const res = await apiClient.post<ApiResponse<any>>("/auth/register", {
      email: userData.email,
      password: userData.password,
      fullName: userData.fullName,
      phone: userData.phone,
      role: (userData.role || "FIELD_ENGINEER").toUpperCase(),
    });

    return normalizeUser(res.data);
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignore network error on logout
    } finally {
      tokenStorage.clearTokens();
      localStorage.removeItem("smtrack_user");
    }
  },

  getCurrentUser: (): User | null => {
    const token = tokenStorage.getToken();
    if (!token) return null;
    const stored = localStorage.getItem("smtrack_user");
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },
};
