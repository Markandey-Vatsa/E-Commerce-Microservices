package com.example.authenticationservice.Utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Component;

import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    private final PrivateKey privateKey;
    private final PublicKey publicKey;

    public JwtUtil(PrivateKey privateKey, PublicKey publicKey) {
        this.privateKey = privateKey;
        this.publicKey = publicKey;
    }

    public String extractUsername(String token) {
        Claims claims = extractAllClaims(token);
        return claims.getSubject();
    }

    public String extractRole(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("role", String.class);
    }

    public Date extractExpiration(String token) {
        return extractAllClaims(token).getExpiration();
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(publicKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public String generateToken(String username, String role) {

        Map<String, Object> claims = new HashMap<>();

        claims.put("role", role);

        return createToken(claims, username);
    }

    private String createToken(
            Map<String, Object> claims,
            String subject) {

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .header()
                .empty()
                .add("typ", "JWT")
                .and()
                .issuedAt(new Date())
                .expiration(new Date(
                        System.currentTimeMillis() + 1000 * 60 * 60
                ))
                .signWith(privateKey, Jwts.SIG.RS256)
                .compact();
    }

    public Boolean validateToken(String token) {
        return !isTokenExpired(token);
    }
}