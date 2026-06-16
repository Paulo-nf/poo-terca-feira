package com.arenape.webapi.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.arenape.webapi.entity.enums.EventStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PostLoad;
import jakarta.persistence.PrePersist;

@Entity
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String imageUrl;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private LocalDateTime eventDate;

    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer availableTickets;

    @Column(nullable = false)
    private Integer totalTickets;

    @Enumerated(EnumType.STRING)
    private EventStatus status;

    private Integer votes;

    public Event() {
    }

    public Event(Long id, String imageUrl, String name, String location, LocalDateTime eventDate, String description,
            BigDecimal price, Integer availableTickets, EventStatus status) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.name = name;
        this.location = location;
        this.eventDate = eventDate;
        this.description = description;
        this.price = price;
        this.availableTickets = availableTickets;
        this.status = status;
    }

    @PrePersist
    public void prePersist() {
        if (status == null) {
            status = EventStatus.PENDING;
        }
        if (totalTickets == null) {
            totalTickets = availableTickets;
        }
        if (votes == null) {
            votes = 0;
        }
    }

    @PostLoad
    public void postLoad() {
        if (totalTickets == null) {
            totalTickets = availableTickets != null ? availableTickets : 0;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDateTime eventDate) {
        this.eventDate = eventDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getAvailableTickets() {
        return availableTickets;
    }

    public void setAvailableTickets(Integer availableTickets) {
        this.availableTickets = availableTickets;
    }

    public Integer getTotalTickets() {
        return totalTickets;
    }

    public void setTotalTickets(Integer totalTickets) {
        this.totalTickets = totalTickets;
    }

    public EventStatus getStatus() {
        return status;
    }

    public void setStatus(EventStatus status) {
        this.status = status;
    }

    public Integer getVotes() {
        return votes;
    }

    public void setVotes(Integer votes) {
        this.votes = votes;
    }
}
