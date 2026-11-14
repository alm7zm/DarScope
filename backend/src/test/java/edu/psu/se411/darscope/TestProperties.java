package edu.psu.se411.darscope;

import java.time.Instant;
import java.time.LocalDate;

import edu.psu.se411.darscope.model.Property;

/** Properties and JSON bodies the tests share. */
public final class TestProperties {

    private TestProperties() {
    }

    /** RP-0001 of the starting data: occupied, with a tenant and a lease. */
    public static Property occupied(Long id) {
        Instant created = Instant.parse("2026-10-01T08:00:00Z");
        return new Property(id, "Riyadh", "Al Malqa", "North", "Villa", 620, 3, 5, 6, 2,
                true, true, false, true, false, true, false, true, true, false, false, false, false,
                190_000, "Spacious family villa with a private pool.", "Occupied", "Nora Al Harbi",
                LocalDate.parse("2026-02-01"), LocalDate.parse("2027-01-31"), created, created);
    }

    /** The same property with another status, tenant and lease, and no ID or timestamps. */
    public static Property withStatus(String status, String tenantName, String leaseStart, String leaseEnd) {
        Property p = occupied(null);
        return new Property(null, p.city(), p.district(), p.front(), p.propertyType(), p.sizeSqm(),
                p.propertyAgeYears(), p.bedrooms(), p.bathrooms(), p.livingRooms(), p.kitchen(),
                p.garage(), p.driverRoom(), p.maidRoom(), p.furnished(), p.ac(), p.roof(), p.pool(),
                p.frontyard(), p.basement(), p.stairs(), p.elevator(), p.fireplace(),
                p.yearlyRentSar(), p.description(), status, tenantName,
                leaseStart == null ? null : LocalDate.parse(leaseStart),
                leaseEnd == null ? null : LocalDate.parse(leaseEnd), null, null);
    }

    /** What the frontend sends to add or update RP-0001: no id, createdAt or updatedAt. */
    public static final String VALID_JSON = """
            {
              "city": "Riyadh",
              "district": "Al Malqa",
              "front": "North",
              "propertyType": "Villa",
              "sizeSqm": 620,
              "propertyAgeYears": 3,
              "bedrooms": 5,
              "bathrooms": 6,
              "livingRooms": 2,
              "kitchen": true, "garage": true, "driverRoom": false, "maidRoom": true,
              "furnished": false, "ac": true, "roof": false, "pool": true, "frontyard": true,
              "basement": false, "stairs": false, "elevator": false, "fireplace": false,
              "yearlyRentSar": 190000,
              "description": "Spacious family villa with a private pool.",
              "status": "Occupied",
              "tenantName": "Nora Al Harbi",
              "leaseStart": "2026-02-01",
              "leaseEnd": "2027-01-31"
            }
            """;
}
