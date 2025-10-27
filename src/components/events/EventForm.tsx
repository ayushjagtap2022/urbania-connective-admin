import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { eventService } from "@/services/event.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";

interface EventFormProps {
    onCancel?: () => void;
    onSuccess?: () => void;
    event?: any; // Accept event prop for editing
}

interface FormErrors {
    [key: string]: string;
}

type FormState = {
    title: string;
    description: string;
    fullDescription: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    category: string;
    'pricing.type': string;
    'pricing.amount': string;
    'pricing.details': string;
    'registration.capacity': string;
    organizerName: string;
    additionalDetails: string;
    'registration.deadline': string;
};

const initialFormState: FormState = {
    title: '',
    description: '',
    fullDescription: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    category: '',
    'pricing.type': '',
    'pricing.amount': '',
    'pricing.details': '',
    'registration.capacity': '',
    organizerName: '',
    additionalDetails: '',
    'registration.deadline': '',
};

const EventForm: React.FC<EventFormProps> = ({
    onCancel,
    onSuccess,
    event
}) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formState, setFormState] = useState<FormState>(() => {
        if (!event) return initialFormState;
        return {
            title: event.title || '',
            description: event.description || '',
            fullDescription: event.fullDescription || '',
            date: event.date ? event.date.slice(0, 10) : '',
            startTime: event.time && typeof event.time === 'string' ? event.time.split(' to ')[0] : '',
            endTime: event.time && typeof event.time === 'string' ? event.time.split(' to ')[1] : '',
            location: event.location || '',
            category: event.category || '',
            'pricing.type': event.pricing?.type || '',
            'pricing.amount': event.pricing?.amount?.toString() || '',
            'pricing.details': event.pricing?.details || '',
            'registration.capacity': event.registration?.capacity?.toString() || '',
            organizerName: event.organizerName || '',
            additionalDetails: event.additionalDetails ? event.additionalDetails.join('\n') : '',
            'registration.deadline': event.registration?.deadline || '',
        };
    });

    // Create event mutation
    const createMutation = useMutation({
        mutationFn: eventService.createEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            toast.success("Event created successfully");
            navigate('/events');
        },
        onError: (error: Error) => {
            console.error('Create event error:', error);
            toast.error(error.message || "Failed to create event");
            setIsSubmitting(false);
        }
    });

    const validateForm = (formData: FormData) => {
        const errors: FormErrors = {};
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const fullDescription = formData.get('fullDescription') as string;
        const date = formData.get('date') as string;
        const startTime = formData.get('startTime') as string;
        const endTime = formData.get('endTime') as string;
        const location = formData.get('location') as string;
        const category = formData.get('category') as string;
        const pricingType = formData.get('pricing.type') as string;
        const pricingAmount = formData.get('pricing.amount') as string;
        const pricingDetails = formData.get('pricing.details') as string;
        const capacity = formData.get('registration.capacity') as string;
        const organizerName = formData.get('organizerName') as string;

        // Required field validations
        if (!title?.trim()) errors.title = 'Title is required';
        if (!description?.trim()) errors.description = 'Description is required';
        if (!fullDescription?.trim()) errors.fullDescription = 'Full description is required';
        if (!date) errors.date = 'Date is required';
        if (!event && !startTime) errors.startTime = 'Start time is required';
        if (!event && !endTime) errors.endTime = 'End time is required';
        if (!location?.trim()) errors.location = 'Location is required';
        if (!category) errors.category = 'Category is required';
        if (!capacity) errors.capacity = 'Capacity is required';
        if (!pricingType) errors.pricingType = 'Pricing type is required';
        if (pricingType === 'paid' && !pricingAmount) errors.pricingAmount = 'Price amount is required for paid events';
        if (!pricingDetails) errors.pricingDetails = 'Pricing details are required';
        if (!organizerName) errors.organizerName = 'Organizer name is required';

        // Time validations
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (startTime && !timeRegex.test(startTime)) {
            errors.time = 'Invalid start time format (HH:MM)';
        }
        if (endTime && !timeRegex.test(endTime)) {
            errors.time = 'Invalid end time format (HH:MM)';
        }
        if (startTime && endTime) {
            const start = new Date(`2000-01-01T${startTime}`);
            const end = new Date(`2000-01-01T${endTime}`);
            if (end <= start) {
                errors.time = 'End time must be after start time';
            }
        }

        return errors;
    };

    // On form field change, update formState
    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // If the field is pricing.amount, always round to nearest integer
        if (name === 'pricing.amount') {
            const rounded = value === '' ? '' : Math.round(Number(value)).toString();
            setFormState(prev => ({ ...prev, [name]: rounded }));
        } else {
            setFormState(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        // If editing, use formState for all fields
        if (event) {
            Object.entries(formState).forEach(([key, value]) => {
                if (value !== "") {
                    formData.set(key, value as string);
                } else {
                    formData.delete(key);
                }
            });
        }

        // Combine start and end times
        const startTime = formData.get('startTime') as string;
        const endTime = formData.get('endTime') as string;
        if (startTime && endTime) {
            const formattedStartTime = new Date(`2000-01-01T${startTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            const formattedEndTime = new Date(`2000-01-01T${endTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            formData.set('time', `${formattedStartTime} to ${formattedEndTime}`);
        } else {
            formData.delete('time');
        }

        // Log the price value for debugging
        console.log('Submitting event with price:', formData.get('pricing.amount'));

        const validationErrors = validateForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error("Please fix the form errors");
            setIsSubmitting(false);
            return;
        }

        // Check if images are selected
        const imageFiles = formData.getAll('images').filter(f => f instanceof File && f.size > 0);
        if (!event && (!imageFiles || imageFiles.length === 0)) {
            setErrors({ ...errors, image: 'Please select at least one image' });
            toast.error("Please select at least one image");
            setIsSubmitting(false);
            return;
        }

        try {
            if (event) {
                await eventService.updateEvent(event._id, formData);
                toast.success("Event updated successfully");
            } else {
                await eventService.createEvent(formData);
                toast.success("Event created successfully");
            }
            onSuccess();
        } catch (error) {
            console.error('Form submission error:', error);
            toast.error(error instanceof Error ? error.message : "Failed to save event");
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full max-w-3xl mx-auto">
            <CardHeader className="p-4 sm:p-6">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        className="mb-2 flex items-center gap-2 w-full sm:w-auto"
                        onClick={onCancel}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                )}
                <CardTitle className="text-lg sm:text-xl lg:text-2xl">{event ? 'Edit Event' : 'Create New Event'}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* Title */}
                        <div className="space-y-2 lg:col-span-2">
                            <Label htmlFor="title" className="text-sm sm:text-base">Event Title</Label>
                            <Input
                                id="title"
                                name="title"
                                required={!event}
                                placeholder="Enter event title"
                                value={formState.title}
                                onChange={handleFieldChange}
                                className="w-full"
                            />
                            {errors.title && <p className="text-xs sm:text-sm text-red-500">{errors.title}</p>}
                        </div>

                        {/* Description */}
                        <div className="space-y-2 lg:col-span-2">
                            <Label htmlFor="description" className="text-sm sm:text-base">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                required={!event}
                                placeholder="Enter event description"
                                className="min-h-[80px] sm:min-h-[100px] w-full"
                                value={formState.description}
                                onChange={handleFieldChange}
                            />
                            {errors.description && <p className="text-xs sm:text-sm text-red-500">{errors.description}</p>}
                        </div>

                        {/* Full Description */}
                        <div className="space-y-2 lg:col-span-2">
                            <Label htmlFor="fullDescription" className="text-sm sm:text-base">Full Description</Label>
                            <Textarea
                                id="fullDescription"
                                name="fullDescription"
                                required={!event}
                                placeholder="Enter detailed event description"
                                className="min-h-[120px] sm:min-h-[150px] w-full"
                                value={formState.fullDescription}
                                onChange={handleFieldChange}
                            />
                            {errors.fullDescription && <p className="text-xs sm:text-sm text-red-500">{errors.fullDescription}</p>}
                        </div>

                        {/* Date and Time */}
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                required={!event}
                                value={formState.date}
                                onChange={handleFieldChange}
                            />
                            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                        </div>

                        {/* Time Range */}
                        <div className="space-y-2">
                            <Label>Time Range</Label>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Label htmlFor="startTime" className="text-sm text-muted-foreground">Start Time</Label>
                                    <Input
                                        id="startTime"
                                        name="startTime"
                                        type="time"
                                        required={!event}
                                        className="w-full"
                                        value={formState.startTime}
                                        onChange={handleFieldChange}
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor="endTime" className="text-sm text-muted-foreground">End Time</Label>
                                    <Input
                                        id="endTime"
                                        name="endTime"
                                        type="time"
                                        required={!event}
                                        className="w-full"
                                        value={formState.endTime}
                                        onChange={handleFieldChange}
                                    />
                                </div>
                            </div>
                            {errors.time && <p className="text-sm text-red-500">{errors.time}</p>}
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                name="location"
                                required={!event}
                                placeholder="Enter event location"
                                value={formState.location}
                                onChange={handleFieldChange}
                            />
                            {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select name="category" value={formState.category} onValueChange={value => setFormState(prev => ({ ...prev, category: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="community">Community</SelectItem>
                                    <SelectItem value="education">Education</SelectItem>
                                    <SelectItem value="charity">Charity</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                        </div>

                        {/* Price Type and Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="pricingType">Pricing Type</Label>
                            <Select name="pricing.type" value={formState['pricing.type']} onValueChange={value => setFormState(prev => ({ ...prev, 'pricing.type': value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select pricing type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="free">Free</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.pricingType && <p className="text-sm text-red-500">{errors.pricingType}</p>}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="price">Price Amount</Label>
                            <Input
                                id="price"
                                name="pricing.amount"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Enter price amount"
                                className="w-full"
                                value={formState['pricing.amount']}
                                onChange={handleFieldChange}
                            />
                        </div>

                        {/* Pricing Details */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="pricingDetails">Pricing Details</Label>
                            <Input
                                id="pricingDetails"
                                name="pricing.details"
                                required={!event}
                                placeholder="Enter pricing details (e.g., 'Free for all participants' or 'Early bird discount available')"
                                value={formState['pricing.details']}
                                onChange={handleFieldChange}
                            />
                            {errors.pricingDetails && <p className="text-sm text-red-500">{errors.pricingDetails}</p>}
                        </div>

                        {/* Capacity */}
                        <div className="space-y-2">
                            <Label htmlFor="capacity">Capacity</Label>
                            <Input
                                id="capacity"
                                name="registration.capacity"
                                type="number"
                                required={!event}
                                min="1"
                                placeholder="Enter maximum capacity"
                                value={formState['registration.capacity']}
                                onChange={handleFieldChange}
                            />
                            {errors.capacity && <p className="text-sm text-red-500">{errors.capacity}</p>}
                        </div>

                        {/* Organizer Name */}
                        <div className="space-y-2">
                            <Label htmlFor="organizerName">Organizer Name</Label>
                            <Input
                                id="organizerName"
                                name="organizerName"
                                required={!event}
                                placeholder="Enter organizer name"
                                value={formState.organizerName}
                                onChange={handleFieldChange}
                            />
                            {errors.organizerName && <p className="text-sm text-red-500">{errors.organizerName}</p>}
                        </div>

                        {/* Additional Details */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="additionalDetails">Additional Details</Label>
                            <Textarea
                                id="additionalDetails"
                                name="additionalDetails"
                                placeholder="Enter additional details (one per line)"
                                className="min-h-[100px]"
                                value={formState.additionalDetails}
                                onChange={handleFieldChange}
                            />
                            <p className="text-sm text-muted-foreground">Enter each detail on a new line</p>
                        </div>

                        {/* Registration Deadline */}
                        <div className="space-y-2">
                            <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                            <Input
                                id="registrationDeadline"
                                name="registration.deadline"
                                type="date"
                                value={formState['registration.deadline']}
                                onChange={handleFieldChange}
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="images">Event Images</Label>
                            <Input
                                id="images"
                                name="images"
                                type="file"
                                accept="image/*"
                                multiple
                                required={!event}
                                className="cursor-pointer"
                            />
                            {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={isSubmitting}
                                className="w-full sm:w-auto order-2 sm:order-1"
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto order-1 sm:order-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {event ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                event ? 'Update Event' : 'Create Event'
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default EventForm; 