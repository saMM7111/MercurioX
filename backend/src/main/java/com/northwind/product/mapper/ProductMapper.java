package com.northwind.product.mapper;

import com.northwind.product.dto.CreateProductRequest;
import com.northwind.product.dto.ProductResponse;
import com.northwind.product.dto.UpdateProductRequest;
import com.northwind.product.entity.Product;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "discontinued", expression = "java(product.getDiscontinued() != null && product.getDiscontinued() == 1)")
    ProductResponse toResponse(Product product);

    @Mapping(target = "discontinued", expression = "java(request.discontinued() != null && request.discontinued() ? 1 : 0)")
    Product toEntity(CreateProductRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "discontinued", expression = "java(request.discontinued() != null ? (request.discontinued() ? 1 : 0) : null)")
    void updateEntity(UpdateProductRequest request, @MappingTarget Product product);
}
