import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService } from '@/services/event.service';
import { Card } from '@/components/ui/card';
import { CardHeader } from '@/components/ui/card';
import { CardTitle } from '@/components/ui/card';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const EventAttendeeDetails = () => {
    const { registrationId } = useParams();
    const navigate = useNavigate();
    const [registration, setRegistration] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!registrationId) return;
        fetchRegistration();
    }, [registrationId]);

    const fetchRegistration = async () => {
        setLoading(true);
        try {
            const res = await eventService.getRegistrationById(registrationId!);
            setRegistration(res.registration || res);
        } catch (error) {
            toast.error('Failed to fetch attendee details');
        } finally {
            setLoading(false);
        }
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

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Attendee Details</CardTitle>
                    <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center p-8">Loading...</div>
                    ) : registration ? (
                        <div className="py-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                {/* Event Info */}
                                <div>
                                    <label className="text-sm font-medium text-gray-500 block">Event Name</label>
                                    <p className="mt-1 text-gray-900">{registration.eventName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 block">Event Date</label>
                                    <p className="mt-1 text-gray-900">{registration.eventDate ? new Date(registration.eventDate).toLocaleDateString() : '-'}</p>
                                </div>
                                {/* Building Info */}
                                <div>
                                    <label className="text-sm font-medium text-gray-500 block">Building Name</label>
                                    <p className="mt-1 text-gray-900">{registration.buildingName || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 block">Wing</label>
                                    <p className="mt-1 text-gray-900">{registration.wing || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 block">Flat No</label>
                                    <p className="mt-1 text-gray-900">{registration.flatNo || '-'}</p>
                                </div>
                                {/* Personal Info */}
                                <div>
                                    <label className="text-sm font-medium text-gray-500 block">First Name</label>
                                    <p className="mt-1 text-gray-900">{registration.firstName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 block">Last Name</label>
                                    <p className="mt-1 text-gray-900">{registration.lastName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 block">Email</label>
                                    <p className="mt-1 text-gray-900">{registration.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 block">Phone</label>
                                    <p className="mt-1 text-gray-900">{registration.phone}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 block">Address</label>
                                    <p className="mt-1 text-gray-900">{registration.address}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 block">City</label>
                                    <p className="mt-1 text-gray-900">{registration.city}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 block">State</label>
                                    <p className="mt-1 text-gray-900">{registration.state}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 block">Zip Code</label>
                                    <p className="mt-1 text-gray-900">{registration.zipCode}</p>
                                </div>
                                {/* Registration Info */}
                                <div>
                                    <label className="text-sm font-medium text-gray-500 block">Registration Type</label>
                                    <p className="mt-1 text-gray-900">{registration.registrationType}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 block">Status</label>
                                    <Badge className={`mt-1 ${getStatusColor(registration.status || 'Pending')}`}>{registration.status || 'Pending'}</Badge>
                                </div>
                                {/* Gender Counts */}
                                <div>
                                    <label className="text-sm font-medium text-gray-500 block">Male</label>
                                    <p className="mt-1 text-gray-900">{registration.genderCounts?.male || 0}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 block">Female</label>
                                    <p className="mt-1 text-gray-900">{registration.genderCounts?.female || 0}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 block">Child</label>
                                    <p className="mt-1 text-gray-900">{registration.genderCounts?.child || 0}</p>
                                </div>
                                {/* Amounts */}
                                <div>
                                    <label className="text-sm font-medium text-gray-500 block">Ticket Price</label>
                                    <p className="mt-1 text-gray-900">₹{registration.ticketPrice || 0}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 block">Total Amount</label>
                                    <p className="mt-1 text-gray-900">₹{registration.totalAmount || 0}</p>
                                </div>
                                {/* Guests */}
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-500 block">Guests</label>
                                    <ul className="mt-1 text-gray-900 list-disc pl-5">
                                        {registration.guests && registration.guests.length > 0 ? registration.guests.map((g: any, i: number) => (
                                            <li key={g._id?.$oid || i}>{g.name} (Age: {g.age}, Gender: {g.gender})</li>
                                        )) : <li>-</li>}
                                    </ul>
                                </div>
                                {/* Created */}
                                <div>
                                    <label className="text-sm font-medium text-gray-500 block">Created At</label>
                                    <p className="mt-1 text-gray-900">{registration.createdAt ? new Date(registration.createdAt).toLocaleString() : '-'}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-8 text-red-500">Attendee not found.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default EventAttendeeDetails; 