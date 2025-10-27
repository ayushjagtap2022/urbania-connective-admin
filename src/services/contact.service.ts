import apiConfig from './api.config';
import api from './api.config';

export interface Contact {
    _id: string;
    name: string;
    email: string;
    phoneno: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'replied';
    readAt: string | null;
    repliedAt: string | null;
    reply: string | null;
    createdAt: string;
}

export const contactService = {
    // Get all contacts
    getAllContacts: async (): Promise<Contact[]> => {
        try {
            const response = await api.get('/api/contact/messages');
            return response.data;
        } catch (error) {
            console.error('Error fetching contacts:', error);
            throw error;
        }
    },

    // Mark contact as read
    markAsRead: async (contactId: string): Promise<void> => {
        try {
            await api.patch(`/api/contact/messages/${contactId}/read`);
        } catch (error) {
            console.error('Error marking contact as read:', error);
            throw error;
        }
    },

    // Reply to contact
    replyToContact: async (contactId: string, reply: string): Promise<void> => {
        try {
            await api.post(`/api/contact/messages/${contactId}/reply`, { reply });
        } catch (error) {
            console.error('Error replying to contact:', error);
            throw error;
        }
    },

    // Get contact message counts
    getMessageCounts: async (): Promise<{ new: number; read: number; replied: number; total: number }> => {
        try {
            const response = await api.get('/api/contact/messages/counts');
            return response.data;
        } catch (error) {
            console.error('Error fetching message counts:', error);
            throw error;
        }
    },

    // Delete contact
    deleteContact: async (contactId: string): Promise<void> => {
        try {
            await api.delete(`/api/contact/messages/${contactId}`);
        } catch (error) {
            console.error('Error deleting contact:', error);
            throw error;
        }
    },
};