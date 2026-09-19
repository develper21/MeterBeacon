import type { User } from "@/shared/types";

const USERS_STORAGE_KEY = "smtrack_users";

export const authService = {
  getUsers: (): User[] => {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveUsers: (users: User[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  },

  findUserByEmail: (email: string): User | undefined => {
    const users = authService.getUsers();
    return users.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
  },

  createUser: (userData: Omit<User, 'id' | 'created_at'>): User => {
    const users = authService.getUsers();
    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    authService.saveUsers(users);
    return newUser;
  },

  validateCredentials: (email: string, password: string): User | null => {
    const user = authService.findUserByEmail(email);
    if (!user) return null;
    
    if (user.password) {
      return user.password === password ? user : null;
    }
    
    // Backward compatibility for old accounts
    return user.phone === password ? user : null;
  },

  updateUserPassword: (email: string, password: string): void => {
    const users = authService.getUsers();
    const index = users.findIndex(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
    if (index !== -1) {
      users[index].password = password;
      authService.saveUsers(users);
    }
  },
};
