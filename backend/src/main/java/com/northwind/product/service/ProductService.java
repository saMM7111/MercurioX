package com.northwind.product.service;

import com.northwind.common.audit.Audited;
import com.northwind.common.exception.ResourceNotFoundException;
import com.northwind.product.dto.CreateProductRequest;
import com.northwind.product.dto.ProductResponse;
import com.northwind.product.dto.UpdateProductRequest;
import com.northwind.product.entity.Product;
import com.northwind.product.mapper.ProductMapper;
import com.northwind.product.repository.ProductRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public ProductService(ProductRepository productRepository, ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
    }

    public Page<ProductResponse> getAll(Pageable pageable, Integer categoryId, String search) {
        Page<Product> page;
        if (search != null && !search.isBlank()) {
            page = productRepository.searchByName(search, pageable);
        } else if (categoryId != null) {
            page = productRepository.findByCategoryId(categoryId, pageable);
        } else {
            page = productRepository.findAll(pageable);
        }
        return page.map(productMapper::toResponse);
    }

    public ProductResponse getById(Integer id) {
        return productMapper.toResponse(findEntity(id));
    }

    public List<ProductResponse> getLowStock() {
        return productRepository.findLowStockProducts().stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Transactional
    @Audited(action = "CREATE", entity = "Product")
    public ProductResponse create(CreateProductRequest request) {
        Product product = productMapper.toEntity(request);
        if (product.getDiscontinued() == null) {
            product.setDiscontinued(false);
        }
        return productMapper.toResponse(productRepository.save(product));
    }

    @Transactional
    @Audited(action = "UPDATE", entity = "Product")
    public ProductResponse update(Integer id, UpdateProductRequest request) {
        Product existing = findEntity(id);
        productMapper.updateEntity(request, existing);
        return productMapper.toResponse(productRepository.save(existing));
    }

    @Transactional
    @Audited(action = "DELETE", entity = "Product")
    public void delete(Integer id) {
        Product existing = findEntity(id);
        existing.setDiscontinued(true);
        productRepository.save(existing);
    }

    private Product findEntity(Integer id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }
}
