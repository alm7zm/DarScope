package edu.psu.se411.darscope;

import static edu.psu.se411.darscope.TestProperties.VALID_JSON;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import edu.psu.se411.darscope.model.Property;
import edu.psu.se411.darscope.repository.PropertyRepository;

/**
 * The whole server on H2, with schema.sql and data.sql: the layers wired together, the
 * repository's SQL and the starting data. Each test that adds a property deletes it again, so the
 * 8 starting properties are all there for every test.
 */
@SpringBootTest
class DarscopeApplicationTests {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private PropertyRepository repository;

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    void startsWithTheEightStartingProperties() {
        assertThat(repository.count()).isEqualTo(8);
    }

    @Test
    void keepsArabicTextIntact() {
        Property second = repository.findById(2L).orElseThrow();
        assertThat(second.district()).isEqualTo("النرجس");
        assertThat(second.tenantName()).isNull();
    }

    @Test
    void cutsPagesNewestFirst() throws Exception {
        mvc.perform(get("/api/v1/properties").param("page", "1").param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(3))
                .andExpect(jsonPath("$.content[0].id").value(3))
                .andExpect(jsonPath("$.page.totalElements").value(8))
                .andExpect(jsonPath("$.page.totalPages").value(2));

        mvc.perform(get("/api/v1/properties").param("page", "0").param("size", "5"))
                .andExpect(jsonPath("$.content[0].id").value(8));
    }

    @Test
    void addsUpdatesAndDeletesAProperty() throws Exception {
        MvcResult added = mvc.perform(post("/api/v1/properties")
                        .contentType(MediaType.APPLICATION_JSON).content(VALID_JSON))
                .andExpect(status().isCreated())
                .andReturn();
        long id = idOf(added);
        assertThat(id).isGreaterThan(8);
        Property saved = repository.findById(id).orElseThrow();
        assertThat(saved.createdAt()).isEqualTo(saved.updatedAt());

        mvc.perform(put("/api/v1/properties/" + id).contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_JSON.replace("\"status\": \"Occupied\"", "\"status\": \"Vacant\"")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Vacant"))
                .andExpect(jsonPath("$.tenantName").value(org.hamcrest.Matchers.nullValue()));
        Property updated = repository.findById(id).orElseThrow();
        assertThat(updated.createdAt()).isEqualTo(saved.createdAt());
        assertThat(updated.tenantName()).isNull();

        mvc.perform(delete("/api/v1/properties/" + id)).andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/properties/" + id)).andExpect(status().isNotFound());
    }

    @Test
    void neverReusesADeletedId() throws Exception {
        long first = idOf(mvc.perform(post("/api/v1/properties")
                .contentType(MediaType.APPLICATION_JSON).content(VALID_JSON)).andReturn());
        mvc.perform(delete("/api/v1/properties/" + first)).andExpect(status().isNoContent());

        long second = idOf(mvc.perform(post("/api/v1/properties")
                .contentType(MediaType.APPLICATION_JSON).content(VALID_JSON)).andReturn());
        mvc.perform(delete("/api/v1/properties/" + second)).andExpect(status().isNoContent());

        assertThat(second).isGreaterThan(first);
    }

    @Test
    void rejectsABadRentStraightToTheApi() throws Exception {
        mvc.perform(post("/api/v1/properties").contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_JSON.replace("\"yearlyRentSar\": 190000", "\"yearlyRentSar\": 500")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.yearlyRentSar")
                        .value("Yearly rent must be between 1,000 and 10,000,000 SAR."));
        assertThat(repository.count()).isEqualTo(8);
    }

    /** The new property's ID, from the Location header of a 201. */
    private static long idOf(MvcResult result) {
        String location = result.getResponse().getHeader("Location");
        return Long.parseLong(location.substring(location.lastIndexOf('/') + 1));
    }
}
