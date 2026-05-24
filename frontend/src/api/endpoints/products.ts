import { axiosInstance } from '../axiosInstance';

export interface Product {
    productId: number;        // matches backend ProductResponse field name
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
    search?: string;
}

export const getProducts = async (params?: ProductsParams): Promise<ProductResponse> => {
    const { data } = await axiosInstance.get('/products', { params });
    const raw = data.data;
    return {
        content: raw.content,
        totalElements: raw.page?.totalElements ?? raw.totalElements ?? 0,
        totalPages: raw.page?.totalPages ?? raw.totalPages ?? 0,
        size: raw.page?.size ?? raw.size ?? 0,
        number: raw.page?.number ?? raw.number ?? 0,
    };
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