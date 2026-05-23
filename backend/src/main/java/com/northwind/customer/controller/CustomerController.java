package com.northwind.customer.controller;

import com.northwind.common.response.ApiResponse;
import com.northwind.customer.dto.CustomerResponse;
import com.northwind.customer.service.CustomerService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customers")
@Validated
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','VIEWER')")
    public ApiResponse<Page<CustomerResponse>> getAll(Pageable pageable) {
        return ApiResponse.ok("Customers fetched", customerService.getAll(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','VIEWER')")
    public ApiResponse<CustomerResponse> getById(@PathVariable String id) {
        return ApiResponse.ok("Customer fetched", customerService.getById(id));
    }
}
