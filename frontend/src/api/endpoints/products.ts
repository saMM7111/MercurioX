import { axiosInstance } from '../axiosInstance';

export interface Product {
  id: number;
  productName: string;
  categoryId?: number;
  supplierId?: number;
  quantityPerUnit?: string;
  unitPrice: number;
  unitsInStock: number;
  unitsOnOrder: number;
  reorderLevel: number;
  discontinued: boolean;
}

export interface ProductResponse {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ProductsParams {
  page?: number;
  size?: number;
  categoryId?: number;
  name?: string;
}

export const getProducts = async (params?: ProductsParams) => {
  const { data } = await axiosInstance.get('/products', { params });
  return data.data as ProductResponse;
};

export const getLowStockProducts = async () => {
  const { data } = await axiosInstance.get('/products/low-stock');
  return data.data as Product[];
};

export const createProduct = async (product: Partial<Product>) => {
  const { data } = await axiosInstance.post('/products', product);
  return data.data as Product;
};

export const updateProduct = async (id: number, product: Partial<Product>) => {
  const { data } = await axiosInstance.put(`/products/${id}`, product);
  return data.data as Product;
};

export const deleteProduct = async (id: number) => {
  await axiosInstance.delete(`/products/${id}`);
};
