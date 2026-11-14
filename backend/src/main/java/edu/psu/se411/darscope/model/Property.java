package edu.psu.se411.darscope.model;

import java.time.Instant;
import java.time.LocalDate;

import org.springframework.data.annotation.Id;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * One rental house: one row of the {@code property} table, and the JSON the frontend sends and
 * receives (docs/backend-plan.md, sections 3 and 4). The field names are the JSON names.
 *
 * <p>The checks are the app's own (SRS Appendix C), with the exact messages the form shows
 * beside each field. The two checks that compare fields are in {@code PropertyService}.
 *
 * <p>Numbers are {@code Integer}, so a missing one arrives as null and {@code @NotNull} gives its
 * message. Amenities are {@code boolean}, so a missing one is simply false.
 */
public record Property(
        @Id Long id,

        @NotNull(message = "Choose a city.")
        @Pattern(regexp = "Riyadh|Jeddah|Dammam|Al Khobar", message = "Choose a city.")
        String city,

        @NotBlank(message = "Enter the district.")
        @Size(min = 2, max = 60, message = "District must be 2 to 60 characters.")
        String district,

        @Pattern(regexp = "North|South|East|West|Northeast|Northwest|Southeast|Southwest|Three streets|Four streets",
                message = "Choose a front from the list.")
        String front,

        @NotNull(message = "Choose a property type.")
        @Pattern(regexp = "Villa|Duplex", message = "Choose a property type.")
        String propertyType,

        @NotNull(message = "Enter the size in m² as a whole number.")
        @Min(value = 20, message = "Size must be between 20 and 100,000 m².")
        @Max(value = 100_000, message = "Size must be between 20 and 100,000 m².")
        Integer sizeSqm,

        @NotNull(message = "Age must be a whole number from 0 to 100 years.")
        @Min(value = 0, message = "Age must be a whole number from 0 to 100 years.")
        @Max(value = 100, message = "Age must be a whole number from 0 to 100 years.")
        Integer propertyAgeYears,

        @NotNull(message = "Bedrooms must be a whole number from 0 to 20.")
        @Min(value = 0, message = "Bedrooms must be a whole number from 0 to 20.")
        @Max(value = 20, message = "Bedrooms must be a whole number from 0 to 20.")
        Integer bedrooms,

        @NotNull(message = "Bathrooms must be a whole number from 0 to 20.")
        @Min(value = 0, message = "Bathrooms must be a whole number from 0 to 20.")
        @Max(value = 20, message = "Bathrooms must be a whole number from 0 to 20.")
        Integer bathrooms,

        @NotNull(message = "Living rooms must be a whole number from 0 to 20.")
        @Min(value = 0, message = "Living rooms must be a whole number from 0 to 20.")
        @Max(value = 20, message = "Living rooms must be a whole number from 0 to 20.")
        Integer livingRooms,

        boolean kitchen,
        boolean garage,
        boolean driverRoom,
        boolean maidRoom,
        boolean furnished,
        boolean ac,
        boolean roof,
        boolean pool,
        boolean frontyard,
        boolean basement,
        boolean stairs,
        boolean elevator,
        boolean fireplace,

        @NotNull(message = "Enter the yearly rent in SAR as a whole number.")
        @Min(value = 1_000, message = "Yearly rent must be between 1,000 and 10,000,000 SAR.")
        @Max(value = 10_000_000, message = "Yearly rent must be between 1,000 and 10,000,000 SAR.")
        Integer yearlyRentSar,

        @Size(max = 2_000, message = "Description must be 2,000 characters or fewer.")
        String description,

        @NotNull(message = "Choose a status.")
        @Pattern(regexp = "Vacant|Occupied|Under maintenance", message = "Choose a status.")
        String status,

        @Size(min = 2, max = 80, message = "Tenant name must be 2 to 80 characters.")
        String tenantName,

        LocalDate leaseStart,
        LocalDate leaseEnd,
        Instant createdAt,
        Instant updatedAt) {

    public static final String OCCUPIED = "Occupied";

    /** The same property with the ID and both timestamps the server decides. */
    public Property withIdAndTimestamps(Long newId, Instant newCreatedAt, Instant newUpdatedAt) {
        return new Property(newId, city, district, front, propertyType, sizeSqm, propertyAgeYears,
                bedrooms, bathrooms, livingRooms, kitchen, garage, driverRoom, maidRoom, furnished,
                ac, roof, pool, frontyard, basement, stairs, elevator, fireplace, yearlyRentSar,
                description, status, tenantName, leaseStart, leaseEnd, newCreatedAt, newUpdatedAt);
    }

    /** The same property with no tenant and no lease, for any status but Occupied (FR-UPD-07). */
    public Property withoutTenant() {
        return new Property(id, city, district, front, propertyType, sizeSqm, propertyAgeYears,
                bedrooms, bathrooms, livingRooms, kitchen, garage, driverRoom, maidRoom, furnished,
                ac, roof, pool, frontyard, basement, stairs, elevator, fireplace, yearlyRentSar,
                description, status, null, null, null, createdAt, updatedAt);
    }
}
