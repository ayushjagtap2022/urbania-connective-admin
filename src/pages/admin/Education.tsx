import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Mail, Download, Check, X, Book, BookOpen, Languages, Users, UserCircle, GraduationCap, MoreVertical, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import RegistrationDetails from '@/components/registrations/RegistrationDetails';
import api from '@/services/api.config';

const EducationPage = () => {
  const { toast } = useToast();
  const [selectedRegistration, setSelectedRegistration] = React.useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState('all');

  // Fetch real registrations from backend
  const [registrations, setRegistrations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const response = await api.get('/api/course-registration');
        const data = response.data;
        setRegistrations(data);
      } catch (error) {
        console.error('Error fetching registrations:', error);
        toast({
          title: "Error",
          description: "Failed to load registrations.",
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  // Filter registrations based on status
  const filteredRegistrations = statusFilter === 'all'
    ? registrations
    : registrations.filter(reg => reg.status === statusFilter);

  // Calculate statistics
  const stats = {
    total: registrations.length,
    pending: registrations.filter(reg => reg.status === "Pending").length,
    approved: registrations.filter(reg => reg.status === "Approved").length,
    rejected: registrations.filter(reg => reg.status === "Rejected").length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-[#19875C] text-white';
      case 'Rejected':
        return 'bg-red-500 text-white';
      case 'Pending':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateStatus = async (registrationId: string, newStatus: string) => {
    try {
      const response = await api.patch(`/api/course-registration/${registrationId}/status`, {
        status: newStatus
      });

      const updatedRegistration = response.data;

      const updatedRegistrations = registrations.map(reg =>
        reg._id === registrationId ? updatedRegistration : reg
      );
      setRegistrations(updatedRegistrations);

      toast({
        title: "Status Updated",
        description: `Registration status has been updated to ${newStatus}`,
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Failed to update status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update registration status.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleViewDetails = (registration: any) => {
    setSelectedRegistration(registration);
    setIsDetailsOpen(true);
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold mb-2">Education Programs</h1>
        <p className="text-sm sm:text-base text-gray-500">Manage and review course registrations for educational programs.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Registrations</span>
              <Badge variant="outline" className="bg-[#19875C] text-white">{stats.total}</Badge>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Review</span>
              <Badge variant="outline" className="bg-yellow-500 text-white">{stats.pending}</Badge>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{stats.pending}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Approved</span>
              <Badge variant="outline" className="bg-[#19875C] text-white">{stats.approved}</Badge>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{stats.approved}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rejected</span>
              <Badge variant="outline" className="bg-red-500 text-white">{stats.rejected}</Badge>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{stats.rejected}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Registrations */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">Recent Registrations</h2>
              <p className="text-gray-500">View and manage course registrations submitted through the portal.</p>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'Pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('Pending')}
                className={statusFilter === 'Pending' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'Approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('Approved')}
                className={statusFilter === 'Approved' ? 'bg-[#19875C] hover:bg-[#167a52]' : ''}
              >
                Approved
              </Button>
              <Button
                variant={statusFilter === 'Rejected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('Rejected')}
                className={statusFilter === 'Rejected' ? 'bg-red-500 hover:bg-red-600' : ''}
              >
                Rejected
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 sm:px-4">Name</th>
                    <th className="text-left py-3 px-2 sm:px-4 hidden sm:table-cell">Email</th>
                    <th className="text-left py-3 px-2 sm:px-4">Course</th>
                    <th className="text-left py-3 px-2 sm:px-4 hidden md:table-cell">Date</th>
                    <th className="text-left py-3 px-2 sm:px-4">Status</th>
                    <th className="text-left py-3 px-2 sm:px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 sm:py-8 text-gray-500 px-2 sm:px-4">
                        No registrations found with the selected status.
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((registration) => (
                      <tr key={registration._id} className="border-b">
                        <td className="py-3 sm:py-4 px-2 sm:px-4">
                          <div className="min-w-0">
                            <div className="font-medium text-sm sm:text-base truncate">{registration.name}</div>
                            <div className="text-xs sm:text-sm text-muted-foreground truncate sm:hidden">{registration.email}</div>
                          </div>
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4 hidden sm:table-cell">
                          <span className="text-sm truncate">{registration.email}</span>
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4">
                          <span className="text-sm sm:text-base truncate">{registration.courseTitle}</span>
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4 hidden md:table-cell">
                          <span className="text-xs sm:text-sm">{new Date(registration.date).toLocaleString()}</span>
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4">
                          <Badge className={`${getStatusColor(registration.status)} text-xs`}>
                            {registration.status || 'Pending'}
                          </Badge>
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-8 sm:w-8">
                                <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(registration)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(registration._id, 'Approved')} disabled={registration.status === 'Approved'} className="text-green-600">
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(registration._id, 'Rejected')} disabled={registration.status === 'Rejected'} className="text-red-600">
                                Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registration Details Dialog */}
      <RegistrationDetails
        registration={selectedRegistration}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
};

export default EducationPage; 