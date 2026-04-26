package com.arenape.webapi.controller;

import com.arenape.webapi.dto.request.EventRequestDTO;
import com.arenape.webapi.dto.response.ApiResponseDTO;
import com.arenape.webapi.dto.response.EventResponseDTO;
import com.arenape.webapi.service.EventService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.util.List;

@RestController
@RequestMapping("/events")
public class EventController {

    private final EventService service;

    public EventController(EventService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @SecurityRequirement(name = "bearerAuth")
    public ApiResponseDTO<EventResponseDTO> createEvent(@RequestBody @Valid EventRequestDTO request) {
        EventResponseDTO evento = service.create(request);
        return new ApiResponseDTO<>("Evento criado com sucesso!", evento);
    }

    @GetMapping
    public List<EventResponseDTO> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public EventResponseDTO findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PutMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    public ApiResponseDTO<EventResponseDTO> update(
            @PathVariable Long id,
            @RequestBody @Valid EventRequestDTO request) {
        EventResponseDTO evento = service.update(id, request);
        return new ApiResponseDTO<>("Evento atualizado com sucesso!", evento);
    }

    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponseDTO<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(new ApiResponseDTO<>("Evento excluído com sucesso!", null));
    }
}
