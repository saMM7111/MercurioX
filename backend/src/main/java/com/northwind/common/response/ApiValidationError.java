package com.northwind.common.response;

import java.time.Instant;
import java.util.Map;

public record ApiValidationError(int status, String message, Instant timestamp, Map<String, String> fieldErrors) {
    public static ApiValidationError of(int status, String message, Map<String, String> fieldErrors) {
        return new ApiValidationError(status, message, Instant.now(), fieldErrors);
    }
}
