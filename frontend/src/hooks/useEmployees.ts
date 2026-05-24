import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export interface CreateEmployeeRequest {
    lastName: string;
    firstName: string;
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
    reportsTo?: number;
}

export interface EmployeePageResponse {
    content: Employee[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

const getEmployees = async (params?: { page?: number; size?: number }) => {
    const { data } = await axiosInstance.get('/employees', { params });
    return data.data as EmployeePageResponse;
};

const getEmployeeById = async (id: number) => {
    const { data } = await axiosInstance.get(`/employees/${id}`);
    return data.data as Employee;
};

const createEmployee = async (request: CreateEmployeeRequest) => {
    const { data } = await axiosInstance.post('/employees', request);
    return data.data as Employee;
};

export const useEmployees = (params?: { page?: number; size?: number }) => {
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

export const useCreateEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: CreateEmployeeRequest) => createEmployee(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        },
    });
};