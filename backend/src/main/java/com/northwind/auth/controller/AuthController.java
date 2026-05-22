package com.northwind.auth.controller;

import com.northwind.auth.dto.AuthResponse;
import com.northwind.auth.dto.LoginRequest;
import com.northwind.auth.dto.RegisterRequest;
import com.northwind.auth.service.AuthService;
import com.northwind.auth.service.RefreshTokenService;
import com.northwind.common.exception.TokenException;
import com.northwind.common.response.ApiResponse;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final boolean refreshCookieSecure;

    public AuthController(
            AuthService authService,
            RefreshTokenService refreshTokenService,
            @Value("${jwt.refresh-cookie-secure:false}") boolean refreshCookieSecure) {
        this.authService = authService;
        this.refreshTokenService = refreshTokenService;
        this.refreshCookieSecure = refreshCookieSecure;
    }

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response) {
        AuthService.AuthResult result = authService.register(request);
        addRefreshCookie(response, result.refreshToken());
        return ApiResponse.ok("Registered successfully", result.response());
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        AuthService.AuthResult result = authService.login(request);
        addRefreshCookie(response, result.refreshToken());
        return ApiResponse.ok("Login successful", result.response());
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new TokenException("Refresh token is missing");
        }
        AuthService.AuthResult result = authService.refresh(refreshToken);
        addRefreshCookie(response, result.refreshToken());
        return ApiResponse.ok("Token refreshed", result.response());
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            authService.logout(refreshToken);
        }
        clearRefreshCookie(response);
        return ApiResponse.ok("Logged out", null);
    }

    private void addRefreshCookie(HttpServletResponse response, String rawToken) {
        Duration ttl = refreshTokenService.getRefreshTtl();
        ResponseCookie cookie = ResponseCookie.from("refreshToken", rawToken)
                .httpOnly(true)
                .secure(refreshCookieSecure)
                .sameSite("Lax")
                .path("/api/auth")
                .maxAge(ttl)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(refreshCookieSecure)
                .sameSite("Lax")
                .path("/api/auth")
                .maxAge(Duration.ZERO)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
