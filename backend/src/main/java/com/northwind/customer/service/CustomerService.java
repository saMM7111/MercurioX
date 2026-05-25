package com.northwind.customer.service;

import com.northwind.common.audit.Audited;
import com.northwind.common.exception.ResourceNotFoundException;
import com.northwind.customer.dto.CreateCustomerRequest;
import com.northwind.customer.dto.CustomerResponse;
import com.northwind.customer.entity.Customer;
import com.northwind.customer.mapper.CustomerMapper;
import com.northwind.customer.repository.CustomerRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    public CustomerService(CustomerRepository customerRepository, CustomerMapper customerMapper) {
        this.customerRepository = customerRepository;
        this.customerMapper = customerMapper;
    }

    public Page<CustomerResponse> getAll(Pageable pageable) {
        return customerRepository.findAll(pageable).map(customerMapper::toResponse);
    }

    public CustomerResponse getById(String id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return customerMapper.toResponse(customer);
    }

    @Transactional
    @Audited(action = "CREATE", entity = "Customer")
    public CustomerResponse create(CreateCustomerRequest request) {
        if (customerRepository.existsById(request.customerId())) {
            throw new IllegalArgumentException(
                    "Customer ID '" + request.customerId() + "' already exists");
        }
        Customer customer = customerMapper.toEntity(request);
        return customerMapper.toResponse(customerRepository.save(customer));
    }
}