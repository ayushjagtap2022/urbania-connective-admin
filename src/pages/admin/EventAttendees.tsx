import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { eventService } from '@/services/event.service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

const EventAttendees = () => {
    const { id: eventId } = useParams();
    const navigate = useNavigate();
    const [attendees, setAttendees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [filtered, setFiltered] = useState<any[]>([]);

    useEffect(() => {
        if (!eventId) return;
        fetchAttendees();
    }, [eventId]);

    useEffect(() => {
        filterAttendees();
    }, [attendees, search, page]);

    const fetchAttendees = async () => {
        setLoading(true);
        try {
            const data = await eventService.getEventRegistrations(eventId!);
            setAttendees(data.registrations || []);
        } catch (error) {
            toast.error('Failed to fetch attendees');
        } finally {
            setLoading(false);
        }
    };

    const filterAttendees = () => {
        let filtered = attendees;
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter((a: any) =>
                (a.firstName && a.firstName.toLowerCase().includes(searchLower)) ||
                (a.lastName && a.lastName.toLowerCase().includes(searchLower)) ||
                (a.buildingName && a.buildingName.toLowerCase().includes(searchLower)) ||
                (a.phone && a.phone.toLowerCase().includes(searchLower))
            );
        }
        setFiltered(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
    };

    // Calculate summary stats
    const totalMale = attendees.reduce((sum, a) => sum + (a.genderCounts?.male || 0), 0);
    const totalFemale = attendees.reduce((sum, a) => sum + (a.genderCounts?.female || 0), 0);
    const totalChild = attendees.reduce((sum, a) => sum + (a.genderCounts?.child || 0), 0);
    const totalAmount = attendees.reduce((sum, a) => sum + (a.totalAmount || 0), 0);
    const totalAttendees = totalMale + totalFemale + totalChild;

    // CSV Export
    const exportCSV = () => {
        const rows = filtered.map(a => ({
            Name: `${a.firstName || ''} ${a.lastName || ''}`.trim(),
            Email: a.email || '',
            Phone: a.phone || '',
            'Building Name': a.buildingName || '',
            Wing: a.wing || '',
            'Flat No': a.flatNo || '',
            'Total Amount Paid': a.totalAmount || 0,
            Male: a.genderCounts?.male || 0,
            Female: a.genderCounts?.female || 0,
            Child: a.genderCounts?.child || 0,
            'Total Attendees': (a.genderCounts?.male || 0) + (a.genderCounts?.female || 0) + (a.genderCounts?.child || 0),
            'Registered At': a.createdAt ? new Date(a.createdAt).toLocaleString() : ''
        }));
        if (rows.length === 0) return;
        const csv = [Object.keys(rows[0]).join(','), ...rows.map(r => Object.values(r).map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'event-attendees.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="container mx-auto py-8 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold">Event Attendees</CardTitle>
                            <CardDescription>View and manage all attendees for this event.</CardDescription>
                        </div>
                        <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
                    </div>
                    {/* Summary Stats */}
                    <div className="flex flex-wrap gap-4 mt-4">
                        <div className="bg-muted rounded-lg px-4 py-2 text-sm">Male: <span className="font-bold">{totalMale}</span></div>
                        <div className="bg-muted rounded-lg px-4 py-2 text-sm">Female: <span className="font-bold">{totalFemale}</span></div>
                        <div className="bg-muted rounded-lg px-4 py-2 text-sm">Children: <span className="font-bold">{totalChild}</span></div>
                        <div className="bg-muted rounded-lg px-4 py-2 text-sm">Total Attendees: <span className="font-bold">{totalAttendees}</span></div>
                        <div className="bg-muted rounded-lg px-4 py-2 text-sm">Total Amount Paid: <span className="font-bold">₹{totalAmount}</span></div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search attendees..."
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                                className="pl-10"
                            />
                        </div>
                        <Button variant="outline" onClick={exportCSV} className="w-full sm:w-auto">Export CSV</Button>
                    </div>
                    {loading ? (
                        <div className="text-center p-8">Loading attendees...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table className="border border-gray-300">
                                <TableHeader className="border-b border-gray-300">
                                    <TableRow>
                                        <TableHead className="border-r border-gray-200">Name</TableHead>
                                        <TableHead className="border-r border-gray-200">Email</TableHead>
                                        <TableHead className="border-r border-gray-200">Phone</TableHead>
                                        <TableHead className="border-r border-gray-200">Building Name</TableHead>
                                        <TableHead className="border-r border-gray-200">Wing</TableHead>
                                        <TableHead className="border-r border-gray-200">Flat No</TableHead>
                                        <TableHead className="border-r border-gray-200">Total Amount Paid</TableHead>
                                        <TableHead className="border-r border-gray-200">Male</TableHead>
                                        <TableHead className="border-r border-gray-200">Female</TableHead>
                                        <TableHead className="border-r border-gray-200">Child</TableHead>
                                        <TableHead className="border-r border-gray-200">Total Attendees</TableHead>
                                        <TableHead className="border-r border-gray-200">User ID</TableHead>
                                        <TableHead>Registered At</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.length > 0 ? filtered.map((a, idx) => (
                                        <TableRow key={a._id || idx} className="border-b border-gray-200">
                                            <TableCell className="border-r border-gray-100">{a.firstName} {a.lastName}</TableCell>
                                            <TableCell className="border-r border-gray-100">{a.email}</TableCell>
                                            <TableCell className="border-r border-gray-100">{a.phone}</TableCell>
                                            <TableCell className="border-r border-gray-100">{a.buildingName || '-'}</TableCell>
                                            <TableCell className="border-r border-gray-100">{a.wing || '-'}</TableCell>
                                            <TableCell className="border-r border-gray-100">{a.flatNo || '-'}</TableCell>
                                            <TableCell className="border-r border-gray-100">₹{a.totalAmount || 0}</TableCell>
                                            <TableCell className="border-r border-gray-100">{a.genderCounts?.male || 0}</TableCell>
                                            <TableCell className="border-r border-gray-100">{a.genderCounts?.female || 0}</TableCell>
                                            <TableCell className="border-r border-gray-100">{a.genderCounts?.child || 0}</TableCell>
                                            <TableCell className="border-r border-gray-100">{(a.genderCounts?.male || 0) + (a.genderCounts?.female || 0) + (a.genderCounts?.child || 0)}</TableCell>
                                            <TableCell className="border-r border-gray-100">{
                                                (() => {
                                                    // Correct custom user ID: R + first 2 letters of second word of building name + wing + flat no + first 2 digits of phone
                                                    const buildingRaw = a.buildingName || '';
                                                    const buildingParts = buildingRaw.trim().split(/\s+/);
                                                    const buildingWord = buildingParts.length > 1 ? buildingParts[1] : buildingParts[0];
                                                    const building2 = (buildingWord || '').replace(/\s+/g, '').toUpperCase().slice(0,2);
                                                    const wing = (a.wing || '').replace(/\s+/g, '').toUpperCase();
                                                    const flat = (a.flatNo || '').replace(/\s+/g, '');
                                                    const phone = (a.phone || '').replace(/\D/g, '');
                                                    const phoneStart = phone.slice(0,2);
                                                    if (building2 && wing && flat && phoneStart) {
                                                        return `R${building2}${wing}${flat}${phoneStart}`;
                                                    }
                                                    return a.userCustomId || a.customId || '-';
                                                })()
                                            }</TableCell>
                                            <TableCell>{a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}</TableCell>
                                            <TableCell>
                                                <Button size="sm" variant="outline" onClick={() => navigate(`/admin/events/${eventId}/attendees/${a._id}`)}>
                                                    View Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={12} className="text-center text-muted-foreground">No attendees found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            {/* Pagination */}
                            <div className="flex justify-end mt-4 gap-2">
                                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                                <span className="px-2 py-1 text-sm">Page {page}</span>
                                <Button variant="outline" size="sm" disabled={filtered.length < PAGE_SIZE} onClick={() => setPage(p => p + 1)}>Next</Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default EventAttendees; 