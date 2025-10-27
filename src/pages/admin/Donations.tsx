import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Mail, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import DonationDetails from "@/components/donations/DonationDetails";
import { useQuery } from '@tanstack/react-query';
import { donationService, Donation } from '@/services/donation.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Donations = () => {
  const { toast } = useToast();
  const [selectedDonation, setSelectedDonation] = React.useState<Donation | null>(null);
  const [search, setSearch] = React.useState('');
  const [searchField, setSearchField] = React.useState('all');
  const [receiptData, setReceiptData] = React.useState<any>(null);
  const receiptRef = React.useRef<HTMLDivElement>(null);

  // Fetch all donations from backend
  const { data, isLoading, error } = useQuery({
    queryKey: ['donations'],
    queryFn: () => donationService.getAllDonations(1, 100),
  });
  const donations = data?.donations || [];

  // Debug: Log all paymentDetails.status values
  donations.forEach(d => console.log('Donation status:', d.paymentDetails.status));

  // Calculate summary stats
  // Accept common status values (case-insensitive)
  const completedDonations = donations.filter(d => {
    const status = d.paymentDetails.status?.toLowerCase();
    return status === 'completed' || status === 'paid' || status === 'success';
  });
  const totalDonations = completedDonations.reduce((sum, d) => sum + d.amount, 0);
  console.log(totalDonations);
  const totalDonors = donations.length; // Simple count of all donations
  console.log(totalDonors);

  // Calculate this month's donations
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthDonations = completedDonations
    .filter(d => new Date(d.createdAt) >= firstDayOfMonth)
    .reduce((sum, d) => sum + d.amount, 0);
  console.log(thisMonthDonations);
  const averageDonation = completedDonations.length > 0 ? (totalDonations / completedDonations.length) : 0;
  console.log(averageDonation);
  // Filtered donations for search
  const filteredDonations = donations.filter(d => {
    if (!search) return true;

    const searchTerm = search.toLowerCase();
    switch (searchField) {
      case 'firstName':
        return d.firstName?.toLowerCase().includes(searchTerm);
      case 'lastName':
        return d.lastName?.toLowerCase().includes(searchTerm);
      case 'email':
        return d.email?.toLowerCase().includes(searchTerm);
      case 'program':
        return d.program?.toLowerCase().includes(searchTerm);
      case 'all':
      default:
        return (
          d.firstName?.toLowerCase().includes(searchTerm) ||
          d.lastName?.toLowerCase().includes(searchTerm) ||
          d.email?.toLowerCase().includes(searchTerm) ||
          d.program?.toLowerCase().includes(searchTerm)
        );
    }
  });

  // Export as CSV
  const handleExport = () => {
    const headers = ['Donor', 'Email', 'Amount', 'Currency', 'Program', 'Type', 'Status', 'Date'];
    const rows = filteredDonations.map(d => [
      d.anonymous ? 'Anonymous Donor' : `${d.firstName} ${d.lastName}`,
      d.email,
      d.amount,
      d.currency,
      d.program,
      d.donationType,
      d.paymentDetails.status,
      new Date(d.createdAt).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'donations.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: 'Donations exported as CSV.' });
  };

  const handleViewDetails = (donation: any) => {
    setSelectedDonation(donation);
  };

  const handleSendEmail = (donation: any) => {
    // In a real application, this would open an email client or email dialog
    window.location.href = `mailto:${donation.email}?subject=Thank you for your donation&body=Dear ${donation.donor},%0D%0A%0D%0AThank you for your generous donation of ${donation.amount} to our ${donation.category} program.`;

    toast({
      title: "Email Client Opened",
      description: `Preparing email to ${donation.donor}`,
    });
  };

  const handleDownload = async (donation: any) => {
    setReceiptData(donation);
    setTimeout(async () => {
      if (receiptRef.current) {
        const canvas = await html2canvas(receiptRef.current);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pageWidth - 80;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 40, 40, pdfWidth, pdfHeight);
        pdf.save(`donation-receipt-${donation._id}.pdf`);
        setReceiptData(null);
        toast({
          title: "Receipt Downloaded",
          description: "The donation receipt has been downloaded as PDF.",
        });
      }
    }, 100);
  };

  return (
    <div className="p-2 xs:p-3 sm:p-4 md:p-6 space-y-3 xs:space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg xs:text-xl sm:text-2xl font-semibold">Donations</h1>
        <p className="text-xs xs:text-sm text-muted-foreground">
          Manage and track donations received through the platform.
        </p>
      </div>

      {/* Professional summary cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 xs:p-4 sm:pt-6">
            <div className="flex flex-col items-start">
              <p className="text-xs xs:text-sm font-medium">Total Donations</p>
              <h3 className="text-lg xs:text-xl sm:text-2xl font-bold mt-1 xs:mt-2">₹{totalDonations.toFixed(2)}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 xs:p-4 sm:pt-6">
            <div className="flex flex-col items-start">
              <p className="text-xs xs:text-sm font-medium">Total Donors</p>
              <h3 className="text-lg xs:text-xl sm:text-2xl font-bold mt-1 xs:mt-2">{totalDonors}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 xs:p-4 sm:pt-6">
            <div className="flex flex-col items-start">
              <p className="text-xs xs:text-sm font-medium">This Month</p>
              <h3 className="text-lg xs:text-xl sm:text-2xl font-bold mt-1 xs:mt-2">₹{thisMonthDonations.toFixed(2)}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 xs:p-4 sm:pt-6">
            <div className="flex flex-col items-start">
              <p className="text-xs xs:text-sm font-medium">Average Donation</p>
              <h3 className="text-lg xs:text-xl sm:text-2xl font-bold mt-1 xs:mt-2">₹{averageDonation.toFixed(2)}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter/Search and Export */}
      <div className="flex flex-col space-y-2 xs:space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between gap-2 xs:gap-3 sm:gap-4">
        <div className="flex flex-col xs:flex-row gap-2 xs:gap-2 max-w-xl">
          <Select value={searchField} onValueChange={setSearchField}>
            <SelectTrigger className="w-full xs:w-[140px] sm:w-[160px] lg:w-[180px] text-xs xs:text-sm">
              <SelectValue placeholder="Search by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fields</SelectItem>
              <SelectItem value="firstName">First Name</SelectItem>
              <SelectItem value="lastName">Last Name</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="program">Program</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder={`Search by ${searchField === 'all' ? 'any field' : searchField}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-xs xs:text-sm"
          />
        </div>
        <Button onClick={handleExport} variant="outline" className="flex items-center gap-1 xs:gap-2 w-full xs:w-auto text-xs xs:text-sm px-2 xs:px-3">
          <Download className="h-3 w-3 xs:h-4 xs:w-4" /> 
          <span className="hidden xs:inline">Export CSV</span>
          <span className="xs:hidden">Export</span>
        </Button>
      </div>

      {/* Donations Table */}
      <div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[600px] xs:min-w-[700px] sm:min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-1 xs:px-2 sm:px-4 text-xs xs:text-sm">Donor</TableHead>
                    <TableHead className="px-1 xs:px-2 sm:px-4 hidden xs:table-cell text-xs xs:text-sm">Email</TableHead>
                    <TableHead className="px-1 xs:px-2 sm:px-4 text-xs xs:text-sm">Amount</TableHead>
                    <TableHead className="px-1 xs:px-2 sm:px-4 hidden lg:table-cell text-xs xs:text-sm">Currency</TableHead>
                    <TableHead className="px-1 xs:px-2 sm:px-4 hidden md:table-cell text-xs xs:text-sm">Program</TableHead>
                    <TableHead className="px-1 xs:px-2 sm:px-4 hidden lg:table-cell text-xs xs:text-sm">Type</TableHead>
                    <TableHead className="px-1 xs:px-2 sm:px-4 hidden xl:table-cell text-xs xs:text-sm">Message</TableHead>
                    <TableHead className="px-1 xs:px-2 sm:px-4 hidden sm:table-cell text-xs xs:text-sm">Date</TableHead>
                    <TableHead className="px-1 xs:px-2 sm:px-4 text-xs xs:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={9} className="px-1 xs:px-2 sm:px-4 text-xs xs:text-sm">Loading...</TableCell></TableRow>
                  ) : error ? (
                    <TableRow><TableCell colSpan={9} className="px-1 xs:px-2 sm:px-4 text-xs xs:text-sm">Error loading donations</TableCell></TableRow>
                  ) : filteredDonations.length === 0 ? (
                    <TableRow><TableCell colSpan={9} className="px-1 xs:px-2 sm:px-4 text-xs xs:text-sm">No donations found</TableCell></TableRow>
                  ) : filteredDonations.map((donation) => (
                    <TableRow key={donation._id}>
                      <TableCell className="px-1 xs:px-2 sm:px-4">
                        <div className="min-w-0">
                          <div className="font-medium text-xs xs:text-sm sm:text-base truncate">
                            {donation.anonymous ? 'Anonymous Donor' : `${donation.firstName} ${donation.lastName}`}
                          </div>
                          <div className="text-xs text-muted-foreground truncate xs:hidden">
                            {donation.email}
                          </div>
                          <div className="text-xs text-muted-foreground truncate hidden xs:block sm:hidden">
                            {donation.program} • {new Date(donation.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-1 xs:px-2 sm:px-4 hidden xs:table-cell">
                        <span className="text-xs xs:text-sm truncate">{donation.email}</span>
                      </TableCell>
                      <TableCell className="px-1 xs:px-2 sm:px-4">
                        <span className="font-semibold text-xs xs:text-sm sm:text-base">₹{donation.amount}</span>
                      </TableCell>
                      <TableCell className="px-1 xs:px-2 sm:px-4 hidden lg:table-cell">
                        <span className="text-xs xs:text-sm">INR</span>
                      </TableCell>
                      <TableCell className="px-1 xs:px-2 sm:px-4 hidden md:table-cell">
                        <span className="text-xs xs:text-sm truncate">{donation.program}</span>
                      </TableCell>
                      <TableCell className="px-1 xs:px-2 sm:px-4 hidden lg:table-cell">
                        <span className="text-xs xs:text-sm">{donation.donationType}</span>
                      </TableCell>
                      <TableCell className="px-1 xs:px-2 sm:px-4 hidden xl:table-cell">
                        <span className="text-xs xs:text-sm truncate">{donation.message || '-'}</span>
                      </TableCell>
                      <TableCell className="px-1 xs:px-2 sm:px-4 hidden sm:table-cell">
                        <span className="text-xs xs:text-sm">{new Date(donation.createdAt).toLocaleDateString()}</span>
                      </TableCell>
                      <TableCell className="px-1 xs:px-2 sm:px-4">
                        <div className="flex gap-1 xs:gap-1 sm:gap-2">
                          <button
                            className="p-1 xs:p-1 sm:p-2 hover:bg-gray-100 rounded-full"
                            onClick={() => setSelectedDonation(donation)}
                            title="View Details"
                          >
                            <Eye className="h-3 w-3 xs:h-3 xs:w-3 sm:h-4 sm:w-4 text-gray-500" />
                          </button>
                          <button
                            className="p-1 xs:p-1 sm:p-2 hover:bg-gray-100 rounded-full"
                            onClick={() => handleSendEmail(donation)}
                            title="Send Email"
                          >
                            <Mail className="h-3 w-3 xs:h-3 xs:w-3 sm:h-4 sm:w-4 text-gray-500" />
                          </button>
                          <button
                            className="p-1 xs:p-1 sm:p-2 hover:bg-gray-100 rounded-full"
                            onClick={() => handleDownload(donation)}
                            title="Download Receipt"
                          >
                            <Download className="h-3 w-3 xs:h-3 xs:w-3 sm:h-4 sm:w-4 text-gray-500" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optionally, show a modal or drawer for selectedDonation details */}
      <DonationDetails
        donation={selectedDonation}
        isOpen={!!selectedDonation}
        onClose={() => setSelectedDonation(null)}
      />

      {/* Razorpay-style professional receipt template for PDF generation */}
      {receiptData && (
        <div ref={receiptRef} style={{
          position: 'fixed',
          left: -9999,
          top: 0,
          width: 640,
          background: '#fff',
          borderRadius: 18,
          border: '1.5px solid #e5e7eb',
          fontFamily: 'Inter, Arial, sans-serif',
          color: '#222',
          boxShadow: '0 6px 32px #0002',
          zIndex: 9999,
          margin: '0 auto',
          padding: 0
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#e0f3ec',
            borderRadius: '18px 18px 0 0',
            borderBottom: '2px solid #e5e7eb',
            padding: '32px 36px 20px 36px',
            justifyContent: 'center'
          }}>
            <img
              src="/urbania-logo.png"
              alt="Urbania Momin Community Logo"
              style={{
                height: 60,
                width: 60,
                marginRight: 24,
                borderRadius: '50%',
                background: '#fff',
                border: '2px solid #157347',
                objectFit: 'cover',
                boxShadow: '0 2px 8px #0001'
              }}
            />
            <div>
              <div style={{
                fontSize: 28,
                fontWeight: 900,
                color: '#157347',
                fontFamily: 'Georgia, serif',
                letterSpacing: 0.5
              }}>
                Urbania <span style={{ color: '#222', fontWeight: 700 }}>Momin Community</span>
              </div>
              <div style={{
                fontSize: 15,
                color: '#157347',
                fontWeight: 500,
                marginTop: 2
              }}>
                Empowering Communities, Enriching Lives
              </div>
            </div>
          </div>
          {/* Receipt Title */}
          <div style={{ textAlign: 'center', margin: '32px 0 16px 0' }}>
            <div style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#222',
              letterSpacing: 1
            }}>
              Donation Receipt
            </div>
            <div style={{
              fontSize: 15,
              color: '#157347',
              marginTop: 2
            }}>
              Thank you for your generous contribution!
            </div>
          </div>
          {/* Receipt Info Table */}
          <table style={{
            width: '92%',
            margin: '0 auto 24px auto',
            borderCollapse: 'collapse',
            fontSize: 16,
            background: '#f8fafc',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 1px 4px #0001'
          }}>
            <tbody>
              <tr>
                <td style={{
                  padding: '14px 16px',
                  fontWeight: 600,
                  color: '#555',
                  width: 170,
                  borderBottom: '1px solid #e5e7eb'
                }}>Receipt No:</td>
                <td style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #e5e7eb'
                }}>{receiptData._id}</td>
              </tr>
              <tr>
                <td style={{
                  padding: '14px 16px',
                  fontWeight: 600,
                  color: '#555',
                  borderBottom: '1px solid #e5e7eb'
                }}>Date:</td>
                <td style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #e5e7eb'
                }}>{new Date(receiptData.createdAt).toLocaleString()}</td>
              </tr>
              <tr>
                <td style={{
                  padding: '14px 16px',
                  fontWeight: 600,
                  color: '#555',
                  borderBottom: '1px solid #e5e7eb'
                }}>Status:</td>
                <td style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #e5e7eb'
                }}>{receiptData.paymentDetails?.status || '-'}</td>
              </tr>
            </tbody>
          </table>
          {/* Donor & Payment Details */}
          <div style={{
            width: '92%',
            margin: '0 auto 24px auto',
            display: 'flex',
            gap: 40
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#157347', marginBottom: 8 }}>Donor Details</div>
              <div style={{ fontSize: 16, marginBottom: 6 }}><strong>Name:</strong> {receiptData.anonymous ? 'Anonymous Donor' : `${receiptData.firstName} ${receiptData.lastName}`}</div>
              <div style={{ fontSize: 16, marginBottom: 6 }}><strong>Email:</strong> {receiptData.email}</div>
              <div style={{ fontSize: 16, marginBottom: 6 }}><strong>Program:</strong> {receiptData.program}</div>
              <div style={{ fontSize: 16, marginBottom: 6 }}><strong>Type:</strong> {receiptData.donationType}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#157347', marginBottom: 8 }}>Payment Details</div>
              <div style={{ fontSize: 16, marginBottom: 6 }}><strong>Amount:</strong> <span style={{ color: '#0a7d4f', fontWeight: 700, fontSize: 20 }}>₹{receiptData.amount}</span> (INR)</div>
              <div style={{ fontSize: 16, marginBottom: 6 }}><strong>Transaction ID:</strong> {receiptData.paymentDetails?.transactionId || '-'}</div>
              <div style={{ fontSize: 16, marginBottom: 6 }}><strong>Message:</strong> {receiptData.message || '-'}</div>
            </div>
          </div>
          {/* Footer */}
          <div style={{
            borderTop: '1.5px dashed #e5e7eb',
            paddingTop: 22,
            margin: '22px 0 0 0',
            textAlign: 'center',
            fontSize: 15,
            color: '#444',
            borderRadius: '0 0 18px 18px'
          }}>
            <div style={{ marginBottom: 8 }}><strong>Urbania Momin Community</strong> | www.urbania.org | info@urbania.org</div>
            <div style={{ marginBottom: 8 }}>123 Main Street, Mumbai, Maharashtra, India</div>
            <div style={{ color: '#157347', fontWeight: 700, marginTop: 10, fontSize: 16 }}>Thank you for making a difference!</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 10 }}><em>This is a computer-generated receipt and does not require a signature.</em></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Donations;