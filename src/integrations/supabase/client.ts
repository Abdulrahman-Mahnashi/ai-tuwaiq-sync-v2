// MOCK SUPABASE CLIENT - All Supabase functionality disabled
// This file replaces Supabase with safe mock implementations
import type { Database } from './types';

// Mock user for auth
const MOCK_USER = {
  id: 'mock-user-id',
  email: 'user@example.com',
  user_metadata: { name: 'Mock User' },
  aud: 'authenticated',
  role: 'authenticated',
};

// Mock session
const MOCK_SESSION = {
  access_token: 'mock-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: 'bearer',
  user: MOCK_USER,
};

// Mock auth object
const mockAuth = {
  getSession: async () => {
    return {
      data: { session: null },
      error: null,
    };
  },
  getUser: async () => {
    return {
      data: { user: null },
      error: null,
    };
  },
  signInWithPassword: async (credentials: any) => {
    // Return mock user for any credentials
    return {
      data: {
        user: MOCK_USER,
        session: MOCK_SESSION,
      },
      error: null,
    };
  },
  signUp: async (credentials: any) => {
    return {
      data: {
        user: MOCK_USER,
        session: MOCK_SESSION,
      },
      error: null,
    };
  },
  signOut: async () => {
    return {
      data: null,
      error: null,
    };
  },
  onAuthStateChange: (callback: any) => {
    // Return a subscription object
    return {
      data: { subscription: null },
      unsubscribe: () => {},
    };
  },
};

// Mock database query builder
const createMockQueryBuilder = (table: string) => {
  return {
    select: (columns?: string) => {
      return {
        eq: (column: string, value: any) => ({
          data: [],
          error: null,
        }),
        neq: (column: string, value: any) => ({
          data: [],
          error: null,
        }),
        like: (column: string, pattern: string) => ({
          data: [],
          error: null,
        }),
        ilike: (column: string, pattern: string) => ({
          data: [],
          error: null,
        }),
        order: (column: string, options?: any) => ({
          data: [],
          error: null,
        }),
        limit: (count: number) => ({
          data: [],
          error: null,
        }),
        single: () => ({
          data: null,
          error: null,
        }),
        then: (onResolve: any, onReject?: any) => {
          return Promise.resolve({ data: [], error: null }).then(onResolve, onReject);
        },
        data: [],
        error: null,
      };
    },
    insert: (values: any) => {
      return {
        select: (columns?: string) => ({
          data: values,
          error: null,
        }),
        single: () => ({
          data: values,
          error: null,
        }),
        then: (onResolve: any, onReject?: any) => {
          return Promise.resolve({ data: values, error: null }).then(onResolve, onReject);
        },
        data: values,
        error: null,
      };
    },
    update: (values: any) => {
      return {
        eq: (column: string, value: any) => ({
          select: (columns?: string) => ({
            data: values,
            error: null,
          }),
          single: () => ({
            data: values,
            error: null,
          }),
          then: (onResolve: any, onReject?: any) => {
            return Promise.resolve({ data: values, error: null }).then(onResolve, onReject);
          },
          data: values,
          error: null,
        }),
        then: (onResolve: any, onReject?: any) => {
          return Promise.resolve({ data: values, error: null }).then(onResolve, onReject);
        },
        data: values,
        error: null,
      };
    },
    delete: () => {
      return {
        eq: (column: string, value: any) => ({
          data: null,
          error: null,
        }),
        then: (onResolve: any, onReject?: any) => {
          return Promise.resolve({ data: null, error: null }).then(onResolve, onReject);
        },
        data: null,
        error: null,
      };
    },
  };
};

// Mock database object
const mockDatabase = {
  from: (table: string) => createMockQueryBuilder(table),
};

// Mock storage object
const mockStorage = {
  from: (bucket: string) => ({
    upload: async (path: string, file: any) => ({
      data: { path },
      error: null,
    }),
    download: async (path: string) => ({
      data: null,
      error: null,
    }),
    remove: async (paths: string[]) => ({
      data: null,
      error: null,
    }),
    list: async (path?: string) => ({
      data: [],
      error: null,
    }),
  }),
};

// Mock Supabase client
export const supabase = {
  auth: mockAuth,
  from: mockDatabase.from,
  storage: mockStorage,
  // Add any other Supabase client properties that might be accessed
  rest: mockDatabase,
  rpc: async (fn: string, args?: any) => ({
    data: null,
    error: null,
  }),
} as any;