package edu.psu.se411.darscope.controller;

import static edu.psu.se411.darscope.TestProperties.VALID_JSON;
import static edu.psu.se411.darscope.TestProperties.occupied;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import edu.psu.se411.darscope.exception.InvalidPropertyException;
import edu.psu.se411.darscope.exception.ObjectNotFoundException;
import edu.psu.se411.darscope.model.Property;
import edu.psu.se411.darscope.service.PropertyService;

/**
 * The routes on their own: a Mockito mock stands in for the service, and MockMvc sends the HTTP
 * requests without starting a server. Checks the status codes, the Location header and the exact
 * JSON bodies the frontend reads.
 */
@ExtendWith(MockitoExtension.class)
class PropertyControllerTest {

    private static final String URL = "/api/v1/properties";

    @Mock
    private PropertyService service;

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(new PropertyController(service))
                .setControllerAdvice(new ApiExceptionHandler())
                .build();
    }

    private static String jsonWith(String original, String replacement) {
        return VALID_JSON.replace(original, replacement);
    }

    // GET one page

    @Test
    void getPageReturnsTheContentAndThePageTotals() throws Exception {
        when(service.getPage(1, 5)).thenReturn(
                new PageImpl<>(List.of(occupied(6L)), PageRequest.of(1, 5), 6));

        mvc.perform(get(URL).param("page", "1").param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].id").value(6))
                .andExpect(jsonPath("$.content[0].pool").value(true))
                .andExpect(jsonPath("$.page.size").value(5))
                .andExpect(jsonPath("$.page.number").value(1))
                .andExpect(jsonPath("$.page.totalElements").value(6))
                .andExpect(jsonPath("$.page.totalPages").value(2));
    }

    @Test
    void getPageUsesPageZeroAndSizeTenByDefault() throws Exception {
        when(service.getPage(0, 10)).thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 10), 0));

        mvc.perform(get(URL)).andExpect(status().isOk());

        verify(service).getPage(0, 10);
    }

    @Test
    void getPageAnswers400ForAPageThatIsNotANumber() throws Exception {
        mvc.perform(get(URL).param("page", "two"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(ApiExceptionHandler.BAD_PARAMETER));
    }

    // GET by ID

    @Test
    void getByIdReturnsTheProperty() throws Exception {
        when(service.getById(1L)).thenReturn(occupied(1L));

        mvc.perform(get(URL + "/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.district").value("Al Malqa"))
                .andExpect(jsonPath("$.leaseStart").value("2026-02-01"));
    }

    @Test
    void getByIdAnswers404ForAnUnknownId() throws Exception {
        when(service.getById(99L)).thenThrow(new ObjectNotFoundException(99L));

        mvc.perform(get(URL + "/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Property not found"));
    }

    // POST

    @Test
    void createAnswers201WithTheLocationAndTheNewProperty() throws Exception {
        when(service.create(any(Property.class))).thenReturn(occupied(9L));

        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON).content(VALID_JSON))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/v1/properties/9"))
                .andExpect(jsonPath("$.id").value(9))
                .andExpect(jsonPath("$.tenantName").value("Nora Al Harbi"));
    }

    @Test
    void createAnswers400WithTheExactMessageForARentOutOfRange() throws Exception {
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON)
                        .content(jsonWith("\"yearlyRentSar\": 190000", "\"yearlyRentSar\": 500")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.yearlyRentSar")
                        .value("Yearly rent must be between 1,000 and 10,000,000 SAR."));
        verifyNoInteractions(service);
    }

    @Test
    void createAnswers400ForAMissingOrUnknownCity() throws Exception {
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON)
                        .content(jsonWith("\"city\": \"Riyadh\"", "\"city\": null")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.city").value("Choose a city."));

        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON)
                        .content(jsonWith("\"city\": \"Riyadh\"", "\"city\": \"Mecca\"")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.city").value("Choose a city."));
        verifyNoInteractions(service);
    }

    @Test
    void createReportsEveryBadFieldAtOnce() throws Exception {
        String body = jsonWith("\"sizeSqm\": 620", "\"sizeSqm\": 5")
                .replace("\"bedrooms\": 5", "\"bedrooms\": 21")
                .replace("\"status\": \"Occupied\"", "\"status\": \"Sold\"");

        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.sizeSqm").value("Size must be between 20 and 100,000 m²."))
                .andExpect(jsonPath("$.errors.bedrooms").value("Bedrooms must be a whole number from 0 to 20."))
                .andExpect(jsonPath("$.errors.status").value("Choose a status."));
    }

    @Test
    void createAnswers400ForAMissingNumber() throws Exception {
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON)
                        .content(jsonWith("\"sizeSqm\": 620", "\"sizeSqm\": null")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.sizeSqm").value("Enter the size in m² as a whole number."));
    }

    @Test
    void createAnswers400WhenTheServiceRejectsTheTenant() throws Exception {
        when(service.create(any(Property.class))).thenThrow(new InvalidPropertyException(
                "tenantName", PropertyService.TENANT_REQUIRED));

        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON).content(VALID_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.tenantName").value(PropertyService.TENANT_REQUIRED));
    }

    @Test
    void createAnswers400ForJsonThatCannotBeRead() throws Exception {
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON)
                        .content(jsonWith("\"sizeSqm\": 620", "\"sizeSqm\": \"big\"")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(ApiExceptionHandler.UNREADABLE));

        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON).content("{ not json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
        verifyNoInteractions(service);
    }

    // PUT

    @Test
    void updateAnswers200WithTheUpdatedProperty() throws Exception {
        when(service.update(eq(4L), any(Property.class))).thenReturn(occupied(4L));

        mvc.perform(put(URL + "/4").contentType(MediaType.APPLICATION_JSON).content(VALID_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(4));
    }

    @Test
    void updateAnswers404ForAnUnknownId() throws Exception {
        when(service.update(eq(99L), any(Property.class))).thenThrow(new ObjectNotFoundException(99L));

        mvc.perform(put(URL + "/99").contentType(MediaType.APPLICATION_JSON).content(VALID_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Property not found"));
    }

    @Test
    void updateAnswers400ForAnInvalidFieldAndNeverCallsTheService() throws Exception {
        mvc.perform(put(URL + "/4").contentType(MediaType.APPLICATION_JSON)
                        .content(jsonWith("\"district\": \"Al Malqa\"", "\"district\": \"\"")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.district").exists());
        verifyNoInteractions(service);
    }

    // DELETE

    @Test
    void deleteAnswers204WithNoBody() throws Exception {
        mvc.perform(delete(URL + "/5"))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));
        verify(service).delete(5L);
    }

    @Test
    void deleteAnswers404ForAnUnknownId() throws Exception {
        doThrow(new ObjectNotFoundException(99L)).when(service).delete(99L);

        mvc.perform(delete(URL + "/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Property not found"));
    }
}
