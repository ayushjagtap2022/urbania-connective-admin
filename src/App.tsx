import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/admin/Login';
import Register from './pages/admin/Register';
import Dashboard from './pages/admin/Dashboard';
import Unauthorized from './pages/Unauthorized';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminRoutes from "./components/layout/AdminRoutes";
import AdminLayout from "./components/layout/AdminLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, loading, admin } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated || !admin) {
        return <Navigate to="/admin-login" state={{ from: window.location.pathname }} replace />;
    }

    return <>{children}</>;
};

const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <Router>
                        <Routes>
                            {/* Public routes */}
                            <Route path="/admin-login" element={<Login />} />
                            <Route path="/admin-register" element={<Register />} />
                            <Route path="/unauthorized" element={<Unauthorized />} />

                            {/* Redirect root to admin dashboard */}
                            <Route path="/" element={<Navigate to="/admin/" replace />} />

                            {/* Protected admin routes */}
                            <Route
                                path="/admin/*"
                                element={
                                    <AdminRoute>
                                        <AdminRoutes />
                                    </AdminRoute>
                                }
                            />

                            {/* Catch all route */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Router>
                </TooltipProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
};

export default App;
