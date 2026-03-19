# --- Stage 1: Build (Optimization & Compilation) ---
FROM gradle:8.14.2-jdk21-alpine AS builder
WORKDIR /app

# 1. Cache dependencies: Copy only files that define the environment first
COPY --chown=gradle:gradle build.gradle settings.gradle gradle.properties* ./
COPY --chown=gradle:gradle gradle ./gradle

# Only download dependencies (this layer is cached unless build files change)
RUN gradle dependencies --no-daemon || true

# 2. Build: Copy source and compile
COPY --chown=gradle:gradle src ./src
RUN gradle clean bootJar -x test --no-daemon

# --- Stage 2: Runtime (Security Hardened) ---
# Using Alpine for the smallest attack surface (~150MB vs ~450MB)
FROM eclipse-temurin:21-jre-alpine AS runtime

# 3. Security: Create a system user with NO shell access
RUN addgroup -S spring && adduser -S spring -G spring -s /bin/false

WORKDIR /app

# 4. Permissions: Copy JAR and make it Read-Only (chmod 400)
COPY --from=builder --chown=spring:spring /app/build/libs/*.jar app.jar
RUN chmod 400 app.jar

# 5. Environment: Production JVM Best Practices
# - ExitOnOutOfMemoryError: Forces container restart if heap dies (crucial for K8s)
# - MaxRAMPercentage: Dynamically respects container memory limits
ENV JAVA_OPTS="-XX:+UseContainerSupport \
               -XX:MaxRAMPercentage=75.0 \
               -XX:+ExitOnOutOfMemoryError \
               -Djava.security.egd=file:/dev/./urandom"

USER spring

# 6. Reliability: Healthcheck using wget (native to Alpine)
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# 7. Lifecycle: Use JSON form for proper Signal Handling (SIGTERM)
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
