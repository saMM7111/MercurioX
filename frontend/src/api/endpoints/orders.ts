import { axiosInstance } from '../axiosInstance';

export interface OrderDetail {
    productId: number;
    unitPrice: number;
    quantity: number;
    discount: number;
}

export interface Order {
    orderId: number;          // matches backend OrderResponse field name
    customerId: string;
    employeeId?: number;
    orderDate?: string;
    requiredDate?: string;
    shippedDate?: string;
    shipVia?: number;
    freight?: number;
    shipName?: string;
    shipAddress?: string;
    shipCity?: string;
    shipRegion?: string;
    shipPostalCode?: string;
    shipCountry?: string;
    details: OrderDetail[];
}

export interface OrderResponse {
    content: Order[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface OrdersParams {
    page?: number;
    size?: number;
    customerId?: string;
    startDate?: string;
    endDate?: string;
}

export interface CreateOrderDetailRequest {
    productId: number;
    unitPrice: number;
    quantity: number;
    discount?: number;
}

export interface CreateOrderRequest {
    customerId: string;
    employeeId?: number;
    orderDate?: string;
    requiredDate?: string;
    shippedDate?: string;
    shipVia?: number;
    freight?: number;
    shipName?: string;
    shipAddress?: string;
    shipCity?: string;
    shipRegion?: string;
    shipPostalCode?: string;
    shipCountry?: string;
    details: CreateOrderDetailRequest[];
}

export const getOrders = async (params?: OrdersParams): Promise<OrderResponse> => {
    const { data } = await axiosInstance.get('/orders', { params });
    const raw = data.data;
    // Backend wraps pagination metadata inside a nested `page` object
    return {
        content: raw.content,
        totalElements: raw.page?.totalElements ?? raw.totalElements ?? 0,
        totalPages: raw.page?.totalPages ?? raw.totalPages ?? 0,
        size: raw.page?.size ?? raw.size ?? 0,
        number: raw.page?.number ?? raw.number ?? 0,
    };
};

export const getOrderById = async (id: number) => {
    const { data } = await axiosInstance.get(`/orders/${id}`);
    return data.data as Order;
};

export const createOrder = async (request: CreateOrderRequest) => {
    const { data } = await axiosInstance.post('/orders', request);
    return data.data as Order;
};