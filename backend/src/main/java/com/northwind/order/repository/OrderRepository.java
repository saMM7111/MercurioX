package com.northwind.order.repository;

import com.northwind.order.entity.Order;
import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    Page<Order> findByCustomerId(String customerId, Pageable pageable);
    Page<Order> findByOrderDateBetween(Instant start, Instant end, Pageable pageable);
}
