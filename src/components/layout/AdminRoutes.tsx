import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the admin pages for better performance
const Dashboard = React.lazy(() => import('../../pages/admin/Dashboard'));
const Users = React.lazy(() => import('../../pages/admin/Users'));
const UserDetails = React.lazy(() => import('../../pages/admin/UserDetails'));
const Events = React.lazy(() => import('../../pages/admin/Events'));
const Forms = React.lazy(() => import('../../pages/admin/Forms'));
const Services = React.lazy(() => import('../../pages/admin/Services'));
const Education = React.lazy(() => import('../../pages/admin/Education'));
const Volunteering = React.lazy(() => import('../../pages/admin/Volunteering'));
const VolunteerDetails = React.lazy(() => import('../../pages/admin/VolunteerDetails'));
const Donations = React.lazy(() => import('../../pages/admin/Donations'));
const AdminNotFound = React.lazy(() => import('../../pages/admin/NotFound'));
const AddUser = React.lazy(() => import('../../pages/admin/AddUser'));
const EventAttendees = React.lazy(() => import('../../pages/admin/EventAttendees'));
const EventAttendeeDetails = React.lazy(() => import('../../pages/admin/EventAttendeeDetails'));
const EditUser = React.lazy(() => import('../../pages/admin/EditUser'));

// Fallback loading component
const PageLoading = () => (
  <div className="p-6 space-y-4 w-full">
    <Skeleton className="h-10 w-1/3" />
    <Skeleton className="h-4 w-2/3" />
    <div className="grid grid-cols-4 gap-4 pt-4">
      <Skeleton className="h-40" />
      <Skeleton className="h-40" />
      <Skeleton className="h-40" />
      <Skeleton className="h-40" />
    </div>
  </div>
);

const AdminRoutes = () => {
  return (
    <AdminLayout>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          {/* Redirect /admin and /admin/ to /admin/dashboard */}
          <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Admin dashboard */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* User management */}
          <Route path="users" element={<Users />} />
          <Route path="users/:userId" element={<UserDetails />} />
          <Route path="users/add" element={<AddUser />} />
          <Route path="users/edit/:id" element={<EditUser />} />

          {/* Event management */}
          <Route path="events" element={<Events />} />
          <Route path="events/:id/attendees" element={<EventAttendees />} />
          <Route path="events/:eventId/attendees/:registrationId" element={<EventAttendeeDetails />} />

          {/* Form management */}
          <Route path="forms" element={<Forms />} />

          {/* Service management */}
          <Route path="services" element={<Services />} />

          {/* Education management */}
          <Route path="education" element={<Education />} />

          {/* Volunteering management */}
          <Route path="volunteering" element={<Volunteering />} />
          <Route path="volunteering/:id" element={<VolunteerDetails />} />

          {/* Donations management */}
          <Route path="donations" element={<Donations />} />

          {/* Catch all route */}
          <Route path="*" element={<AdminNotFound />} />
        </Routes>
      </Suspense>
    </AdminLayout>
  );
};

export default AdminRoutes;
