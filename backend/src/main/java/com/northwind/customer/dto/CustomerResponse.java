package com.northwind.customer.dto;

public record CustomerResponse(
        String customerId,
        String companyName,
        String contactName,
        String contactTitle,
        String address,
        String city,
        String region,
        String postalCode,
        String country,
        String phone,
        String fax
) {
}
