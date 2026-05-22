package com.northwind.auth.dto;

import com.northwind.auth.entity.Role;
import java.util.UUID;

public record AuthResponse(
        UUID userId,
        String username,
        Role role,
        String accessToken
) {
}
