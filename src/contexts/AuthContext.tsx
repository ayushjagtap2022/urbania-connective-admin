import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, Admin, LoginCredentials, RegisterData } from '../services/auth.service';

interface AuthContextType {
    admin: Admin | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const storedAdmin = authService.getCurrentAdmin();
                if (storedAdmin) {
                    setAdmin(storedAdmin);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                authService.logout();
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            setError(null);
            const response = await authService.login(credentials);
            if (!response.admin) {
                throw new Error('Unauthorized: Admin access required');
            }
            setAdmin(response.admin);
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const register = async (data: RegisterData) => {
        try {
            setError(null);
            const response = await authService.register(data);
            if (!response.admin) {
                throw new Error('Unauthorized: Admin access required');
            }
            setAdmin(response.admin);
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const logout = () => {
        authService.logout();
        setAdmin(null);
        setError(null);
    };

    const value = {
        admin,
        loading,
        error,
        isAuthenticated: !!admin,
        login,
        register,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext; 