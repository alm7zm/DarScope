package edu.psu.se411.darscope.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;

import edu.psu.se411.darscope.model.Property;

/**
 * Reads and writes the {@code property} table. Spring Data JDBC writes the SQL: CrudRepository
 * gives save, findById, existsById and deleteById, and PagingAndSortingRepository gives
 * findAll(Pageable), which cuts one page in the database.
 */
public interface PropertyRepository
        extends CrudRepository<Property, Long>, PagingAndSortingRepository<Property, Long> {
}
