# Stage 1: Build Native Image
FROM ghcr.io/graalvm/graalvm-ce:21-java17 AS builder

WORKDIR /app

# Install native-image
RUN gu install native-image

# Copy Gradle files
COPY gradlew gradlew
COPY gradle gradle
COPY build.gradle settings.gradle gradle.properties ./

# Download dependencies
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon

# Copy source code
COPY src src

# Build native image
RUN ./gradlew nativeCompile --no-daemon

# Stage 2: Runtime Image
FROM debian:bookworm-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y libz1 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/build/native/nativeCompile/blog-app .

EXPOSE 8088

ENTRYPOINT ["./blog-app"]