import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, MapPin, Mail, Phone, User, CheckCircle, XCircle } from 'lucide-react';
import { volunteerService, Volunteer } from '@/services/volunteer.service';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const VolunteerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchVolunteer = async () => {
      try {
        setLoading(true);
        const data = await volunteerService.getVolunteerById(id!);
        setVolunteer(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch volunteer details');
        toast({
          title: "Error",
          description: "Failed to fetch volunteer details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteer();
  }, [id, toast]);

  const handleApprove = async () => {
    if (!id) return;

    try {
      setProcessing(true);
      const updatedVolunteer = await volunteerService.approveVolunteer(id);
      setVolunteer(updatedVolunteer);
      toast({
        title: "Success",
        description: "Volunteer application has been approved",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to approve volunteer application",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;

    try {
      setProcessing(true);
      const updatedVolunteer = await volunteerService.rejectVolunteer(id);
      setVolunteer(updatedVolunteer);
      toast({
        title: "Success",
        description: "Volunteer application has been rejected",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to reject volunteer application",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

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

  if (loading) return <div>Loading volunteer details...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!volunteer) return <div>Volunteer not found</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/volunteering')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Volunteers
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Volunteer Application</CardTitle>
            <Badge className={getStatusColor(volunteer.status)}>
              {getStatusText(volunteer.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{volunteer.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{volunteer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{volunteer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{volunteer.address || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Volunteer Details */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Volunteer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium">{volunteer.role}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Availability</p>
                  <p className="font-medium">{volunteer.availability}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Application Date</p>
                  <p className="font-medium">
                    {new Date(volunteer.applicationDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Skills */}
            {volunteer.skills && volunteer.skills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {volunteer.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {volunteer.experience && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Experience</h3>
                <p className="text-muted-foreground">{volunteer.experience}</p>
              </div>
            )}

            {/* Motivation */}
            {volunteer.motivation && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Motivation</h3>
                <p className="text-muted-foreground">{volunteer.motivation}</p>
              </div>
            )}

            {/* Action Buttons */}
            {volunteer.status?.toLowerCase() === 'pending' && (
              <div className="flex gap-4 mt-6">
                <Button
                  onClick={handleApprove}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Application
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={processing}
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Application
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VolunteerDetails; 