import axios from './api.config';

export interface Admin {
    id: string;
    firstName: string;
    lastName: string;
    mobile: string;
    email: string;
    isActive: boolean;
}

export interface RegisterData {
    firstName: string;
    lastName: string;
    mobile: string;
    email: string;
    password: string;
    isAdmin?: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    admin: Admin | null;
    message: string;
}

class AuthService {
    async register(data: RegisterData): Promise<AuthResponse> {
        try {
            const response = await axios.post<AuthResponse>('/api/auth/admin-register', data);

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                if (response.data.admin) {
                    localStorage.setItem('admin', JSON.stringify(response.data.admin));
                }
            }

            return response.data;
        } catch (error: any) {
            console.error('Registration error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    }

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const response = await axios.post<AuthResponse>('/api/auth/admin-login', credentials);

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                if (response.data.admin) {
                    localStorage.setItem('admin', JSON.stringify(response.data.admin));
                }
            } else {
                // Clear any existing admin data if no token is received
                this.logout();
                throw new Error('Invalid credentials');
            }

            // Verify admin status
            if (!response.data.admin) {
                this.logout();
                throw new Error('Unauthorized: Admin access required');
            }

            return response.data;
        } catch (error: any) {
            console.error('Login error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Invalid credentials');
        }
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
    }

    getCurrentAdmin(): Admin | null {
        const adminStr = localStorage.getItem('admin');
        if (!adminStr) return null;
        try {
            const admin = JSON.parse(adminStr);
            return admin;
        } catch {
            return null;
        }
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        const admin = this.getCurrentAdmin();
        return !!(token && admin);
    }

    // Add method to get redirect path
    getRedirectPath(): string {
        return '/admin/';  // Always redirect to admin dashboard
    }
}

export const authService = new AuthService();
export default authService; 