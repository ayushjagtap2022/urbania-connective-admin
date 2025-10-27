import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface RegistrationDetailsProps {
  registration: any;
  isOpen: boolean;
  onClose: () => void;
}

const RegistrationDetails = ({ registration, isOpen, onClose }: RegistrationDetailsProps) => {
  if (!registration) return null;

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-6 overflow-y-auto" style={{ maxHeight: '90vh' }}>
        <DialogHeader className="border-b pb-4">
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle>Attendee Details</DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Full registration details for this attendee.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {Object.entries(registration)
              .filter(([key, value]) => {
                const hiddenFields = ['_id', 'userId', 'createdAt', 'updatedAt', '__v'];
                return value !== undefined && value !== null && value !== "" && !Array.isArray(value) && typeof value !== 'object' && !hiddenFields.includes(key);
              })
              .map(([key, value]) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-500 block">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                  <p className="mt-1 text-gray-900">{
                    typeof value === 'string' && key.toLowerCase().includes('date') && !isNaN(Date.parse(value))
                      ? new Date(value).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
                      : value
                  }</p>
                </div>
              ))}
            {/* Render arrays and objects in a readable way if needed */}
            {Object.entries(registration)
              .filter(([key, value]) => Array.isArray(value) && value.length > 0)
              .map(([key, value]) => (
                <div key={key} className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500 block">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                  <ul className="mt-1 text-gray-900 list-disc pl-5">
                    {(value as any[]).map((item, i) => (
                      <li key={i}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
                    ))}
                  </ul>
                </div>
              ))}
            {Object.entries(registration)
              .filter(([key, value]) => typeof value === 'object' && value !== null && !Array.isArray(value))
              .map(([key, value]) => (
                <div key={key} className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500 block">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                  <pre className="mt-1 text-gray-900 bg-gray-50 rounded p-2 overflow-x-auto text-xs">{JSON.stringify(value, null, 2)}</pre>
                </div>
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationDetails; 