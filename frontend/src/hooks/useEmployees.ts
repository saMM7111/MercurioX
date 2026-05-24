import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../api/axiosInstance';

export interface Employee {
    employeeId: number;
    firstName: string;
    lastName: string;
    title?: string;
    titleOfCourtesy?: string;
    birthDate?: string;
    hireDate?: string;
    address?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
    homePhone?: string;
    extension?: string;
    notes?: string;
    photoPath?: string;
    reportsTo?: number;
}

export interface EmployeePageResponse {
    content: Employee[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

const getEmployees = async (params?: any) => {
    const { data } = await axiosInstance.get('/employees', { params });
    return data.data as EmployeePageResponse;
};

const getEmployeeById = async (id: number) => {
    const { data } = await axiosInstance.get(`/employees/${id}`);
    return data.data as Employee;
};

export const useEmployees = (params?: any) => {
    return useQuery({
        queryKey: ['employees', params],
        queryFn: () => getEmployees(params),
    });
};

export const useEmployeeById = (id: number | null) => {
    return useQuery({
        queryKey: ['employees', id],
        queryFn: () => getEmployeeById(id!),
        enabled: id !== null,
    });
};