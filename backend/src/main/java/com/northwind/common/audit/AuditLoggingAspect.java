package com.northwind.common.audit;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class AuditLoggingAspect {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    public AuditLoggingAspect(AuditLogRepository auditLogRepository, ObjectMapper objectMapper) {
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
    }

    @Around("@annotation(audited)")
    public Object logAround(ProceedingJoinPoint joinPoint, Audited audited) throws Throwable {
        Object[] args = joinPoint.getArgs(); // capture args BEFORE proceeding
        Object result = joinPoint.proceed();
        persistLogAsync(audited, result, args);
        return result;
    }

    @Async
    void persistLogAsync(Audited audited, Object result, Object[] args) {
        AuditLog log = new AuditLog();
        log.setAction(audited.action());
        log.setEntityType(audited.entity());

        String entityId = resolveEntityId(result);
        // For void methods (DELETE), fall back to first argument
        if ((entityId == null || entityId.isEmpty()) && args != null && args.length > 0) {
            entityId = String.valueOf(args[0]);
        }
        log.setEntityId(entityId);
        log.setNewValue(serialize(result));
        log.setUserId(resolveUserId().orElse(null));
        log.setRequestId(null);
        auditLogRepository.save(log);
    }

    private Optional<UUID> resolveUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return Optional.empty();
        }
        try {
            return Optional.of(UUID.fromString(auth.getPrincipal().toString()));
        } catch (IllegalArgumentException ex) {
            return Optional.empty();
        }
    }

    private String resolveEntityId(Object result) {
        if (result == null) return "";
        try {
            com.fasterxml.jackson.databind.JsonNode node =
                    objectMapper.readTree(serialize(result));
            // Try common id field names
            for (String field : new String[]{"id", "productId", "orderId",
                    "customerId", "employeeId"}) {
                String val = node.path(field).asText("");
                if (!val.isEmpty()) return val;
            }
            return "";
        } catch (Exception ex) {
            return "";
        }
    }

    private String serialize(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            return "\"<serialization_failed>\"";
        }
    }
}
