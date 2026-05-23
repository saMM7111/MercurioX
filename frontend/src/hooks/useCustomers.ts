import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../api/axiosInstance';

export const getCustomers = async (params?: any) => {
  const { data } = await axiosInstance.get('/customers', { params });
  return data.data;
};

export const useCustomers = (params?: any) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => getCustomers(params),
  });
};
