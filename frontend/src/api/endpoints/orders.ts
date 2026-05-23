import { axiosInstance } from '../axiosInstance';

export interface Order {
  id: number;
  customerId: string;
  employeeId: number;
  orderDate: string;
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
  totalAmount?: number;
  status?: string; // e.g., 'Pending', 'Shipped', 'Delivered'
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
  startDate?: string;
  endDate?: string;
  customerId?: string;
}

export const getOrders = async (params?: OrdersParams) => {
  const { data } = await axiosInstance.get('/orders', { params });
  return data.data as OrderResponse;
};

export const getOrderStats = async () => {
  const { data } = await axiosInstance.get('/orders/stats');
  return data.data; // generic stats object
};
