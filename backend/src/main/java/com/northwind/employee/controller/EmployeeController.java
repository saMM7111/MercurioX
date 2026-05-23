package com.northwind.employee.controller;

import com.northwind.common.response.ApiResponse;
import com.northwind.employee.dto.EmployeeResponse;
import com.northwind.employee.service.EmployeeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employees")
@Validated
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ApiResponse<Page<EmployeeResponse>> getAll(Pageable pageable) {
        return ApiResponse.ok("Employees fetched", employeeService.getAll(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ApiResponse<EmployeeResponse> getById(@PathVariable Integer id) {
        return ApiResponse.ok("Employee fetched", employeeService.getById(id));
    }
}
