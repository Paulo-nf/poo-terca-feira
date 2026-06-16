package com.arenape.webapi.steps;

import com.arenape.webapi.entity.Event;
import com.arenape.webapi.entity.enums.EventStatus;
import com.arenape.webapi.repository.EventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.cucumber.java.Before;
import io.cucumber.java.pt.Dado;
import io.cucumber.java.pt.Então;
import io.cucumber.java.pt.Quando;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

public class VotacaoSteps {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private EventRepository eventRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private MockMvc mockMvc;
    private Long eventId;
    private MvcResult voteResult;

    @Before
    public void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    @Dado("que existe um evento chamado {string}")
    public void que_existe_um_evento_chamado(String nome) {
        Event evento = new Event();
        evento.setName(nome);
        evento.setLocation("Arena PE");
        evento.setEventDate(LocalDateTime.now().plusDays(30));
        evento.setDescription("Evento de teste");
        evento.setPrice(BigDecimal.valueOf(100));
        evento.setAvailableTickets(1000);
        evento.setTotalTickets(1000);
        evento.setStatus(EventStatus.CONFIRMED);
        eventId = eventRepository.save(evento).getId();
    }

    @Quando("eu voto nesse evento")
    public void eu_voto_nesse_evento() throws Exception {
        voteResult = mockMvc.perform(post("/events/" + eventId + "/vote")
                        .contentType(MediaType.APPLICATION_JSON))
                .andReturn();
    }

    @Então("o evento deve ter {int} voto(s)")
    public void o_evento_deve_ter_votos(int esperado) throws Exception {
        int status = voteResult.getResponse().getStatus();
        assertThat(status)
                .as("votar deveria retornar 2xx, mas retornou " + status)
                .isBetween(200, 299);

        Map<?, ?> body = objectMapper.readValue(
                voteResult.getResponse().getContentAsString(), Map.class);
        assertThat(((Number) body.get("votes")).intValue()).isEqualTo(esperado);
    }
}
