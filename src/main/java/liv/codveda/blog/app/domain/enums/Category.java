package liv.codveda.blog.app.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Category {
    TECHNOLOGY,
    SPIRITUAL,
    LIFESTYLE,
    TRAVEL,
    POLITICS,
    LEADERSHIP,
    CULTURE,
    FASHION,
    HEALTH,
    BUSINESS,
    EDUCATION,
    ENTERTAINMENT,
    SPORTS;

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static Category fromString(String value) {
        if (value == null) return null;
        // Normalize: trim, uppercase, replace non-alphanumeric sequences with underscore
        String normalized = value.trim().toUpperCase().replaceAll("[^A-Z0-9]+", "_");
        try {
            return Category.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            // As a fallback, try exact uppercase without normalization
            try {
                return Category.valueOf(value.trim().toUpperCase());
            } catch (IllegalArgumentException ex) {
                // Could not parse - rethrow to let controller/validation handle invalid category
                throw new IllegalArgumentException("Invalid category: " + value);
            }
        }
    }

    @JsonValue
    public String toValue() {
        return this.name();
    }
}
