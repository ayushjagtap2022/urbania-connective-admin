
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="max-w-3xl text-center animate-slide-in">
        <div className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
          Welcome to the Community Portal
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">
          Community Portal Administration
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          This is your community management system where you can manage users, events, services, education programs, volunteering opportunities, and more.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="flex items-center">
            <Link to="/admin/dashboard">
              Go to Admin Panel
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/admin/dashboard">
              View Site Documentation
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-16 text-center text-sm text-muted-foreground">
        <p>For demonstration purposes only.</p>
        <p>Login with any email and password.</p>
      </div>
    </div>
  );
};

export default Index;
