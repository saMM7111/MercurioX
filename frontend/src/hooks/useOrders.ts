import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getOrders,
    getOrderById,
    createOrder,
    type OrdersParams,
    type CreateOrderRequest,
} from '../api/endpoints/orders';

export const useOrders = (params?: OrdersParams) => {
    return useQuery({
        queryKey: ['orders', params],
        queryFn: () => getOrders(params),
    });
};

export const useOrderById = (id: number) => {
    return useQuery({
        queryKey: ['orders', id],
        queryFn: () => getOrderById(id),
        enabled: !!id,
    });
};

export const useCreateOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: CreateOrderRequest) => createOrder(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });
};