import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Event } from "@/services/event.service";
import { format } from 'date-fns';

interface EventCardProps {
    event: Event;
    attendeeCount?: number;
    onDelete?: (event: Event) => void;
    onEdit?: (event: Event) => void;
    onViewAttendees?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, attendeeCount = 0, onDelete, onEdit, onViewAttendees }) => {
    const isUpcoming = new Date(event.date) > new Date();

    // Format time display
    const formatTime = (time: string | { startTime: string; endTime: string }) => {
        if (typeof time === 'string') {
            return time;
        }
        return `${time.startTime} to ${time.endTime}`;
    };

    return (
        <Card className="overflow-hidden">
            {/* Event Image */}
            <div className="relative h-32 xs:h-40 sm:h-48 w-full">
                <img
                    src={Array.isArray(event.images) && event.images.length > 0 ? event.images[0] : event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                />
                {event.featured && (
                    <Badge className="absolute top-1 xs:top-2 right-1 xs:right-2 bg-primary text-xs">
                        Featured
                    </Badge>
                )}
            </div>

            <CardHeader className="p-3 xs:p-4 sm:p-6">
                <CardTitle className="text-base xs:text-lg sm:text-xl line-clamp-2">{event.title}</CardTitle>
                <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 text-xs xs:text-sm text-muted-foreground">
                    <span>{format(new Date(event.date), 'MMM dd, yyyy')}</span>
                    <span className="hidden xs:inline">•</span>
                    <span className="truncate">{formatTime(event.time)}</span>
                </div>
            </CardHeader>

            <CardContent className="p-3 xs:p-4 sm:p-6 pt-0">
                <div className="space-y-3 xs:space-y-4">
                    {/* Description */}
                    <p className="text-xs xs:text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                    </p>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 xs:gap-3 sm:gap-4 text-xs xs:text-sm">
                        <div>
                            <span className="font-medium">Location:</span>
                            <p className="text-muted-foreground truncate">{event.location}</p>
                        </div>
                        <div>
                            <span className="font-medium">Category:</span>
                            <p className="text-muted-foreground capitalize">{event.category}</p>
                        </div>
                        <div>
                            <span className="font-medium">Price:</span>
                            <p className="text-muted-foreground">
                                {event.pricing.type === 'free' ? 'Free' : `₹${Math.round(Number(event.pricing.amount))}`}
                            </p>
                        </div>
                        <div>
                            <span className="font-medium">Capacity:</span>
                            <p className="text-muted-foreground">{event.registration.capacity} spots</p>
                        </div>
                        <div className="xs:col-span-2">
                            <span className="font-medium">Organizer:</span>
                            <p className="text-muted-foreground truncate">{event.organizerName}</p>
                        </div>
                        <div>
                            <span className="font-medium">Attendees:</span>
                            <p className="text-muted-foreground">{attendeeCount}</p>
                        </div>
                    </div>

                    {/* Additional Details */}
                    {event.additionalDetails && event.additionalDetails.length > 0 && (
                        <div>
                            <span className="font-medium text-xs xs:text-sm">Additional Details:</span>
                            <ul className="text-xs xs:text-sm text-muted-foreground mt-1 space-y-1">
                                {event.additionalDetails.map((detail, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="mr-1 xs:mr-2">•</span>
                                        <span className="truncate">{detail}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Status and Actions */}
                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-0">
                        <Badge variant={isUpcoming ? "default" : "secondary"} className="text-xs w-fit">
                            {isUpcoming ? "Upcoming" : "Past"}
                        </Badge>
                        <div className="flex flex-wrap gap-1 xs:gap-2">
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(event)}
                                    className="text-xs xs:text-sm text-primary hover:underline px-1"
                                >
                                    Edit
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(event)}
                                    className="text-xs xs:text-sm text-destructive hover:underline px-1"
                                >
                                    Delete
                                </button>
                            )}
                            {onViewAttendees && (
                                <button
                                    onClick={onViewAttendees}
                                    className="text-xs xs:text-sm text-blue-600 hover:underline px-1"
                                >
                                    <span className="hidden xs:inline">View Attendees</span>
                                    <span className="xs:hidden">Attendees</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default EventCard; 