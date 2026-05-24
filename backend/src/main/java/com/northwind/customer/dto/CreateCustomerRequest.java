package com.northwind.customer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCustomerRequest(
        @NotBlank @Size(max = 5) String customerId,
        @NotBlank @Size(max = 40) String companyName,
        @Size(max = 30) String contactName,
        @Size(max = 30) String contactTitle,
        @Size(max = 60) String address,
        @Size(max = 15) String city,
        @Size(max = 15) String region,
        @Size(max = 10) String postalCode,
        @Size(max = 15) String country,
        @Size(max = 24) String phone,
        @Size(max = 24) String fax
) {
}