
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const AdminNotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="space-y-6 max-w-md animate-slide-in">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-medium">Page Not Found</h2>
        <p className="text-muted-foreground">
          The admin page you're looking for doesn't exist or you may not have the necessary permissions to view it.
        </p>
        <Button asChild className="mt-4">
          <Link to="/admin" className="flex items-center">
            <Home className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default AdminNotFound;
