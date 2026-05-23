package com.northwind.order.service;

import com.northwind.common.exception.InsufficientStockException;
import com.northwind.common.exception.ResourceNotFoundException;
import com.northwind.order.dto.CreateOrderDetailRequest;
import com.northwind.order.dto.CreateOrderRequest;
import com.northwind.order.dto.OrderResponse;
import com.northwind.order.entity.Order;
import com.northwind.order.entity.OrderDetail;
import com.northwind.order.entity.OrderDetailId;
import com.northwind.order.event.OrderCreatedEvent;
import com.northwind.order.mapper.OrderMapper;
import com.northwind.order.repository.OrderRepository;
import com.northwind.product.entity.Product;
import com.northwind.product.repository.ProductRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final OrderMapper orderMapper;
    private final ApplicationEventPublisher eventPublisher;

    public OrderService(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            OrderMapper orderMapper,
            ApplicationEventPublisher eventPublisher) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.orderMapper = orderMapper;
        this.eventPublisher = eventPublisher;
    }

    public Page<OrderResponse> getAll(Pageable pageable, String customerId, Instant startDate, Instant endDate) {
        Page<Order> page;
        if (customerId != null && !customerId.isBlank()) {
            page = orderRepository.findByCustomerId(customerId, pageable);
        } else if (startDate != null && endDate != null) {
            page = orderRepository.findByOrderDateBetween(startDate, endDate, pageable);
        } else {
            page = orderRepository.findAll(pageable);
        }
        return page.map(orderMapper::toResponse);
    }

    public OrderResponse getById(Integer id) {
        return orderMapper.toResponse(findEntity(id));
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        Order order = new Order();
        order.setCustomerId(request.customerId());
        order.setEmployeeId(request.employeeId());
        order.setOrderDate(request.orderDate() != null ? request.orderDate() : Instant.now());
        order.setRequiredDate(request.requiredDate());
        order.setShippedDate(request.shippedDate());
        order.setShipVia(request.shipVia());
        order.setFreight(request.freight());
        order.setShipName(request.shipName());
        order.setShipAddress(request.shipAddress());
        order.setShipCity(request.shipCity());
        order.setShipRegion(request.shipRegion());
        order.setShipPostalCode(request.shipPostalCode());
        order.setShipCountry(request.shipCountry());

        BigDecimal total = BigDecimal.ZERO;
        for (CreateOrderDetailRequest detailRequest : request.details()) {
            Product product = productRepository.findById(detailRequest.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            int inStock = product.getUnitsInStock() != null ? product.getUnitsInStock() : 0;
            if (inStock < detailRequest.quantity()) {
                throw new InsufficientStockException("Insufficient stock for product " + detailRequest.productId());
            }
            product.setUnitsInStock(inStock - detailRequest.quantity());
            productRepository.save(product);

            OrderDetail detail = new OrderDetail();
            OrderDetailId detailId = new OrderDetailId();
            detailId.setProductId(detailRequest.productId());
            detail.setId(detailId);
            detail.setOrder(order);
            detail.setUnitPrice(detailRequest.unitPrice());
            detail.setQuantity(detailRequest.quantity());
            detail.setDiscount(detailRequest.discount() != null ? detailRequest.discount() : 0.0);
            order.addDetail(detail);

            BigDecimal lineTotal = detail.getUnitPrice()
                    .multiply(BigDecimal.valueOf(detail.getQuantity()))
                    .multiply(BigDecimal.valueOf(1.0 - detail.getDiscount()));
            total = total.add(lineTotal);
        }

        Order saved = orderRepository.save(order);
        eventPublisher.publishEvent(new OrderCreatedEvent(
                saved.getOrderId(),
                saved.getCustomerId(),
                total,
                Instant.now()));

        return orderMapper.toResponse(saved);
    }

    private Order findEntity(Integer id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }
}
