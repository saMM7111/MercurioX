package com.northwind.product.dto;

import java.math.BigDecimal;

public record ProductResponse(
        Integer productId,
        String productName,
        Integer supplierId,
        Integer categoryId,
        String quantityPerUnit,
        BigDecimal unitPrice,
        Integer unitsInStock,
        Integer unitsOnOrder,
        Integer reorderLevel,
        Boolean discontinued
) {
}
