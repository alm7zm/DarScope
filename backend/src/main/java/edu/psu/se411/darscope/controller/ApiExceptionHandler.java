package edu.psu.se411.darscope.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import edu.psu.se411.darscope.exception.InvalidPropertyException;
import edu.psu.se411.darscope.exception.ObjectNotFoundException;

/**
 * Builds every error body the API sends (docs/backend-plan.md, section 3). There are two shapes:
 *
 * <ul>
 *   <li>400 {@code { "errors": { field: message } }} when a field fails a check, one entry per
 *       field, so the form shows each message beside its field;</li>
 *   <li>{@code { "message": ... }} for everything else: 400 for a request that cannot be read,
 *       404, 405, 415 and 500.</li>
 * </ul>
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    public static final String UNREADABLE = "The request body is not valid JSON, or a field has the wrong type.";
    public static final String BAD_PARAMETER = "The request has a value of the wrong type.";
    public static final String BAD_PAGE = "page must be 0 or more, and size from 1 to 1000.";
    public static final String SERVER_ERROR = "Something went wrong on the server.";

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

    /** The body is missing or is broken JSON, or text or a decimal was sent where a whole number goes. */
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

    /** page or size is out of range (the @Min and @Max checks in PropertyController). */
    @ExceptionHandler(HandlerMethodValidationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> badPage(HandlerMethodValidationException exception) {
        return Map.of("message", BAD_PAGE);
    }

    @ExceptionHandler(ObjectNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> notFound(ObjectNotFoundException exception) {
        return Map.of("message", ObjectNotFoundException.MESSAGE);
    }

    /**
     * Everything else. Spring's own HTTP errors (405 wrong method, 415 not JSON, 404 unknown
     * route) keep their status and headers, such as Allow, and get a {@code message}. Anything
     * else is a fault in the server: 500, logged here, with a fixed message so no SQL or stack
     * trace reaches the client.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> other(Exception exception) {
        if (exception instanceof ErrorResponse error) {
            return ResponseEntity.status(error.getStatusCode())
                    .headers(error.getHeaders())
                    .body(Map.of("message", String.valueOf(error.getBody().getDetail())));
        }
        log.error("Unexpected error", exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", SERVER_ERROR));
    }
}
