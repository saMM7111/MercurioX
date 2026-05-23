package com.northwind.gateway.config;

import com.northwind.gateway.filter.RoleAuthorizationFilter;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.GatewayFilterSpec;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.cloud.gateway.route.builder.UriSpec;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

import java.util.function.Function;

/**
 * Programmatic route definitions for the API Gateway.
 * <p>
 * Each route forwards to the backend service and applies role-based
 * authorization filters with method-level granularity.
 */
@Configuration
public class RouteConfig {

        @Value("${gateway.backend-uri:http://backend:8081}")
        private String backendUri;
        private final RedisRateLimiter redisRateLimiter;
        private final KeyResolver userKeyResolver;

        public RouteConfig(RedisRateLimiter redisRateLimiter, KeyResolver userKeyResolver) {
                this.redisRateLimiter = redisRateLimiter;
                this.userKeyResolver = userKeyResolver;
        }

    // ──────────────────────────────────────────────────
    // Auth routes — no role filter (public)
    // ──────────────────────────────────────────────────

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()

                // ── Auth (public) ────────────────────────────
                .route("auth-route", r -> r
                        .path("/api/auth/**")
                        .filters(rateLimitOnly())
                        .uri(backendUri))

                // ── Products — read (ADMIN, MANAGER, VIEWER) ─
                .route("products-read", r -> r
                        .path("/api/products/**")
                        .and().method("GET")
                        .filters(rateLimitAndRole("ADMIN", "MANAGER", "VIEWER"))
                        .uri(backendUri))

                // ── Products — write (ADMIN, MANAGER) ────────
                .route("products-write", r -> r
                        .path("/api/products/**")
                        .and().method("POST", "PUT", "PATCH")
                        .filters(rateLimitAndRole("ADMIN", "MANAGER"))
                        .uri(backendUri))

                // ── Products — delete (ADMIN only) ───────────
                .route("products-delete", r -> r
                        .path("/api/products/**")
                        .and().method("DELETE")
                        .filters(rateLimitAndRole("ADMIN"))
                        .uri(backendUri))

                // ── Orders — read ────────────────────────────
                .route("orders-read", r -> r
                        .path("/api/orders/**")
                        .and().method("GET")
                        .filters(rateLimitAndRole("ADMIN", "MANAGER", "VIEWER"))
                        .uri(backendUri))

                // ── Orders — write ───────────────────────────
                .route("orders-write", r -> r
                        .path("/api/orders/**")
                        .and().method("POST", "PUT", "PATCH", "DELETE")
                        .filters(rateLimitAndRole("ADMIN", "MANAGER"))
                        .uri(backendUri))

                // ── Customers — read ─────────────────────────
                .route("customers-read", r -> r
                        .path("/api/customers/**")
                        .and().method("GET")
                        .filters(rateLimitAndRole("ADMIN", "MANAGER", "VIEWER"))
                        .uri(backendUri))

                // ── Customers — write ────────────────────────
                .route("customers-write", r -> r
                        .path("/api/customers/**")
                        .and().method("POST", "PUT", "PATCH", "DELETE")
                        .filters(rateLimitAndRole("ADMIN", "MANAGER"))
                        .uri(backendUri))

                // ── Employees (ADMIN, MANAGER only) ──────────
                .route("employees-route", r -> r
                        .path("/api/employees/**")
                        .filters(rateLimitAndRole("ADMIN", "MANAGER"))
                        .uri(backendUri))

                // ── Audit logs (ADMIN only) ──────────────────
                .route("audit-logs-route", r -> r
                        .path("/api/audit-logs/**")
                        .filters(rateLimitAndRole("ADMIN"))
                        .uri(backendUri))

                .build();
    }

        private Function<GatewayFilterSpec, UriSpec> rateLimitOnly() {
                return f -> f.requestRateLimiter(c -> c
                                .setRateLimiter(redisRateLimiter)
                                .setKeyResolver(userKeyResolver));
        }

        private Function<GatewayFilterSpec, UriSpec> rateLimitAndRole(String... roles) {
                return f -> f.filter(new RoleAuthorizationFilter(roles))
                                .requestRateLimiter(c -> c
                                                .setRateLimiter(redisRateLimiter)
                                                .setKeyResolver(userKeyResolver));
        }
}
