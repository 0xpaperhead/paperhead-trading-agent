'use client';

import { createContext, useContext, useEffect, useState, ReactNode, Suspense, useCallback } from 'react';
import { useDynamicContext } from '@/lib/dynamic';
import { useSearchParams } from 'next/navigation';
import { Database } from '@/types/db.extended';
import { toast } from 'sonner';
import fetchApi from './lib/fetch';

type User = Database['public']['Tables']['users']['Row'];

interface UserContextState {
    isLoading: boolean;
    userData: User | null;
    error: string | null;
}

// Create a type for the authenticated context
type AuthenticatedContext = {
    userData: User | null;
    refreshUserData: () => Promise<void>;
    setUserData: (userData: Partial<User>) => void;
    isLoading: boolean;
};

const UserContext = createContext<AuthenticatedContext | null>(null);

interface UserProviderProps {
    children: ReactNode;
    fallback?: ReactNode;
}

// Inner component that uses useSearchParams
function UserProviderInner({ children, fallback }: UserProviderProps) {
    const { primaryWallet, user } = useDynamicContext();

    const [state, setState] = useState<UserContextState>({
        isLoading: true,
        userData: null,
        error: null,
    });

    // Listen for auth errors from axios interceptor
    useEffect(() => {
        const handleAuthError = () => {
            setState(prev => ({
                ...prev,
                error: 'Authentication error - please reconnect your wallet',
            }));
        };

        window.addEventListener('auth-error', handleAuthError);
        return () => window.removeEventListener('auth-error', handleAuthError);
    }, []);

    // Memoize fetchUserData to avoid unnecessary re-renders
    const fetchUserData = useCallback(async () => {

        if (!primaryWallet && !user) {
            setState(prev => ({
                ...prev,
                isLoading: false,
            }));
            return;
        }

        setState(prev => ({ ...prev, isLoading: true }));

        try {

            const res = await fetchApi.get('/api/auth');
            const data = await res.json();

            setState({
                isLoading: false,
                userData: data.user,
                error: null,
            });
        } catch (error) {
            console.error("Error fetching user data:", error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to fetch user data',
            }));
        }
    }, [primaryWallet]);

    const refreshUserData = useCallback(async () => {
        if (!primaryWallet) return;

        try {
            const res = await fetchApi.get('/api/auth');
            const data = await res.json();

            setState(prev => ({
                ...prev,
                userData: data.user,
            }));
        } catch (error) {
            console.error("Failed to refresh user data:", error);
            toast.error("Failed to refresh user data");
        }
    }, [primaryWallet]);

    // Fetch user data on mount
    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    // Listen for page visibility changes to refresh data when tab becomes visible again
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                if (primaryWallet) {
                    fetchUserData();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [fetchUserData]);

    // refresh user data when user changes
    useEffect(() => {
        if (primaryWallet || user) {
            fetchUserData();
        }
        else {
            refreshUserData();
        }
    }, [primaryWallet, user, fetchUserData, refreshUserData]);

    const setUserData = (newUserData: Partial<User>) => {
        setState(prev => ({
            ...prev,
            userData: prev.userData ? { ...prev.userData, ...newUserData } : null,
        }));
    };

    // Loading state
    if (state.isLoading && fallback) {
        return fallback;
    }

    const contextValue: AuthenticatedContext = {
        userData: state.userData,
        refreshUserData,
        setUserData,
        isLoading: state.isLoading,
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
}

// Outer component with Suspense boundary
export function UserProvider(props: UserProviderProps) {
    return (
        <Suspense fallback={props.fallback || <div>Loading...</div>}>
            <UserProviderInner {...props} />
        </Suspense>
    );
}

export function useUser(): AuthenticatedContext {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}