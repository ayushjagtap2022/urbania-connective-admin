import api from './api.config';

export interface Event {
    _id: string;
    title: string;
    description: string;
    fullDescription: string;
    date: string;
    time: string;
    location: string;
    category: 'community' | 'education' | 'charity';
    image: string;
    featured: boolean;
    pricing: {
        type: 'free' | 'paid';
        amount: number;
        details: string;
    };
    registration: {
        required: boolean;
        deadline?: string;
        capacity: number;
    };
    organizer: string;
    organizerName: string;
    attendees: number;
    additionalDetails: string[];
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
}

export const eventService = {
    // Get all events with filters
    getAllEvents: async (page = 1, limit = 10, category?: string, featured?: boolean, search?: string) => {
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', limit.toString());
            if (category) params.append('category', category);
            if (featured !== undefined) params.append('featured', featured.toString());
            if (search) params.append('search', search);

            const response = await api.get(`/api/events?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching events:', error);
            throw error;
        }
    },

    // Get featured events
    getFeaturedEvents: async () => {
        const response = await api.get('/api/events/featured');
        return response.data;
    },

    // Get upcoming events
    getUpcomingEvents: async () => {
        const response = await api.get('/api/events/upcoming');
        return response.data;
    },

    // Get events by category
    getEventsByCategory: async (category: string) => {
        const response = await api.get(`/api/events/category/${category}`);
        return response.data;
    },

    // Get single event
    getEvent: async (id: string) => {
        const response = await api.get(`/api/events/${id}`);
        return response.data;
    },

    // Create new event
    createEvent: async (formData: FormData) => {
        try {
            console.log('Creating event with form data:', {
                title: formData.get('title'),
                description: formData.get('description'),
                fullDescription: formData.get('fullDescription'),
                date: formData.get('date'),
                time: formData.get('time'),
                location: formData.get('location'),
                category: formData.get('category'),
                organizerName: formData.get('organizerName'),
                additionalDetails: formData.get('additionalDetails'),
                pricing: {
                    type: formData.get('pricing.type'),
                    amount: formData.get('pricing.amount'),
                    details: formData.get('pricing.details')
                },
                registration: {
                    required: formData.get('registration.required') === 'true',
                    deadline: formData.get('registration.deadline'),
                    capacity: formData.get('registration.capacity')
                }
            });

            // Create a new FormData instance for the files
            const fileFormData = new FormData();
            // Add all selected image files
            const imageFiles = formData.getAll('images');
            imageFiles.forEach((file) => {
                if (file instanceof File && file.size > 0) {
                    fileFormData.append('images', file);
                }
            });

            // Convert FormData to a proper event object
            const eventData = {
                title: formData.get('title'),
                description: formData.get('description'),
                fullDescription: formData.get('fullDescription'),
                date: formData.get('date'),
                time: formData.get('time'),
                location: formData.get('location'),
                category: formData.get('category'),
                featured: formData.get('featured') === 'true',
                organizerName: formData.get('organizerName'),
                additionalDetails: formData.get('additionalDetails'),
                pricing: {
                    type: formData.get('pricing.type') || 'free',
                    amount: Number(formData.get('pricing.amount')) || 0,
                    details: formData.get('pricing.details') || ''
                },
                registration: {
                    required: true,
                    deadline: formData.get('registration.deadline'),
                    capacity: Number(formData.get('registration.capacity')) || 0
                }
            };

            // Then add the event data
            fileFormData.append('data', JSON.stringify(eventData));

            console.log('Sending form data:', {
                image: imageFiles.length > 0 ? 'Files present' : 'No files',
                data: eventData
            });

            const response = await api.post('/api/events', fileFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Server response:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error creating event:', error.response?.data || error.message);
            throw new Error(error.response?.data?.error || 'Failed to create event');
        }
    },

    // Delete event
    deleteEvent: async (id: string) => {
        try {
            const response = await api.delete(`/api/events/${id}`);
            return response.data;
        } catch (error: any) {
            console.error('Error deleting event:', error.response?.data || error.message);
            throw new Error(error.response?.data?.error || 'Failed to delete event');
        }
    },

    // Update event
    updateEvent: async (id: string, formData: FormData) => {
        try {
            // Prepare FormData for file upload and event data
            const fileFormData = new FormData();
            // Append all selected images (if any)
            const imageFiles = formData.getAll('images');
            imageFiles.forEach((file) => {
                if (file instanceof File && file.size > 0) {
                    fileFormData.append('images', file);
                }
            });
            // Convert FormData to event object
            const eventData = {
                title: formData.get('title'),
                description: formData.get('description'),
                fullDescription: formData.get('fullDescription'),
                date: formData.get('date'),
                time: formData.get('time'),
                location: formData.get('location'),
                category: formData.get('category'),
                featured: formData.get('featured') === 'true',
                organizerName: formData.get('organizerName'),
                additionalDetails: formData.get('additionalDetails'),
                pricing: {
                    type: formData.get('pricing.type') || 'free',
                    amount: Number(formData.get('pricing.amount')) || 0,
                    details: formData.get('pricing.details') || ''
                },
                registration: {
                    required: true,
                    deadline: formData.get('registration.deadline'),
                    capacity: Number(formData.get('registration.capacity')) || 0
                }
            };
            fileFormData.append('data', JSON.stringify(eventData));
            const response = await api.put(`/api/events/${id}`, fileFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error: any) {
            console.error('Error updating event:', error.response?.data || error.message);
            throw new Error(error.response?.data?.error || 'Failed to update event');
        }
    },
    getTotalAttendees: async (eventId: string): Promise<number> => {
        console.log(eventId)
        const response = await api.get(`/api/events/${eventId}/total-attendees`);
        return response.data.totalAttendees;
    },
    getEventRegistrations: async (eventId: string) => {
        const response = await api.get(`/api/registrations/event?eventId=${eventId}`);
        return response.data;
    },
    getRegistrationById: async (registrationId: string) => {
        const response = await api.get(`/api/registrations/${registrationId}`);
        return response.data;
    },
}; 