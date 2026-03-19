# Stage 1: Extract/Prepare (Optimization)
FROM gradle:8.14.2-jdk21-alpine AS builder
WORKDIR /app

# Only copy files needed for dependency resolution first
# This allows Docker to cache your dependencies unless build.gradle changes
COPY build.gradle settings.gradle ./
RUN gradle dependencies --no-daemon || true

# Now copy the source and build
COPY src ./src
RUN gradle clean bootJar -x test --no-daemon

# Stage 2: Runtime (Security Hardened)
FROM eclipse-temurin:21-jre-alpine AS runtime

# 1. Security: Create a system user with no shell access
RUN addgroup -S spring && adduser -S spring -G spring -s /bin/false

WORKDIR /app

# 2. Performance: Copy the JAR from the builder stage
# Using a wildcard or specific name is fine, but renaming to app.jar simplifies scripts
COPY --from=builder --chown=spring:spring /app/build/libs/*.jar app.jar

# 3. Security: Make the JAR read-only
RUN chmod 400 app.jar

# 4. Environment: Standardize JVM flags for containers
# Use -XX:MaxRAMPercentage instead of Xmx for dynamic scaling
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"

USER spring

# 5. Reliability: Healthcheck using wget (standard in Alpine)
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# 6. Execution: Use 'exec' to ensure signals (SIGTERM) are passed to Java
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
