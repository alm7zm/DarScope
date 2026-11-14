package edu.psu.se411.darscope.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import edu.psu.se411.darscope.exception.InvalidPropertyException;
import edu.psu.se411.darscope.exception.ObjectNotFoundException;

/**
 * Builds every error body the frontend reads (docs/backend-plan.md, section 3):
 *
 * <ul>
 *   <li>400 {@code { "errors": { field: message } }} when a check fails, one entry per field;</li>
 *   <li>400 {@code { "message": ... }} when the request cannot be read;</li>
 *   <li>404 {@code { "message": "Property not found" }}.</li>
 * </ul>
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    public static final String UNREADABLE = "The request could not be read. Check that every number is a number.";
    public static final String BAD_PARAMETER = "The request has a value of the wrong type.";

    /** A Bean Validation check on Property failed. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Map<String, String>> invalidFields(MethodArgumentNotValidException exception) {
        Map<String, String> errors = new LinkedHashMap<>();
        for (FieldError error : exception.getBindingResult().getFieldErrors()) {
            // When two rules fail on one field, keep the first message.
            errors.putIfAbsent(error.getField(), error.getDefaultMessage());
        }
        return Map.of("errors", errors);
    }

    /** A check in PropertyService that compares two fields failed. */
    @ExceptionHandler(InvalidPropertyException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Map<String, String>> invalidProperty(InvalidPropertyException exception) {
        return Map.of("errors", Map.of(exception.getField(), exception.getMessage()));
    }

    /** The JSON is broken, or text was sent where a number goes. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> unreadable(HttpMessageNotReadableException exception) {
        return Map.of("message", UNREADABLE);
    }

    /** An ID or page number in the URL is not a number, such as /api/v1/properties/abc. */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> badParameter(MethodArgumentTypeMismatchException exception) {
        return Map.of("message", BAD_PARAMETER);
    }

    @ExceptionHandler(ObjectNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> notFound(ObjectNotFoundException exception) {
        return Map.of("message", ObjectNotFoundException.MESSAGE);
    }
}
