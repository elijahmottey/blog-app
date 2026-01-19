# Stage 1: Build Native Image
FROM ghcr.io/graalvm/native-image-community:21 AS builder

WORKDIR /app

# Install build tools
RUN microdnf install -y findutils zip unzip gcc glibc-devel zlib-devel

# Copy Gradle files
COPY gradlew gradlew
COPY gradle gradle
COPY build.gradle settings.gradle gradle.properties ./

# Download dependencies first (for better caching)
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon

# Copy source code
COPY src src

# Build native image
ENV GRADLE_OPTS="-Xmx4g"
RUN ./gradlew nativeCompile --no-daemon

# Stage 2: Runtime Image (Alpine for smaller size)
FROM alpine:3.19

WORKDIR /app

# Install minimal runtime dependencies
RUN apk add --no-cache libstdc++ libgcc

# Copy the native executable
COPY --from=builder /app/build/native/nativeCompile/blog-app .

# Set non-root user (optional but recommended)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8088

ENTRYPOINT ["./blog-app"]