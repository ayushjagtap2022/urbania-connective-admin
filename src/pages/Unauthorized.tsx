import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Unauthorized: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Access Denied
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        You don't have permission to access this page.
                    </p>
                </div>
                <div className="mt-8 space-y-6">
                    <Button
                        onClick={() => navigate('/admin-login')}
                        className="w-full"
                    >
                        Go to Login
                    </Button>
                    <Button
                        onClick={() => navigate('/')}
                        variant="outline"
                        className="w-full"
                    >
                        Return to Home
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized; 