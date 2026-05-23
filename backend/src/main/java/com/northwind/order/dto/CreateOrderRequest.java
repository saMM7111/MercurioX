package com.northwind.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record CreateOrderRequest(
        @NotBlank @Size(max = 5) String customerId,
        Integer employeeId,
        Instant orderDate,
        Instant requiredDate,
        Instant shippedDate,
        Integer shipVia,
        BigDecimal freight,
        @Size(max = 40) String shipName,
        @Size(max = 60) String shipAddress,
        @Size(max = 15) String shipCity,
        @Size(max = 15) String shipRegion,
        @Size(max = 10) String shipPostalCode,
        @Size(max = 15) String shipCountry,
        @Valid @NotEmpty List<CreateOrderDetailRequest> details
) {
}
