package com.arenape.webapi.service;

import com.arenape.webapi.dto.request.AuthRequestDTO;
import com.arenape.webapi.dto.request.LoginRequestDTO;
import com.arenape.webapi.dto.response.AuthResponseDTO;
import com.arenape.webapi.entity.User;
import com.arenape.webapi.entity.enums.UserRole;
import com.arenape.webapi.exception.BusinessException;
import com.arenape.webapi.repository.UserRepository;
import com.arenape.webapi.security.JwtService;
import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponseDTO register(AuthRequestDTO request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException("E-mail já cadastrado");
        }

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(UserRole.USER); // registro público sempre cria USER

        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return new AuthResponseDTO(token, user.getName(), user.getRole().name());
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("E-mail ou senha inválidos"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("E-mail ou senha inválidos");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponseDTO(token, user.getName(), user.getRole().name());
    }
}
