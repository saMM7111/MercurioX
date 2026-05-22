package com.northwind.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

/**
 * Configures the Redis-backed rate limiter key resolver.
 * <p>
 * Uses the {@code X-User-Id} header (set by JwtAuthFilter) as the rate-limit key
 * for authenticated users. Falls back to the client IP address for
 * unauthenticated requests (e.g. login/register).
 */
@Configuration
public class RateLimiterConfig {

    @Bean
    public KeyResolver userKeyResolver() {
        return exchange -> {
            String userId = exchange.getRequest().getHeaders().getFirst("X-User-Id");
            if (userId != null && !userId.isBlank()) {
                return Mono.just(userId);
            }
            // Fallback to remote address for unauthenticated endpoints
            return Mono.justOrEmpty(exchange.getRequest().getRemoteAddress())
                    .map(addr -> addr.getAddress().getHostAddress())
                    .defaultIfEmpty("unknown");
        };
    }

    @Bean
    public RedisRateLimiter redisRateLimiter(
            @Value("${gateway.rate-limiter.replenish-rate:20}") int replenishRate,
            @Value("${gateway.rate-limiter.burst-capacity:40}") int burstCapacity) {
        return new RedisRateLimiter(replenishRate, burstCapacity);
    }
}
