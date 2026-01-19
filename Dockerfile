# Stage 1: Build Native Image
FROM ghcr.io/graalvm/native-image-community:21 AS builder

WORKDIR /app

# Install necessary tools
RUN microdnf install -y git zip unzip findutils

# Copy Gradle wrapper & project files
COPY gradlew gradlew
COPY gradle gradle
COPY build.gradle settings.gradle gradle.properties ./
COPY src src

RUN chmod +x gradlew

# Build native image
RUN ./gradlew nativeCompile --no-daemon

# Stage 2: Minimal Runtime Image
FROM gcr.io/distroless/base-debian12

WORKDIR /app

# Copy native binary
COPY --from=builder /app/build/native/nativeCompile/blog-app .

EXPOSE 8088

USER nonroot:nonroot

ENTRYPOINT ["./blog-app"]
