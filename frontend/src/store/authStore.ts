import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
    id: number;
    email: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    patronymic?: string;
    birth_date?: string;
    education_info?: any[];
    experience_info?: any[];
    phone_number?: string;
    headline?: string;
    bio?: string;
    skills?: string[];
    languages?: any[];
    social_links?: any[];
    is_active: boolean;
    is_superuser?: boolean;
    is_expert?: boolean;
    subscription_tier?: string;
    profile_completed?: boolean;
    profile_picture_url?: string;
}


interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
            logout: () => set({ user: null, token: null, isAuthenticated: false }),
        }),
        {
            name: 'joyida-auth',
        }
    )
);
