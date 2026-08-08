package com.expensemanager.utils;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.util.Date;
import javax.crypto.spec.SecretKeySpec;

public class JwtUtil {

    private static final String SECRET_STRING = System.getenv().getOrDefault(
        "JWT_SECRET",
        "dev-only-fallback-secret-change-me-1234567890"
    );
    private static final Key SECRET_KEY = new SecretKeySpec(
        SECRET_STRING.getBytes(), SignatureAlgorithm.HS256.getJcaName()
    );

    public static String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
                .signWith(SECRET_KEY)
                .compact();
    }

    public static String extractEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}