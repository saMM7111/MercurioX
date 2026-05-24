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

export const getCustomers = async (params?: CustomersParams) => {
    const { data } = await axiosInstance.get('/customers', { params });
    return data.data as CustomerResponse;
};

export const getCustomerById = async (id: string) => {
    const { data } = await axiosInstance.get(`/customers/${id}`);
    return data.data as Customer;
};