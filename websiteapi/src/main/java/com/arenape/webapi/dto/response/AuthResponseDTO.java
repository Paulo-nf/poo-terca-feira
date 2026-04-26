package com.arenape.webapi.dto.response;

public record AuthResponseDTO(
    String token,
    String name,
    String role
) {}
