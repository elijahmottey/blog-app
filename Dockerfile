# Stage 1: Build Native Image
FROM ghcr.io/graalvm/native-image-community:21 AS builder

WORKDIR /app

# Install build tools
RUN microdnf install -y findutils zip unzip gcc glibc-devel zlib-devel

# Copy entire project
COPY . .

# Build native image
RUN chmod +x gradlew && ./gradlew nativeCompile --no-daemon

# Stage 2: Runtime Image
FROM debian:bookworm-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y libstdc++6 libgcc-s1 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy native executable
COPY --from=builder /app/build/native/nativeCompile/blog-app .

EXPOSE 8088

ENTRYPOINT ["./blog-app"]