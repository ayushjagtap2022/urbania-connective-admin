import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, BookOpen, HandHelping, FileText, Image, Video, TrendingUp, ArrowUpRight, ArrowDownRight, X, Mail, Phone, MapPin, Building, Search, Filter, MoreVertical, GraduationCap, Clock, Users2, BookOpenCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { volunteerService } from '@/services/volunteer.service';
import { eventService } from '@/services/event.service';

const UserManagementCard = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch recent users
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['recentUsers'],
    queryFn: async () => {
      const allUsers = await userService.getAllUsers();
      // Sort by creation date and take the 10 most recent
      return allUsers
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
    },
    staleTime: 60000, // Cache for 1 minute
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'moderator':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'user':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="card-hover group bg-white">
        <CardHeader className="border-b p-3 xs:p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg xs:text-xl font-bold text-gray-800">Recent Users</CardTitle>
              <CardDescription className="text-xs xs:text-sm">Latest registered users</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 xs:p-4 sm:p-6">
          <div className="space-y-3 xs:space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 xs:space-x-4">
                <div className="h-8 w-8 xs:h-10 xs:w-10 rounded-full bg-gray-100 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 xs:h-4 bg-gray-100 rounded animate-pulse w-1/4" />
                  <div className="h-2 xs:h-3 bg-gray-100 rounded animate-pulse w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="card-hover group bg-white">
        <CardHeader className="border-b p-3 xs:p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg xs:text-xl font-bold text-gray-800">Recent Users</CardTitle>
              <CardDescription className="text-xs xs:text-sm">Latest registered users</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 xs:p-4 sm:p-6">
          <div className="text-center text-red-500 text-xs xs:text-sm">
            Error loading users. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover group bg-white">
      <CardHeader className="border-b p-3 xs:p-4 sm:p-6">
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-4">
          <div>
            <CardTitle className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-800">Recent Users</CardTitle>
            <CardDescription className="text-xs xs:text-sm sm:text-base">Latest registered users</CardDescription>
          </div>
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center space-y-2 xs:space-y-0 xs:space-x-3 w-full xs:w-auto">
            <div className="relative w-full xs:w-auto">
              <Search className="absolute left-2 xs:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 xs:h-4 xs:w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                className="pl-7 xs:pl-10 w-full xs:w-[200px] sm:w-[250px] lg:w-[300px] text-xs xs:text-sm"
              />
            </div>
            <Button variant="outline" size="icon" className="w-full xs:w-auto h-8 xs:h-10">
              <Filter className="h-3 w-3 xs:h-4 xs:w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-2 xs:px-4 sm:px-6 lg:px-8 py-3 xs:py-4 text-left text-xs xs:text-sm font-medium text-gray-500 uppercase tracking-wider w-1/3">User</th>
                <th className="px-2 xs:px-4 sm:px-6 lg:px-8 py-3 xs:py-4 text-left text-xs xs:text-sm font-medium text-gray-500 uppercase tracking-wider hidden xs:table-cell w-1/4">Role</th>
                <th className="px-2 xs:px-4 sm:px-6 lg:px-8 py-3 xs:py-4 text-left text-xs xs:text-sm font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell w-1/4">Status</th>
                <th className="px-2 xs:px-4 sm:px-6 lg:px-8 py-3 xs:py-4 text-right text-xs xs:text-sm font-medium text-gray-500 uppercase tracking-wider w-1/6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users?.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  onClick={() => handleUserClick(user)}
                >
                  <td className="px-2 xs:px-4 sm:px-6 lg:px-8 py-4 xs:py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Users className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div className="ml-2 xs:ml-4 sm:ml-6 min-w-0 flex-1">
                        <div className="text-xs xs:text-sm sm:text-base font-medium text-gray-900 truncate">{user.firstName} {user.lastName}</div>
                        <div className="text-xs xs:text-sm text-gray-500 truncate">{user.email}</div>
                        <div className="flex flex-wrap gap-1 mt-1 xs:hidden">
                          {user.roles.map((role) => (
                            <Badge key={role} variant="outline" className={`${getRoleColor(role)} text-xs`}>
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 xs:px-4 sm:px-6 lg:px-8 py-4 xs:py-5 whitespace-nowrap hidden xs:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role} variant="outline" className={`${getRoleColor(role)} text-xs xs:text-sm`}>
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-2 xs:px-4 sm:px-6 lg:px-8 py-4 xs:py-5 whitespace-nowrap hidden sm:table-cell">
                    <Badge variant="outline" className={`${getStatusColor('active')} text-xs xs:text-sm`}>
                      Active
                    </Badge>
                  </td>
                  <td className="px-2 xs:px-4 sm:px-6 lg:px-8 py-4 xs:py-5 whitespace-nowrap text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 xs:h-8 xs:w-8 sm:h-10 sm:w-10">
                          <MoreVertical className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild className="text-xs xs:text-sm">
                          <Link to={`/admin/users/${user._id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs xs:text-sm">Edit User</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 text-xs xs:text-sm">Delete User</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[425px] bg-white mx-2 xs:mx-4">
          <DialogHeader className="p-3 xs:p-4 sm:p-6">
            <DialogTitle className="text-base xs:text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="flex flex-col space-y-3 xs:space-y-4 py-2 xs:py-4 px-3 xs:px-4 sm:px-6">
              <div className="flex items-center justify-center">
                <div className="h-12 w-12 xs:h-16 xs:w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <Users className="h-6 w-6 xs:h-8 xs:w-8 sm:h-10 sm:w-10" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-base xs:text-lg sm:text-xl font-semibold text-gray-800">{selectedUser.firstName} {selectedUser.lastName}</h3>
                <p className="text-xs xs:text-sm sm:text-base text-gray-600">{selectedUser.email}</p>
                <p className="text-xs xs:text-sm sm:text-base text-gray-600">{selectedUser.mobile}</p>
              </div>
              <div className="space-y-2 xs:space-y-3">
                <div className="flex items-center justify-between p-2 xs:p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 mr-2 xs:mr-3 text-primary" />
                    <span className="text-xs xs:text-sm font-medium">Join Date</span>
                  </div>
                  <span className="text-xs xs:text-sm font-semibold">{format(new Date(selectedUser.createdAt), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1 xs:gap-2 p-2 xs:p-3 rounded-lg bg-gray-50">
                  {selectedUser.roles.map((role: string) => (
                    <Badge key={role} variant="outline" className={`text-xs ${getRoleColor(role)}`}>
                      {role}
                    </Badge>
                  ))}
                  <Badge variant="outline" className={`text-xs ${getStatusColor('active')}`}>
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const Dashboard = () => {
  // Fetch total users dynamically (keep using useQuery for users)
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAllUsers,
    staleTime: 60000,
  });
  const totalUsers = users?.length || 0;

  // Volunteers count using useEffect/useState
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [volunteersLoading, setVolunteersLoading] = useState(true);
  useEffect(() => {
    const fetchVolunteers = async () => {
      setVolunteersLoading(true);
      try {
        const data = await volunteerService.getAllVolunteers();
        setVolunteers(Array.isArray(data) ? data : []);
      } catch {
        setVolunteers([]);
      } finally {
        setVolunteersLoading(false);
      }
    };
    fetchVolunteers();
  }, []);
  const totalVolunteers = volunteers.length;

  // Total events count using useEffect/useState
  const [totalEvents, setTotalEvents] = useState(0);
  const [eventsLoading, setEventsLoading] = useState(true);
  useEffect(() => {
    const fetchEvents = async () => {
      setEventsLoading(true);
      try {
        const data = await eventService.getAllEvents(1, 100);
        // data may be an array or an object with events property
        const eventsArr = Array.isArray(data) ? data : data?.events || [];
        setTotalEvents(eventsArr.length);
      } catch {
        setTotalEvents(0);
      } finally {
        setEventsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="space-y-3 xs:space-y-4 sm:space-y-6 lg:space-y-8 bg-gray-50 p-2 xs:p-3 sm:p-4 md:p-6">
      <div className="flex flex-col">
        <h2 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight animate-slide-in bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
          Dashboard
        </h2>
        <p className="text-gray-600 animate-slide-in text-xs xs:text-sm sm:text-base lg:text-lg" style={{ animationDelay: "50ms" }}>
          Welcome to your admin dashboard. Here's an overview of your site's activity.
        </p>
      </div>
      <div className="grid gap-3 xs:gap-4 sm:gap-6 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 animate-slide-in" style={{ animationDelay: "100ms" }}>
        <Card className="card-hover group bg-white">
          <CardContent className="p-3 xs:p-4 sm:p-6 flex flex-col items-center justify-center">
            <div className="h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg mb-2">
              <Users className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6" />
            </div>
            <h3 className="text-lg xs:text-xl sm:text-2xl font-bold">{totalUsers}</h3>
            <p className="text-xs xs:text-sm font-medium text-gray-500 mt-1 text-center">Total Users</p>
          </CardContent>
        </Card>
        <Card className="card-hover group bg-white">
          <CardContent className="p-3 xs:p-4 sm:p-6 flex flex-col items-center justify-center">
            <div className="h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg mb-2">
              <HandHelping className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6" />
            </div>
            <h3 className="text-lg xs:text-xl sm:text-2xl font-bold">{volunteersLoading ? '...' : totalVolunteers}</h3>
            <p className="text-xs xs:text-sm font-medium text-gray-500 mt-1 text-center">Total Volunteers</p>
          </CardContent>
        </Card>
        <Card className="card-hover group bg-white">
          <CardContent className="p-3 xs:p-4 sm:p-6 flex flex-col items-center justify-center">
            <div className="h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 rounded-full bg-purple-500 flex items-center justify-center text-white shadow-lg mb-2">
              <Calendar className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6" />
            </div>
            <h3 className="text-lg xs:text-xl sm:text-2xl font-bold">{eventsLoading ? '...' : totalEvents}</h3>
            <p className="text-xs xs:text-sm font-medium text-gray-500 mt-1 text-center">Total Events</p>
          </CardContent>
        </Card>
      </div>
      <div className="w-full animate-slide-in" style={{ animationDelay: "150ms" }}>
        <UserManagementCard />
      </div>
    </div>
  );
};

export default Dashboard;
