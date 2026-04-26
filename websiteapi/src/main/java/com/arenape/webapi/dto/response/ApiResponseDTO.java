package com.arenape.webapi.dto.response;

public record ApiResponseDTO<T>(
    String mensagem,
    T dados
) {}
