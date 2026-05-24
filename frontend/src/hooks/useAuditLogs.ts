import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../api/axiosInstance';

export interface AuditLogPageResponse {
    content: any[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export const getAuditLogs = async (params?: { page?: number; size?: number }): Promise<AuditLogPageResponse> => {
    const { data } = await axiosInstance.get('/audit-logs', { params });
    const raw = data.data;
    const meta = raw.page ?? {};
    return {
        content: raw.content,
        totalElements: meta.totalElements ?? raw.totalElements ?? 0,
        totalPages: meta.totalPages ?? raw.totalPages ?? 0,
        size: meta.size ?? raw.size ?? 0,
        number: meta.number ?? raw.number ?? 0,
    };
};

export const useAuditLogs = (params?: { page?: number; size?: number }) => {
    return useQuery({
        queryKey: ['audit-logs', params],
        queryFn: () => getAuditLogs(params),
    });
};