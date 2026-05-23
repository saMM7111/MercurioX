package com.northwind.order.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Integer orderId,
        String customerId,
        Integer employeeId,
        Instant orderDate,
        Instant requiredDate,
        Instant shippedDate,
        Integer shipVia,
        BigDecimal freight,
        String shipName,
        String shipAddress,
        String shipCity,
        String shipRegion,
        String shipPostalCode,
        String shipCountry,
        List<OrderDetailResponse> details
) {
}
