package com.northwind.employee.service;

import com.northwind.common.exception.ResourceNotFoundException;
import com.northwind.employee.dto.CreateEmployeeRequest;
import com.northwind.employee.dto.EmployeeResponse;
import com.northwind.employee.entity.Employee;
import com.northwind.employee.mapper.EmployeeMapper;
import com.northwind.employee.repository.EmployeeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeMapper employeeMapper;

    public EmployeeService(EmployeeRepository employeeRepository, EmployeeMapper employeeMapper) {
        this.employeeRepository = employeeRepository;
        this.employeeMapper = employeeMapper;
    }

    public Page<EmployeeResponse> getAll(Pageable pageable) {
        return employeeRepository.findAll(pageable).map(employeeMapper::toResponse);
    }

    public EmployeeResponse getById(Integer id) {
        return employeeRepository.findById(id)
                .map(employeeMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
    }

    @Transactional
    public EmployeeResponse create(CreateEmployeeRequest request) {
        Employee employee = employeeMapper.toEntity(request);

        // Set manager if reportsTo is provided
        if (request.reportsTo() != null) {
            Employee manager = employeeRepository.findById(request.reportsTo())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Manager not found with id: " + request.reportsTo()));
            employee.setManager(manager);
        }

        // Auto-assign next employee ID (employees table has no sequence)
        Integer maxId = employeeRepository.findAll().stream()
                .mapToInt(Employee::getEmployeeId)
                .max()
                .orElse(0);
        employee.setEmployeeId(maxId + 1);

        return employeeMapper.toResponse(employeeRepository.save(employee));
    }
}