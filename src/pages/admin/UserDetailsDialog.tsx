import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User } from '@/services/user.service';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { UserRound, Mail, Phone, Home, KeyRound, Building2, Calendar, CheckCircle, XCircle, AlertCircle, Clock, UserCog } from 'lucide-react';

interface UserDetailsDialogProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
}

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
    <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-6 h-6 text-muted-foreground">{icon}</div>
        <div>
            <p className="text-sm font-semibold text-gray-600">{label}</p>
            <div className="text-sm text-gray-800">{value || <span className="text-gray-400">Not Provided</span>}</div>
        </div>
    </div>
);

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({ user, isOpen, onClose }) => {
    if (!user) return null;

    const getStatusInfo = (status?: string) => {
        switch (status) {
            case 'approved':
                return {
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    text: 'Approved',
                    color: 'bg-green-100 text-green-800',
                };
            case 'rejected':
                return {
                    icon: <XCircle className="h-5 w-5 text-red-500" />,
                    text: 'Rejected',
                    color: 'bg-red-100 text-red-800',
                };
            default:
                return {
                    icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
                    text: 'Pending',
                    color: 'bg-yellow-100 text-yellow-800',
                };
        }
    };

    const statusInfo = getStatusInfo(user.status);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-full p-6 overflow-y-auto" style={{ maxHeight: '90vh' }}>
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserRound className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-xl">{user.firstName} {user.lastName}</p>
                            <p className="text-sm font-normal text-muted-foreground">{user.mobile}</p>
                        </div>
                    </DialogTitle>
                    <DialogDescription>
                        Detailed information for the selected user.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                    <DetailItem icon={<KeyRound />} label="User ID" value={user.customId} />
                    <DetailItem icon={<Mail />} label="Email" value={<a href={`mailto:${user.email}`} className="text-primary hover:underline">{user.email}</a>} />
                    <DetailItem icon={<Phone />} label="Mobile" value={user.mobile} />
                    {user.phone && <DetailItem icon={<Phone />} label="Phone" value={user.phone} />}
                    <DetailItem icon={<Home />} label="Address" value={user.address} />
                    
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 text-muted-foreground"><CheckCircle /></div>
                        <div>
                            <p className="text-sm font-semibold text-gray-600">Status</p>
                            <Badge className={statusInfo.color}>{statusInfo.text}</Badge>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 text-muted-foreground"><UserCog /></div>
                        <div>
                            <p className="text-sm font-semibold text-gray-600">Roles</p>
                            <div className="flex flex-wrap gap-1">
                                {user.roles.map(role => <Badge key={role} variant="outline">{role}</Badge>)}
                            </div>
                        </div>
                    </div>

                    <DetailItem icon={<Calendar />} label="Created At" value={format(new Date(user.createdAt), 'PPpp')} />
                    <DetailItem icon={<Clock />} label="Last Updated" value={format(new Date(user.updatedAt), 'PPpp')} />

                    <DetailItem icon={<UserRound />} label="Middle Name" value={user.middleName} />
                    <DetailItem icon={<UserCog />} label="Occupation & Profile" value={user.occupationProfile} />
                    <DetailItem icon={<Building2 />} label="Workplace Address" value={user.workplaceAddress} />
                    <DetailItem icon={<UserRound />} label="Family Members (Total)" value={user.familyCount} />
                    <DetailItem icon={<UserRound />} label="Males (Above 18)" value={user.maleAbove18} />
                    <DetailItem icon={<UserRound />} label="Males (Above 60)" value={user.maleAbove60} />
                    <DetailItem icon={<UserRound />} label="Males (Under 18)" value={user.maleUnder18} />
                    <DetailItem icon={<UserRound />} label="Females (Above 18)" value={user.femaleAbove18} />
                    <DetailItem icon={<UserRound />} label="Females (Above 60)" value={user.femaleAbove60} />
                    <DetailItem icon={<UserRound />} label="Females (Under 18)" value={user.femaleUnder18} />
                    <DetailItem icon={<UserCog />} label="Forum Contribution" value={user.forumContribution} />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UserDetailsDialog; 