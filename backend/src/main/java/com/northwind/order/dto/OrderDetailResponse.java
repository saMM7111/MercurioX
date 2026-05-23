package com.northwind.order.dto;

import java.math.BigDecimal;

public record OrderDetailResponse(
        Integer productId,
        BigDecimal unitPrice,
        Integer quantity,
        Double discount
) {
}
