package com.northwind.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

/**
 * Global JWT authentication filter that runs on every gateway request.
 * <p>
 * Validates the Authorization Bearer token, extracts user claims,
 * and forwards them as headers to downstream services.
 * Whitelisted paths (login/register) bypass validation.
 */
@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final String HEADER_USER_ID = "X-User-Id";
    private static final String HEADER_USER_ROLES = "X-User-Roles";

    /** Paths that do not require a JWT token. */
    private static final List<String> WHITELIST = List.of(
            "/api/auth/login",
            "/api/auth/register"
    );

    private final SecretKey signingKey;

    public JwtAuthFilter(@Value("${jwt.secret}") String jwtSecret) {
        this.signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // 1. Allow whitelisted endpoints through without a token
        if (isWhitelisted(path)) {
            return chain.filter(exchange);
        }

        // 2. Extract the Authorization header
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            return rejectWith(exchange, HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
        }

        // 3. Validate the JWT
        String token = authHeader.substring(BEARER_PREFIX.length());
        Claims claims;
        try {
            claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException ex) {
            return rejectWith(exchange, HttpStatus.UNAUTHORIZED, "Token has expired");
        } catch (MalformedJwtException | SignatureException | IllegalArgumentException ex) {
            return rejectWith(exchange, HttpStatus.UNAUTHORIZED, "Invalid token");
        }

        // 4. Extract claims and forward as headers to downstream services
        String userId = claims.getSubject();
        @SuppressWarnings("unchecked")
        List<String> roles = claims.get("roles", List.class);
        String rolesHeader = (roles != null) ? String.join(",", roles) : "";

        ServerHttpRequest mutatedRequest = request.mutate()
                .header(HEADER_USER_ID, userId)
                .header(HEADER_USER_ROLES, rolesHeader)
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    @Override
    public int getOrder() {
        // Run before the role authorization filter
        return -2;
    }

    private boolean isWhitelisted(String path) {
        return WHITELIST.stream().anyMatch(path::startsWith);
    }

    /**
     * Writes a JSON error response and completes the exchange.
     */
    private Mono<Void> rejectWith(ServerWebExchange exchange, HttpStatus status, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String body = """
                {"status":%d,"message":"%s","timestamp":"%s"}
                """.formatted(status.value(), message, Instant.now()).strip();

        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }
}
