package com.northwind.employee.dto;

import java.time.Instant;

public record EmployeeResponse(
        Integer employeeId,
        String lastName,
        String firstName,
        String title,
        String titleOfCourtesy,
        Instant birthDate,
        Instant hireDate,
        String address,
        String city,
        String region,
        String postalCode,
        String country,
        String homePhone,
        String extension,
        String notes,
        String photoPath,
        Integer reportsTo
) {
}
