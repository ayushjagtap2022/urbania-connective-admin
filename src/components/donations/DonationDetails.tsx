import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface DonationDetailsProps {
  donation: any;
  isOpen: boolean;
  onClose: () => void;
}

const DonationDetails = ({ donation, isOpen, onClose }: DonationDetailsProps) => {
  if (!donation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="border-b pb-4">
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle>Donation Details</DialogTitle>
              <p className="text-sm text-gray-500 mt-1">Review the complete donation information.</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {/* Donor Name */}
            <div>
              <label className="text-sm font-bold block">Donor Name</label>
              <p className="mt-1 text-gray-600">{!donation.anonymous ? `${donation.firstName} ${donation.lastName}` : "Anonymous Donor"}</p>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-bold block">Email</label>
              <p className="mt-1 text-gray-600">{!donation.anonymous ? donation.email : "Anonymous Donor"}</p>
            </div>

            {/* Amount */}
            <div>
              <label className="text-sm font-bold block">Amount</label>
              <p className="mt-1 text-gray-600">₹{donation.amount} (INR)</p>
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-bold block">Category</label>
              <p className="mt-1 text-gray-600">{donation.category}</p>
            </div>


            {/* Date */}
            <div>
              <label className="text-sm font-bold block">Date</label>
              <p className="mt-1 text-gray-600">{donation.date}</p>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <label className="text-sm font-bold block">Payment Information</label>
            <p className="mt-1 text-gray-600">Transaction ID: {donation.id}</p>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-bold block">Notes</label>
            <p className="mt-1 text-gray-600">
              {donation.notes || "No additional notes provided."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DonationDetails; 