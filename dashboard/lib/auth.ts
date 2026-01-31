import NextAuth from 'next-auth'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import { Adapter } from 'next-auth/adapters'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// User roles
export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  organization: string
  permissions: string[]
}

// JWT configuration
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Permission definitions
export const PERMISSIONS = {
  // Dashboard permissions
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_ANALYTICS: 'view_analytics',
  
  // Tracker management
  ADD_TRACKER: 'add_tracker',
  EDIT_TRACKER: 'edit_tracker',
  DELETE_TRACKER: 'delete_tracker',
  
  // User management
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  
  // System administration
  SYSTEM_CONFIG: 'system_config',
  VIEW_LOGS: 'view_logs',
  
  // Hardware management
  DEPLOY_FIRMWARE: 'deploy_firmware',
  MANAGE_DEVICES: 'manage_devices',
} as const

// Role-based permissions
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: Object.values(PERMISSIONS),
  manager: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.ADD_TRACKER,
    PERMISSIONS.EDIT_TRACKER,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_DEVICES,
  ],
  operator: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.ADD_TRACKER,
    PERMISSIONS.EDIT_TRACKER,
    PERMISSIONS.MANAGE_DEVICES,
  ],
  viewer: [
    PERMISSIONS.VIEW_DASHBOARD,
  ],
}

// NextAuth configuration
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // In production, this would query your database
          // For now, we'll use a mock user system
          const mockUser = await getMockUser(credentials.email)
          
          if (!mockUser) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            mockUser.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
            role: mockUser.role,
            organization: mockUser.organization,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  
  adapter: SupabaseAdapter({
    url: SUPABASE_URL,
    secret: SUPABASE_SERVICE_KEY,
  }) as Adapter,
  
  session: {
    strategy: 'jwt' as const,
  },
  
  jwt: {
    secret: JWT_SECRET,
  },
  
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
        token.organization = user.organization
      }
      return token
    },
    
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRole
        session.user.organization = token.organization as string
      }
      return session
    },
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}

// Mock user database (replace with real database in production)
const mockUsers = [
  {
    id: '1',
    email: 'admin@discom.com',
    password: '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', // 'admin123'
    name: 'System Administrator',
    role: 'admin' as UserRole,
    organization: 'DISCOM North',
  },
  {
    id: '2',
    email: 'manager@discom.com',
    password: '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', // 'manager123'
    name: 'Operations Manager',
    role: 'manager' as UserRole,
    organization: 'DISCOM North',
  },
]

async function getMockUser(email: string) {
  return mockUsers.find(user => user.email === email)
}

// Permission checking utilities
export function hasPermission(userRole: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[userRole].includes(permission)
}

export function hasAnyPermission(userRole: UserRole, permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission))
}

export function hasAllPermissions(userRole: UserRole, permissions: string[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission))
}

// Device authentication for ESP32
export function generateDeviceToken(deviceId: string): string {
  return jwt.sign(
    { 
      deviceId,
      type: 'device',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30), // 30 days
    },
    JWT_SECRET
  )
}

export function verifyDeviceToken(token: string): { deviceId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.type === 'device') {
      return { deviceId: decoded.deviceId }
    }
    return null
  } catch {
    return null
  }
}

// API key generation for external integrations
export function generateApiKey(userId: string, permissions: string[]): string {
  return jwt.sign(
    {
      userId,
      permissions,
      type: 'api_key',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365), // 1 year
    },
    JWT_SECRET
  )
}

export default NextAuth(authOptions)
