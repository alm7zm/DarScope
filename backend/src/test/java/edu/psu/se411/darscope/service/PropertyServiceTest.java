package edu.psu.se411.darscope.service;

import static edu.psu.se411.darscope.TestProperties.occupied;
import static edu.psu.se411.darscope.TestProperties.withStatus;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import edu.psu.se411.darscope.exception.InvalidPropertyException;
import edu.psu.se411.darscope.exception.ObjectNotFoundException;
import edu.psu.se411.darscope.model.Property;
import edu.psu.se411.darscope.repository.PropertyRepository;

/** The service on its own: a Mockito mock stands in for the repository, so no database runs. */
@ExtendWith(MockitoExtension.class)
class PropertyServiceTest {

    private static final Instant NOW = Instant.parse("2026-11-14T09:30:00.123Z");

    @Mock
    private PropertyRepository repository;

    private PropertyService service;

    @BeforeEach
    void setUp() {
        service = new PropertyService(repository, Clock.fixed(NOW, ZoneOffset.UTC));
    }

    /** The repository hands back what it was given, as save does for an update. */
    private void saveReturnsItsArgument() {
        when(repository.save(any(Property.class))).thenAnswer(call -> call.getArgument(0));
    }

    private Property savedProperty() {
        ArgumentCaptor<Property> saved = ArgumentCaptor.forClass(Property.class);
        verify(repository).save(saved.capture());
        return saved.getValue();
    }

    // getPage

    @Test
    void getPageAsksForThatPageNewestFirst() {
        Page<Property> page = new PageImpl<>(List.of(occupied(1L)));
        when(repository.findAll(any(Pageable.class))).thenReturn(page);

        assertThat(service.getPage(2, 5)).isSameAs(page);

        ArgumentCaptor<Pageable> asked = ArgumentCaptor.forClass(Pageable.class);
        verify(repository).findAll(asked.capture());
        assertThat(asked.getValue().getPageNumber()).isEqualTo(2);
        assertThat(asked.getValue().getPageSize()).isEqualTo(5);
        assertThat(asked.getValue().getSort()).isEqualTo(PropertyService.NEWEST_FIRST);
    }

    @Test
    void getPageAllowsAThousandForTheDashboard() {
        when(repository.findAll(any(Pageable.class))).thenReturn(Page.empty());

        service.getPage(0, 1000);

        ArgumentCaptor<Pageable> asked = ArgumentCaptor.forClass(Pageable.class);
        verify(repository).findAll(asked.capture());
        assertThat(asked.getValue().getPageSize()).isEqualTo(1000);
    }

    // getById

    @Test
    void getByIdReturnsTheProperty() {
        Property property = occupied(7L);
        when(repository.findById(7L)).thenReturn(Optional.of(property));

        assertThat(service.getById(7L)).isSameAs(property);
    }

    @Test
    void getByIdThrowsForAnUnknownId() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(99L))
                .isInstanceOf(ObjectNotFoundException.class)
                .hasMessage("Property not found");
    }

    // create

    @Test
    void createSavesWithNoIdAndBothTimestampsNow() {
        saveReturnsItsArgument();
        Property input = occupied(42L); // an ID sent by the client is ignored

        Property result = service.create(input);

        Property saved = savedProperty();
        assertThat(saved.id()).isNull();
        assertThat(saved.createdAt()).isEqualTo(NOW);
        assertThat(saved.updatedAt()).isEqualTo(saved.createdAt());
        assertThat(saved.tenantName()).isEqualTo("Nora Al Harbi");
        assertThat(result).isEqualTo(saved);
    }

    @Test
    void createClearsTenantAndLeaseWhenNotOccupied() {
        saveReturnsItsArgument();

        service.create(withStatus("Vacant", "Someone", "2026-01-01", "2026-12-31"));

        Property saved = savedProperty();
        assertThat(saved.status()).isEqualTo("Vacant");
        assertThat(saved.tenantName()).isNull();
        assertThat(saved.leaseStart()).isNull();
        assertThat(saved.leaseEnd()).isNull();
    }

    @Test
    void createClearsTenantUnderMaintenanceToo() {
        saveReturnsItsArgument();

        service.create(withStatus("Under maintenance", "Someone", null, null));

        assertThat(savedProperty().tenantName()).isNull();
    }

    @Test
    void createRejectsOccupiedWithoutATenant() {
        assertThatThrownBy(() -> service.create(withStatus("Occupied", null, null, null)))
                .isInstanceOf(InvalidPropertyException.class)
                .hasMessage(PropertyService.TENANT_REQUIRED)
                .extracting("field").isEqualTo("tenantName");
        verify(repository, never()).save(any());
    }

    @Test
    void createRejectsOccupiedWithABlankTenant() {
        assertThatThrownBy(() -> service.create(withStatus("Occupied", "   ", null, null)))
                .isInstanceOf(InvalidPropertyException.class)
                .extracting("field").isEqualTo("tenantName");
        verify(repository, never()).save(any());
    }

    @Test
    void createRejectsALeaseEndBeforeTheStart() {
        assertThatThrownBy(() -> service.create(
                withStatus("Occupied", "Nora", "2026-06-01", "2026-05-31")))
                .isInstanceOf(InvalidPropertyException.class)
                .hasMessage(PropertyService.LEASE_END_AFTER_START)
                .extracting("field").isEqualTo("leaseEnd");
        verify(repository, never()).save(any());
    }

    @Test
    void createRejectsALeaseEndOnTheStartDay() {
        assertThatThrownBy(() -> service.create(
                withStatus("Occupied", "Nora", "2026-06-01", "2026-06-01")))
                .isInstanceOf(InvalidPropertyException.class)
                .extracting("field").isEqualTo("leaseEnd");
    }

    @Test
    void createAcceptsAnOccupiedPropertyWithOnlyOneLeaseDate() {
        saveReturnsItsArgument();

        service.create(withStatus("Occupied", "Nora", "2026-06-01", null));

        assertThat(savedProperty().leaseStart()).isNotNull();
    }

    // update

    @Test
    void updateKeepsIdAndCreatedAtAndSetsANewUpdatedAt() {
        Property existing = occupied(3L);
        when(repository.findById(3L)).thenReturn(Optional.of(existing));
        saveReturnsItsArgument();

        Property result = service.update(3L, withStatus("Occupied", "Sara", "2026-03-01", "2027-02-28"));

        Property saved = savedProperty();
        assertThat(saved.id()).isEqualTo(3L);
        assertThat(saved.createdAt()).isEqualTo(existing.createdAt());
        assertThat(saved.updatedAt()).isEqualTo(NOW);
        assertThat(saved.tenantName()).isEqualTo("Sara");
        assertThat(result).isEqualTo(saved);
    }

    @Test
    void updateClearsTheTenantWhenThePropertyIsNoLongerOccupied() {
        when(repository.findById(3L)).thenReturn(Optional.of(occupied(3L)));
        saveReturnsItsArgument();

        service.update(3L, withStatus("Vacant", "Nora Al Harbi", "2026-02-01", "2027-01-31"));

        assertThat(savedProperty().tenantName()).isNull();
    }

    @Test
    void updateThrowsForAnUnknownIdAndNeverSaves() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(99L, occupied(null)))
                .isInstanceOf(ObjectNotFoundException.class);
        verify(repository, never()).save(any());
    }

    @Test
    void updateRunsTheSameChecksAsCreate() {
        when(repository.findById(3L)).thenReturn(Optional.of(occupied(3L)));

        assertThatThrownBy(() -> service.update(3L, withStatus("Occupied", null, null, null)))
                .isInstanceOf(InvalidPropertyException.class);
        verify(repository, never()).save(any());
    }

    // delete

    @Test
    void deleteRemovesAnExistingProperty() {
        when(repository.existsById(5L)).thenReturn(true);

        service.delete(5L);

        verify(repository).deleteById(5L);
    }

    @Test
    void deleteThrowsForAnUnknownIdAndDeletesNothing() {
        when(repository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> service.delete(99L)).isInstanceOf(ObjectNotFoundException.class);
        verify(repository, never()).deleteById(any());
    }
}
