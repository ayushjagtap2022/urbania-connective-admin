import api from './api.config';

export interface Donation {
    _id: string;
    donor?: {
        _id: string;
        username?: string;
        name?: string;
        email?: string;
    };
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    amount: number;
    currency: string;
    program: string;
    donationType: string;
    recurringFrequency?: string;
    receiptRequired?: boolean;
    paymentDetails: {
        paymentId: string;
        method: string;
        status: string;
        transactionDate: string;
        transactionId?: string;
    };
    anonymous?: boolean;
    message?: string;
    receiptUrl?: string;
    subscriptionId?: string;
    nextPaymentDate?: string;
    isActive?: boolean;
    canceledAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface DonationListResponse {
    donations: Donation[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

class DonationService {
    async getAllDonations(page = 1, limit = 100): Promise<DonationListResponse> {
        const response = await api.get(`/api/donations?page=${page}&limit=${limit}`);
        return response.data;
    }
}

export const donationService = new DonationService();