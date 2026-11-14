package edu.psu.se411.darscope.exception;

/**
 * A check that compares two fields failed. The API answers 400 with
 * {@code { "errors": { field: message } }}, the same body as a failed annotation check, so the
 * form shows the message beside the field.
 */
public class InvalidPropertyException extends RuntimeException {

    private final String field;

    public InvalidPropertyException(String field, String message) {
        super(message);
        this.field = field;
    }

    public String getField() {
        return field;
    }
}
