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

export interface PageMeta {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
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

export interface CreateCustomerRequest {
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

export const getCustomers = async (params?: CustomersParams): Promise<CustomerResponse> => {
    const { data } = await axiosInstance.get('/customers', { params });
    const raw = data.data;
    // Backend returns pagination metadata inside a nested `page` object
    const meta: PageMeta = raw.page ?? {};
    return {
        content: raw.content,
        totalElements: meta.totalElements ?? 0,
        totalPages: meta.totalPages ?? 0,
        size: meta.size ?? 0,
        number: meta.number ?? 0,
    };
};

export const getCustomerById = async (id: string) => {
    const { data } = await axiosInstance.get(`/customers/${id}`);
    return data.data as Customer;
};

export const createCustomer = async (request: CreateCustomerRequest) => {
    const { data } = await axiosInstance.post('/customers', request);
    return data.data as Customer;
};