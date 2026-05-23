package com.northwind.common.event;

import com.northwind.order.event.OrderCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class DomainEventListener {

    private static final Logger logger = LoggerFactory.getLogger(DomainEventListener.class);

    @Async
    @EventListener
    public void onOrderCreated(OrderCreatedEvent event) {
        logger.info("Order created: id={} customer={} amount={}",
                event.orderId(), event.customerId(), event.totalAmount());
    }
}
