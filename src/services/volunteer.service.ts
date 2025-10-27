import api from './api.config';
import { API_URL } from '@/config/constants';

export interface Volunteer {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    address?: string;
    role: string;
    skills?: string[];
    experience?: string;
    availability: string;
    motivation?: string;
    status: 'pending' | 'approved' | 'rejected';
    applicationDate: string;
}

export interface VolunteerStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    byRole: { [key: string]: number };
    byAvailability: { [key: string]: number };
    byStatus: { [key: string]: number };
}

class VolunteerService {
    private baseUrl = `${API_URL}/volunteers`;

    async getAllVolunteers(): Promise<Volunteer[]> {
        try {
            const response = await api.get(this.baseUrl);
            return response.data;
        } catch (error) {
            console.error('Error fetching volunteers:', error);
            throw error;
        }
    }

    async getVolunteerById(id: string): Promise<Volunteer> {
        try {
            const response = await api.get(`${this.baseUrl}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching volunteer:', error);
            throw error;
        }
    }

    async approveVolunteer(id: string): Promise<Volunteer> {
        try {
            const response = await api.post(`${this.baseUrl}/${id}/approve`);
            return response.data;
        } catch (error) {
            console.error('Error approving volunteer:', error);
            throw error;
        }
    }

    async rejectVolunteer(id: string): Promise<Volunteer> {
        try {
            const response = await api.post(`${this.baseUrl}/${id}/reject`);
            return response.data;
        } catch (error) {
            console.error('Error rejecting volunteer:', error);
            throw error;
        }
    }
}

export const volunteerService = new VolunteerService(); 