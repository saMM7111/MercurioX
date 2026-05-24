import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, getLowStockProducts, createProduct, updateProduct, deleteProduct, type ProductsParams, type Product } from '../api/endpoints/products';

export const useProducts = (params?: ProductsParams) => {
    return useQuery({
        queryKey: ['products', params],
        queryFn: () => getProducts(params),
    });
};

export const useLowStockProducts = () => {
    return useQuery({
        queryKey: ['products', 'low-stock'],
        queryFn: () => getLowStockProducts(),
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (product: Partial<Product>) => createProduct(product),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, product }: { id: number; product: Partial<Product> }) => updateProduct(id, product),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};