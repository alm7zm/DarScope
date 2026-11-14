package edu.psu.se411.darscope.exception;

/** No property has the ID. The API answers 404 with {@code { "message": "Property not found" }}. */
public class ObjectNotFoundException extends RuntimeException {

    public static final String MESSAGE = "Property not found";

    private final long id;

    public ObjectNotFoundException(long id) {
        super(MESSAGE);
        this.id = id;
    }

    public long getId() {
        return id;
    }
}
