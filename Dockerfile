# Stage 1: Build Native Image
FROM ghcr.io/graalvm/native-image-community:21 AS builder

WORKDIR /app
RUN microdnf install -y git zip unzip findutils

COPY gradlew gradlew
COPY gradle gradle
COPY build.gradle settings.gradle ./
COPY src src

RUN chmod +x gradlew
RUN ./gradlew nativeCompile --no-daemon

# Stage 2: Runtime Image (Debian Slim)
FROM debian:bookworm-slim

RUN apt-get update && \
    apt-get install -y libz1 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ✅ COPY FROM BUILDER (this is the key fix)
COPY --from=builder /app/build/native/nativeCompile/blog-app .

EXPOSE 8088

ENTRYPOINT ["./blog-app"]
