package com.arenape.webapi.security;

import com.arenape.webapi.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // 1. THIS IS THE MISSING LINE! It grabs the header from the request.
        String authHeader = request.getHeader("Authorization");

        // 2. Safety check: If there is no token, just pass the request along.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extract the token and email
        String token = authHeader.substring(7);
        String email = jwtService.extractUsername(token);

        System.out.println("DEBUG: Token recebido para o email -> " + email);

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails user = userRepository.findByEmail(email).orElse(null);

            System.out.println("DEBUG: Usuário encontrado no banco? -> " + (user != null));

            if (user != null && jwtService.isTokenValid(token, user)) {
                System.out.println("DEBUG: Autoridades (Roles) do usuário -> " + user.getAuthorities());

                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(user, null,
                        user.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            } else {
                System.out.println("DEBUG: Falha - Usuário é nulo ou token inválido.");
            }
        }

        filterChain.doFilter(request, response);
    }
}
