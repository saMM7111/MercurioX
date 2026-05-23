package com.northwind.product.dto;

import com.northwind.common.validation.ValidProductCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record UpdateProductRequest(
        @Size(max = 40) String productName,
        Integer supplierId,
        @ValidProductCategory Integer categoryId,
        @Size(max = 20) String quantityPerUnit,
        @DecimalMin(value = "0.0", inclusive = true) BigDecimal unitPrice,
        @PositiveOrZero Integer unitsInStock,
        @PositiveOrZero Integer unitsOnOrder,
        @PositiveOrZero Integer reorderLevel,
        Boolean discontinued
) {
}
