package com.arenape.webapi.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record EventRequestDTO(

    @NotBlank(message = "O nome do evento é obrigatório")
    @Size(min = 3, max = 100, message = "O nome deve ter entre 3 e 100 caracteres")
    String name,

    @NotBlank(message = "A localização é obrigatória")
    @Size(max = 200, message = "A localização deve ter no máximo 200 caracteres")
    String location,

    @Size(max = 1000, message = "A descrição deve ter no máximo 1000 caracteres")
    String description,

    @Size(max = 500, message = "A URL da imagem deve ter no máximo 500 caracteres")
    String imageUrl,

    @NotNull(message = "O preço é obrigatório")
    @DecimalMin(value = "0.0", inclusive = true, message = "O preço não pode ser negativo")
    BigDecimal price,

    @NotNull(message = "A quantidade de ingressos é obrigatória")
    @Min(value = 0, message = "A quantidade de ingressos não pode ser negativa")
    Integer availableTickets,

    @NotNull(message = "A data do evento é obrigatória")
    @Future(message = "A data do evento deve ser no futuro")
    @Schema(example = "2026-12-31T19:00")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    LocalDateTime eventDate

) {}
