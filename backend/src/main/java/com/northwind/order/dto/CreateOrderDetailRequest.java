package com.northwind.order.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record CreateOrderDetailRequest(
        @NotNull Integer productId,
        @NotNull @DecimalMin(value = "0.0", inclusive = true) BigDecimal unitPrice,
        @NotNull @Positive Integer quantity,
        @DecimalMin(value = "0.0", inclusive = true) @DecimalMax(value = "1.0", inclusive = true) Double discount
) {
}
