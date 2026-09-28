package com.example.productservice.Configuration;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Component;

import java.security.PublicKey;

@Component
public class JwtUtil {

    private final PublicKey publicKey;

    public JwtUtil(PublicKey publicKey) {
        this.publicKey = publicKey;
    }

    public Claims extractClaims(String token) {

        return Jwts.parser()
                .verifyWith(publicKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }
}
