package com.northwind.customer.mapper;

import com.northwind.customer.dto.CreateCustomerRequest;
import com.northwind.customer.dto.CustomerResponse;
import com.northwind.customer.entity.Customer;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CustomerMapper {
    CustomerResponse toResponse(Customer customer);
    Customer toEntity(CreateCustomerRequest request);
}