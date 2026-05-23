package com.northwind.order.event;

import java.math.BigDecimal;
import java.time.Instant;

public record OrderCreatedEvent(
        Integer orderId,
        String customerId,
        BigDecimal totalAmount,
        Instant occurredAt
) {
}
