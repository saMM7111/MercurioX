import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../api/axiosInstance';

export const getAuditLogs = async (params?: any) => {
  const { data } = await axiosInstance.get('/audit-logs', { params });
  return data.data;
};

export const useAuditLogs = (params?: any) => {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => getAuditLogs(params),
  });
};
