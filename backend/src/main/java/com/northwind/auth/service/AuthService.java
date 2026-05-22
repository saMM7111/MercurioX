package com.northwind.auth.service;

import com.northwind.auth.dto.AuthResponse;
import com.northwind.auth.dto.LoginRequest;
import com.northwind.auth.dto.RegisterRequest;
import com.northwind.auth.entity.Role;
import com.northwind.auth.entity.User;
import com.northwind.auth.repository.UserRepository;
import com.northwind.auth.security.JwtUtil;
import com.northwind.common.exception.TokenException;
import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    public record AuthResult(AuthResponse response, String refreshToken) {
    }

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final JwtUtil jwtUtil;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            RefreshTokenService refreshTokenService,
            JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResult register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new TokenException("Username is already in use");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new TokenException("Email is already in use");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.VIEWER);

        User saved = userRepository.save(user);
        return issueTokens(saved);
    }

    @Transactional
    public AuthResult login(LoginRequest request) {
        Optional<User> userOptional = userRepository.findByUsernameOrEmail(
                request.username(), request.username());
        User user = userOptional.orElseThrow(() -> new TokenException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new TokenException("Invalid credentials");
        }

        return issueTokens(user);
    }

    @Transactional
    public AuthResult refresh(String rawRefreshToken) {
        RefreshTokenService.RotationResult rotation = refreshTokenService.rotateToken(rawRefreshToken);
        return issueTokens(rotation.user(), rotation.newToken());
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        refreshTokenService.revokeToken(rawRefreshToken);
    }

    private AuthResult issueTokens(User user) {
        String accessToken = jwtUtil.generateAccessToken(user);
        String refreshToken = refreshTokenService.issueToken(user);
        AuthResponse response = new AuthResponse(user.getId(), user.getUsername(), user.getRole(), accessToken);
        return new AuthResult(response, refreshToken);
    }

    private AuthResult issueTokens(User user, String refreshToken) {
        String accessToken = jwtUtil.generateAccessToken(user);
        AuthResponse response = new AuthResponse(user.getId(), user.getUsername(), user.getRole(), accessToken);
        return new AuthResult(response, refreshToken);
    }
}
