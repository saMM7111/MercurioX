import { useQuery } from '@tanstack/react-query';
import { getOrders, getOrderStats, type OrdersParams } from '../api/endpoints/orders';

export const useOrders = (params?: OrdersParams) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => getOrders(params),
  });
};

export const useOrderStats = () => {
  return useQuery({
    queryKey: ['orders', 'stats'],
    queryFn: () => getOrderStats(),
  });
};
