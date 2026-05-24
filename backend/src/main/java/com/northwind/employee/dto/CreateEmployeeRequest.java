package com.northwind.employee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public record CreateEmployeeRequest(
        @NotBlank @Size(max = 20) String lastName,
        @NotBlank @Size(max = 10) String firstName,
        @Size(max = 30) String title,
        @Size(max = 25) String titleOfCourtesy,
        Instant birthDate,
        Instant hireDate,
        @Size(max = 60) String address,
        @Size(max = 15) String city,
        @Size(max = 15) String region,
        @Size(max = 10) String postalCode,
        @Size(max = 15) String country,
        @Size(max = 24) String homePhone,
        @Size(max = 4) String extension,
        String notes,
        Integer reportsTo
) {
}