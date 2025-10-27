import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { volunteerService, Volunteer } from '@/services/volunteer.service';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, List, Grid } from 'lucide-react';
import { format } from 'date-fns';

const Volunteering = () => {
  const navigate = useNavigate();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'applicationDate' | 'fullName' | 'status'>('applicationDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;
  const [groupByRole, setGroupByRole] = useState(false);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const data = await volunteerService.getAllVolunteers();
      setVolunteers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch volunteers');
      toast.error('Failed to fetch volunteers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string | undefined) => {
    if (!status) return 'PENDING';
    return status.toUpperCase();
  };

  // Unique roles and availabilities for filters
  const allRoles = Array.from(new Set(volunteers.map(v => v.role))).filter(Boolean);
  const allAvailabilities = Array.from(new Set(volunteers.map(v => v.availability))).filter(Boolean);

  // Filtering
  let filtered = volunteers.filter(v => {
    const matchesStatus = activeTab === 'all' ? true : v.status?.toLowerCase() === activeTab;
    const matchesRole = roleFilter === 'all' ? true : v.role === roleFilter;
    const matchesAvailability = availabilityFilter === 'all' ? true : v.availability === availabilityFilter;
    const matchesSearch =
      v.fullName.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase()) ||
      v.phone.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesRole && matchesAvailability && matchesSearch;
  });

  // Sorting
  filtered = filtered.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (sortBy === 'applicationDate') {
      valA = new Date(valA);
      valB = new Date(valB);
    }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Bulk actions
  const toggleRow = (id: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
      return newSet;
    });
  };
  const selectAll = () => setSelectedRows(new Set(paginated.map(v => v._id)));
  const clearAll = () => setSelectedRows(new Set());
  const bulkApprove = async () => {
    for (const id of selectedRows) await volunteerService.approveVolunteer(id);
    toast.success('Selected applications approved');
    fetchVolunteers();
    clearAll();
  };
  const bulkReject = async () => {
    for (const id of selectedRows) await volunteerService.rejectVolunteer(id);
    toast.success('Selected applications rejected');
    fetchVolunteers();
    clearAll();
  };
  // Export to CSV
  const exportCSV = () => {
    const rows = [
      ['Full Name', 'Email', 'Phone', 'Role', 'Availability', 'Status', 'Application Date'],
      ...filtered.map(v => [v.fullName, v.email, v.phone, v.role, v.availability, v.status, v.applicationDate])
    ];
    const csv = rows.map(r => r.map(x => `"${x}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'volunteers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render volunteer card component
  const renderVolunteerCard = (volunteer: Volunteer) => (
    <Card key={volunteer._id} className={selectedRows.has(volunteer._id) ? 'ring-2 ring-primary' : 'hover:shadow-lg transition-shadow'}>
      <CardHeader className="p-3 xs:p-4 sm:p-6">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-sm xs:text-base sm:text-lg line-clamp-2">{volunteer.fullName}</CardTitle>
          <Badge className={`${getStatusColor(volunteer.status)} text-xs flex-shrink-0`}>
            {getStatusText(volunteer.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 xs:p-4 sm:p-6 pt-0">
        <div className="space-y-3 xs:space-y-4">
          <div>
            <p className="text-xs xs:text-sm text-muted-foreground">Contact</p>
            <p className="font-medium text-xs xs:text-sm truncate">{volunteer.email}</p>
            <p className="font-medium text-xs xs:text-sm">{volunteer.phone}</p>
          </div>
          <div>
            <p className="text-xs xs:text-sm text-muted-foreground">Role</p>
            <p className="font-medium text-xs xs:text-sm">{volunteer.role}</p>
          </div>
          <div>
            <p className="text-xs xs:text-sm text-muted-foreground">Availability</p>
            <p className="font-medium text-xs xs:text-sm">{volunteer.availability}</p>
          </div>
          <div>
            <p className="text-xs xs:text-sm text-muted-foreground">Application Date</p>
            <p className="font-medium text-xs xs:text-sm">{format(new Date(volunteer.applicationDate), 'yyyy-MM-dd')}</p>
          </div>
          {volunteer.skills && volunteer.skills.length > 0 && (
            <div>
              <p className="text-xs xs:text-sm text-muted-foreground">Skills</p>
              <div className="flex flex-wrap gap-1 xs:gap-2 mt-1">
                {volunteer.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            {!groupByRole && (
              <input 
                type="checkbox" 
                checked={selectedRows.has(volunteer._id)} 
                onChange={() => toggleRow(volunteer._id)}
                className="mt-2 w-3 h-3 xs:w-4 xs:h-4"
              />
            )}
            <Button
              variant="outline"
              className="flex-1 text-xs xs:text-sm px-2 xs:px-3"
              onClick={() => navigate(`/admin/volunteering/${volunteer._id}`)}
            >
              <span className="hidden xs:inline">View Details</span>
              <span className="xs:hidden">View</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Render table row component
  const renderTableRow = (volunteer: Volunteer) => (
    <TableRow key={volunteer._id} className={selectedRows.has(volunteer._id) ? 'bg-primary/10' : ''}>
      {!groupByRole && (
        <TableCell className="px-1 xs:px-2 sm:px-4">
          <input 
            type="checkbox" 
            checked={selectedRows.has(volunteer._id)} 
            onChange={() => toggleRow(volunteer._id)} 
            className="w-3 h-3 xs:w-4 xs:h-4"
          />
        </TableCell>
      )}
      <TableCell className="px-1 xs:px-2 sm:px-4">
        <div className="min-w-0">
          <div className="font-medium text-xs xs:text-sm truncate">{volunteer.fullName}</div>
          <div className="text-xs text-muted-foreground truncate xs:hidden">
            {volunteer.email}
          </div>
        </div>
      </TableCell>
      <TableCell className="px-1 xs:px-2 sm:px-4 hidden xs:table-cell">
        <span className="text-xs xs:text-sm truncate">{volunteer.email}</span>
      </TableCell>
      <TableCell className="px-1 xs:px-2 sm:px-4 hidden sm:table-cell">
        <span className="text-xs xs:text-sm">{volunteer.phone}</span>
      </TableCell>
      <TableCell className="px-1 xs:px-2 sm:px-4 hidden md:table-cell">
        <span className="text-xs xs:text-sm">{volunteer.role}</span>
      </TableCell>
      <TableCell className="px-1 xs:px-2 sm:px-4 hidden lg:table-cell">
        <span className="text-xs xs:text-sm">{volunteer.availability}</span>
      </TableCell>
      <TableCell className="px-1 xs:px-2 sm:px-4">
        <Badge className={`${getStatusColor(volunteer.status)} text-xs`}>
          {getStatusText(volunteer.status)}
        </Badge>
      </TableCell>
      <TableCell className="px-1 xs:px-2 sm:px-4 hidden sm:table-cell">
        <span className="text-xs xs:text-sm">{format(new Date(volunteer.applicationDate), 'yyyy-MM-dd')}</span>
      </TableCell>
      <TableCell className="px-1 xs:px-2 sm:px-4">
        <Button size="sm" variant="outline" onClick={() => navigate(`/admin/volunteering/${volunteer._id}`)} className="text-xs xs:text-sm px-2 xs:px-3">
          View
        </Button>
      </TableCell>
    </TableRow>
  );

  if (loading) return <div>Loading volunteers...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto py-2 xs:py-4 sm:py-6 lg:py-8 px-2 xs:px-3 sm:px-4 lg:px-6">
      <div className="flex flex-col xs:flex-row xs:flex-wrap gap-3 xs:gap-4 items-start xs:items-center mb-4 xs:mb-6 justify-between">
        <h1 className="text-lg xs:text-xl sm:text-2xl font-bold">Volunteer Applications</h1>
        <div className="flex flex-wrap gap-2 xs:gap-2 items-center w-full xs:w-auto">
          <Button variant="outline" onClick={fetchVolunteers} className="flex items-center gap-1 xs:gap-2 text-xs xs:text-sm px-2 xs:px-3">
            <RefreshCw className="h-3 w-3 xs:h-4 xs:w-4" />
            <span className="hidden xs:inline">Refresh</span>
            <span className="xs:hidden">↻</span>
          </Button>
          <Button variant="outline" onClick={exportCSV} className="flex items-center gap-1 xs:gap-2 text-xs xs:text-sm px-2 xs:px-3">
            <Download className="h-3 w-3 xs:h-4 xs:w-4" />
            <span className="hidden xs:inline">Export CSV</span>
            <span className="xs:hidden">Export</span>
          </Button>
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'outline'} 
            onClick={() => setViewMode('grid')}
            className="flex items-center gap-1 xs:gap-2 text-xs xs:text-sm px-2 xs:px-3"
          >
            <Grid className="h-3 w-3 xs:h-4 xs:w-4" />
            <span className="hidden xs:inline">Grid</span>
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'} 
            onClick={() => setViewMode('list')}
            className="flex items-center gap-1 xs:gap-2 text-xs xs:text-sm px-2 xs:px-3"
          >
            <List className="h-3 w-3 xs:h-4 xs:w-4" />
            <span className="hidden xs:inline">List</span>
          </Button>
          <Button 
            variant={groupByRole ? 'default' : 'outline'} 
            onClick={() => setGroupByRole(g => !g)}
            className="text-xs xs:text-sm px-2 xs:px-3"
          >
            <span className="hidden xs:inline">Group by Role</span>
            <span className="xs:hidden">Group</span>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col xs:flex-row flex-wrap gap-2 xs:gap-3 sm:gap-4 mb-3 xs:mb-4">
        <Input 
          placeholder="Search name, email, phone..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="w-full xs:w-48 sm:w-64 text-xs xs:text-sm" 
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="text-xs xs:text-sm px-2 xs:px-3">
              <span className="hidden xs:inline">Role: </span>
              {roleFilter === 'all' ? 'All' : roleFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setRoleFilter('all')}>All</DropdownMenuItem>
            {allRoles.map(role => (
              <DropdownMenuItem key={role} onClick={() => setRoleFilter(role)}>
                {role}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="text-xs xs:text-sm px-2 xs:px-3">
              <span className="hidden xs:inline">Availability: </span>
              {availabilityFilter === 'all' ? 'All' : availabilityFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setAvailabilityFilter('all')}>All</DropdownMenuItem>
            {allAvailabilities.map(avail => (
              <DropdownMenuItem key={avail} onClick={() => setAvailabilityFilter(avail)}>
                {avail}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="text-xs xs:text-sm px-2 xs:px-3">
              <span className="hidden xs:inline">Sort: </span>
              {sortBy} {sortDir === 'asc' ? '↑' : '↓'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSortBy('applicationDate')}>Application Date</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('fullName')}>Name</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('status')}>Status</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}>
              {sortDir === 'asc' ? 'Descending' : 'Ascending'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {selectedRows.size > 0 && !groupByRole && (
        <div className="flex flex-wrap gap-2 mb-3 xs:mb-4">
          <Button size="sm" onClick={bulkApprove} className="bg-green-600 hover:bg-green-700 text-xs xs:text-sm">
            <span className="hidden xs:inline">Approve Selected ({selectedRows.size})</span>
            <span className="xs:hidden">Approve ({selectedRows.size})</span>
          </Button>
          <Button size="sm" onClick={bulkReject} variant="destructive" className="text-xs xs:text-sm">
            <span className="hidden xs:inline">Reject Selected ({selectedRows.size})</span>
            <span className="xs:hidden">Reject ({selectedRows.size})</span>
          </Button>
          <Button size="sm" variant="outline" onClick={clearAll} className="text-xs xs:text-sm">
            Clear Selection
          </Button>
        </div>
      )}
      
      {groupByRole ? (
        // Grouped by role view
        allRoles.map(role => {
          const roleVolunteers = paginated.filter(v => v.role === role);
          if (roleVolunteers.length === 0) return null;
          
          return (
            <div key={role} className="mb-6 xs:mb-8 sm:mb-10">
              <h2 className="text-lg xs:text-xl font-semibold mb-3 xs:mb-4">{role} ({roleVolunteers.length})</h2>
              {viewMode === 'list' ? (
                <div className="overflow-x-auto rounded-lg border mb-3 xs:mb-4">
                  <Table className="min-w-[600px] xs:min-w-[700px] sm:min-w-[800px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs xs:text-sm">Name</TableHead>
                        <TableHead className="text-xs xs:text-sm hidden xs:table-cell">Email</TableHead>
                        <TableHead className="text-xs xs:text-sm hidden sm:table-cell">Phone</TableHead>
                        <TableHead className="text-xs xs:text-sm hidden md:table-cell">Role</TableHead>
                        <TableHead className="text-xs xs:text-sm hidden lg:table-cell">Availability</TableHead>
                        <TableHead className="text-xs xs:text-sm">Status</TableHead>
                        <TableHead className="text-xs xs:text-sm hidden sm:table-cell">Applied</TableHead>
                        <TableHead className="text-xs xs:text-sm">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roleVolunteers.map(renderTableRow)}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6 mb-3 xs:mb-4">
                  {roleVolunteers.map(renderVolunteerCard)}
                </div>
              )}
            </div>
          );
        })
      ) : (
        // Non-grouped view
        viewMode === 'list' ? (
          <div className="overflow-x-auto rounded-lg border">
            <Table className="min-w-[600px] xs:min-w-[700px] sm:min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs xs:text-sm">
                    <input 
                      type="checkbox" 
                      checked={paginated.length > 0 && paginated.every(v => selectedRows.has(v._id))} 
                      onChange={e => e.target.checked ? selectAll() : clearAll()} 
                      className="w-3 h-3 xs:w-4 xs:h-4"
                    />
                  </TableHead>
                  <TableHead className="text-xs xs:text-sm">Name</TableHead>
                  <TableHead className="text-xs xs:text-sm hidden xs:table-cell">Email</TableHead>
                  <TableHead className="text-xs xs:text-sm hidden sm:table-cell">Phone</TableHead>
                  <TableHead className="text-xs xs:text-sm hidden md:table-cell">Role</TableHead>
                  <TableHead className="text-xs xs:text-sm hidden lg:table-cell">Availability</TableHead>
                  <TableHead className="text-xs xs:text-sm">Status</TableHead>
                  <TableHead className="text-xs xs:text-sm hidden sm:table-cell">Applied</TableHead>
                  <TableHead className="text-xs xs:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map(renderTableRow)}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6">
            {paginated.map(renderVolunteerCard)}
          </div>
        )
      )}
      
      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-muted-foreground">
          Showing {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} volunteers
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-3 py-2 text-sm">
            Page {page} of {totalPages}
          </span>
          <Button 
            size="sm" 
            variant="outline" 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
      
      {filtered.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {activeTab === 'all'
              ? 'No volunteer applications found'
              : `No ${activeTab} volunteer applications found`}
          </p>
        </div>
      )}
    </div>
  );
};

export default Volunteering; 