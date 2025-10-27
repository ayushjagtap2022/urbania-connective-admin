import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Settings, CheckCircle, Reply, User2, Trash2, Eye, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { contactService, Contact } from '@/services/contact.service';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRef } from 'react';

const truncate = (str: string, n: number) => str.length > n ? str.slice(0, n) + '…' : str;

const PAGE_SIZE_OPTIONS = ["10", "25", "50"];
const STATUS_OPTIONS = ["all", "new", "read"];

const ServicesPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'status' | 'subject' | 'phoneno' | 'createdAt'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const data = await contactService.getAllContacts();
      setContacts(data);
    } catch (error) {
      toast.error('Failed to fetch contacts');
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Bulk actions
  const toggleRow = (id: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
      return newSet;
    });
  };
  const toggleAllRows = (ids: string[]) => {
    if (ids.every(id => selectedRows.has(id))) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(ids));
    }
  };
  const bulkMarkAsRead = async () => {
    for (const id of selectedRows) {
      await contactService.markAsRead(id);
    }
    toast.success('Selected marked as read');
    setSelectedRows(new Set());
    fetchContacts();
  };
  const handleBulkDelete = async () => {
    try {
      for (const id of selectedRows) {
        await contactService.deleteContact(id);
      }
      toast.success('Selected contacts deleted');
      setSelectedRows(new Set());
      setBulkDeleteDialogOpen(false);
      fetchContacts();
    } catch (error) {
      toast.error('Failed to delete selected contacts');
    }
  };
  const exportCSV = () => {
    const rows = paginatedContacts.map(c => ({
      Name: c.name,
      Email: c.email,
      Status: c.status,
      Subject: c.subject,
      Phone: c.phoneno,
      Date: new Date(c.createdAt).toLocaleDateString(),
      Message: c.message
    }));
    const csv = [Object.keys(rows[0]).join(','), ...rows.map(r => Object.values(r).map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Sorting
  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  // Filtering, sorting, pagination
  let filteredContacts = contacts.filter(contact => {
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const created = new Date(contact.createdAt);
    const matchesStart = !startDate || created >= new Date(startDate);
    const matchesEnd = !endDate || created <= new Date(endDate + 'T23:59:59');
    return matchesStatus && matchesSearch && matchesStart && matchesEnd;
  });

  filteredContacts = filteredContacts.sort((a, b) => {
    if (sortBy === 'createdAt') {
      const v1 = new Date(a.createdAt).getTime();
      const v2 = new Date(b.createdAt).getTime();
      return sortDir === 'asc' ? v1 - v2 : v2 - v1;
    }

    const v1 = String(a[sortBy] || '');
    const v2 = String(b[sortBy] || '');
    return sortDir === 'asc'
      ? v1.localeCompare(v2)
      : v2.localeCompare(v1);
  });

  const totalPages = Math.ceil(filteredContacts.length / Number(pageSize));
  const paginatedContacts = filteredContacts.slice((page - 1) * Number(pageSize), page * Number(pageSize));

  // Row details modal
  const openDetails = (contact: Contact) => {
    setSelectedContact(contact);
    setDetailsDialogOpen(true);
  };

  const handleMarkAsRead = async (contactId: string) => {
    try {
      await contactService.markAsRead(contactId);
      await fetchContacts();
      toast.success('Message marked as read');
    } catch (error) {
      toast.error('Failed to mark message as read');
      console.error('Error marking message as read:', error);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await contactService.deleteContact(contactId);
      toast.success('Contact deleted');
      setDeleteDialogOpen(false);
      setContactToDelete(null);
      fetchContacts();
    } catch (error) {
      toast.error('Failed to delete contact');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage community services and contact messages
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Service
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search services..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="border rounded px-2 py-1 w-full sm:w-auto"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
        >
          {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
        </select>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">From</label>
            <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }} className="border rounded px-2 py-1 flex-1 sm:flex-none" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">To</label>
            <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1); }} className="border rounded px-2 py-1 flex-1 sm:flex-none" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={exportCSV} title="Export CSV" className="flex-shrink-0">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          </Button>
          <Button variant="outline" size="icon" onClick={bulkMarkAsRead} disabled={selectedRows.size === 0} title="Bulk Mark as Read" className="flex-shrink-0">
            <CheckCircle className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setBulkDeleteDialogOpen(true)} disabled={selectedRows.size === 0} title="Bulk Delete" className="flex-shrink-0">
            <Trash2 className="h-5 w-5 text-destructive" />
          </Button>
        </div>
      </div>

      <Card className="shadow-lg rounded-xl border border-gray-200">
        <CardHeader className="pb-3 bg-gray-50 rounded-t-xl border-b border-gray-200">
          <CardTitle>Services Overview</CardTitle>
          <CardDescription>
            View and manage all community services and contact messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="border-b bg-gray-50 text-gray-700">
                    <th className="py-3 px-2 sm:px-4 font-semibold rounded-tl-xl">
                      <input type="checkbox" checked={paginatedContacts.length > 0 && paginatedContacts.every(c => selectedRows.has(c._id))} onChange={() => toggleAllRows(paginatedContacts.map(c => c._id))} />
                    </th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold border-l border-gray-200 cursor-pointer" onClick={() => handleSort('name')}>
                      Name {sortBy === 'name' && (sortDir === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold border-l border-gray-200 cursor-pointer hidden sm:table-cell" onClick={() => handleSort('email')}>
                      Category {sortBy === 'email' && (sortDir === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold border-l border-gray-200 cursor-pointer" onClick={() => handleSort('status')}>
                      Status {sortBy === 'status' && (sortDir === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold border-l border-gray-200 cursor-pointer hidden md:table-cell" onClick={() => handleSort('subject')}>
                      Subject {sortBy === 'subject' && (sortDir === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold border-l border-gray-200 cursor-pointer hidden lg:table-cell" onClick={() => handleSort('phoneno')}>
                      Phone {sortBy === 'phoneno' && (sortDir === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold border-l border-gray-200 cursor-pointer hidden md:table-cell" onClick={() => handleSort('createdAt')}>
                      Date {sortBy === 'createdAt' && (sortDir === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="text-right py-3 px-2 sm:px-4 font-semibold border-l border-gray-200 rounded-tr-xl">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedContacts.map((contact, idx) => (
                    <tr
                      key={contact._id}
                      className={
                        `border-b transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ` +
                        (hoveredRow === contact._id ? 'bg-blue-50/60' : '')
                      }
                      onMouseEnter={() => setHoveredRow(contact._id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td className="py-4 px-4 text-center">
                        <input type="checkbox" checked={selectedRows.has(contact._id)} onChange={() => toggleRow(contact._id)} />
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 max-w-[200px] flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 text-gray-400 mr-1 sm:mr-2">
                          <User2 className="w-3 h-3 sm:w-5 sm:h-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="truncate text-xs sm:text-sm" title={contact.name}>{truncate(contact.name, 20)}</span>
                          <div className="text-xs text-muted-foreground truncate sm:hidden" title={contact.email}>{truncate(contact.email, 20)}</div>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 max-w-[220px] truncate border-l border-gray-200 hidden sm:table-cell" title={contact.email}>{truncate(contact.email, 32)}</td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 border-l border-gray-200">
                        <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${contact.status === 'new'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : contact.status === 'read'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : 'bg-green-100 text-green-800 border border-green-200'
                          }`}>
                          {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 max-w-[260px] border-l border-gray-200 truncate hidden md:table-cell" title={contact.subject}>{truncate(contact.subject, 40)}</td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 max-w-[140px] border-l border-gray-200 truncate hidden lg:table-cell" title={contact.phoneno}>{contact.phoneno}</td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 border-l border-gray-200 hidden md:table-cell">
                        <span className="text-xs sm:text-sm">{new Date(contact.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-right space-x-1 sm:space-x-2 border-l border-gray-200">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" title="Actions" className="h-6 w-6 sm:h-8 sm:w-8">
                              <MoreVertical className="h-3 w-3 sm:h-5 sm:w-5" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="end" className="w-44 p-1">
                            <button
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded text-left"
                              onClick={() => openDetails(contact)}
                            >
                              <Eye className="h-4 w-4" /> View Details
                            </button>
                            {contact.status === 'new' && (
                              <button
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded text-left"
                                onClick={() => handleMarkAsRead(contact._id)}
                              >
                                <CheckCircle className="h-4 w-4" /> Mark as Read
                              </button>
                            )}
                            <button
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-100 text-red-600 rounded text-left"
                              onClick={() => { setContactToDelete(contact); setDeleteDialogOpen(true); }}
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </button>
                          </PopoverContent>
                        </Popover>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 sm:gap-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm">Rows per page:</span>
                  <select value={pageSize} onChange={e => { setPageSize(e.target.value); setPage(1); }} className="border rounded px-2 py-1 text-xs sm:text-sm">
                    {PAGE_SIZE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8 w-8">
                    <span className="text-sm">&lt;</span>
                  </Button>
                  <span className="text-xs sm:text-sm">Page {page} of {totalPages}</span>
                  <Button variant="outline" size="icon" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 w-8">
                    <span className="text-sm">&gt;</span>
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                  <span className="text-xs text-gray-500">Status Legend:</span>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">New</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">Read</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Row Details Modal */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
            <DialogDescription>
              Full details for {selectedContact?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-2">
              <div><strong>Name:</strong> {selectedContact.name}</div>
              <div><strong>Email:</strong> {selectedContact.email}</div>
              <div><strong>Status:</strong> {selectedContact.status}</div>
              <div><strong>Subject:</strong> {selectedContact.subject}</div>
              <div><strong>Phone:</strong> {selectedContact.phoneno}</div>
              <div><strong>Date:</strong> {new Date(selectedContact.createdAt).toLocaleDateString()}</div>
              <div><strong>Message:</strong> <div className="whitespace-pre-line break-words bg-gray-50 p-2 rounded mt-1">{selectedContact.message}</div></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contact message?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => contactToDelete && handleDeleteContact(contactToDelete._id)}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Selected Contacts</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all selected contact messages?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setBulkDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete}>
              Delete All
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesPage;