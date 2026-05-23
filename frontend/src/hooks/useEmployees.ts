import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../api/axiosInstance';

export const getEmployees = async (params?: any) => {
  const { data } = await axiosInstance.get('/employees', { params });
  return data.data;
};

export const useEmployees = (params?: any) => {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => getEmployees(params),
  });
};
