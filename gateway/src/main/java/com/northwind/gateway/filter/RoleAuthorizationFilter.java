package com.northwind.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Per-route gateway filter that checks whether the authenticated user
 * holds at least one of the required roles.
 * <p>
 * Reads roles from the {@code X-User-Roles} header (injected by {@link JwtAuthFilter})
 * and compares against the allowed set configured per route in {@link com.northwind.gateway.config.RouteConfig}.
 */
public class RoleAuthorizationFilter implements GatewayFilter {

    private static final String HEADER_USER_ROLES = "X-User-Roles";

    private final Set<String> allowedRoles;

    /**
     * @param allowedRoles the roles that are permitted for a given route
     */
    public RoleAuthorizationFilter(String... allowedRoles) {
        this.allowedRoles = Set.of(allowedRoles);
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String rolesHeader = exchange.getRequest().getHeaders().getFirst(HEADER_USER_ROLES);

        if (rolesHeader == null || rolesHeader.isBlank()) {
            return forbidden(exchange, "No roles present — access denied");
        }

        List<String> userRoles = Arrays.stream(rolesHeader.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());

        boolean hasPermission = userRoles.stream().anyMatch(allowedRoles::contains);

        if (!hasPermission) {
            return forbidden(exchange, "Insufficient role — requires one of: " + allowedRoles);
        }

        return chain.filter(exchange);
    }

    private Mono<Void> forbidden(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.FORBIDDEN);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String body = """
                {"status":403,"message":"%s","timestamp":"%s"}
                """.formatted(message, Instant.now()).strip();

        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }
}
