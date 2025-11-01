import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, User } from '@/services/user.service';
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
    Trash2,
    UserRound,
    Mail as MailIcon,
    Phone,
    Calendar,
    Download,
    Upload,
    Filter,
    Search,
    MoreHorizontal,
    UserPlus,
    RefreshCw,
    Edit,
    KeyRound,
    UserCheck,
    Grid,
    List,
    SlidersHorizontal,
    FileSpreadsheet,
    FileText,
    Users as UsersIcon,
    UserCog,
    Activity,
    Clock,
    Building2
} from 'lucide-react';
import { format } from 'date-fns';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuGroup,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import UserDetailsDialog from './UserDetailsDialog';

const Users = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importing, setImporting] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [filters, setFilters] = useState({
        role: '',
        status: '',
        organization: '',
        dateRange: 'all'
    });
    const [sortConfig, setSortConfig] = useState({
        key: 'createdAt',
        direction: 'desc'
    });
    const [selectedUserForDetails, setSelectedUserForDetails] = useState<User | null>(null);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

    // Fetch users with enhanced query
    const { data: users, isLoading, error } = useQuery({
        queryKey: ['users', filters],
        queryFn: async () => {
            try {
                const data = await userService.getAllUsers();
                return data;
            } catch (error: any) {
                console.error('Error in query function:', error);
                throw error;
            }
        },
        retry: 1,
        staleTime: 5000,
    });

    // Calculate statistics
    const stats = {
        total: users?.length || 0,
        active: users?.filter(u => u.status).length || 0,
        admins: users?.filter(u => u.roles.includes('admin')).length || 0,
        newThisMonth: users?.filter(u => {
            const date = new Date(u.createdAt);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length || 0,
        organizations: [...new Set(users?.map(u => u.organization).filter(Boolean) || [])].length || 0
    };

    // Enhanced bulk actions
    const handleBulkAction = async (action: string) => {
        if (selectedUsers.length === 0) {
            toast.error('Please select users first');
            return;
        }

        switch (action) {
            case 'delete':
                // Show confirmation dialog for bulk delete
                break;
            case 'export':
                handleExportSelected('csv');
                break;
            case 'email':
                window.location.href = `mailto:${selectedUsers.map(id =>
                    users?.find(u => u._id === id)?.email
                ).filter(Boolean).join(',')}`;
                break;
            default:
                break;
        }
    };

    // Export selected users (default to CSV)
    const handleExportSelected = async (format: 'csv' | 'pdf' = 'csv') => {
        if (selectedUsers.length === 0) {
            toast.error('Please select users to export');
            return;
        }
        setExporting(true);
        try {
            // TODO: Implement selected users export for PDF if needed
            const selectedData = users?.filter(user => selectedUsers.includes(user._id)) || [];
            // For now, only CSV is supported for selected users
            const blob = await userService.exportUsers('csv');
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'selected_users_export.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Selected users exported successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to export users');
        } finally {
            setExporting(false);
        }
    };

    // Filter users based on all criteria
    const filteredUsers = users?.filter(user => {
        const matchesSearch =
            (user.firstName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (user.lastName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (user.mobile?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());

        const matchesRole = !filters.role || user.roles.includes(filters.role);
        const matchesStatus = !filters.status || user.status === filters.status;
        const matchesOrg = !filters.organization || user.organization === filters.organization;

        let matchesDate = true;
        if (filters.dateRange !== 'all') {
            const date = new Date(user.createdAt);
            const now = new Date();
            switch (filters.dateRange) {
                case 'today':
                    matchesDate = date.toDateString() === now.toDateString();
                    break;
                case 'week':
                    const weekAgo = new Date(now.setDate(now.getDate() - 7));
                    matchesDate = date >= weekAgo;
                    break;
                case 'month':
                    matchesDate = date.getMonth() === now.getMonth() &&
                        date.getFullYear() === now.getFullYear();
                    break;
            }
        }

        return matchesSearch && matchesRole && matchesStatus && matchesOrg && matchesDate;
    });

    // Sort users
    const sortedUsers = [...(filteredUsers || [])].sort((a, b) => {
        let aVal = a[sortConfig.key as keyof User];
        let bVal = b[sortConfig.key as keyof User];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
            return sortConfig.direction === 'asc'
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        }
        return 0;
    });

    // Delete user mutation
    const deleteUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            try {
                await userService.deleteUser(userId);
            } catch (error: any) {
                throw new Error(error.message || 'Failed to delete user');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete user. Please try again.');
        }
    });

    // Approve user mutation
    const approveUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            await userService.updateUser(userId, { status: 'approved' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User approved successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to approve user. Please try again.');
        }
    });

    // Reject user mutation
    const rejectUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            await userService.updateUser(userId, { status: 'rejected' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User rejected successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to reject user. Please try again.');
        }
    });

    const handleDelete = async (userId: string) => {
        try {
            await deleteUserMutation.mutateAsync(userId);
        } catch (error) {
            // Error is already handled by mutation onError
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800 hover:bg-red-200';
            case 'user':
                return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
        }
    };

    // Export users in selected format
    const handleExportUsers = async (format: 'csv' | 'pdf') => {
        setExporting(true);
        try {
            const blob = await userService.exportUsers(format);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `users_export.${format}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success(`Users exported as ${format.toUpperCase()} successfully`);
        } catch (error: any) {
            toast.error(error.message || `Failed to export users as ${format.toUpperCase()}`);
        } finally {
            setExporting(false);
        }
    };

    const handleViewDetails = async (userId: string) => {
        try {
            // We can use the already fetched user data if it's comprehensive enough,
            // or fetch fresh details if needed. For now, let's use the existing list.
            const user = users?.find(u => u._id === userId);
            if (user) {
                setSelectedUserForDetails(user);
                setIsDetailsDialogOpen(true);
            } else {
                toast.error('Could not find user details.');
            }
        } catch (error) {
            toast.error('Failed to fetch user details.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64 text-red-500">
                {error instanceof Error ? error.message : 'Error loading users. Please try again.'}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Enhanced Statistics Cards */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Total Users</CardTitle>
                        <UsersIcon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Active Users</CardTitle>
                        <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.active}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Admin Users</CardTitle>
                        <UserCog className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.admins}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-full sm:w-[250px] lg:w-[300px]"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Advanced Filters Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="flex-shrink-0">
                                    <SlidersHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px]">
                                <DropdownMenuLabel>Filter Users</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>
                                            <UserRound className="h-4 w-4 mr-2" />
                                            Role
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent>
                                            <DropdownMenuRadioGroup value={filters.role} onValueChange={(value) => setFilters(f => ({ ...f, role: value }))}>
                                                <DropdownMenuRadioItem value="">All Roles</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="user">User</DropdownMenuRadioItem>
                                            </DropdownMenuRadioGroup>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>
                                            <Activity className="h-4 w-4 mr-2" />
                                            Status
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent>
                                            <DropdownMenuRadioGroup value={filters.status} onValueChange={(value) => setFilters(f => ({ ...f, status: value }))}>
                                                <DropdownMenuRadioItem value="">All Status</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="active">Active</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="inactive">Inactive</DropdownMenuRadioItem>
                                            </DropdownMenuRadioGroup>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>
                                            <Clock className="h-4 w-4 mr-2" />
                                            Date Range
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent>
                                            <DropdownMenuRadioGroup value={filters.dateRange} onValueChange={(value) => setFilters(f => ({ ...f, dateRange: value }))}>
                                                <DropdownMenuRadioItem value="all">All Time</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="today">Today</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="week">This Week</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="month">This Month</DropdownMenuRadioItem>
                                            </DropdownMenuRadioGroup>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setFilters({ role: '', status: '', organization: '', dateRange: 'all' })}>
                                    Reset Filters
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* View Mode Toggle */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="flex-shrink-0">
                                    {viewMode === 'list' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuRadioGroup value={viewMode} onValueChange={(value: 'list' | 'grid') => setViewMode(value)}>
                                    <DropdownMenuRadioItem value="list">
                                        <List className="h-4 w-4 mr-2" /> List View
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="grid">
                                        <Grid className="h-4 w-4 mr-2" /> Grid View
                                    </DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="outline" size="icon" onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })} className="flex-shrink-0">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                    {/* Export Options */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" disabled={exporting} className="w-full sm:w-auto">
                                <Download className="h-4 w-4 mr-2" />
                                {exporting ? 'Exporting...' : 'Export'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleExportUsers('csv')}>
                                <FileSpreadsheet className="h-4 w-4 mr-2" />
                                Export as CSV
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Add User */}
                    <Button variant="default" size="sm" onClick={() => navigate('/admin/users/add')} className="w-full sm:w-auto">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add User
                    </Button>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedUsers.length > 0 && (
                <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{selectedUsers.length} selected</Badge>
                        <Separator orientation="vertical" className="h-4" />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBulkAction('email')}
                        >
                            <MailIcon className="h-4 w-4 mr-2" />
                            Email Selected
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBulkAction('export')}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export Selected
                        </Button>
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleBulkAction('delete')}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected
                    </Button>
                </div>
            )}

            {/* Users Table/Grid */}
            {viewMode === 'list' ? (
                <div className="border rounded-lg overflow-x-auto">
                    <Table className="min-w-[800px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="px-2 sm:px-4">User Info</TableHead>
                                <TableHead className="px-2 sm:px-4 hidden sm:table-cell">Contact</TableHead>
                                <TableHead className="px-2 sm:px-4 hidden lg:table-cell">User ID</TableHead>
                                <TableHead className="px-2 sm:px-4 hidden md:table-cell">Gender</TableHead>
                                <TableHead className="px-2 sm:px-4 hidden md:table-cell">Roles</TableHead>
                                <TableHead className="px-2 sm:px-4 hidden lg:table-cell">Status</TableHead>
                                <TableHead className="px-2 sm:px-4 hidden md:table-cell">Created At</TableHead>
                                <TableHead className="w-[80px] sm:w-[100px] px-2 sm:px-4">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedUsers.map((user) => (
                                <TableRow key={user._id}>
                                    <TableCell className="px-2 sm:px-4">
                                        <div className="flex items-center space-x-2 sm:space-x-3">
                                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <UserRound className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium text-sm sm:text-base truncate">{user.firstName} {user.lastName}</div>
                                                <div className="text-xs sm:text-sm text-muted-foreground truncate">{user.mobile}</div>
                                                <div className="text-xs sm:text-sm text-muted-foreground truncate sm:hidden">{user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-2 sm:px-4 hidden sm:table-cell">
                                        <div className="space-y-1">
                                            <div className="flex items-center text-sm">
                                                <MailIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                                <span className="truncate">{user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-2 sm:px-4 hidden lg:table-cell">
                                        {user.customId ? (
                                            <span className="text-sm">{user.customId}</span>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="px-2 sm:px-4 hidden md:table-cell">
                                        {user.gender ? (
                                            <Badge variant="outline" className="text-xs capitalize">
                                                {user.gender}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="px-2 sm:px-4 hidden md:table-cell">
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles.map((role) => (
                                                <Badge
                                                    key={role}
                                                    variant="outline"
                                                    className={`${getRoleBadgeColor(role)} text-xs`}
                                                >
                                                    {role}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-2 sm:px-4 hidden lg:table-cell">
                                        {user.status === 'approved' && (
                                            <Badge className="bg-green-100 text-green-800 text-xs">Approved</Badge>
                                        )}
                                        {user.status === 'rejected' && (
                                            <Badge className="bg-red-100 text-red-800 text-xs">Rejected</Badge>
                                        )}
                                        {(!user.status || user.status === 'pending') && (
                                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pending</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="px-2 sm:px-4 hidden md:table-cell">
                                        <div className="flex items-center text-sm">
                                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                            <span className="text-xs sm:text-sm">{format(new Date(user.createdAt), 'MMM d, yyyy')}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-[80px] sm:w-[100px] px-2 sm:px-4">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => navigate(`/admin/users/edit/${user._id}`, { state: { user } })}
                                                title="Edit User"
                                                className="h-6 w-6 sm:h-8 sm:w-8"
                                            >
                                                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-8 sm:w-8">
                                                        <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleViewDetails(user._id)}>
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => approveUserMutation.mutate(user._id)}>
                                                        Approve
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => rejectUserMutation.mutate(user._id)}>
                                                        Reject
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem
                                                                onSelect={(e) => e.preventDefault()}
                                                                className="text-destructive"
                                                            >
                                                                Delete User
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this user? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    onClick={() => handleDelete(user._id)}
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sortedUsers.map((user) => (
                        <Card key={user._id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center space-x-3">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <UserRound className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{user.firstName} {user.lastName}</CardTitle>
                                        <CardDescription>{user.mobile}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center text-sm">
                                    <MailIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                    {user.email}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {user.roles.map((role) => (
                                        <Badge
                                            key={role}
                                            variant="outline"
                                            className={getRoleBadgeColor(role)}
                                        >
                                            {role}
                                        </Badge>
                                    ))}
                                </div>
                                <div className="pt-2 flex items-center justify-between">
                                    <Badge className={user.status === 'approved' ? 'bg-green-100 text-green-800' : user.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                                        {user.status === 'approved' ? 'Approved' : user.status === 'rejected' ? 'Rejected' : 'Pending'}
                                    </Badge>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleViewDetails(user._id)}>
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigate(`/admin/users/${user._id}/edit`, { state: { user } })}>
                                                Edit User
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => approveUserMutation.mutate(user._id)}>
                                                Approve
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => rejectUserMutation.mutate(user._id)}>
                                                Reject
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem
                                                        onSelect={(e) => e.preventDefault()}
                                                        className="text-destructive"
                                                    >
                                                        Delete User
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete this user? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            onClick={() => handleDelete(user._id)}
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <UserDetailsDialog
                user={selectedUserForDetails}
                isOpen={isDetailsDialogOpen}
                onClose={() => setIsDetailsDialogOpen(false)}
            />
        </div>
    );
};

export default Users;
