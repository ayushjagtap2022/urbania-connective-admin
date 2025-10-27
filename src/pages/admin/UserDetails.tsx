import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
    UserRound,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Shield,
    Activity,
    Settings,
    ChevronLeft,
    Save
} from 'lucide-react';
import { format } from 'date-fns';

const UserDetails = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = React.useState("profile");

    // Fetch user details
    const { data: user, isLoading } = useQuery({
        queryKey: ['user', userId],
        queryFn: () => userService.getUserById(userId as string),
    });

    // Update user mutation
    const updateUserMutation = useMutation({
        mutationFn: (data: any) => userService.updateUser(userId as string, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
            toast.success('User updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update user');
        }
    });

    const handleUpdateUser = async (data: any) => {
        try {
            await updateUserMutation.mutateAsync(data);
        } catch (error) {
            // Error handled by mutation
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center h-64 text-red-500">
                User not found
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/admin/users')}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-3xl font-bold">User Details</h1>
                </div>
            </div>

            {/* User Quick Info Card */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-primary/10">
                                {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span>{user.email}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <span>{user.mobile}</span>
                            </div>
                            <div className="flex space-x-2">
                                {user.roles.map((role) => (
                                    <Badge key={role} variant="outline">
                                        {role}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        defaultValue={user.firstName}
                                        onChange={(e) => handleUpdateUser({ firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        defaultValue={user.lastName}
                                        onChange={(e) => handleUpdateUser({ lastName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="middleName">Middle Name</Label>
                                    <Input
                                        id="middleName"
                                        defaultValue={user.middleName}
                                        onChange={(e) => handleUpdateUser({ middleName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mobile">Mobile</Label>
                                    <Input
                                        id="mobile"
                                        defaultValue={user.mobile}
                                        onChange={(e) => handleUpdateUser({ mobile: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        defaultValue={user.email}
                                        onChange={(e) => handleUpdateUser({ email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    defaultValue={user.address || ''}
                                    onChange={(e) => handleUpdateUser({ address: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="occupationProfile">Occupation & Brief Profile</Label>
                                <Input
                                    id="occupationProfile"
                                    defaultValue={user.occupationProfile}
                                    onChange={(e) => handleUpdateUser({ occupationProfile: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="workplaceAddress">Workplace Address</Label>
                                <Input
                                    id="workplaceAddress"
                                    defaultValue={user.workplaceAddress}
                                    onChange={(e) => handleUpdateUser({ workplaceAddress: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="familyCount">Family Members (Total)</Label>
                                <Input
                                    id="familyCount"
                                    type="number"
                                    defaultValue={user.familyCount}
                                    onChange={(e) => handleUpdateUser({ familyCount: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Males (Above 18)</Label>
                                <Input
                                    id="maleAbove18"
                                    type="number"
                                    defaultValue={user.maleAbove18}
                                    onChange={(e) => handleUpdateUser({ maleAbove18: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Males (Above 60)</Label>
                                <Input
                                    id="maleAbove60"
                                    type="number"
                                    defaultValue={user.maleAbove60}
                                    onChange={(e) => handleUpdateUser({ maleAbove60: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Males (Under 18)</Label>
                                <Input
                                    id="maleUnder18"
                                    type="number"
                                    defaultValue={user.maleUnder18}
                                    onChange={(e) => handleUpdateUser({ maleUnder18: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Females (Above 18)</Label>
                                <Input
                                    id="femaleAbove18"
                                    type="number"
                                    defaultValue={user.femaleAbove18}
                                    onChange={(e) => handleUpdateUser({ femaleAbove18: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Females (Above 60)</Label>
                                <Input
                                    id="femaleAbove60"
                                    type="number"
                                    defaultValue={user.femaleAbove60}
                                    onChange={(e) => handleUpdateUser({ femaleAbove60: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Females (Under 18)</Label>
                                <Input
                                    id="femaleUnder18"
                                    type="number"
                                    defaultValue={user.femaleUnder18}
                                    onChange={(e) => handleUpdateUser({ femaleUnder18: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="forumContribution">How I can contribute to this forum</Label>
                                <Textarea
                                    id="forumContribution"
                                    defaultValue={user.forumContribution}
                                    onChange={(e) => handleUpdateUser({ forumContribution: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Mock activity data - replace with real data */}
                                <div className="flex items-center space-x-4 py-2 border-b">
                                    <Activity className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Profile updated</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(), 'MMM d, yyyy HH:mm')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Permissions Tab */}
                <TabsContent value="permissions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Permissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {user.roles.map((role) => (
                                    <div key={role} className="flex items-center justify-between py-2">
                                        <div className="flex items-center space-x-2">
                                            <Shield className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{role}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {role === 'admin' ? 'Full access to all features' : 'Standard user access'}
                                                </p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={true}
                                            onCheckedChange={() => {
                                                toast.info('Permission management will be implemented soon');
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="font-medium">Two-Factor Authentication</p>
                                        <p className="text-sm text-muted-foreground">
                                            Add an extra layer of security to your account
                                        </p>
                                    </div>
                                    <Switch
                                        checked={false}
                                        onCheckedChange={() => {
                                            toast.info('2FA will be implemented soon');
                                        }}
                                    />
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="font-medium">Account Status</p>
                                        <p className="text-sm text-muted-foreground">
                                            Active since {format(new Date(user.createdAt), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="bg-green-100 text-green-800">
                                        Active
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default UserDetails; 