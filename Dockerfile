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

# Stage 2: Runtime (WITH zlib)
FROM gcr.io/distroless/base-debian12:debug

WORKDIR /app

COPY --from=builder /app/build/native/nativeCompile/blog-app .

EXPOSE 8088
USER nonroot:nonroot

ENTRYPOINT ["./blog-app"]
