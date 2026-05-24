import { axiosInstance } from '../axiosInstance';

export interface Customer {
    customerId: string;
    companyName: string;
    contactName?: string;
    contactTitle?: string;
    address?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    fax?: string;
}

export interface CustomerResponse {
    content: Customer[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface CustomersParams {
    page?: number;
    size?: number;
}

export const getCustomers = async (params?: CustomersParams): Promise<CustomerResponse> => {
    const { data } = await axiosInstance.get('/customers', { params });
    const raw = data.data;
    // Backend wraps pagination metadata inside a nested `page` object
    return {
        content: raw.content,
        totalElements: raw.page?.totalElements ?? raw.totalElements ?? 0,
        totalPages: raw.page?.totalPages ?? raw.totalPages ?? 0,
        size: raw.page?.size ?? raw.size ?? 0,
        number: raw.page?.number ?? raw.number ?? 0,
    };
};

export const getCustomerById = async (id: string) => {
    const { data } = await axiosInstance.get(`/customers/${id}`);
    return data.data as Customer;
};