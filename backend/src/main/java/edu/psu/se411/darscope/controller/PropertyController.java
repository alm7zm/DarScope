package edu.psu.se411.darscope.controller;

import java.net.URI;

import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import edu.psu.se411.darscope.model.Property;
import edu.psu.se411.darscope.service.PropertyService;
import jakarta.validation.Valid;

/**
 * The REST routes (docs/backend-plan.md, section 3). Each one hands the work to PropertyService;
 * ApiExceptionHandler turns its exceptions into the error bodies.
 *
 * <pre>
 * GET    /api/v1/properties?page=0&amp;size=10  one page, newest first      (brief 4)
 * GET    /api/v1/properties/{id}              one property, or 404        (brief 3)
 * POST   /api/v1/properties                   add: 201 and the property   (brief 2)
 * PUT    /api/v1/properties/{id}              update: 200 and the property (brief 5)
 * DELETE /api/v1/properties/{id}              delete: 204
 * </pre>
 */
@RestController
@RequestMapping(PropertyController.BASE_PATH)
public class PropertyController {

    public static final String BASE_PATH = "/api/v1/properties";

    private final PropertyService service;

    public PropertyController(PropertyService service) {
        this.service = service;
    }

    @GetMapping
    public PagedModel<Property> getPage(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return new PagedModel<>(service.getPage(page, size));
    }

    @GetMapping("/{id}")
    public Property getById(@PathVariable("id") long id) {
        return service.getById(id);
    }

    @PostMapping
    public ResponseEntity<Property> create(@Valid @RequestBody Property property) {
        Property saved = service.create(property);
        return ResponseEntity.created(URI.create(BASE_PATH + "/" + saved.id())).body(saved);
    }

    @PutMapping("/{id}")
    public Property update(@PathVariable("id") long id, @Valid @RequestBody Property property) {
        return service.update(id, property);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("id") long id) {
        service.delete(id);
    }
}
