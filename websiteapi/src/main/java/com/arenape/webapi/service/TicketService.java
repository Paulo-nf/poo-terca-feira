package com.arenape.webapi.service;

import com.arenape.webapi.dto.request.TicketRequestDTO;
import com.arenape.webapi.dto.response.TicketResponseDTO;
import com.arenape.webapi.dto.response.TicketSummaryDTO;
import com.arenape.webapi.entity.Event;
import com.arenape.webapi.entity.Ticket;
import com.arenape.webapi.entity.User;
import com.arenape.webapi.entity.enums.EventStatus;
import com.arenape.webapi.entity.enums.TicketStatus;
import com.arenape.webapi.exception.BusinessException;
import com.arenape.webapi.exception.ResourceNotFoundException;
import com.arenape.webapi.repository.EventRepository;
import com.arenape.webapi.repository.TicketRepository;
import com.arenape.webapi.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public TicketService(TicketRepository ticketRepository,
                         EventRepository eventRepository,
                         UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TicketResponseDTO purchase(TicketRequestDTO request, String buyerEmail) {
        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new ResourceNotFoundException("Evento não encontrado com id: " + request.eventId()));

        if (event.getStatus() == EventStatus.CANCELLED) {
            throw new BusinessException("Não é possível comprar ingressos para um evento cancelado");
        }

        if (event.getAvailableTickets() < request.quantity()) {
            throw new BusinessException("Ingressos insuficientes. Disponíveis: " + event.getAvailableTickets());
        }

        User buyer = userRepository.findByEmail(buyerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        if (buyer.getRole() == com.arenape.webapi.entity.enums.UserRole.ADMIN) {
            throw new BusinessException("Administradores não podem comprar ingressos");
        }

        event.setAvailableTickets(event.getAvailableTickets() - request.quantity());
        eventRepository.save(event);

        Ticket ticket = new Ticket();
        ticket.setEvent(event);
        ticket.setBuyer(buyer);
        ticket.setQuantity(request.quantity());
        ticket.setTotalPrice(event.getPrice().multiply(BigDecimal.valueOf(request.quantity())));
        ticket.setEventName(event.getName());
        ticket.setEventLocation(event.getLocation());
        ticket.setEventDate(event.getEventDate());
        ticket.setStatus(TicketStatus.ACTIVE);

        return toDTO(ticketRepository.save(ticket));
    }

    public List<TicketResponseDTO> findMyTickets(String buyerEmail) {
        return ticketRepository.findByBuyerEmail(buyerEmail)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public TicketSummaryDTO getSummary() {
        Integer totalSold = ticketRepository.sumQuantityByStatus(TicketStatus.ACTIVE);
        BigDecimal totalRevenue = ticketRepository.sumTotalPriceByStatus(TicketStatus.ACTIVE);
        return new TicketSummaryDTO(totalSold, totalRevenue);
    }

    private TicketResponseDTO toDTO(Ticket ticket) {
        return new TicketResponseDTO(
                ticket.getId(),
                ticket.getEvent().getId(),
                ticket.getEventName(),
                ticket.getEventLocation(),
                ticket.getEventDate(),
                ticket.getBuyer().getName(),
                ticket.getBuyer().getEmail(),
                ticket.getQuantity(),
                ticket.getTotalPrice(),
                ticket.getPurchaseDate(),
                ticket.getStatus().name()
        );
    }
}