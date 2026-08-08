package com.expensemanager.config;

import com.expensemanager.utils.JwtUtil;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

public class JwtFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // 🔥 VERY IMPORTANT — allow login, register, and AI insight calls without auth
        if (path.startsWith("/api/auth") || path.startsWith("/api/ai")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Allow CORS preflight (OPTIONS) requests through without a token.
        // The browser sends these before every cross-origin POST / PUT / DELETE
        // (and even GET when a non-simple Content-Type header is set).
        if ("OPTIONS".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            System.out.println("[JwtFilter] REJECTED " + method + " " + path
                    + " -> missing or malformed Authorization header"
                    + (header == null ? " (header is null)" : " (does not start with 'Bearer ')"));
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        String token = header.substring(7).trim();

        if (token.isEmpty()) {
            System.out.println("[JwtFilter] REJECTED " + method + " " + path + " -> empty token");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        try {
            String email = JwtUtil.extractEmail(token);

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(email, null, Collections.emptyList());

            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (ExpiredJwtException e) {
            System.out.println("[JwtFilter] REJECTED " + method + " " + path + " -> token EXPIRED: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        } catch (Exception e) {
            System.out.println("[JwtFilter] REJECTED " + method + " " + path + " -> INVALID token: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        filterChain.doFilter(request, response);
    }
}
