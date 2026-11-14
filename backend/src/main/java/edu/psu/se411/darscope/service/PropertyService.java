package edu.psu.se411.darscope.service;

import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import edu.psu.se411.darscope.exception.InvalidPropertyException;
import edu.psu.se411.darscope.exception.ObjectNotFoundException;
import edu.psu.se411.darscope.model.Property;
import edu.psu.se411.darscope.repository.PropertyRepository;

/**
 * The rules about properties: who sets the ID and the timestamps, the checks that compare two
 * fields, and clearing the tenant of a property that is not occupied. The controller turns each
 * exception thrown here into the API's error body.
 */
@Service
public class PropertyService {

    /** The app asks for up to 1000 at once, for the Dashboard and the search. */
    public static final int MAX_PAGE_SIZE = 1000;

    public static final String TENANT_REQUIRED = "Enter the tenant's name for an occupied property.";
    public static final String LEASE_END_AFTER_START = "Lease end must be after lease start.";

    /** Newest change first (FR-SRC-09). The ID breaks ties, so a page never changes order. */
    static final Sort NEWEST_FIRST = Sort.by(Sort.Order.desc("updatedAt"), Sort.Order.desc("id"));

    private final PropertyRepository repository;
    private final Clock clock;

    public PropertyService(PropertyRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    /**
     * One page of properties, newest first. Pages count from 0. PropertyController has already
     * checked that page is 0 or more and size is from 1 to {@link #MAX_PAGE_SIZE}.
     */
    public Page<Property> getPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size, NEWEST_FIRST));
    }

    /** The property with this ID, or ObjectNotFoundException. */
    public Property getById(long id) {
        return repository.findById(id).orElseThrow(() -> new ObjectNotFoundException(id));
    }

    /** Saves a new property. The database issues the ID; createdAt and updatedAt are now. */
    public Property create(Property property) {
        Property checked = checkAndTidy(property);
        Instant now = now();
        return repository.save(checked.withIdAndTimestamps(null, now, now));
    }

    /** Replaces a property's fields. The ID and createdAt stay; updatedAt is now. */
    public Property update(long id, Property property) {
        Property existing = getById(id);
        Property checked = checkAndTidy(property);
        return repository.save(checked.withIdAndTimestamps(id, existing.createdAt(), now()));
    }

    /** Deletes a property. The database never issues its ID again (FR-DEL-06). */
    public void delete(long id) {
        if (!repository.existsById(id)) {
            throw new ObjectNotFoundException(id);
        }
        repository.deleteById(id);
    }

    /**
     * The checks that compare two fields, and FR-UPD-07: a property that is not occupied has no
     * tenant and no lease.
     */
    private Property checkAndTidy(Property property) {
        if (!Property.OCCUPIED.equals(property.status())) {
            return property.withoutTenant();
        }
        if (property.tenantName() == null || property.tenantName().isBlank()) {
            throw new InvalidPropertyException("tenantName", TENANT_REQUIRED);
        }
        if (property.leaseStart() != null && property.leaseEnd() != null
                && !property.leaseEnd().isAfter(property.leaseStart())) {
            throw new InvalidPropertyException("leaseEnd", LEASE_END_AFTER_START);
        }
        return property;
    }

    /** Milliseconds are enough, and Postgres keeps only microseconds. */
    private Instant now() {
        return clock.instant().truncatedTo(ChronoUnit.MILLIS);
    }
}
