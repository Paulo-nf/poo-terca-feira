package com.arenape.webapi.service;

import com.arenape.webapi.dto.request.EventRequestDTO;
import com.arenape.webapi.dto.response.EventResponseDTO;
import com.arenape.webapi.entity.Event;
import com.arenape.webapi.entity.enums.EventStatus;
import com.arenape.webapi.exception.BusinessException;
import com.arenape.webapi.exception.ResourceNotFoundException;
import com.arenape.webapi.repository.EventRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventService {

    private final EventRepository repository;

    public EventService(EventRepository repository) {
        this.repository = repository;
    }

    public EventResponseDTO create(EventRequestDTO request) {
        Event event = new Event();
        event.setName(request.name());
        event.setLocation(request.location());
        event.setDescription(request.description());
        event.setImageUrl(request.imageUrl());
        event.setPrice(request.price());
        event.setAvailableTickets(request.availableTickets());
        event.setEventDate(request.eventDate());
        event.setStatus(EventStatus.PENDING); // criação sempre inicia como PENDING

        return toDTO(repository.save(event));
    }

    public List<EventResponseDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    public EventResponseDTO findById(Long id) {
        return toDTO(findEventById(id));
    }

    public EventResponseDTO update(Long id, EventRequestDTO request) {
        Event event = findEventById(id);

        if (event.getStatus() == EventStatus.CANCELLED) {
            throw new BusinessException("Não é possível editar um evento cancelado");
        }

        if (request.eventDate().isBefore(LocalDateTime.now())) {
            throw new BusinessException("A data do evento deve ser no futuro");
        }

        if (request.status() != null) {
            validateStatusTransition(event.getStatus(), request.status());
            event.setStatus(request.status());
        }

        event.setName(request.name());
        event.setLocation(request.location());
        event.setDescription(request.description());
        event.setImageUrl(request.imageUrl());
        event.setPrice(request.price());
        event.setAvailableTickets(request.availableTickets());
        event.setEventDate(request.eventDate());

        return toDTO(repository.save(event));
    }

    public void delete(Long id) {
        Event event = findEventById(id);

        if (event.getStatus() == EventStatus.CONFIRMED) {
            throw new BusinessException("Não é possível excluir um evento confirmado");
        }

        repository.delete(event);
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private void validateStatusTransition(EventStatus current, EventStatus next) {
        boolean invalid = switch (current) {
            case PENDING    -> next == EventStatus.PENDING;   // já está, não faz sentido
            case CONFIRMED  -> next == EventStatus.PENDING;   // não pode regredir
            case CANCELLED  -> true;                          // evento cancelado não aceita mudanças
        };

        if (invalid) {
            throw new BusinessException(
                "Transição de status inválida: " + current + " → " + next
            );
        }
    }

    private Event findEventById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evento não encontrado com id: " + id));
    }

    private EventResponseDTO toDTO(Event event) {
        return new EventResponseDTO(
                event.getId(),
                event.getName(),
                event.getLocation(),
                event.getDescription(),
                event.getImageUrl(),
                event.getPrice(),
                event.getAvailableTickets(),
                event.getStatus().name(),
                event.getEventDate());
    }
}
