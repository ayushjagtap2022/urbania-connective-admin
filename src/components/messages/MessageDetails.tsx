import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Calendar, User } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface MessageDetailsProps {
  message: {
    id: number;
    type: string;
    sender: string;
    email: string;
    phone: string;
    message: string;
    status: string;
    time: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onReply: (messageId: number, reply: string) => void;
}

const MessageDetails = ({ message, isOpen, onClose, onReply }: MessageDetailsProps) => {
  const [isReplying, setIsReplying] = React.useState(false);
  const [replyText, setReplyText] = React.useState('');

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(message.id, replyText);
      setReplyText('');
      setIsReplying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'Read':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'Replied':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">{message.type}</DialogTitle>
            <Badge variant="outline" className={getStatusColor(message.status)}>
              {message.status}
            </Badge>
          </div>
          <DialogDescription>Message details and communication history</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sender Information */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Sender</p>
                <p className="text-sm text-muted-foreground">{message.sender}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Received</p>
                <p className="text-sm text-muted-foreground">{message.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{message.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{message.phone}</p>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="space-y-2">
            <h4 className="font-medium">Message</h4>
            <p className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg">
              {message.message}
            </p>
          </div>

          {/* Reply Section */}
          {isReplying ? (
            <div className="space-y-4">
              <h4 className="font-medium">Your Reply</h4>
              <Textarea
                placeholder="Type your reply here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          ) : null}
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {isReplying ? (
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setIsReplying(false)}>
                Cancel Reply
              </Button>
              <Button onClick={handleReply}>
                Send Reply
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsReplying(true)}>
              Reply
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MessageDetails; 