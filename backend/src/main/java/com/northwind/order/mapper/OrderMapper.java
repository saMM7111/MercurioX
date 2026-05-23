package com.northwind.order.mapper;

import com.northwind.order.dto.OrderDetailResponse;
import com.northwind.order.dto.OrderResponse;
import com.northwind.order.entity.Order;
import com.northwind.order.entity.OrderDetail;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(source = "details", target = "details")
    OrderResponse toResponse(Order order);

    @Mapping(source = "id.productId", target = "productId")
    OrderDetailResponse toDetailResponse(OrderDetail detail);

    List<OrderDetailResponse> toDetailResponses(List<OrderDetail> details);
}
