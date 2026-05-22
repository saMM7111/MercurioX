package com.northwind.auth.service;

import com.northwind.auth.entity.RefreshToken;
import com.northwind.auth.entity.User;
import com.northwind.auth.repository.RefreshTokenRepository;
import com.northwind.common.exception.TokenException;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RefreshTokenService {

    public record RotationResult(User user, String newToken) {
    }

    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final Duration refreshTtl;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            @Value("${jwt.refresh-ttl-days:7}") long refreshTtlDays) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.refreshTtl = Duration.ofDays(refreshTtlDays);
    }

    public Duration getRefreshTtl() {
        return refreshTtl;
    }

    public String issueToken(User user) {
        String rawToken = UUID.randomUUID().toString();
        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setTokenHash(passwordEncoder.encode(rawToken));
        token.setExpiresAt(Instant.now().plus(refreshTtl));
        refreshTokenRepository.save(token);
        return rawToken;
    }

    @Transactional
    public RotationResult rotateToken(String rawToken) {
        RefreshToken existing = findByRawToken(rawToken);

        if (existing.getRevokedAt() != null) {
            revokeAllForUser(existing.getUser().getId());
            throw new TokenException("Refresh token has been revoked");
        }
        if (existing.getExpiresAt().isBefore(Instant.now())) {
            throw new TokenException("Refresh token has expired");
        }

        existing.setRevokedAt(Instant.now());

        String newToken = issueToken(existing.getUser());
        existing.setReplacedByTokenHash(passwordEncoder.encode(newToken));
        refreshTokenRepository.save(existing);

        return new RotationResult(existing.getUser(), newToken);
    }

    @Transactional
    public void revokeToken(String rawToken) {
        RefreshToken existing = findByRawToken(rawToken);
        existing.setRevokedAt(Instant.now());
        refreshTokenRepository.save(existing);
    }

    @Transactional
    public void revokeAllForUser(UUID userId) {
        List<RefreshToken> tokens = refreshTokenRepository.findAllByUser_Id(userId);
        Instant now = Instant.now();
        for (RefreshToken token : tokens) {
            token.setRevokedAt(now);
        }
        refreshTokenRepository.saveAll(tokens);
    }

    private RefreshToken findByRawToken(String rawToken) {
        List<RefreshToken> tokens = refreshTokenRepository.findAll();
        return tokens.stream()
                .filter(token -> passwordEncoder.matches(rawToken, token.getTokenHash()))
                .findFirst()
                .orElseThrow(() -> new TokenException("Refresh token not recognized"));
    }
}
