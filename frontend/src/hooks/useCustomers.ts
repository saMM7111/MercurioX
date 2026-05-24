import { useQuery } from '@tanstack/react-query';
import { getCustomers, getCustomerById, type CustomersParams } from '../api/endpoints/customers';

export const useCustomers = (params?: CustomersParams) => {
    return useQuery({
        queryKey: ['customers', params],
        queryFn: () => getCustomers(params),
    });
};

export const useAllCustomers = () => {
    return useQuery({
        queryKey: ['customers', 'all'],
        queryFn: () => getCustomers({ page: 0, size: 200 }),
    });
};

export const useCustomerById = (id: string) => {
    return useQuery({
        queryKey: ['customers', id],
        queryFn: () => getCustomerById(id),
        enabled: !!id,
    });
};