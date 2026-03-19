# --- Stage 1: Build (Java 25) ---
FROM eclipse-temurin:25-jdk-alpine AS builder
WORKDIR /app

# 1. Install necessary build-time utilities for Alpine
# bash is required for many gradlew scripts; libc6-compat helps with native plugins
RUN apk add --no-cache bash libc6-compat

# 2. Copy configuration files first (Optimization)
COPY gradlew build.gradle settings.gradle gradle.properties* ./
COPY gradle ./gradle

# 3. Download dependencies 
# -Porg.gradle.java.installations.auto-download=false stops the "Foojay" crash
RUN chmod +x gradlew && \
    ./gradlew dependencies --no-daemon \
    -Porg.gradle.java.installations.auto-download=false || true

# 4. Build the application
COPY src ./src
RUN ./gradlew clean bootJar -x test --no-daemon \
    -Porg.gradle.java.installations.auto-download=false

# --- Stage 2: Runtime (Security Hardened) ---
FROM eclipse-temurin:25-jre-alpine AS runtime

# 5. Security: Create a system user with no shell access
RUN addgroup -S spring && adduser -S spring -G spring -s /bin/false

WORKDIR /app

# 6. Permissions: Copy JAR and make it Read-Only (chmod 400)
COPY --from=builder --chown=spring:spring /app/build/libs/*.jar app.jar
RUN chmod 400 app.jar

# 7. Environment: Java 25 Production Flags
# -XX:+AlwaysPreTouch improves stability by pre-allocating memory pages
ENV JAVA_OPTS="-XX:+UseContainerSupport \
               -XX:MaxRAMPercentage=75.0 \
               -XX:+ExitOnOutOfMemoryError \
               -XX:+AlwaysPreTouch \
               -Djava.security.egd=file:/dev/./urandom"

USER spring

# 8. Reliability: Healthcheck using wget (native to Alpine)
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# 9. Execution: Signal-friendly Entrypoint
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
