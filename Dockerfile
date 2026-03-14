# Stage 1: Build
FROM gradle:8.5-jdk25 AS build
WORKDIR /app

# Copy build files
COPY --chown=gradle:gradle build.gradle settings.gradle ./
COPY --chown=gradle:gradle gradle.properties* ./
COPY --chown=gradle:gradle gradle ./gradle
COPY --chown=gradle:gradle src ./src

# Build the application
RUN gradle clean build -x test --no-daemon

# Stage 2: Run
FROM eclipse-temurin:25-jre-jammy

# Install dependencies and create user
RUN apt-get update && \
    apt-get upgrade -y && \
    groupadd -r spring && \
    useradd -r -g spring spring && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the JAR from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Switch to non-root user
USER spring

# JVM options
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT exec java $JAVA_OPTS -jar app.jar
