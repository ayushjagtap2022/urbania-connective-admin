import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface ApplicationDetailsProps {
  application: any;
  isOpen: boolean;
  onClose: () => void;
}

const ApplicationDetails = ({ application, isOpen, onClose }: ApplicationDetailsProps) => {
  if (!application) return null;

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Full Name</label>
                <p className="font-medium">{application.fullName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="font-medium">{application.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Phone</label>
                <p className="font-medium">{application.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Status</label>
                <div>
                  <Badge className={getStatusColor(application.status)}>
                    {application.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Volunteering Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Volunteering Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Area of Interest</label>
                <p className="font-medium">{application.areaOfInterest}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Availability</label>
                <p className="font-medium">{application.availability}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Submitted Date</label>
                <p className="font-medium">{formatDate(application.submittedAt)}</p>
              </div>
            </div>
          </div>

          {/* Experience */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Experience</h3>
            <p className="text-gray-700">
              {application.experience || 'No experience details provided.'}
            </p>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">
                Application ID: {application.id}<br />
                Last Updated: {formatDate(application.submittedAt)}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationDetails; 