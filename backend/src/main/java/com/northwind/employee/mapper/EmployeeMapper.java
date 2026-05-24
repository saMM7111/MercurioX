package com.northwind.employee.mapper;

import com.northwind.employee.dto.CreateEmployeeRequest;
import com.northwind.employee.dto.EmployeeResponse;
import com.northwind.employee.entity.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {

    @Mapping(source = "manager.employeeId", target = "reportsTo")
    EmployeeResponse toResponse(Employee employee);

    @Mapping(target = "employeeId", ignore = true)  // assigned manually in service
    @Mapping(target = "manager", ignore = true)      // set manually in service
    Employee toEntity(CreateEmployeeRequest request);
}